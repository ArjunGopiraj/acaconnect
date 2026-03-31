import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import os
import json
import time

# Force reload timestamp
CF_VERSION = time.time()
print(f"[CF] Loading cf_model.py version {CF_VERSION}")

# Path setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTERACTION_DATA_PATH = os.path.join(BASE_DIR, "..", "data", "interaction_matrix.json")

# Load real interaction data
def load_real_interactions():
    """Load real user-event interactions from database export"""
    try:
        with open(INTERACTION_DATA_PATH, 'r') as f:
            data = json.load(f)
        print(f"[OK] Loaded real interaction data: {len(data['users'])} users, {len(data['events'])} events")
        return data
    except FileNotFoundError:
        print("[WARNING] Real interaction data not found, using fallback")
        return None

real_data = load_real_interactions()

# Create interaction matrix from real data
def create_interaction_matrix():
    """Create user-event interaction matrix from real registrations"""
    if not real_data:
        # Fallback to empty matrix
        return np.zeros((10, 10)), {}
    
    users = real_data['users']
    events = real_data['events']
    interactions = real_data['interactions']
    
    n_users = len(users)
    n_events = len(events)
    
    # Create user and event ID mappings
    user_to_idx = {user: idx for idx, user in enumerate(users)}
    event_id_to_idx = {event['id']: idx for idx, event in enumerate(events)}
    
    # Create interaction matrix (users x events)
    interaction_matrix = np.zeros((n_users, n_events))
    
    # Fill matrix with real interactions
    for interaction in interactions:
        user_email = interaction['user']
        if user_email in user_to_idx:
            user_idx = user_to_idx[user_email]
            for event_id in interaction['events']:
                if event_id in event_id_to_idx:
                    event_idx = event_id_to_idx[event_id]
                    interaction_matrix[user_idx][event_idx] = 1.0  # Binary: registered or not
    
    # Calculate event-event similarity based on co-registrations
    event_similarity = cosine_similarity(interaction_matrix.T)  # Transpose to get event x event
    
    return interaction_matrix, event_similarity, event_id_to_idx

# Initialize CF components
interaction_matrix, event_similarity, event_id_map = create_interaction_matrix()

# Matrix Factorization using SVD on real data
if interaction_matrix.shape[0] > 1 and interaction_matrix.shape[1] > 1:
    n_components = min(10, min(interaction_matrix.shape) - 1)  # Adjust based on matrix size
    if n_components > 0:
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        user_factors = svd.fit_transform(interaction_matrix)
        event_factors = svd.components_.T
    else:
        svd = None
        user_factors = None
        event_factors = None
else:
    svd = None
    user_factors = None
    event_factors = None

def user_based_cf(user_vector, top_k=5):
    """User-based collaborative filtering"""
    # Find similar users based on preferences
    user_similarities = cosine_similarity([user_vector], interaction_matrix)[0]
    
    # Get top similar users
    similar_users = np.argsort(user_similarities)[::-1][:10]
    
    # Aggregate recommendations from similar users
    recommendations = np.zeros(len(df))
    for user_idx in similar_users:
        if user_similarities[user_idx] > 0.1:  # Threshold
            recommendations += interaction_matrix[user_idx] * user_similarities[user_idx]
    
    # Get top k recommendations
    top_events = np.argsort(recommendations)[::-1][:top_k]
    
    results = []
    for idx in top_events:
        if recommendations[idx] > 0:
            results.append({
                "event_id": int(df.iloc[idx]["event_id"]),
                "similarity": float(recommendations[idx])
            })
    
    return results

def item_based_cf(user_interests, events_pool, top_k=5):
    """True Item-Based Collaborative Filtering using interaction matrix"""
    # Reload data on each call to get latest registrations
    current_data = load_real_interactions()
    if not current_data:
        current_data = real_data  # Fallback to module-level data
    
    print(f"[CF v{CF_VERSION}] True CF with {len(user_interests)} interests, {len(events_pool)} events")
    print(f"[CF] Using data with {len(current_data.get('users', []))} users, {len(current_data.get('events', []))} events")
    
    if not events_pool or not current_data:
        print("[CF] No events or no interaction data, falling back to tag matching")
        return tag_based_fallback(user_interests, events_pool, top_k)
    
    # Get event IDs and titles from pool
    event_map = {e.get('id'): e.get('title', '') for e in events_pool}
    event_ids = list(event_map.keys())
    
    # Find seed events (events matching user interests)
    seed_events = []
    for event in events_pool:
        event_tags = event.get('tags', [])
        print(f"[CF DEBUG] Checking event '{event.get('title')}' with tags: {event_tags}")
        print(f"[CF DEBUG] User interests: {user_interests}")
        matches = sum(1 for interest in user_interests if interest in event_tags)
        print(f"[CF DEBUG] Matches found: {matches}")
        if matches > 0:
            seed_events.append((event.get('id'), event.get('title', '')))
            print(f"[CF DEBUG] Added as seed event: {event.get('title')}")
    
    print(f"[CF] Found {len(seed_events)} seed events: {[title for _, title in seed_events]}")
    
    if not seed_events:
        print("[CF] No seed events, using tag-based fallback")
        return tag_based_fallback(user_interests, events_pool, top_k)
    
    # Use co-occurrence patterns
    co_occur_data = current_data.get('coOccurrence', {})
    event_scores = {}
    num_seeds = len(seed_events) if seed_events else 1
    
    for event_id in event_ids:
        event_title = event_map.get(event_id, '')
        cf_score = 0.0
        
        # Check co-occurrence with each seed event
        for seed_id, seed_title in seed_events:
            if seed_id == event_id:
                continue  # Skip self
            
            # Try both orderings of the pair
            pair1 = f"{seed_title} + {event_title}"
            pair2 = f"{event_title} + {seed_title}"
            
            count = co_occur_data.get(pair1, 0) + co_occur_data.get(pair2, 0)
            if count > 0:
                cf_score += count / 6.0  # Normalize by max co-occurrence count
                print(f"[CF] Co-occurrence: '{seed_title}' + '{event_title}' = {count}")
        
        # Normalize by number of seed events to prevent score inflation
        cf_score = cf_score / num_seeds
        
        # Add tag-based component (30%)
        event = next((e for e in events_pool if e.get('id') == event_id), None)
        if event:
            event_tags = event.get('tags', [])
            print(f"[CF DEBUG] Event '{event_title}' tags: {event_tags}")
            print(f"[CF DEBUG] User interests for matching: {user_interests}")
            tag_matches = sum(1 for interest in user_interests if interest in event_tags)
            print(f"[CF DEBUG] Tag matches: {tag_matches}")
            tag_score = tag_matches / len(user_interests) if user_interests else 0
            print(f"[CF DEBUG] Tag score: {tag_score}")
            
            # Combine: 70% CF + 30% tags
            final_score = 0.7 * min(cf_score, 1.0) + 0.3 * tag_score
            event_scores[event_id] = final_score
            print(f"[CF] '{event_title}': CF={cf_score:.2f}, Tag={tag_score:.2f}, Final={final_score:.2f}")
    
    # Convert to list and sort
    results = [
        {'event_id': eid, 'similarity': float(score)}
        for eid, score in event_scores.items()
    ]
    results.sort(key=lambda x: x['similarity'], reverse=True)
    
    print(f"[CF] Total results before sorting: {len(results)}")
    all_scores = [(event_map.get(r['event_id']), round(r['similarity'], 3)) for r in results]
    print(f"[CF] All scores: {all_scores}")
    top_scores = [(event_map.get(r['event_id']), round(r['similarity'], 3)) for r in results[:top_k]]
    print(f"[CF] Top {top_k} results: {top_scores}")
    return results[:top_k]

def tag_based_fallback(user_interests, events_pool, top_k=5):
    """Fallback to simple tag matching when CF data unavailable"""
    event_scores = []
    for event in events_pool:
        event_tags = event.get('tags', [])
        matches = sum(1 for interest in user_interests if interest in event_tags)
        similarity = matches / len(user_interests) if user_interests else 0
        event_scores.append({
            'event_id': event.get('id'),
            'similarity': float(similarity)
        })
    event_scores.sort(key=lambda x: x['similarity'], reverse=True)
    return event_scores[:top_k]

def matrix_factorization_cf(user_vector, top_k=5):
    """Matrix factorization based collaborative filtering"""
    if svd is None or event_factors is None:
        return []
    
    try:
        # Project user vector to latent space
        user_latent = svd.transform([user_vector])[0]
        
        # Calculate scores for all events
        event_scores = np.dot(user_latent, event_factors.T)
        
        # Get top k recommendations
        top_events = np.argsort(event_scores)[::-1][:top_k]
        
        results = []
        for idx in top_events:
            if event_scores[idx] > 0 and idx < len(real_data['events']):
                results.append({
                    "event_id": real_data['events'][idx]['id'],
                    "similarity": float(event_scores[idx])
                })
        
        return results
    except Exception as e:
        print(f"Matrix factorization error: {e}")
        return []