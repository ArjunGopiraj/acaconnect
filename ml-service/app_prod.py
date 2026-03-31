from flask import Flask, request, jsonify
from flask_cors import CORS
from model.knn_model import create_student_vector, recommend_events, knn_model, scaler, feature_cols, X_scaled, df
from model.cf_model import user_based_cf, item_based_cf, matrix_factorization_cf
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# ... (rest of the code stays the same)

if __name__ == '__main__':
    print("ML Recommendation Service starting...")
    print("Loading KNN model and dataset...")
    print("Loading Collaborative Filtering model...")
    print("Service ready on http://localhost:5001")
    # Run WITHOUT debug mode to avoid module caching
    app.run(host='0.0.0.0', port=5001, debug=False)
