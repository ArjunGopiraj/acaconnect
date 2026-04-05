#!/usr/bin/env python3
"""Test True CF with real interaction data"""
import json

# Load real data
with open('data/interaction_matrix.json', 'r') as f:
    real_data = json.load(f)

def item_based_cf(user_interests, events_pool, top_k=5):
    """True Item-Based Collaborative Filtering"""
    print(f"[CF] True CF with {len(user_interests)} interests, {len(events_pool)} events")
    
    # Get event IDs and titles
    event_map = {e.get('id'): e.get('title', '') for e in events_pool}
    event_ids = list(event_map.keys())
    
    # Find seed events (matching user interests)
    seed_events = []
    for event in events_pool:
        event_tags = event.get('tags', [])
        matches = sum(1 for interest in user_interests if interest in event_tags)
        if matches > 0:
            seed_events.append((event.get('id'), event.get('title', '')))
    
    print(f"[CF] Seed events: {[title for _, title in seed_events]}")
    
    if not seed_events:
        print("[CF] No seed events!")
        return []
    
    # Use co-occurrence patterns
    co_occur_data = real_data.get('coOccurrence', {})
    event_scores = {}
    
    for event_id in event_ids:
        event_title = event_map.get(event_id, '')
        cf_score = 0.0
        
        # Check co-occurrence with each seed
        for seed_id, seed_title in seed_events:
            if seed_id == event_id:
                continue
            
            pair1 = f"{seed_title} + {event_title}"
            pair2 = f"{event_title} + {seed_title}"
            
            count = co_occur_data.get(pair1, 0) + co_occur_data.get(pair2, 0)
            if count > 0:
                cf_score += count / 5.0
                print(f"[CF] MATCH: '{seed_title}' + '{event_title}' = {count} users")
        
        # Add tag component
        event = next((e for e in events_pool if e.get('id') == event_id), None)
        if event:
            event_tags = event.get('tags', [])
            tag_matches = sum(1 for interest in user_interests if interest in event_tags)
            tag_score = tag_matches / len(user_interests) if user_interests else 0
            
            # 70% CF + 30% tags
            final_score = 0.7 * min(cf_score, 1.0) + 0.3 * tag_score
            event_scores[event_id] = final_score
            print(f"[CF] '{event_title}': CF={cf_score:.2f}, Tag={tag_score:.2f}, Final={final_score:.2f}")
    
    # Sort and return
    results = [
        {'event_id': eid, 'similarity': float(score)}
        for eid, score in event_scores.items()
    ]
    results.sort(key=lambda x: x['similarity'], reverse=True)
    
    return results[:top_k]

# Test with real scenario
print("=" * 70)
print("TESTING TRUE COLLABORATIVE FILTERING")
print("=" * 70)

user_interests = ["Programming & Coding", "Database & SQL"]
events_pool = real_data['events']

print(f"\nUser interests: {user_interests}")
print(f"Available events: {len(events_pool)}")
print("\n" + "=" * 70)

results = item_based_cf(user_interests, events_pool, 5)

print("\n" + "=" * 70)
print("TOP 5 RECOMMENDATIONS:")
print("=" * 70)
for i, rec in enumerate(results, 1):
    event_title = next((e['title'] for e in events_pool if e['id'] == rec['event_id']), 'Unknown')
    print(f"{i}. {event_title}: {rec['similarity']*100:.1f}%")
print("=" * 70)
