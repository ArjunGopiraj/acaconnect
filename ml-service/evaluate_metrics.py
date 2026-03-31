"""
Recommendation System Evaluation Metrics
Calculates: Precision, Recall, F1-Score, NDCG, MAP, Coverage, Diversity
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from model.cf_model import item_based_cf, load_real_interactions
from model.knn_model import create_student_vector, feature_cols, scaler, knn_model, X_scaled
import numpy as np
import pandas as pd
from collections import defaultdict
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

def precision_at_k(recommended, relevant, k):
    """Precision@K: Proportion of recommended items that are relevant"""
    recommended_k = recommended[:k]
    relevant_set = set(relevant)
    hits = len([r for r in recommended_k if r in relevant_set])
    return hits / k if k > 0 else 0

def recall_at_k(recommended, relevant, k):
    """Recall@K: Proportion of relevant items that are recommended"""
    recommended_k = recommended[:k]
    relevant_set = set(relevant)
    hits = len([r for r in recommended_k if r in relevant_set])
    return hits / len(relevant) if len(relevant) > 0 else 0

def f1_score(precision, recall):
    """F1 Score: Harmonic mean of precision and recall"""
    if precision + recall == 0:
        return 0
    return 2 * (precision * recall) / (precision + recall)

def ndcg_at_k(recommended, relevant, k):
    """NDCG@K: Normalized Discounted Cumulative Gain"""
    recommended_k = recommended[:k]
    relevant_set = set(relevant)
    
    # DCG: sum of (relevance / log2(position + 1))
    dcg = sum([1.0 / np.log2(i + 2) if rec in relevant_set else 0 
               for i, rec in enumerate(recommended_k)])
    
    # IDCG: ideal DCG (all relevant items at top)
    idcg = sum([1.0 / np.log2(i + 2) for i in range(min(len(relevant), k))])
    
    return dcg / idcg if idcg > 0 else 0

def average_precision(recommended, relevant):
    """Average Precision: Average of precision values at each relevant item"""
    relevant_set = set(relevant)
    precisions = []
    hits = 0
    
    for i, rec in enumerate(recommended):
        if rec in relevant_set:
            hits += 1
            precisions.append(hits / (i + 1))
    
    return np.mean(precisions) if precisions else 0

def catalog_coverage(all_recommendations, total_items):
    """Coverage: Percentage of catalog items that appear in recommendations"""
    unique_items = set()
    for recs in all_recommendations:
        unique_items.update(recs)
    return len(unique_items) / total_items if total_items > 0 else 0

def diversity_score(recommendations, events_pool):
    """Diversity: Average pairwise dissimilarity between recommended items"""
    if len(recommendations) < 2:
        return 0
    
    # Calculate tag-based dissimilarity
    dissimilarities = []
    for i in range(len(recommendations)):
        for j in range(i + 1, len(recommendations)):
            event1 = next((e for e in events_pool if e['id'] == recommendations[i]), None)
            event2 = next((e for e in events_pool if e['id'] == recommendations[j]), None)
            
            if event1 and event2:
                tags1 = set(event1.get('tags', []))
                tags2 = set(event2.get('tags', []))
                
                # Jaccard distance
                if len(tags1.union(tags2)) > 0:
                    similarity = len(tags1.intersection(tags2)) / len(tags1.union(tags2))
                    dissimilarities.append(1 - similarity)
    
    return np.mean(dissimilarities) if dissimilarities else 0

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

def get_cf_recommendations(user_interests, events_pool, k=5):
    """Get CF recommendations"""
    cf_results = item_based_cf(user_interests, events_pool, k)
    return [r['event_id'] for r in cf_results]

def get_hybrid_recommendations(user_interests, events_pool, k=5):
    """Get Hybrid KNN+CF recommendations"""
    # KNN scores
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
    
    # CF scores
    cf_recommendations = item_based_cf(user_interests, events_pool, k * 2)
    cf_scores = {rec['event_id']: rec['similarity'] for rec in cf_recommendations}
    
    # Combine
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

def evaluate_system(system_name, recommendation_func, k=5):
    """Evaluate a recommendation system"""
    print(f"\n{'='*70}")
    print(f"EVALUATING: {system_name}")
    print(f"{'='*70}")
    
    precisions = []
    recalls = []
    f1_scores = []
    ndcgs = []
    aps = []
    all_recommendations = []
    
    # Use leave-one-out: for each user, hide one event and try to recommend it
    evaluated_users = 0
    
    for interaction in interactions:
        user_email = interaction['user']
        user_events = interaction['events']
        
        if len(user_events) < 2:
            continue  # Need at least 2 events
        
        # Leave one out
        for i in range(len(user_events)):
            test_event = user_events[i]
            train_events = [e for j, e in enumerate(user_events) if j != i]
            
            # Get user interests from training events
            user_interests = get_user_interests_from_events(train_events)
            
            if not user_interests:
                continue
            
            # Get recommendations
            try:
                recommended = recommendation_func(user_interests, events_pool, k)
                all_recommendations.append(recommended)
                
                # Relevant items: the held-out event
                relevant = [test_event]
                
                # Calculate metrics
                p = precision_at_k(recommended, relevant, k)
                r = recall_at_k(recommended, relevant, k)
                f1 = f1_score(p, r)
                ndcg = ndcg_at_k(recommended, relevant, k)
                ap = average_precision(recommended, relevant)
                
                precisions.append(p)
                recalls.append(r)
                f1_scores.append(f1)
                ndcgs.append(ndcg)
                aps.append(ap)
                
                evaluated_users += 1
                
            except Exception as e:
                print(f"Error for user {user_email}: {e}")
                continue
    
    # Calculate averages
    avg_precision = np.mean(precisions) if precisions else 0
    avg_recall = np.mean(recalls) if recalls else 0
    avg_f1 = np.mean(f1_scores) if f1_scores else 0
    avg_ndcg = np.mean(ndcgs) if ndcgs else 0
    map_score = np.mean(aps) if aps else 0
    coverage = catalog_coverage(all_recommendations, len(events_pool))
    
    # Calculate diversity
    diversities = [diversity_score(recs, events_pool) for recs in all_recommendations if len(recs) > 1]
    avg_diversity = np.mean(diversities) if diversities else 0
    
    print(f"\nEvaluated on {evaluated_users} test cases")
    print(f"\nMetrics @K={k}:")
    print(f"  Precision@{k}:  {avg_precision:.4f} ({avg_precision*100:.2f}%)")
    print(f"  Recall@{k}:     {avg_recall:.4f} ({avg_recall*100:.2f}%)")
    print(f"  F1-Score@{k}:   {avg_f1:.4f} ({avg_f1*100:.2f}%)")
    print(f"  NDCG@{k}:       {avg_ndcg:.4f} ({avg_ndcg*100:.2f}%)")
    print(f"  MAP:            {map_score:.4f} ({map_score*100:.2f}%)")
    print(f"  Coverage:       {coverage:.4f} ({coverage*100:.2f}%)")
    print(f"  Diversity:      {avg_diversity:.4f} ({avg_diversity*100:.2f}%)")
    
    return {
        'precision': avg_precision,
        'recall': avg_recall,
        'f1_score': avg_f1,
        'ndcg': avg_ndcg,
        'map': map_score,
        'coverage': coverage,
        'diversity': avg_diversity,
        'test_cases': evaluated_users
    }

if __name__ == "__main__":
    print("\n" + "="*70)
    print("RECOMMENDATION SYSTEM EVALUATION")
    print("="*70)
    print(f"Dataset: {len(data['users'])} users, {len(events_pool)} events, {len(interactions)} interactions")
    print(f"Evaluation Method: Leave-One-Out Cross Validation")
    print(f"K (Top-K recommendations): 5")
    
    # Evaluate all three systems
    knn_metrics = evaluate_system("KNN (Hybrid with 10 Lakh Dataset)", get_knn_recommendations, k=5)
    cf_metrics = evaluate_system("Collaborative Filtering (CF)", get_cf_recommendations, k=5)
    hybrid_metrics = evaluate_system("Hybrid (KNN + CF)", get_hybrid_recommendations, k=5)
    
    # Comparison table
    print(f"\n{'='*70}")
    print("COMPARISON TABLE")
    print(f"{'='*70}")
    print(f"{'Metric':<20} {'KNN':<15} {'CF':<15} {'Hybrid':<15}")
    print(f"{'-'*70}")
    print(f"{'Precision@5':<20} {knn_metrics['precision']:.4f}          {cf_metrics['precision']:.4f}          {hybrid_metrics['precision']:.4f}")
    print(f"{'Recall@5':<20} {knn_metrics['recall']:.4f}          {cf_metrics['recall']:.4f}          {hybrid_metrics['recall']:.4f}")
    print(f"{'F1-Score@5':<20} {knn_metrics['f1_score']:.4f}          {cf_metrics['f1_score']:.4f}          {hybrid_metrics['f1_score']:.4f}")
    print(f"{'NDCG@5':<20} {knn_metrics['ndcg']:.4f}          {cf_metrics['ndcg']:.4f}          {hybrid_metrics['ndcg']:.4f}")
    print(f"{'MAP':<20} {knn_metrics['map']:.4f}          {cf_metrics['map']:.4f}          {hybrid_metrics['map']:.4f}")
    print(f"{'Coverage':<20} {knn_metrics['coverage']:.4f}          {cf_metrics['coverage']:.4f}          {hybrid_metrics['coverage']:.4f}")
    print(f"{'Diversity':<20} {knn_metrics['diversity']:.4f}          {cf_metrics['diversity']:.4f}          {hybrid_metrics['diversity']:.4f}")
    print(f"{'='*70}\n")
    
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
    
    with open('evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("Results saved to evaluation_results.json")
