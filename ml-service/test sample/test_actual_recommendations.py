import requests
import json

# Test data
test_request = {
    "interests": ["Programming & Coding", "Database & SQL"],
    "events": [
        {"id": "1", "tags": ["Database & SQL", "Programming & Coding"]},
        {"id": "2", "tags": ["Debugging & Logic", "DSA & Problem Solving", "Programming & Coding"]},
        {"id": "3", "tags": ["Technical Quiz", "Programming & Coding"]},
        {"id": "4", "tags": ["UI/UX Design", "Web Development", "Creative & Marketing"]},
        {"id": "5", "tags": ["Project & Presentation", "Communication & Voice", "Creative & Marketing"]}
    ],
    "k": 5
}

print("=" * 60)
print("TESTING ACTUAL RECOMMENDATIONS")
print("=" * 60)
print(f"\nUser Interests: {test_request['interests']}")
print(f"Number of Events: {len(test_request['events'])}")
print()

# Test KNN
print("1. TESTING KNN RECOMMENDATIONS:")
print("-" * 60)
try:
    response = requests.post('http://localhost:5001/recommend-knn', json=test_request)
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✅ KNN Working! Found {data['count']} recommendations")
            for i, rec in enumerate(data['recommendations'], 1):
                print(f"{i}. Event ID: {rec['event_id']}")
                print(f"   Similarity: {rec['similarity']*100:.1f}%")
                if 'user_similarity' in rec:
                    print(f"   Direct: {rec['user_similarity']*100:.1f}%, Pattern: {rec['pattern_similarity']*100:.1f}%")
                print()
        else:
            print(f"❌ Error: {data}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Connection Error: {e}")

print()

# Test CF
print("2. TESTING COLLABORATIVE FILTERING:")
print("-" * 60)
try:
    cf_request = {**test_request, "method": "item"}
    response = requests.post('http://localhost:5001/recommend-cf', json=cf_request)
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✅ CF Working! Found {data['count']} recommendations")
            for i, rec in enumerate(data['recommendations'], 1):
                print(f"{i}. Event ID: {rec['event_id']}")
                print(f"   Similarity: {rec['similarity']*100:.1f}%")
                print()
        else:
            print(f"❌ Error: {data}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
except Exception as e:
    print(f"❌ Connection Error: {e}")

print()

# Test Hybrid
print("3. TESTING HYBRID (KNN + CF):")
print("-" * 60)
try:
    hybrid_request = {**test_request, "knn_weight": 0.6, "cf_weight": 0.4}
    response = requests.post('http://localhost:5001/recommend-hybrid-cf', json=hybrid_request)
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✅ Hybrid Working! Found {data['count']} recommendations")
            print(f"Weights: KNN={data['weights']['knn']}, CF={data['weights']['cf']}")
            print()
            for i, rec in enumerate(data['recommendations'], 1):
                print(f"{i}. Event ID: {rec['event_id']}")
                print(f"   Hybrid Score: {rec['similarity']*100:.1f}%")
                if 'knn_score' in rec and 'cf_score' in rec:
                    print(f"   (KNN: {rec['knn_score']*100:.1f}%, CF: {rec['cf_score']*100:.1f}%)")
                print()
        else:
            print(f"❌ Error: {data}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
except Exception as e:
    print(f"❌ Connection Error: {e}")

print("=" * 60)
print("TEST COMPLETE")
print("=" * 60)
