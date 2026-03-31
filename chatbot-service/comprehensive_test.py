import requests
import json
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_query(query):
    """Test a single query"""
    try:
        response = requests.post(
            'http://localhost:5002/chat',
            json={'query': query},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nQ: {query}")
            print(f"A: {data.get('response', 'No response')}")
            print("-" * 80)
            return True
        else:
            print(f"ERROR: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

print("=" * 80)
print("COMPREHENSIVE CHATBOT TEST")
print("=" * 80)

# Test queries
queries = [
    # Greetings
    "hi",
    "hello",
    
    # Event listing
    "what are the events",
    "list all technical events",
    "show me non-technical events",
    
    # Specific events
    "tell me about SQL WAR",
    "what is the registration fee for SQL WAR",
    "what is the prize for DEBUGGING WITH DSA",
    
    # Dates and venue
    "when is NIRAL",
    "where is NIRAL held",
    
    # NIRAL info
    "what is NIRAL",
    "history of NIRAL",
    "tell me about IST department",
    
    # Rules
    "what are the rules for SQL WAR",
    "general rules for events",
    
    # Statistics
    "how many participants",
    "how many events are there",
    
    # Edge cases
    "is NIRAL free",
    "can I participate from other colleges",
    "what prizes can I win"
]

for query in queries:
    test_query(query)

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)