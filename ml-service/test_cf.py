import requests
import json

# Test the new CF endpoints
BASE_URL = "http://localhost:5001"

def test_cf_recommendations():
    """Test collaborative filtering endpoint"""
    
    # Test data
    test_data = {
        "interests": ["Programming & Coding", "Database & SQL"],
        "events": [
            {
                "id": "event1",
                "tags": ["Programming & Coding", "Web Development"]
            },
            {
                "id": "event2", 
                "tags": ["Database & SQL", "Technical Quiz"]
            },
            {
                "id": "event3",
                "tags": ["Creative & Marketing", "Fun & Engagement"]
            }
        ],
        "method": "item",
        "k": 3
    }
    
    print("Testing CF Recommendations...")
    
    # Test item-based CF
    test_data["method"] = "item"
    response = requests.post(f"{BASE_URL}/recommend-cf", json=test_data)
    print(f"Item-based CF: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Recommendations: {len(result.get('recommendations', []))}")
        print(json.dumps(result, indent=2))
    
    # Test matrix factorization CF
    test_data["method"] = "matrix"
    response = requests.post(f"{BASE_URL}/recommend-cf", json=test_data)
    print(f"Matrix CF: {response.status_code}")
    
    # Test user-based CF
    test_data["method"] = "user"
    response = requests.post(f"{BASE_URL}/recommend-cf", json=test_data)
    print(f"User-based CF: {response.status_code}")

def test_hybrid_cf():
    """Test hybrid KNN + CF endpoint"""
    
    test_data = {
        "interests": ["Programming & Coding", "Competitive Coding"],
        "events": [
            {
                "id": "event1",
                "tags": ["Programming & Coding", "DSA & Problem Solving"]
            },
            {
                "id": "event2",
                "tags": ["Database & SQL", "Technical Quiz"]
            }
        ],
        "k": 2,
        "knn_weight": 0.7,
        "cf_weight": 0.3
    }
    
    print("\nTesting Hybrid KNN + CF...")
    response = requests.post(f"{BASE_URL}/recommend-hybrid-cf", json=test_data)
    print(f"Hybrid CF: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    try:
        # Test health check first
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("ML Service is running!")
            test_cf_recommendations()
            test_hybrid_cf()
        else:
            print("ML Service not running. Start it first.")
    except requests.exceptions.ConnectionError:
        print("Cannot connect to ML service. Make sure it's running on port 5001.")