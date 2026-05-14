# AI Service
This is a RAG (Retrieval-Augmented Generation) application. It lets you upload a PDF file, extracts the text, and allows you to ask questions about that specific PDF using an AI model.

Next.js
   ↓
API Gateway
   ↓
AI Service (FastAPI)
   ↓
Redis Cache
   ↓
FAISS Vector DB
   ↓
Hugging Face LLM

# Steps to run
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn transformers torch
pip install -r requirements.txt

Run the app:
uvicorn main:app --reload --port 3003

curl -X POST http://localhost:3003/ai/chat \
-H "Content-Type: application/json" \
-d '{"query": "What is Kubernetes?"}'

# build and push
docker build -t your-dockerhub/ai-service .
docker push your-dockerhub/ai-service

# k8s apply and test
kubectl apply -f k8s/
kubectl port-forward svc/ai-service 8000:8000

# request to node.js server
curl -X POST http://localhost:3000/ai/chat \
-d '{"query":"Hello"}' \
-H "Content-Type: application/json"

# RAG
pip install langchain faiss-cpu pypdf sentence-transformers
PDF → split → embeddings → store → retrieve → LLM answer

# Optimization
pip install huggingface_hub redis
EXPORT HF_TOKEN=
