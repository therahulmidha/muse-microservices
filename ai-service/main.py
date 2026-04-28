from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Load model (lightweight for now)
generator = pipeline("text-generation", model="distilgpt2")

class ChatRequest(BaseModel):
    query: str

@app.post("/ai/chat")
def chat(req: ChatRequest):
    result = generator(req.query, max_length=100, num_return_sequences=1)
    return {"response": result[0]["generated_text"]}
