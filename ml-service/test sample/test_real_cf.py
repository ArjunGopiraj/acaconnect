import sys
sys.path.append('.')

from model.cf_model import real_data, interaction_matrix, event_similarity, item_based_cf

print("=" * 70)
print("TESTING CF MODEL WITH REAL DATA")
print("=" * 70)

if real_data:
    print(f"\n✓ Real data loaded successfully!")
    print(f"  Users: {len(real_data['users'])}")
    print(f"  Events: {len(real_data['events'])}")
    print(f"  Interactions: {len(real_data['interactions'])}")
    print(f"  Co-occurrence patterns: {len(real_data['coOccurrence'])}")
    
    print(f"\n✓ Interaction matrix shape: {interaction_matrix.shape}")
    print(f"✓ Event similarity matrix shape: {event_similarity.shape}")
    
    # Test item-based CF
    print("\n" + "-" * 70)
    print("Testing Item-Based CF:")
    print("-" * 70)
    
    test_interests = ["Programming & Coding", "Database & SQL"]
    test_events = [
        {"id": "1", "title": "SQL WAR", "tags": ["Database & SQL", "Programming & Coding"]},
        {"id": "2", "title": "DEBUGGING WITH DSA", "tags": ["Debugging & Logic", "DSA & Problem Solving"]},
        {"id": "3", "title": "UI/UX DEVELOPMENT", "tags": ["UI/UX Design", "Web Development"]}
    ]
    
    recommendations = item_based_cf(test_interests, test_events, top_k=3)
    
    print(f"\nUser Interests: {test_interests}")
    print(f"\nRecommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. Event ID: {rec['event_id']}")
        print(f"   Similarity: {rec['similarity']*100:.1f}%")
        if 'cf_boost' in rec:
            print(f"   CF Boost: {rec['cf_boost']:.2f}")
        print()
    
    if len(recommendations) > 0:
        print("✓ CF is working with real data!")
    else:
        print("⚠ CF returned no recommendations")
else:
    print("\n❌ Real data not loaded!")
    print("   Make sure interaction_matrix.json exists in ml-service/data/")

print("=" * 70)
