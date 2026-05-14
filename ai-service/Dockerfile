FROM python:3.10 
# or try lightweight 3.11-slim

# Prevent python from buffering logs (Ensure logs appear instantly in kubectl logs)   
ENV PYTHONUNBUFFERED=1

# Prevents .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create vector DB persistence directory
RUN mkdir -p /app/vector_db

# Expose FastAPI port
EXPOSE 3003

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3003", "--workers", "1"]