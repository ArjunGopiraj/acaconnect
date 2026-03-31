import pandas as pd
import numpy as np
import os
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler

# Path setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "it_events_processed.csv")

# Load dataset
df = pd.read_csv(DATA_PATH)

# Feature columns (all except event_id)
feature_cols = [col for col in df.columns if col != "event_id"]
X = df[feature_cols]

# Normalize features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Train KNN model
knn_model = NearestNeighbors(n_neighbors=5, metric="cosine")
knn_model.fit(X_scaled)

def create_student_vector(selected_domains):
    
    vector = np.zeros(len(feature_cols))
    for domain in selected_domains:
        if domain in feature_cols:
            idx = feature_cols.index(domain)
            vector[idx] = 1
    return vector

def recommend_events(student_interest_vector, top_k=5):
    
    student_df = pd.DataFrame([student_interest_vector], columns=feature_cols)
    student_scaled = scaler.transform(student_df)
    distances, indices = knn_model.kneighbors(student_scaled, n_neighbors=top_k)
    
    
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        results.append({
            "event_id": int(df.iloc[idx]["event_id"]),
            "similarity": float(1 - dist)  
        })
    return results
