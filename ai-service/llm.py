from huggingface_hub import InferenceClient
import os
from fastapi.responses import StreamingResponse

client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    token=os.getenv("HF_TOKEN")
)

def stream_llm(prompt: str):
    stream = client.text_generation(
        prompt,
        max_new_tokens=300,
        temperature=0.3,
        stream=True
    )

    for chunk in stream:
        yield chunk