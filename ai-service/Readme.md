# AI Service
This is a python based AI service with an initial goal to build a chatbot to answer queries using LLM and RAG.

    UI
    ↓
API Gateway (Node.js)
    ↓
Python AI Service
    ↓
Vector DB (FAISS / Chroma)
    ↓
Hugging Face LLM

# Steps to run
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn transformers torch