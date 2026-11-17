FROM python:3.11.9-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces run as a non-root user (id 1000). 
# We need to create this user and give it ownership of the directory.
RUN useradd -m -u 1000 user

# Create directories that Flask expects and give ownership to the new user
RUN mkdir -p uploads data generated photos templates && chown -R user:user /app

# Switch to the new user
USER user

# Copy the rest of the application with appropriate ownership
COPY --chown=user:user . .

# Expose the default Hugging Face Spaces port
EXPOSE 7860

# Run gunicorn bound to 0.0.0.0:7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
