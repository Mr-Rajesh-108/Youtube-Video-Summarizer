import os
# Force HuggingFace to download models directly into our project folder (venv) instead of globally
local_model_dir = os.path.join(os.path.dirname(__file__), "models")
os.environ["HF_HOME"] = local_model_dir

import torch
import transformers
from transformers import pipeline, TextIteratorStreamer, GenerationConfig
from threading import Thread

# Silence noisy transformers output and only show critical errors
transformers.logging.set_verbosity_error()

_summarizer = None

SYSTEM_PROMPT = """You are a professional technical summarizer.
Your task is to provide a concise, high-density summary of the provided video transcript.

STRICT FORMAT:
**Summary:**
[One or two sentences capturing the most important specific takeaway from this video]

**Key Points:**
- [Unique insight 1]
- [Unique insight 2]
- [Unique insight 3]
- [Unique insight 4]
- [Unique insight 5]

RULES:
1. Start your response immediately with **Summary:**
2. Do not include any introductory text, filler, or a copy of these instructions.
3. Focus on specific technical or professional insights, not generic descriptions.
4. Stop immediately after the last bullet point.
"""

def get_summarizer():
    global _summarizer
    if _summarizer is not None:
        return _summarizer
    
    import torch # Local import safety
    print(f"Loading Llama Model into Memory... (v2.0.2 Stable) (Models: {local_model_dir})")
    device = 0 if torch.cuda.is_available() else -1
    
    _summarizer = pipeline(
        "text-generation", 
        model="unsloth/Llama-3.2-1B-Instruct", 
        device=device,
        torch_dtype=torch.float16 if device == 0 else torch.float32,
        trust_remote_code=True
    )
    return _summarizer

def generate_summary_stream(transcript: str):
    """
    Refactored into a generator that yields tokens for real-time 'typing' effect.
    """
    import torch # Local import safety
    limit_transcript = transcript[:12000] 
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Transcript:\n{limit_transcript}"}
    ]
    
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        pipe = get_summarizer()
        model = pipe.model
        tokenizer = pipe.tokenizer
        
        # Token-level streamer
        streamer = TextIteratorStreamer(
            tokenizer, 
            skip_prompt=True, 
            skip_special_tokens=True,
            timeout=120.0 # High timeout for slow 4GB GPU pre-fills
        )
        
        # Format the input for the model using its chat template
        # return_tensors='pt' returns a dictionary of tensors
        inputs = tokenizer.apply_chat_template(
            messages, 
            add_generation_prompt=True, 
            return_tensors="pt"
        ).to(model.device)
        
        token_count = inputs['input_ids'].shape[1]
        print(f"DEBUG: Llama Input Tokens: {token_count}")
        if token_count > 2500:
            print("DEBUG: Large prompt detected. First token may take up to 60s on 4GB GPU...")

        # Explicit GenerationConfig to avoid all warnings and issues
        gen_config = GenerationConfig(
            max_new_tokens=500,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            temperature=None,
            top_p=None,
        )
        
        # Prepare generation arguments
        generation_kwargs = dict(
            **inputs,
            generation_config=gen_config,
            streamer=streamer,
        )
        
        # Start generation in a background thread
        thread_errors = []
        import traceback
        def safe_generate():
            try:
                print("DEBUG: Thread starting model.generate()")
                model.generate(**generation_kwargs)
                print("DEBUG: Thread finished model.generate()")
            except Exception:
                err_detail = traceback.format_exc()
                print(f"THREAD ERROR in Llama generate:\n{err_detail}")
                thread_errors.append(err_detail)

        thread = Thread(target=safe_generate)
        thread.start()
        
        # Yield tokens as they become available
        tokens_yielded = 0
        try:
            for token in streamer:
                if tokens_yielded == 0:
                    print("DEBUG: First token received (Pre-fill complete)")
                tokens_yielded += 1
                yield token
        except Exception as e:
            print(f"STREAMER ITERATION ERROR ({type(e).__name__}): {e}")
            thread_errors.append(f"Streamer Error: {e}")
            
        thread.join()

        # If no tokens were yielded, explain why
        if tokens_yielded == 0:
            if thread_errors:
                error_lines = thread_errors[0].split('\n')
                error_msg = error_lines[-2] if len(error_lines) > 1 else str(thread_errors[0])
                print(f"Llama thread failed with: {error_msg}")
                yield f"Error generating summary: {error_msg}"
            else:
                msg = "AI Model returned no tokens - possibly timed out or context window issue."
                print(f"Llama total failure: {msg}")
                yield f"Error generating summary: {msg}"
        
    except Exception as e:
        print(f"Llama streaming failed (Outer): {e}")
        yield f"Error generating summary: {str(e)}"

def generate_summary(transcript: str) -> str:
    """
    Legacy sync wrapper - collects all tokens from the stream.
    """
    tokens = list(generate_summary_stream(transcript))
    return "".join(tokens)
