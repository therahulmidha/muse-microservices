from fastapi import FastAPI
from pydantic import BaseModel
import tempfile
from rag import load_pdf, get_answer
import UploadFile
app = FastAPI()

class ChatRequest(BaseModel):
    query: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/chat")
async def chat(req: ChatRequest):
    result = get_answer(req.query)
    return {"response": result}


@app.post("/ai/upload")
async def upload(file: UploadFile):
    if file.content_type != "application/pdf":
        raise HTTPException('Invalid File Type')
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        path = tmp.name

    load_pdf(path)

    return {"message": "PDF processed"}