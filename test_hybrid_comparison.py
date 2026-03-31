import requests
import json

# Test with 5 interests
user_interests = [
    "Programming & Coding",
    "Database & SQL", 
    "UI/UX Design",
    "General Quiz",
    "Photography & Media"
]

# Get all events from backend
backend_url = "http://localhost:5000"
ml_url = "http://localhost:5001"

print("Fetching events from backend...")
response = requests.get(f"{backend_url}/api/events/published")
events = response.json()
print(f"Found {len(events)} events\n")

print("="*70)
print("TESTING HYBRID KNN+CF RECOMMENDATION")
print("="*70)
print(f"User Interests: {user_interests}\n")

# Test Hybrid KNN+CF
print("\n" + "="*70)
print("HYBRID (KNN + CF) RECOMMENDATIONS:")
print("="*70)
try:
    hybrid_response = requests.post(
        f"{ml_url}/recommend-hybrid-cf",
        json={
            "user_interests": user_interests,
            "events": events
        }
    )
    hybrid_results = hybrid_response.json()
    
    if 'recommendations' in hybrid_results:
        for i, rec in enumerate(hybrid_results['recommendations'][:10], 1):
            event = next((e for e in events if e['_id'] == rec['event_id']), None)
            if event:
                score = rec['similarity'] * 100
                print(f"#{i} {event['title']}: {score:.1f}%")
    else:
        print("No recommendations returned")
except Exception as e:
    print(f"Error: {e}")

# Test Pure KNN
print("\n" + "="*70)
print("PURE KNN RECOMMENDATIONS:")
print("="*70)
try:
    knn_response = requests.post(
        f"{ml_url}/recommend",
        json={"user_interests": user_interests}
    )
    knn_results = knn_response.json()
    
    if 'recommendations' in knn_results:
        for i, rec in enumerate(knn_results['recommendations'][:10], 1):
            event = next((e for e in events if e['_id'] == rec['event_id']), None)
            if event:
                score = rec['similarity'] * 100
                print(f"#{i} {event['title']}: {score:.1f}%")
    else:
        print("No recommendations returned")
except Exception as e:
    print(f"Error: {e}")

# Test Pure CF
print("\n" + "="*70)
print("PURE CF RECOMMENDATIONS:")
print("="*70)
try:
    cf_response = requests.post(
        f"{ml_url}/recommend-cf",
        json={
            "user_interests": user_interests,
            "events": events
        }
    )
    cf_results = cf_response.json()
    
    if 'recommendations' in cf_results:
        for i, rec in enumerate(cf_results['recommendations'][:10], 1):
            event = next((e for e in events if e['_id'] == rec['event_id']), None)
            if event:
                score = rec['similarity'] * 100
                print(f"#{i} {event['title']}: {score:.1f}%")
    else:
        print("No recommendations returned")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*70)
