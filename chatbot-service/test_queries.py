import requests
import json

def test_chatbot_query(query):
    """Test a single query to the chatbot"""
    try:
        response = requests.post(
            'http://localhost:5002/chat',
            json={'query': query},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query: {query}")
            print(f"Response: {data.get('response', 'No response')}")
            print(f"Success: {data.get('success', False)}")
            print("-" * 60)
            return True
        else:
            print(f"Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to chatbot service on localhost:5002")
        print("Please start the service with: python app.py")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    print("=" * 60)
    print("Testing Enhanced NIRAL Chatbot")
    print("=" * 60)
    
    # Test queries
    test_queries = [
        "What is NIRAL?",
        "Tell me about IST department history",
        "What are the technical events?",
        "List all events",
        "What are the rules for events?",
        "How many participants are registered?"
    ]
    
    successful_tests = 0
    
    for query in test_queries:
        if test_chatbot_query(query):
            successful_tests += 1
        print()
    
    print("=" * 60)
    print(f"Test Results: {successful_tests}/{len(test_queries)} queries successful")
    print("=" * 60)

if __name__ == "__main__":
    main()