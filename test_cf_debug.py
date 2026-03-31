import requests
import json

# Test CF endpoint directly
url = "http://localhost:5001/recommend-cf"
data = {
    "interests": ["Programming & Coding", "Database & SQL"],
    "events": [
        {"id": "test1", "tags": ["Programming & Coding"]},
        {"id": "test2", "tags": ["Database & SQL"]}
    ],
    "method": "item",
    "k": 5
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")