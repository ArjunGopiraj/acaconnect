# ML Recommendation Service

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Start ML Service
```bash
python app.py
```

The service will start on `http://localhost:5001`

### 3. Test ML Service
```bash
curl -X POST http://localhost:5001/recommend \
  -H "Content-Type: application/json" \
  -d '{"interests": ["Programming & Coding", "Competitive Coding"]}'
```

## API Endpoints

### POST /recommend
Get event recommendations based on user interests

**Request:**
```json
{
  "interests": ["Programming & Coding", "Competitive Coding"],
  "top_k": 5
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "event_id": 684921758,
      "similarity": 0.95
    }
  ],
  "count": 5
}
```

### GET /health
Health check endpoint

## Model Details

- **Algorithm:** K-Nearest Neighbors (KNN)
- **Metric:** Cosine Similarity
- **Neighbors:** 5
- **Features:** 16 domain categories
- **Dataset:** 10 lakh IT events

## Tag Mapping

Frontend tags are automatically mapped to ML model domains:
- "Programming & Coding" → "Programming_Coding"
- "Competitive Coding" → "Competitive_Coding"
- etc.
