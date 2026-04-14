"""Utility functions."""
import json, time
from functools import wraps

def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try: return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1: raise
                    time.sleep(delay * (attempt + 1))
        return wrapper
    return decorator

def format_for_prompt(data) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)

def chunk_text(text: str, max_chars: int = 4000) -> list:
    return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
