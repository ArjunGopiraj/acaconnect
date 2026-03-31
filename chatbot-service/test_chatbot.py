import requests
import json
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

CHATBOT_URL = "http://localhost:5002"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{CHATBOT_URL}/health")
    print(json.dumps(response.json(), indent=2))
    print()

def test_chat(query):
    """Test chat endpoint"""
    print(f"Query: {query}")
    response = requests.post(
        f"{CHATBOT_URL}/chat",
        json={"query": query}
    )
    result = response.json()
    print(f"Response: {result.get('response', 'No response')}")
    print(f"Contexts used: {result.get('contexts_used', 0)}")
    print("-" * 60)
    print()

if __name__ == '__main__':
    # Test queries
    queries = [
        "What is NIRAL 2026?",
        "When is NIRAL happening?",
        "Tell me about technical events",
        "How do I register?",
        "Who are the coordinators?"
    ]
    
    print("=" * 60)
    print("NIRAL Chatbot Test")
    print("=" * 60)
    print()
    
    test_health()
    
    for query in queries:
        test_chat(query)
