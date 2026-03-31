from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import ollama
from database_connector import DatabaseConnector

app = Flask(__name__)
CORS(app)

# Load knowledge base
with open("data/niral_knowledge_simple.json", "r") as file:
    documents = json.load(file)

doc_texts = list(documents.values())
doc_keys = list(documents.keys())

# Initialize models
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
doc_embeddings = embed_model.encode(doc_texts)
db_connector = DatabaseConnector()

def retrieve_context(query, top_k=2):
    """Retrieve top-k most relevant contexts"""
    query_embedding = embed_model.encode([query])
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [doc_texts[i] for i in top_indices]

def get_event_by_name(query):
    """Find event by name in query"""
    events = db_connector.get_all_events()
    query_lower = query.lower()
    
    for event in events:
        if event['title'].lower() in query_lower:
            return event
    return None

def handle_greeting(query):
    """Handle simple greetings"""
    greetings = ['hi', 'hello', 'hey', 'hii', 'helo']
    if query.lower().strip() in greetings:
        return "Hello! I'm NIRAL Assistant. Ask me about NIRAL 2026 events, registration, fees, or history."
    return None

def handle_event_list(query):
    """Handle event listing queries"""
    query_lower = query.lower()
    events = db_connector.get_all_events()
    
    if 'technical event' in query_lower:
        technical = [e for e in events if e.get('type') == 'Technical']
        if not technical:
            return "No technical events found."
        
        response = f"Here are {len(technical)} technical events:\\n\\n"
        for i, e in enumerate(technical, 1):
            response += f"{i}. {e['title']} - ₹{e.get('prize_pool', 0):,} prize\\n"
        return response
    
    elif 'non-technical event' in query_lower or 'non technical event' in query_lower:
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        if not non_tech:
            return "No non-technical events found."
        
        response = f"Here are {len(non_tech)} non-technical events:\\n\\n"
        for i, e in enumerate(non_tech, 1):
            response += f"{i}. {e['title']} - ₹{e.get('prize_pool', 0):,} prize\\n"
        return response
    
    elif 'all event' in query_lower or 'list event' in query_lower:
        response = f"NIRAL 2026 has {len(events)} events:\\n\\n"
        tech = [e for e in events if e.get('type') == 'Technical']
        non_tech = [e for e in events if e.get('type') == 'Non-Technical']
        
        response += f"Technical ({len(tech)}):\\n"
        for e in tech:
            response += f"• {e['title']}\\n"
        
        response += f"\\nNon-Technical ({len(non_tech)}):\\n"
        for e in non_tech:
            response += f"• {e['title']}\\n"
        
        return response
    
    return None

def handle_specific_event(query):
    """Handle specific event queries"""
    event = get_event_by_name(query)
    if not event:
        return None
    
    query_lower = query.lower()
    
    # Registration fee query
    if 'fee' in query_lower or 'cost' in query_lower or 'registration' in query_lower:
        fee = event.get('registration_fee', 0)
        if fee == 0:
            return f"{event['title']} is FREE (no registration fee). Prize pool: ₹{event.get('prize_pool', 0):,}"
        else:
            return f"{event['title']} registration fee is ₹{fee}. Prize pool: ₹{event.get('prize_pool', 0):,}"
    
    # Prize query
    elif 'prize' in query_lower:
        return f"{event['title']} prize pool is ₹{event.get('prize_pool', 0):,}. Registration fee: ₹{event.get('registration_fee', 0)}"
    
    # General event info
    else:
        response = f"{event['title']}\\n"
        response += f"Type: {event.get('type')}\\n"
        response += f"Date: {event.get('date', 'TBD')}\\n"
        response += f"Duration: {event.get('duration_hours', 'TBD')} hours\\n"
        response += f"Prize: ₹{event.get('prize_pool', 0):,}\\n"
        response += f"Fee: ₹{event.get('registration_fee', 0)}\\n"
        response += f"Description: {event.get('description', 'No description')}"
        return response

def rag_chatbot(query):
    """Main RAG chatbot function"""
    # Check for direct handlers first
    greeting_response = handle_greeting(query)
    if greeting_response:
        return greeting_response
    
    event_list_response = handle_event_list(query)
    if event_list_response:
        return event_list_response
    
    specific_event_response = handle_specific_event(query)
    if specific_event_response:
        return specific_event_response
    
    # Use RAG for general queries
    context = retrieve_context(query, top_k=2)
    
    prompt = f"""You are NIRAL Assistant for NIRAL 2026 symposium.
Use ONLY the context below to answer. Be brief and accurate.

Context: {" ".join(context)}

Question: {query}

Answer based only on the context. If not in context, say "I don't have that information. Please contact NIRAL coordinators."
"""
    
    try:
        response = ollama.chat(
            model="mistral",
            messages=[
                {"role": "system", "content": "You are a helpful NIRAL symposium assistant. Answer briefly using only the provided context."},
                {"role": "user", "content": prompt}
            ]
        )
        return response['message']['content']
    except Exception as e:
        return "I'm having trouble processing that. Please try asking about NIRAL events, registration, or history."

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "NIRAL Chatbot Service"
    })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({"error": "No query provided"}), 400
        
        response = rag_chatbot(user_query)
        
        return jsonify({
            "success": True,
            "query": user_query,
            "response": response
        })
    
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to process chat request"
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("NIRAL Chatbot Service Starting...")
    print("=" * 60)
    print("Chatbot service ready on http://localhost:5002")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5002, debug=True)
