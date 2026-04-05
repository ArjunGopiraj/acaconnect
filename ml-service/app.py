from flask import Flask, request, jsonify
from flask_cors import CORS
import importlib
import sys
import os

# Force reload of cf_model on every request in debug mode
if 'model.cf_model' in sys.modules:
    del sys.modules['model.cf_model']

from model.knn_model import create_student_vector, recommend_events, knn_model, scaler, feature_cols, X_scaled, df
from model.cf_model import user_based_cf, item_based_cf, matrix_factorization_cf
import numpy as np
import pandas as pd
import joblib

# Load budget prediction model
budget_data = joblib.load(os.path.join(os.path.dirname(__file__), 'model', 'budget_model.pkl'))
budget_model = budget_data['model']
budget_feature_cols = budget_data['feature_cols']
budget_target_cols = budget_data['target_cols']

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend

# Tag mapping: Frontend tags to ML model domains
TAG_MAPPING = {
    "Programming & Coding": "Programming_Coding",
    "Competitive Coding": "Competitive_Coding",
    "Database & SQL": "Database_SQL",
    "DSA & Problem Solving": "DSA_Problem_Solving",
    "Debugging & Logic": "Debugging_Logic",
    "Cyber Security": "Cyber_Security",
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

# Reverse mapping: ML domains to Frontend tags
REVERSE_TAG_MAPPING = {v: k for k, v in TAG_MAPPING.items()}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ML Recommendation Service"})

@app.route('/recommend-knn', methods=['POST'])
def get_knn_recommendations():
    """
    Hybrid KNN: Use 10 lakh dataset to learn patterns, apply to published events
    Request: { "interests": [...], "events": [{"id": "...", "tags": [...]}], "k": 5 }
    Response: { "recommendations": [{"event_id": "...", "similarity": 0.95}] }
    """
    try:
        data = request.json
        user_interests = data.get('interests', [])
        events_pool = data.get('events', [])
        k = data.get('k', 5)
        
        if not user_interests or not events_pool:
            return jsonify({"error": "No interests or events provided"}), 400
        
        # Map user interests to ML domains
        user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
        if not user_domains:
            return jsonify({"error": "No valid interests"}), 400
        
        # Create user vector
        user_vector = create_student_vector(user_domains)
        
        # STEP 1: Use pre-trained KNN on 10 lakh dataset to find similar events
        # This learns what event patterns are popular for this interest profile
        student_df = pd.DataFrame([user_vector], columns=feature_cols)
        student_scaled = scaler.transform(student_df)
        
        # Find 50 nearest neighbors from 10 lakh dataset to learn patterns
        distances_global, indices_global = knn_model.kneighbors(student_scaled, n_neighbors=50)
        
        # Extract learned pattern: average vector of similar events from 10 lakh dataset
        similar_events_vectors = X_scaled[indices_global[0]]
        learned_pattern = np.mean(similar_events_vectors, axis=0)  # Average of 50 similar events
        
        # STEP 2: Score YOUR published events using learned pattern
        event_scores = []
        
        for event in events_pool:
            event_tags = event.get('tags', [])
            event_domains = [TAG_MAPPING.get(tag, tag) for tag in event_tags if tag in TAG_MAPPING]
            
            if not event_domains:
                continue
            
            # Create event vector
            event_vector = create_student_vector(event_domains)
            event_df = pd.DataFrame([event_vector], columns=feature_cols)
            event_scaled = scaler.transform(event_df)[0]
            
            # Calculate similarity to learned pattern (from 10 lakh dataset)
            pattern_similarity = np.dot(learned_pattern, event_scaled) / (
                np.linalg.norm(learned_pattern) * np.linalg.norm(event_scaled) + 1e-10
            )
            
            # Also calculate direct similarity to user interests
            user_similarity = np.dot(user_vector, event_vector) / (
                np.linalg.norm(user_vector) * np.linalg.norm(event_vector) + 1e-10
            )
            
            # Hybrid score: 70% user similarity + 30% pattern similarity
            hybrid_score = 0.7 * user_similarity + 0.3 * pattern_similarity
            
            event_scores.append({
                'event_id': event.get('id'),
                'similarity': float(hybrid_score),
                'user_similarity': float(user_similarity),
                'pattern_similarity': float(pattern_similarity)
            })
        
        # STEP 3: Sort by hybrid score and return top k
        event_scores.sort(key=lambda x: x['similarity'], reverse=True)
        recommendations = event_scores[:min(k, len(event_scores))]
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "total_evaluated": len(event_scores),
            "knn_used": True,
            "pattern_learned_from": 50,
            "dataset_size": len(df)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/score-event', methods=['POST'])
def score_event():
    """
    Score a single event based on user interests
    Request: { "interests": ["Programming & Coding"], "event_tags": ["Programming & Coding", "Database & SQL"] }
    Response: { "similarity": 0.95 }
    """
    try:
        data = request.json
        user_interests = data.get('interests', [])
        event_tags = data.get('event_tags', [])
        
        if not user_interests or not event_tags:
            return jsonify({
                "similarity": 0,
                "message": "No interests or tags provided"
            })
        
        # Map to ML domains
        user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
        event_domains = [TAG_MAPPING.get(tag, tag) for tag in event_tags if tag in TAG_MAPPING]
        
        if not user_domains or not event_domains:
            return jsonify({"similarity": 0})
        
        # Create vectors
        user_vector = create_student_vector(user_domains)
        event_vector = create_student_vector(event_domains)
        
        # Calculate cosine similarity
        dot_product = np.dot(user_vector, event_vector)
        user_norm = np.linalg.norm(user_vector)
        event_norm = np.linalg.norm(event_vector)
        
        if user_norm == 0 or event_norm == 0:
            similarity = 0
        else:
            similarity = dot_product / (user_norm * event_norm)
        
        return jsonify({
            "success": True,
            "similarity": float(similarity)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    """
    Get event recommendations based on user interests
    Request body: { "interests": ["Programming & Coding", "Competitive Coding"] }
    """
    try:
        data = request.json
        user_interests = data.get('interests', [])
        top_k = data.get('top_k', 5)
        
        if not user_interests:
            return jsonify({"error": "No interests provided"}), 400
        
        # Map frontend tags to ML domains
        ml_domains = []
        for interest in user_interests:
            if interest in TAG_MAPPING:
                ml_domains.append(TAG_MAPPING[interest])
        
        if not ml_domains:
            return jsonify({"error": "No valid interests found"}), 400
        
        # Create student vector
        student_vector = create_student_vector(ml_domains)
        
        # Get recommendations from 10 lakh dataset
        recommendations = recommend_events(student_vector, top_k)
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "user_vector": student_vector.tolist()  # Send user preference vector
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend-cf', methods=['POST'])
def get_cf_recommendations():
    """
    Collaborative Filtering recommendations
    Request: { "interests": [...], "events": [...], "method": "user|item|matrix", "k": 5 }
    """
    try:
        data = request.json
        user_interests = data.get('interests', [])
        events_pool = data.get('events', [])
        cf_method = data.get('method', 'item')  # user, item, or matrix
        k = data.get('k', 5)
        
        if not user_interests:
            return jsonify({"error": "No interests provided"}), 400
        
        # Map user interests to ML domains
        user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
        if not user_domains:
            return jsonify({"error": "No valid interests"}), 400
        
        recommendations = []
        
        if cf_method == 'user':
            # User-based CF
            user_vector = create_student_vector(user_domains)
            recommendations = user_based_cf(user_vector, k)
        
        elif cf_method == 'item' and events_pool:
            # Item-based CF with specific events
            # CF uses original frontend tags, not mapped domains
            print(f"[DEBUG] Calling item_based_cf with {len(user_interests)} interests and {len(events_pool)} events")
            recommendations = item_based_cf(user_interests, events_pool, k)  # Pass original interests
            print(f"[DEBUG] CF returned {len(recommendations)} recommendations")
            if recommendations:
                print(f"[DEBUG] First recommendation: {recommendations[0]}")
        
        elif cf_method == 'matrix':
            # Matrix factorization CF
            user_vector = create_student_vector(user_domains)
            recommendations = matrix_factorization_cf(user_vector, k)
        
        else:
            return jsonify({"error": "Invalid CF method or missing events"}), 400
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "method": f"collaborative_filtering_{cf_method}",
            "cf_used": True
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend-hybrid-cf', methods=['POST'])
def get_hybrid_cf_recommendations():
    """
    Hybrid: KNN + Collaborative Filtering
    Request: { "interests": [...], "events": [...], "k": 5, "knn_weight": 0.6, "cf_weight": 0.4 }
    """
    try:
        data = request.json
        user_interests = data.get('interests', [])
        events_pool = data.get('events', [])
        k = data.get('k', 5)
        knn_weight = data.get('knn_weight', 0.6)
        cf_weight = data.get('cf_weight', 0.4)
        
        if not user_interests or not events_pool:
            return jsonify({"error": "No interests or events provided"}), 400
        
        # Get KNN recommendations (reuse existing logic)
        knn_request = {
            'interests': user_interests,
            'events': events_pool,
            'k': k * 2  # Get more for better hybrid selection
        }
        
        # Simulate KNN call (reuse existing logic from /recommend-knn)
        user_domains = [TAG_MAPPING.get(tag, tag) for tag in user_interests if tag in TAG_MAPPING]
        user_vector = create_student_vector(user_domains)
        
        # KNN scoring
        knn_scores = {}
        student_df = pd.DataFrame([user_vector], columns=feature_cols)
        student_scaled = scaler.transform(student_df)
        distances_global, indices_global = knn_model.kneighbors(student_scaled, n_neighbors=50)
        similar_events_vectors = X_scaled[indices_global[0]]
        learned_pattern = np.mean(similar_events_vectors, axis=0)
        
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
        
        # CF scoring - use original interests, not mapped domains
        cf_recommendations = item_based_cf(user_interests, events_pool, k * 2)
        cf_scores = {rec['event_id']: rec['similarity'] for rec in cf_recommendations}
        
        # Combine scores
        hybrid_scores = []
        for event in events_pool:
            event_id = event.get('id')
            knn_score = knn_scores.get(event_id, 0)
            cf_score = cf_scores.get(event_id, 0)
            
            hybrid_score = knn_weight * knn_score + cf_weight * cf_score
            
            if hybrid_score > 0:
                hybrid_scores.append({
                    'event_id': event_id,
                    'similarity': float(hybrid_score),
                    'knn_score': float(knn_score),
                    'cf_score': float(cf_score)
                })
        
        # Sort and return top k
        hybrid_scores.sort(key=lambda x: x['similarity'], reverse=True)
        recommendations = hybrid_scores[:k]
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "method": "hybrid_knn_cf",
            "weights": {"knn": knn_weight, "cf": cf_weight}
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

EVENT_TYPE_MAP = {'Non-Technical': 0, 'Technical': 1, 'Hackathon': 2, 'Seminar': 3, 'Workshop': 4}

@app.route('/predict-budget', methods=['POST'])
def predict_budget():
    """Predict budget breakdown for an event"""
    try:
        data = request.json
        event_type = EVENT_TYPE_MAP.get(data.get('event_type', ''), 1)
        features = {
            'event_type': event_type,
            'expected_participants': data.get('expected_participants', 50),
            'duration_hours': data.get('duration_hours', 2),
            'prize_pool': data.get('prize_pool', 0),
            'refreshments_needed': int(data.get('refreshments_needed', False)),
            'stationary_needed': int(data.get('stationary_needed', False)),
            'goodies_needed': int(data.get('goodies_needed', False)),
            'physical_certificate': int(data.get('physical_certificate', False)),
            'trophies_needed': int(data.get('trophies_needed', False)),
            'volunteers_needed': data.get('volunteers_needed', 0),
            'rooms_needed': data.get('rooms_needed', 0),
            'refreshment_item_count': data.get('refreshment_item_count', 0),
            'stationery_item_count': data.get('stationery_item_count', 0)
        }

        input_df = pd.DataFrame([features], columns=budget_feature_cols)
        prediction = budget_model.predict(input_df)[0]

        breakdown = {}
        for i, col in enumerate(budget_target_cols):
            breakdown[col] = max(0, round(float(prediction[i])))

        # Zero out predictions for disabled categories
        if not features['refreshments_needed']:
            breakdown['expense_refreshments'] = 0
        if not features['stationary_needed']:
            breakdown['expense_stationery'] = 0
        if not features['goodies_needed']:
            breakdown['expense_goodies'] = 0
        if not features['physical_certificate']:
            breakdown['expense_certificates'] = 0
        if not features['trophies_needed']:
            breakdown['expense_trophies'] = 0

        # Recalculate total
        breakdown['total_expense'] = sum(v for k, v in breakdown.items() if k != 'total_expense')

        return jsonify({
            'success': True,
            'prediction': breakdown,
            'input_features': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("ML Recommendation Service starting...")
    print("Loading KNN model and dataset...")
    print("Loading Collaborative Filtering model...")
    print("Loading Budget Prediction model...")
    print("Service ready on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)  # Disable debug to avoid module caching
