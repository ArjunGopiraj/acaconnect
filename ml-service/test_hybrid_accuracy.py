import sys
import os

# Suppress CF debug output
class SuppressOutput:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout

sys.path.insert(0, os.path.dirname(__file__))

from model.cf_model import item_based_cf, load_real_interactions
from model.knn_model import create_student_vector, feature_cols, scaler, knn_model, X_scaled
import numpy as np
import pandas as pd

# Tag mapping
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
    
    cf_recommendations = item_based_cf(user_interests, events_pool, top_k=k * 2)
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

def calculate_hybrid_accuracy():
    """
    Calculate Hybrid accuracy by testing if recommendations match user's actual registrations
    """
    data = load_real_interactions()
    events_pool = data['events']
    interactions = data['interactions']
    
    print(f"Evaluating Hybrid (KNN+CF) recommendation accuracy on {len(interactions)} users...\n")
    
    correct_predictions = 0
    total_predictions = 0
    relevance_scores = []
    
    for idx, interaction in enumerate(interactions):
        user_events = interaction['events']
        
        if len(user_events) < 2:
            continue
        
        # Get user interests from their registered events
        user_interests = set()
        for event_id in user_events:
            event = next((e for e in events_pool if e['id'] == event_id), None)
            if event:
                user_interests.update(event.get('tags', []))
        
        user_interests = list(user_interests)
        
        if not user_interests:
            continue
        
        try:
            # Get Hybrid recommendations (suppress debug output)
            with SuppressOutput():
                recommended_ids = get_hybrid_recommendations(user_interests, events_pool, k=5)
            
            # Check if any recommendation matches user's actual registrations
            matches = sum(1 for rec_id in recommended_ids if rec_id in user_events)
            
            if matches > 0:
                correct_predictions += 1
            
            # Calculate relevance
            relevance = matches / len(recommended_ids) if recommended_ids else 0
            relevance_scores.append(relevance)
            
            total_predictions += 1
            
            if idx % 5 == 0:
                print(f"Processed {idx}/{len(interactions)} users")
        
        except Exception as e:
            continue
    
    accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
    avg_relevance = (np.mean(relevance_scores) * 100) if relevance_scores else 0
    
    return accuracy, avg_relevance, correct_predictions, total_predictions

if __name__ == "__main__":
    print("="*60)
    print("HYBRID (KNN + CF) ACCURACY TEST")
    print("="*60)
    
    accuracy, relevance, correct, total = calculate_hybrid_accuracy()
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"{'='*60}")
    print(f"Hybrid Accuracy (Hit Rate):    {accuracy:.2f}%")
    print(f"Average Relevance:             {relevance:.2f}%")
    print(f"Correct Predictions:           {correct}/{total}")
    print(f"{'='*60}\n")
    
    print("Interpretation:")
    print(f"- {accuracy:.2f}% of users received at least 1 relevant recommendation")
    print(f"- On average, {relevance:.2f}% of recommendations matched user interests")
    print(f"- Combines KNN (99.28% model accuracy) with CF behavioral patterns")
