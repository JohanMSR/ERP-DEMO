FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for SQLite database
RUN mkdir -p /app/data /app/instance

# Expose port
EXPOSE 5000

# Run the application with startup script using bash
CMD ["bash", "start.sh"]