from fastapi import FastAPI
from pydantic import BaseModel
from agent import get_ai_response

app = FastAPI(title="Salon AI Agent Service")

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "AI Agent Service is running perfectly!"}

@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        reply = get_ai_response(request.message)
        return {"reply": reply}
    except Exception as e:
        return {"error": str(e)}