from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_pipeline import get_rag_pipeline
from ollama_client import get_ollama_client
from database_connector import DatabaseConnector
import os
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import chromadb

app = Flask(__name__)
CORS(app)

# Initialize components
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
db_connector = DatabaseConnector()
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Define intent templates
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
    ],
    'all_events': [
        'list all events',
        'show me all events',
        'what events are available',
        'events list',
        'all competitions'
    ],
    'event_details': [
        'what is',
        'tell me about',
        'details about',
        'information about',
        'describe'
    ]
}

# Pre-compute embeddings for intent templates
INTENT_EMBEDDINGS = {}
for intent, templates in INTENT_TEMPLATES.items():
    INTENT_EMBEDDINGS[intent] = embedding_model.encode(templates)

def detect_intent(query, threshold=0.6):
    """Detect user intent using semantic similarity"""
    query_embedding = embedding_model.encode([query])
    
    best_intent = None
    best_score = 0
    
    for intent, template_embeddings in INTENT_EMBEDDINGS.items():
        similarities = cosine_similarity(query_embedding, template_embeddings)[0]
        max_similarity = np.max(similarities)
        
        if max_similarity > best_score and max_similarity > threshold:
            best_score = max_similarity
            best_intent = intent
    
    return best_intent, best_score

def handle_specific_event_query(query):
    """Handle specific event queries with exact database values"""
    query_lower = query.lower()
    events = db_connector.get_all_events()
    
    # Check if asking about specific event
    for event in events:
        event_name_lower = event['title'].lower()
        if event_name_lower in query_lower:
            # Asking about registration fee
            if 'registration fee' in query_lower or 'fee' in query_lower or 'cost' in query_lower:
                fee = event.get('registration_fee', 0)
                response = f"The registration fee for **{event['title']}** is "
                if fee == 0:
                    response += "**FREE** (no registration fee)."
                else:
                    response += f"**₹{fee}**."
                
                response += f"\n\nEvent Details:\n"
                response += f"• Prize Pool: ₹{event.get('prize_pool', 0):,}\n"
                response += f"• Date: {event.get('date', 'TBD')}\n"
                response += f"• Duration: {event.get('duration_hours', 'TBD')} hours"
                
                return jsonify({
                    "success": True,
                    "query": query,
                    "response": response,
                    "contexts_used": 1,
                    "direct_query": True
                })
            
            # Asking about prize
            elif 'prize' in query_lower:
                prize = event.get('prize_pool', 0)
                response = f"The prize pool for **{event['title']}** is **₹{prize:,}**."
                
                response += f"\n\nEvent Details:\n"
                response += f"• Registration Fee: ₹{event.get('registration_fee', 0)}\n"
                response += f"• Date: {event.get('date', 'TBD')}\n"
                response += f"• Duration: {event.get('duration_hours', 'TBD')} hours"
                
                return jsonify({
                    "success": True,
                    "query": query,
                    "response": response,
                    "contexts_used": 1,
                    "direct_query": True
                })
    
    return None

def get_enhanced_context(query: str, top_k: int = 5) -> str:
    """Get context from both PDFs and database"""
    context_parts = []
    
    # Get database context
    db_context = db_connector.format_events_for_context()
    context_parts.append("=== CURRENT EVENT DATA ===")
    context_parts.append(db_context)
    
    # Get PDF context from ChromaDB
    try:
        collection = chroma_client.get_collection(name="niral_knowledge")
        query_embedding = embedding_model.encode([query]).tolist()
        
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            include=["documents", "metadatas"]
        )
        
        if results['documents'][0]:
            context_parts.append("\n=== DOCUMENT KNOWLEDGE ===")
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                source = metadata.get('source', 'Unknown')
                context_parts.append(f"Source: {source}")
                context_parts.append(doc)
                context_parts.append("---")
    except Exception as e:
        print(f"ChromaDB query error: {e}")
    
    return "\n".join(context_parts)

def handle_technical_events_query():
    events = db_connector.get_all_events()
    technical_events = [e for e in events if e.get('type') == 'Technical']
    
    if not technical_events:
        response = "No technical events found."
    else:
        response = f"Here are all {len(technical_events)} technical events at NIRAL 2026:\n\n"
        for i, event in enumerate(technical_events, 1):
            response += f"{i}. **{event['title']}**\n"
            response += f"   • Date: {event.get('date', 'TBD')}\n"
            response += f"   • Duration: {event.get('duration_hours', 'TBD')} hours\n"
            response += f"   • Prize Pool: ₹{event.get('prize_pool', 0):,}\n"
            response += f"   • Registration Fee: ₹{event.get('registration_fee', 0)}\n"
            response += f"   • Description: {event.get('description', 'No description')}\n\n"
    
    return jsonify({
        "success": True,
        "query": "technical events",
        "response": response,
        "contexts_used": len(technical_events),
        "direct_query": True
    })

def handle_non_technical_events_query():
    events = db_connector.get_all_events()
    non_technical_events = [e for e in events if e.get('type') == 'Non-Technical']
    
    if not non_technical_events:
        response = "No non-technical events found."
    else:
        response = f"Here are all {len(non_technical_events)} non-technical events at NIRAL 2026:\n\n"
        for i, event in enumerate(non_technical_events, 1):
            response += f"{i}. **{event['title']}**\n"
            response += f"   • Date: {event.get('date', 'TBD')}\n"
            response += f"   • Duration: {event.get('duration_hours', 'TBD')} hours\n"
            response += f"   • Prize Pool: ₹{event.get('prize_pool', 0):,}\n"
            response += f"   • Registration Fee: ₹{event.get('registration_fee', 0)}\n"
            response += f"   • Description: {event.get('description', 'No description')}\n\n"
    
    return jsonify({
        "success": True,
        "query": "non-technical events",
        "response": response,
        "contexts_used": len(non_technical_events),
        "direct_query": True
    })

def handle_event_details_query(query):
    events = db_connector.get_all_events()
    query_lower = query.lower()
    
    # Extract event name from query
    for event in events:
        event_name = event['title'].lower()
        if event_name in query_lower or any(word in query_lower for word in event_name.split()):
            response = f"**{event['title']}**\n\n"
            response += f"Date: {event.get('event_date', 'TBD')}\n"
            response += f"Duration: {event.get('duration_hours', 'TBD')} hours\n"
            response += f"Prize Pool: ₹{event.get('prize_pool', 0):,}\n"
            response += f"Registration Fee: ₹{event.get('registration_fee', 0)}\n"
            response += f"Expected Participants: {event.get('expected_participants', 'TBD')}\n"
            response += f"Description: {event.get('description', 'No description')}\n"
            response += f"Type: {event.get('type', 'Unknown')} Event"
            
            return jsonify({
                "success": True,
                "query": query,
                "response": response,
                "contexts_used": 1,
                "direct_query": True
            })
    
    return jsonify({
        "success": True,
        "query": query,
        "response": "I couldn't find details about that specific event. Please check the event name or ask for the full events list.",
        "contexts_used": 0,
        "direct_query": True
    })
            
def handle_all_events_query():
    events = db_connector.get_all_events()
    
    if not events:
        response = "No events found."
    else:
        technical = [e for e in events if e.get('type') == 'Technical']
        non_technical = [e for e in events if e.get('type') == 'Non-Technical']
        
        response = f"NIRAL 2026 has {len(events)} total events:\n\n"
        response += f"**Technical Events ({len(technical)}):**\n"
        for event in technical:
            response += f"• {event['title']} - {event.get('date', 'TBD')} - ₹{event.get('prize_pool', 0):,}\n"
        
        response += f"\n**Non-Technical Events ({len(non_technical)}):**\n"
        for event in non_technical:
            response += f"• {event['title']} - {event.get('date', 'TBD')} - ₹{event.get('prize_pool', 0):,}\n"
    
    return jsonify({
        "success": True,
        "query": "all events",
        "response": response,
        "contexts_used": len(events),
        "direct_query": True
    })

# System prompt for the chatbot
SYSTEM_PROMPT = """You are NIRAL Assistant. CRITICAL RULES:

1. ONLY answer if the context has SPECIFIC information about the question
2. If context doesn't have the answer, say: "I don't have specific information about that. Please ask about NIRAL 2026 events, registration, or contact our coordinators."
3. NEVER make up years, dates, locations, or event names
4. NEVER mix up Prize Pool and Registration Fee
5. Copy numbers EXACTLY from context - don't change them
6. If you see "PRIZE POOL: ₹15,000" and "REGISTRATION FEE: ₹100", use those EXACT values

When answering:
- Be brief and direct
- Use bullet points
- Quote exact numbers from context
- Don't elaborate beyond what's in context"""

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    rag = get_rag_pipeline()
    ollama = get_ollama_client()
    
    return jsonify({
        "status": "healthy",
        "service": "NIRAL Chatbot Service",
        "rag_initialized": rag is not None,
        "ollama_available": ollama.check_health()
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint with RAG + Ollama"""
    try:
        data = request.json
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({"error": "No query provided"}), 400
        
        # Handle greetings
        query_lower = user_query.lower()
        if query_lower in ['hi', 'hello', 'hey', 'hii', 'helo']:
            return jsonify({
                "success": True,
                "query": user_query,
                "response": "Hello! I'm NIRAL Assistant. I can help you with:\n\n• Information about NIRAL 2026 events\n• Event registration and fees\n• NIRAL history and IST department\n• Event rules and guidelines\n\nWhat would you like to know?",
                "contexts_used": 0,
                "direct_query": True
            })
        
        # Detect intent using semantic similarity
        intent, confidence = detect_intent(user_query)
        
        # Check for specific event queries first (bypass LLM)
        specific_response = handle_specific_event_query(user_query)
        if specific_response:
            return specific_response
        
        if intent == 'technical_events':
            return handle_technical_events_query()
        elif intent == 'non_technical_events':
            return handle_non_technical_events_query()
        elif intent == 'all_events':
            return handle_all_events_query()
        elif intent == 'event_details':
            return handle_event_details_query(user_query)
        
        # Get RAG pipeline and Ollama client
        rag = get_rag_pipeline()
        ollama = get_ollama_client()
        
        # Check if Ollama is available
        if not ollama.check_health():
            # Fallback: Return context directly without LLM
            contexts = rag.retrieve_context(user_query, top_k=3)
            if contexts:
                response = "Based on our knowledge base:\n\n"
                for ctx in contexts:
                    response += f"• {ctx['text']}\n\n"
                response += "\nFor more details, please contact our coordinators."
            else:
                response = "I don't have specific information about that. Please contact our event coordinators for assistance."
            
            return jsonify({
                "success": True,
                "query": user_query,
                "response": response,
                "contexts_used": len(contexts),
                "fallback_mode": True
            })
        
        # Determine top_k based on query
        query_lower = user_query.lower()
        if any(keyword in query_lower for keyword in ['all events', 'list events', 'what events', 'which events', 'events available']):
            top_k = 15
        else:
            top_k = 5
            
        # Use enhanced context instead of RAG pipeline
        enhanced_context = get_enhanced_context(user_query, top_k=top_k)
        
        print(f"Retrieved enhanced context with {len(enhanced_context)} characters")
        
        # Create prompt with enhanced context
        prompt = f"""Context Information:
{enhanced_context}

User Question: {user_query}

Please provide a helpful and accurate answer based ONLY on the context above. Do not add any information not present in the context."""
        
        # Generate response using Ollama with very low temperature
        print("Generating response with enhanced context...")
        response = ollama.generate(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.1,
            max_tokens=500
        )
        
        # Check if Ollama had an error (memory issue)
        if "Error:" in response and "memory" in response.lower():
            # Fallback to context-only response
            print("Ollama memory error, using fallback...")
            fallback_response = "Based on our knowledge base:\n\n"
            for idx, ctx in enumerate(contexts, 1):
                fallback_response += f"{idx}. {ctx['text'][:200]}...\n\n"
            fallback_response += "For more details, please contact our coordinators."
            
            return jsonify({
                "success": True,
                "query": user_query,
                "response": fallback_response,
                "contexts_used": len(contexts),
                "fallback_mode": True
            })
        
        return jsonify({
            "success": True,
            "query": user_query,
            "response": response,
            "contexts_used": "enhanced_context"
        })
    
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to process chat request"
        }), 500

@app.route('/reload-knowledge', methods=['POST'])
def reload_knowledge():
    """Reload knowledge base (useful after adding new events)"""
    try:
        rag = get_rag_pipeline()
        rag.load_knowledge_base()
        
        return jsonify({
            "success": True,
            "message": "Knowledge base reloaded successfully"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to reload knowledge base"
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("NIRAL Chatbot Service Starting...")
    print("=" * 60)
    print("Initializing RAG pipeline...")
    
    # Initialize RAG pipeline on startup
    try:
        rag = get_rag_pipeline()
        print("RAG pipeline initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize RAG pipeline: {e}")
    
    # Check Ollama availability
    ollama = get_ollama_client()
    if ollama.check_health():
        print("Ollama service is available")
    else:
        print("WARNING: Ollama service is not available!")
        print("Please ensure Ollama is running: ollama serve")
        print("And Mistral model is installed: ollama pull mistral")
    
    print("=" * 60)
    print("Chatbot service ready on http://localhost:5002")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5002, debug=True)
