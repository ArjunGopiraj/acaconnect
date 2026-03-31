import requests
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Testing Rule Queries")
print("=" * 80)

queries = [
    "what are the rules for SQL WAR",
    "rules for DEBUGGING WITH DSA", 
    "tell me rules for UI/UX DEVELOPMENT",
    "general rules for events",
    "what are the rules for TREASURE HUNT"
]

for q in queries:
    try:
        response = requests.post(
            'http://localhost:5002/chat',
            json={'query': q},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nQ: {q}")
            print(f"A: {data.get('response', 'No response')[:500]}...")
            print("-" * 80)
    except Exception as e:
        print(f"Error for '{q}': {e}")

print("\n" + "=" * 80)