"""
Enhanced Recommendation System Evaluation with Accuracy and Relevance Score
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from model.cf_model import item_based_cf, load_real_interactions
from model.knn_model import create_student_vector, feature_cols, scaler, knn_model, X_scaled
import numpy as np
import pandas as pd
import json

# Load real interaction data
data = load_real_interactions()
events_pool = data['events']
interactions = data['interactions']

# Tag mapping for KNN
TAG_MAPPING = {
    "Programming & Coding": "Programming_Coding",
    "Database & SQL": "Database_SQL",
    "DSA & Problem Solving": "DSA_Problem_Solving",
    "Debugging & Logic": "Debugging_Logic",
    "Web Development": "Web_UI_UX",
    "UI/UX Design": "Web_UI_UX",
    "Project & Presentation": "Project_Presentation",
    "Technical Quiz": "Technical_Quiz",
    "General Quiz": "General_Quiz",
    "Management & Strategy": "Management_Strategy",
    "Creative & Marketing": "Creative_Marketing",
    "Photography & Media": "Photography_Media",
    "Fun & Engagement": "Fun_Engagement",
    "Communication & Voice": "Communication_Voice"
}

def get_user_interests_from_events(user_events):
    """Extract unique tags from user's registered events"""
    interests = set()
    for event_id in user_events:
        event = next((e for e in events_pool if e['id'] == event_id), None)
        if event:
            interests.update(event.get('tags', []))
    return list(interests)

def calculate_relevance_score(recommended, user_events, events_pool):
    """
    Relevance Score: Measures how relevant recommendations are based on tag overlap
    Returns score between 0-100%
    """
    if not recommended or not user_events:
        return 0
    
    # Get tags from user's actual events
    user_tags = set()
    for event_id in user_events:
        event = next((e for e in events_pool if e['id'] == event_id), None)
        if event:
            user_tags.update(event.get('tags', []))
    
    if not user_tags:
        return 0
    
    # Calculate relevance for each recommendation
    relevance_scores = []
    for rec_id in recommended:
        rec_event = next((e for e in events_pool if e['id'] == rec_id), None)
        if rec_event:
            rec_tags = set(rec_event.get('tags', []))
            if rec_tags:
                overlap = len(user_tags.intersection(rec_tags))
                relevance = overlap / len(user_tags)
                relevance_scores.append(relevance)
    
    return np.mean(relevance_scores) if relevance_scores else 0

def calculate_hit_rate(recommended, relevant):
    """
    Hit Rate: Did we recommend at least one relevant item?
    Returns 1 if yes, 0 if no
    """
    return 1 if any(r in relevant for r in recommended) else 0

def calculate_accuracy(all_hits, total_tests):
    """
    Accuracy: Percentage of times we successfully recommended at least one relevant item
    """
    return (all_hits / total_tests * 100) if total_tests > 0 else 0

def get_cf_recommendations(user_interests, events_pool, k=5):
    """Get CF recommendations"""
    cf_results = item_based_cf(user_interests, events_pool, k)
    return [r['event_id'] for r in cf_results]

def get_knn_recommendations(user_interests, events_pool, k=5):
    """Get KNN recommendations"""
    user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
    if not user_domains:
        return []
    
    user_vector = create_student_vector(user_domains)
    student_df = pd.DataFrame([user_vector], columns=feature_cols)
    student_scaled = scaler.transform(student_df)
    
    distances_global, indices_global = knn_model.kneighbors(student_scaled, n_neighbors=50)
    similar_events_vectors = X_scaled[indices_global[0]]
    learned_pattern = np.mean(similar_events_vectors, axis=0)
    
    event_scores = []
    for event in events_pool:
        event_tags = event.get('tags', [])
        event_domains = [TAG_MAPPING.get(tag, tag) for tag in event_tags if tag in TAG_MAPPING]
        
        if event_domains:
            event_vector = create_student_vector(event_domains)
            event_df = pd.DataFrame([event_vector], columns=feature_cols)
            event_scaled = scaler.transform(event_df)[0]
            
            pattern_similarity = np.dot(learned_pattern, event_scaled) / (
                np.linalg.norm(learned_pattern) * np.linalg.norm(event_scaled) + 1e-10
            )
            user_similarity = np.dot(user_vector, event_vector) / (
                np.linalg.norm(user_vector) * np.linalg.norm(event_vector) + 1e-10
            )
            
            hybrid_score = 0.7 * user_similarity + 0.3 * pattern_similarity
            event_scores.append((event.get('id'), hybrid_score))
    
    event_scores.sort(key=lambda x: x[1], reverse=True)
    return [e[0] for e in event_scores[:k]]

def get_hybrid_recommendations(user_interests, events_pool, k=5):
    """Get Hybrid KNN+CF recommendations"""
    user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
    if not user_domains:
        return []
    
    user_vector = create_student_vector(user_domains)
    student_df = pd.DataFrame([user_vector], columns=feature_cols)
    student_scaled = scaler.transform(student_df)
    
    distances_global, indices_global = knn_model.kneighbors(student_scaled, n_neighbors=50)
    similar_events_vectors = X_scaled[indices_global[0]]
    learned_pattern = np.mean(similar_events_vectors, axis=0)
    
    knn_scores = {}
    for event in events_pool:
        event_tags = event.get('tags', [])
        event_domains = [TAG_MAPPING.get(tag, tag) for tag in event_tags if tag in TAG_MAPPING]
        if event_domains:
            event_vector = create_student_vector(event_domains)
            event_df = pd.DataFrame([event_vector], columns=feature_cols)
            event_scaled = scaler.transform(event_df)[0]
            
            pattern_similarity = np.dot(learned_pattern, event_scaled) / (
                np.linalg.norm(learned_pattern) * np.linalg.norm(event_scaled) + 1e-10
            )
            user_similarity = np.dot(user_vector, event_vector) / (
                np.linalg.norm(user_vector) * np.linalg.norm(event_vector) + 1e-10
            )
            
            knn_scores[event.get('id')] = 0.7 * user_similarity + 0.3 * pattern_similarity
    
    cf_recommendations = item_based_cf(user_interests, events_pool, k * 2)
    cf_scores = {rec['event_id']: rec['similarity'] for rec in cf_recommendations}
    
    hybrid_scores = []
    for event in events_pool:
        event_id = event.get('id')
        knn_score = knn_scores.get(event_id, 0)
        cf_score = cf_scores.get(event_id, 0)
        hybrid_score = 0.6 * knn_score + 0.4 * cf_score
        
        if hybrid_score > 0:
            hybrid_scores.append((event_id, hybrid_score))
    
    hybrid_scores.sort(key=lambda x: x[1], reverse=True)
    return [e[0] for e in hybrid_scores[:k]]

def evaluate_system_enhanced(system_name, recommendation_func, k=5):
    """Enhanced evaluation with Accuracy and Relevance Score"""
    print(f"\n{'='*70}")
    print(f"EVALUATING: {system_name}")
    print(f"{'='*70}")
    
    hits = 0
    total_tests = 0
    relevance_scores = []
    
    for interaction in interactions:
        user_email = interaction['user']
        user_events = interaction['events']
        
        if len(user_events) < 2:
            continue
        
        # Use all events to get user interests
        user_interests = get_user_interests_from_events(user_events)
        
        if not user_interests:
            continue
        
        try:
            # Get recommendations
            recommended = recommendation_func(user_interests, events_pool, k)
            
            # Calculate Hit Rate (did we recommend at least one event they registered for?)
            hit = calculate_hit_rate(recommended, user_events)
            hits += hit
            
            # Calculate Relevance Score (how relevant are recommendations based on tags?)
            relevance = calculate_relevance_score(recommended, user_events, events_pool)
            relevance_scores.append(relevance)
            
            total_tests += 1
            
        except Exception as e:
            continue
    
    # Calculate metrics
    accuracy = (hits / total_tests * 100) if total_tests > 0 else 0
    avg_relevance = (np.mean(relevance_scores) * 100) if relevance_scores else 0
    
    print(f"\nEvaluated on {total_tests} users")
    print(f"\nKey Metrics:")
    print(f"  Accuracy (Hit Rate):     {accuracy:.2f}%")
    print(f"  Relevance Score:         {avg_relevance:.2f}%")
    print(f"  Successful Hits:         {hits}/{total_tests}")
    
    return {
        'accuracy': accuracy,
        'relevance_score': avg_relevance,
        'hits': hits,
        'total_tests': total_tests
    }

if __name__ == "__main__":
    print("\n" + "="*70)
    print("ENHANCED RECOMMENDATION SYSTEM EVALUATION")
    print("="*70)
    print(f"Dataset: {len(data['users'])} users, {len(events_pool)} events")
    print(f"Metrics: Accuracy (Hit Rate) & Relevance Score")
    print(f"K (Top-K recommendations): 5")
    
    # Evaluate all three systems
    print("\n" + "="*70)
    knn_metrics = evaluate_system_enhanced("KNN (Hybrid with 10 Lakh Dataset)", get_knn_recommendations, k=5)
    
    print("\n" + "="*70)
    cf_metrics = evaluate_system_enhanced("Collaborative Filtering (CF)", get_cf_recommendations, k=5)
    
    print("\n" + "="*70)
    hybrid_metrics = evaluate_system_enhanced("Hybrid (KNN + CF)", get_hybrid_recommendations, k=5)
    
    # Final comparison table
    print(f"\n{'='*70}")
    print("FINAL COMPARISON - KEY METRICS")
    print(f"{'='*70}")
    print(f"{'System':<30} {'Accuracy':<15} {'Relevance Score':<20}")
    print(f"{'-'*70}")
    print(f"{'KNN':<30} {knn_metrics['accuracy']:.2f}%{' '*10} {knn_metrics['relevance_score']:.2f}%")
    print(f"{'Collaborative Filtering':<30} {cf_metrics['accuracy']:.2f}%{' '*10} {cf_metrics['relevance_score']:.2f}%")
    print(f"{'Hybrid (KNN + CF)':<30} {hybrid_metrics['accuracy']:.2f}%{' '*10} {hybrid_metrics['relevance_score']:.2f}%")
    print(f"{'='*70}")
    
    print("\n📊 INTERPRETATION:")
    print(f"  • Accuracy: % of users who got at least 1 relevant recommendation")
    print(f"  • Relevance Score: How well recommendations match user interests")
    print(f"  • Higher is better for both metrics")
    
    # Determine best system
    best_accuracy = max(knn_metrics['accuracy'], cf_metrics['accuracy'], hybrid_metrics['accuracy'])
    best_relevance = max(knn_metrics['relevance_score'], cf_metrics['relevance_score'], hybrid_metrics['relevance_score'])
    
    print(f"\n🏆 BEST PERFORMANCE:")
    if cf_metrics['accuracy'] == best_accuracy:
        print(f"  • Accuracy: Collaborative Filtering ({cf_metrics['accuracy']:.2f}%)")
    elif hybrid_metrics['accuracy'] == best_accuracy:
        print(f"  • Accuracy: Hybrid ({hybrid_metrics['accuracy']:.2f}%)")
    else:
        print(f"  • Accuracy: KNN ({knn_metrics['accuracy']:.2f}%)")
    
    if cf_metrics['relevance_score'] == best_relevance:
        print(f"  • Relevance: Collaborative Filtering ({cf_metrics['relevance_score']:.2f}%)")
    elif hybrid_metrics['relevance_score'] == best_relevance:
        print(f"  • Relevance: Hybrid ({hybrid_metrics['relevance_score']:.2f}%)")
    else:
        print(f"  • Relevance: KNN ({knn_metrics['relevance_score']:.2f}%)")
    
    # Save results
    results = {
        'knn': knn_metrics,
        'cf': cf_metrics,
        'hybrid': hybrid_metrics,
        'dataset_info': {
            'users': len(data['users']),
            'events': len(events_pool),
            'interactions': len(interactions)
        }
    }
    
    with open('evaluation_enhanced.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Results saved to evaluation_enhanced.json\n")
