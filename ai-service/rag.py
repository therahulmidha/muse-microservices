from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from transformers import pipeline
from llm import stream_llm
import redis
import json
from fastapi.responses import StreamingResponse

cache = redis.Redis(host="redis", port=6379)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
vector_store = FAISS.load_local(
    "vector_db",
    embeddings,
    allow_dangerous_deserialization=True
)

def load_pdf(file_path):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    chunks = splitter.split_documents(docs)

    global vector_store
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("vector_db")


def get_answer(query):
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5}
    )
    # MMR: Maximal Marginal Relevance:
    # reduces duplicate chunks
    # improves context diversity

    # executes the semantic search against your vector store. It returns a list of LangChain Document objects containing both text (page_content) and metadata.
    retrieved_docs = retriever.invoke(query)

    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    prompt = f"""
        You are an AI assistant.

        Answer ONLY from the provided context.
        If answer is not present, say:
        "I could not find this in the uploaded documents."

        Context:
        {context}

        Question:
        {query}

        Answer:
        """

    cached = cache.get(query)

    if cached:
        async def cached_stream():
            for word in cached.split():
                yield word + " "
                await asyncio.sleep(0.02)

        return StreamingResponse(
            cached_stream(),
            media_type="text/plain"
        )

    # ❌ CACHE MISS
    async def generate():

        accumulated = ""

        for chunk in stream_llm(prompt):

            accumulated += chunk

            yield chunk

        # save AFTER streaming completes
        cache.setex(
            cache_key,
            3600,
            accumulated
        )

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )