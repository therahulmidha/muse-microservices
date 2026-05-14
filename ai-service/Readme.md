# AI Service
This is a python based AI service with an initial goal to build a chatbot to answer queries using LLM and RAG.

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
