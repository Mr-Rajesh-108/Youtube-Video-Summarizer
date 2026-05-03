import re
import tempfile
import os
import gc
import sys
import torch
import yt_dlp

# Python 3.13 Polyfill for audioop (required by Pydub)
try:
    import audioop
except ImportError:
    try:
        import audioop_lts as audioop
        sys.modules["audioop"] = audioop
    except ImportError:
        pass

from pydub import AudioSegment
from faster_whisper import WhisperModel
from youtube_transcript_api import YouTubeTranscriptApi

# We use the 'base' Faster Whisper model for maximum CPU speed.
# It is 2x-5x faster than 'small' on CPU while maintaining good accuracy.
MODEL_SIZE = os.getenv("MODEL_SIZE", "base")

_whisper_model = None

def get_whisper_model():
    """
    Singleton to load Whisper into RAM once. 
    Keeps it available without the loading delay per-request.
    """
    global _whisper_model
    if _whisper_model is None:
        import os
        # Optimized for CPU usage with all cores
        _whisper_model = WhisperModel(
            MODEL_SIZE, 
            device="cpu", 
            compute_type="int8",
            cpu_threads=os.cpu_count() or 4,
            num_workers=2
        )
    return _whisper_model

def extract_video_id(url: str):
    regex = r"(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})"
    match = re.search(regex, url)
    if match:
        return match.group(1)
    return None

def get_video_metadata(url: str):
    """
    Extracts video metadata (Title, etc.) without downloading the audio.
    """
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title', "YouTube Video"),
                "thumbnail": info.get('thumbnail', ""),
                "duration": info.get('duration', 0)
            }
    except Exception as e:
        print(f"Metadata extraction failed: {e}")
        return {"title": "YouTube Video", "thumbnail": "", "duration": 0}

def fetch_transcript_api(video_id: str):
    
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.fetch(video_id)
        return " ".join([snippet.text for snippet in transcript_list])
    except Exception as e:
        print(f"Transcript API failed: {e}")
        return None

def transcribe_with_whisper(url: str):
    """
    Downloads audio and transcribes it using Faster Whisper (CTranslate2).
    HIGH PERFORMANCE MODE: 
    1. Uses 'base' model for CPU speed.
    2. IN-MEMORY: No disk I/O for chunks (NumPy direct).
    3. NO BEAM SEARCH: beam_size=1 for maximum throughput.
    """
    try:
        import numpy as np

        with tempfile.TemporaryDirectory() as temp_dir:
            ydl_opts = {
                'format': 'bestaudio/best',
                # Removed hardcoded path to use system 'ffmpeg' for reliability
                'extractor_args': {'youtube': {'client': ['ios']}},
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': os.path.join(temp_dir, 'audio.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
                'nocheckcertificate': True,
                'header': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
            
            yield (5, "Requesting audio from YouTube...")
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])
            except Exception as e:
                yield (0, f"Error: YouTube Download Failed - {str(e)}")
                return
            
            yield (20, "Audio downloaded. Processing stream...")
            audio_path = os.path.join(temp_dir, 'audio.mp3')
            
            # 1. Warm up/Get Singleton Model
            yield (25, f"Waking up AI engine ({MODEL_SIZE}) on CPU...")
            model = get_whisper_model()

            # 2. Audio Loading & Chunking
            yield (35, "Analyzing audio segments (In-Memory)...")
            try:
                audio = AudioSegment.from_file(audio_path)
            except Exception as e:
                yield (0, f"Error: Audio Processing Failed (Check FFmpeg) - {str(e)}")
                return

            duration_ms = len(audio)
            chunk_length_ms = 60 * 1000 
            overlap_ms = 2 * 1000
            
            chunks = []
            for start in range(0, duration_ms, chunk_length_ms - overlap_ms):
                end = min(start + chunk_length_ms, duration_ms)
                chunks.append(audio[start:end])
                if end == duration_ms:
                    break
            
            total_chunks = len(chunks)
            full_transcript = []
            
            # 3. High-Speed In-Memory Transcription
            for i, chunk in enumerate(chunks):
                progress = 40 + int((i / total_chunks) * 50)
                yield (progress, f"Analyzing audio segment {i+1} of {total_chunks}...")

                samples = np.array(chunk.get_array_of_samples()).astype("float32") / 32768.0
                
                segments, _ = model.transcribe(
                    samples,
                    beam_size=1,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500),
                )
                
                chunk_text = " ".join([s.text for s in segments]).strip()
                full_transcript.append(chunk_text)
            
            # Final Cleanup for memory
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

            yield (95, "Finalizing transcript...")
            yield " ".join(full_transcript).strip()

    except Exception as e:
        print(f"Faster Whisper transcription failed: {e}")
        yield (0, f"Error: {str(e)}")
        yield None
