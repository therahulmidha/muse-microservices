import tempfile  # Tool to create temporary files that delete themselves later.
# FastAPI is the web framework. File and UploadFile handle uploads.
# HTTPException lets us send clear error codes (like 400 Bad Request) to the user.
from fastapi import FastAPI, File, HTTPException, UploadFile
# BaseModel helps define the exact structure of data we expect from the user.
from pydantic import BaseModel
# Import the actual core functions from our companion file 'rag.py'.
from rag import get_answer, load_pdf

# Initialize the main FastAPI application instance.
app = FastAPI()


# We define what data a user must send us when they want to chat.
class ChatRequest(BaseModel):
    query: str  # The user must provide a text string called 'query'.


# Endpoint 1: A simple health check to see if the server is up and running.
@app.get("/ai/health")
async def health():
    return {"status": "ok"}  # Returns a simple JSON response.


# Endpoint 2: The chat route where users send a question.
@app.post("/ai/chat")
async def chat(req: ChatRequest):
    # Sends the user's query text straight into our RAG system logic.
    return get_answer(req.query)


# Endpoint 3: The upload route where users upload their PDF file.
@app.post("/ai/upload")
async def upload(file: UploadFile):
    # Guard rail: Make sure the uploaded file is actually a PDF.
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid File Type")

    # Safely open a temporary file on the server's hard drive.
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        # Read the uploaded file bytes and write them to the temp file.
        tmp.write(await file.read())
        path = tmp.name  # Grab the exact folder path of this temp file.

    # Send the saved file path over to rag.py to process and remember it.
    load_pdf(path)
    return {"message": "PDF processed"}  # Tell the user everything went well.
