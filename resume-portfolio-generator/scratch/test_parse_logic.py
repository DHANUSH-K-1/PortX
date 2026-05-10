import sys
import os
import json
import requests
from dotenv import load_dotenv

# Add the project directory to sys.path
sys.path.append(os.path.abspath('.'))

load_dotenv(override=True)

from app import extract_resume_data_with_openrouter

def test_parsing():
    test_text = "Name: John Doe\nEmail: john@example.com\nSkills: Python, Flask, MongoDB"
    print("Testing resume parsing with OpenRouter...")
    try:
        data = extract_resume_data_with_openrouter(test_text)
        print("Parsed Data:")
        print(json.dumps(data, indent=4))
    except Exception as e:
        print(f"Error during parsing: {e}")

if __name__ == "__main__":
    test_parsing()
