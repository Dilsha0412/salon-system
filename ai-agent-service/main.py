import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent import get_ai_response

app = FastAPI(title="Salon AI Agent Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageItem(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MessageItem]] = []

@app.get("/")
def read_root():
    return {"status": "AI Agent Service is running perfectly!"}

@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        # Run synchronous LangChain call in a worker thread safely
        reply = await asyncio.to_thread(get_ai_response, request.message, request.history)
        return {"reply": reply}
    except Exception as e:
        print(f"Chat Error: {e}")
        return {
            "reply": "Sorry, I encountered an issue retrieving that information. Please contact our salon directly.",
            "error": str(e)
        }
