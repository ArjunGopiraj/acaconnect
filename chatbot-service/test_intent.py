from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Intent templates
INTENT_TEMPLATES = {
    'technical_events': [
        'list all technical events',
        'show me technical events', 
        'what are the technical events',
        'technical competitions',
        'coding events',
        'programming events'
    ],
    'non_technical_events': [
        'list all non-technical events',
        'show me non-technical events',
        'what are the non-technical events', 
        'fun events',
        'entertainment events',
        'quiz events'
    ]
}

# Pre-compute embeddings
INTENT_EMBEDDINGS = {}
for intent, templates in INTENT_TEMPLATES.items():
    INTENT_EMBEDDINGS[intent] = embedding_model.encode(templates)

def detect_intent(query, threshold=0.6):
    query_embedding = embedding_model.encode([query])
    
    best_intent = None
    best_score = 0
    
    for intent, template_embeddings in INTENT_EMBEDDINGS.items():
        similarities = cosine_similarity(query_embedding, template_embeddings)[0]
        max_similarity = np.max(similarities)
        
        print(f"{intent}: {max_similarity:.3f}")
        
        if max_similarity > best_score and max_similarity > threshold:
            best_score = max_similarity
            best_intent = intent
    
    return best_intent, best_score

# Test queries
test_queries = [
    "list me all the non tech events",
    "show fun events", 
    "coding competitions",
    "what technical events do you have"
]

for query in test_queries:
    print(f"\nQuery: '{query}'")
    intent, score = detect_intent(query)
    print(f"Intent: {intent}, Score: {score:.3f}")