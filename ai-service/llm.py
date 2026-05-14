import os  # Tool to read system environment variables.
from dotenv import load_dotenv  # Tool to read secrets from a hidden '.env' file.
from huggingface_hub import InferenceClient  # The official tool to talk to Hugging Face AI models.

# Look into the '.env' file and load the secret keys into the application memory.
load_dotenv()

# Initialize the AI client using your private Hugging Face Security Token.
client = InferenceClient(token=os.getenv("HF_TOKEN"))


# This function streams answers word-by-word instead of waiting for the whole block.
def stream_llm(prompt: str):
    # Format the input string into a structured chat history message list.
    messages = [{"role": "user", "content": prompt}]

    # Send the prompt request to the specific Qwen AI model.
    stream = client.chat_completion(
        model="Qwen/Qwen2.5-7B-Instruct",  # The exact open-source AI model used.
        messages=messages,  # The formatted text prompt.
        max_tokens=300,  # Limit the response length to 300 tokens.
        temperature=0.3,  # Low temperature makes the model focused and factual.
        stream=True,  # Critical: Tells the server to stream chunks back live.
    )

    # Loop through the raw incoming stream fragments from the AI server.
    for chunk in stream:
        # Safely verify that the AI returned a valid text chunk choice.
        if chunk.choices and chunk.choices[0].delta.content:
            # Yield sends the word chunk out immediately without stopping the function loop.
            yield chunk.choices[0].delta.content
