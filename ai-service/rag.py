import asyncio  # Allows the program to handle pausing and timing tasks smoothly.
import json
import os
from fastapi.responses import StreamingResponse  # Sends data bit-by-bit to the web browser.
from langchain_community.document_loaders import PyPDFLoader  # Tool to open and read PDF text.
from langchain_community.vectorstores import FAISS  # A local database built for searching text similarity.
from langchain_huggingface import HuggingFaceEmbeddings  # Converts text into mathematical coordinates.
from langchain_text_splitters import RecursiveCharacterTextSplitter  # Chops long text into smaller blocks.
from llm import stream_llm  # Our streaming function from llm.py.
import redis  # A super-fast in-memory database used here for saving/caching answers.
from transformers import pipeline

# Connect to a local Redis server. It caches answers so we don't pay for the same question twice.
cache = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True)

# Load a model that translates words into numerical vectors (Embeddings).
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db_folder = "vector_db"  # The directory folder name to store our saved vector database.
vector_store = None  # Start with an empty database variable.

# When starting up, check if we already saved a PDF database folder before.
if os.path.exists(db_folder):
    # Load the existing database from the hard drive.
    vector_store = FAISS.load_local(
        folder_path=db_folder,
        embeddings=embeddings,
        allow_dangerous_deserialization=True,  # Needed to load local files safely.
    )
    print("FAISS Index loaded successfully!")
else:
    print(f"WARN: The folder '{db_folder}' does not exist yet.")


# Function to process an uploaded PDF.
def load_pdf(file_path):
    loader = PyPDFLoader(file_path)  # Point the tool to the temporary file path.
    docs = loader.load()  # Extract all text pages from the PDF.

    # Configure a text chopper: blocks of 800 characters with 150 characters overlapping.
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = splitter.split_documents(docs)  # Slice the document into manageable snippets.

    global vector_store  # Tell Python we are updating the global variable.
    # Turn text snippets into vectors and save them into the FAISS search database.
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("vector_db")  # Write the database to disk so it stays permanently.


# Function to find the answer to a user's question.
def get_answer(query):
    global vector_store

    # Error handling: if no database exists, the user forgot to upload a PDF.
    if vector_store is None:

        async def empty_db_stream():
            yield "Please upload a PDF document before asking questions."

        return StreamingResponse(empty_db_stream(), media_type="text/plain")

    # Set up the search engine using MMR (Maximum Marginal Relevance) to get diverse results.
    retriever = vector_store.as_retriever(
        search_type="mmr", search_kwargs={"k": 5}  # Pull the top 5 most relevant text chunks.
    )
    retrieved_docs = retriever.invoke(query)  # Search the database for text matching the question.
    # Bind the found text chunks together into one single block of text.
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    # Craft the master instruction prompt forcing the AI to only look at our document text.
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

    # Check our Redis cache to see if this exact question was answered before.
    cached = cache.get(query)

    # 🎯 CACHE HIT: If found, simulate streaming back the cached response quickly.
    if cached:

        async def cached_stream():
            for word in cached.split(" "):
                yield word + " "
                await asyncio.sleep(0.02)  # Small sleep delay to look like an active typing stream.

        return StreamingResponse(cached_stream(), media_type="text/plain")

    # ❌ CACHE MISS: Question is new. Talk to the actual AI model.
    async def generate():
        accumulated = ""  # Variable to collect text chunks so we can cache them later.
        for chunk in stream_llm(prompt):  # Run the streaming function from llm.py.
            accumulated += chunk  # Record each word chunk into our string tracker.
            yield chunk  # Send the chunk live to the user's web screen.

        # Save this brand-new answer into Redis cache for 3600 seconds (1 hour).
        cache.setex(query, 3600, accumulated)

    return StreamingResponse(generate(), media_type="text/plain")
