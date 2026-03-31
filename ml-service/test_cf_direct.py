import sys
sys.path.append('c:\\Arjun\\acaconnect\\ml-service')

from model.cf_model import item_based_cf
import json

# Load interaction data
with open('c:\\Arjun\\acaconnect\\ml-service\\data\\interaction_matrix.json', 'r') as f:
    data = json.load(f)

print("=" * 70)
print("TESTING CF FUNCTION DIRECTLY")
print("=" * 70)

# Simulate user interests
user_interests = ["Programming & Coding", "Database & SQL"]
print(f"\nUser Interests: {user_interests}")

# Create events pool (just a few for testing)
events_pool = [
    {
        "id": "6977e66df51b849353f77a91",
        "title": "SQL WAR",
        "tags": ["Database & SQL", "Programming & Coding"]
    },
    {
        "id": "6977e66df51b849353f77a9b",
        "title": "UI/UX DEVELOPMENT",
        "tags": ["UI/UX Design", "Web Development", "Creative & Marketing"]
    },
    {
        "id": "6977e66df51b849353f77a9e",
        "title": "PITCH YOUR PROJECT CUM PRESENTATION",
        "tags": ["Project & Presentation", "Communication & Voice", "Creative & Marketing"]
    },
    {
        "id": "6977e66df51b849353f77a94",
        "title": "DEBUGGING WITH DSA",
        "tags": ["Debugging & Logic", "DSA & Problem Solving", "Programming & Coding"]
    }
]

print(f"\nEvents Pool: {len(events_pool)} events")
for e in events_pool:
    print(f"  - {e['title']}: {e['tags']}")

print("\n" + "=" * 70)
print("CALLING item_based_cf()...")
print("=" * 70)

# Call CF function
results = item_based_cf(user_interests, events_pool, top_k=5)

print("\n" + "=" * 70)
print("RESULTS:")
print("=" * 70)

for i, rec in enumerate(results, 1):
    event = next((e for e in events_pool if e['id'] == rec['event_id']), None)
    title = event['title'] if event else 'Unknown'
    print(f"{i}. {title}: {rec['similarity']:.3f} ({rec['similarity']*100:.1f}%)")

print("\n" + "=" * 70)
print("CO-OCCURRENCE DATA:")
print("=" * 70)
co_occur = data.get('coOccurrence', {})
print(f"Total patterns: {len(co_occur)}")
print("\nRelevant patterns:")
for key, count in co_occur.items():
    if 'SQL WAR' in key or 'UI/UX' in key:
        print(f"  {key}: {count}")
