import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool
from threading import Thread
from pydantic import BaseModel

import llm
import utils

# --- Models ---
class SummarizeRequest(BaseModel):
    url: str
    prompt: str = None  # Optional custom prompt

# --- App Initialization ---
app = FastAPI(title="Stateless AI Worker")

# Preload models in background
def preload():
    try:
        llm.get_summarizer()
        print("LLM Preloaded")
        utils.get_whisper_model()
        print("Whisper Preloaded")
    except Exception as e:
        print(f"Preload error: {e}")

@app.on_event("startup")
async def startup_event():
    Thread(target=preload).start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow backend to call freely
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cache ---
transcript_cache = {}

# --- Routes ---

@app.get("/")
async def root():
    return {"status": "online", "message": "Stateless AI Worker is running"}

@app.get("/metadata")
async def get_metadata(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="Missing URL")
    metadata = await run_in_threadpool(utils.get_video_metadata, url)
    return metadata

@app.post("/summarize")
async def summarize_video(request: SummarizeRequest):
    video_id = utils.extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    async def generate_response():
        try:
            # 1. Fetch/Transcribe
            if video_id in transcript_cache:
                yield f"data: {json.dumps({'type': 'progress', 'value': 20, 'message': 'Transcript found in cache...'})}\n\n"
                transcript = transcript_cache[video_id]
            else:
                yield f"data: {json.dumps({'type': 'progress', 'value': 10, 'message': 'Fetching transcript...'})}\n\n"
                transcript = await run_in_threadpool(utils.fetch_transcript_api, video_id)
                
                if not transcript:
                    yield f"data: {json.dumps({'type': 'progress', 'value': 20, 'message': 'No API transcript found. Running AI transcription...'})}\n\n"
                    generator = utils.transcribe_with_whisper(request.url)
                    
                    def safe_next(gen):
                        try:
                            return next(gen)
                        except StopIteration:
                            return None

                    while True:
                        item = await run_in_threadpool(safe_next, generator)
                        if item is None: break
                            
                        if isinstance(item, tuple):
                            percent, message = item
                            ui_percent = 20 + (percent * 0.70)
                            yield f"data: {json.dumps({'type': 'progress', 'value': ui_percent, 'message': message})}\n\n"
                        else:
                            transcript = item
                            break
                
                if transcript:
                    transcript_cache[video_id] = transcript

            if not transcript or not transcript.strip():
                yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to obtain transcript'})}\n\n"
                return

            # 2. Summarize
            yield f"data: {json.dumps({'type': 'progress', 'value': 95, 'message': 'Generating summary...'})}\n\n"
            
            token_gen = llm.generate_summary_stream(transcript) if not request.prompt else llm.generate_summary_stream(f"Custom Instruction: {request.prompt}\n\nTranscript:\n{transcript}")
            
            def safe_next_token(gen):
                try:
                    return next(gen)
                except StopIteration:
                    return None

            full_summary = ""
            while True:
                token = await run_in_threadpool(safe_next_token, token_gen)
                if token is None: break
                full_summary += token
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

            yield f"data: {json.dumps({'type': 'complete', 'summary': full_summary, 'transcript': transcript})}\n\n"

        except Exception as e:
            print(f"Error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate_response(), 
        media_type="text/event-stream"
    )

import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.getenv("PORT", 8001))
    HOST = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=HOST, port=PORT)
