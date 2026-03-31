import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from model.cf_model import item_based_cf, load_real_interactions

# Test with 5 interests
user_interests = [
    "Programming & Coding",
    "Database & SQL", 
    "UI/UX Design",
    "General Quiz",
    "Photography & Media"
]

# Load events
data = load_real_interactions()
events_pool = data['events']

print(f"\n{'='*60}")
print(f"Testing CF with {len(user_interests)} interests:")
for interest in user_interests:
    print(f"  - {interest}")
print(f"{'='*60}\n")

# Get recommendations
results = item_based_cf(user_interests, events_pool, top_k=10)

print(f"\n{'='*60}")
print("FINAL RECOMMENDATIONS:")
print(f"{'='*60}")
for i, result in enumerate(results, 1):
    event = next((e for e in events_pool if e['id'] == result['event_id']), None)
    if event:
        score_pct = result['similarity'] * 100
        print(f"#{i} {event['title']}: {score_pct:.1f}%")
print(f"{'='*60}\n")
