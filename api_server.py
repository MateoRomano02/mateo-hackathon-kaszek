"""
FastAPI backend — use if you need an API layer.
Run: uvicorn api_server:app --reload
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.api.claude_client import chat, chat_with_tools
from prompts.system_prompts import BASE_ASSISTANT

app = FastAPI(title="Hackathon API", version="1.0")

class ChatRequest(BaseModel):
    message: str
    system_prompt: str = BASE_ASSISTANT

class ChatResponse(BaseModel):
    response: str
    model: str = "claude-sonnet-4-6"

@app.get("/")
def root():
    return {"status": "ok", "app": "Hackathon Demo"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        response = chat(request.message, request.system_prompt)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy"}
