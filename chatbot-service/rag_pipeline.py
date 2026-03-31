import json
import os
from sentence_transformers import SentenceTransformer
import chromadb

class RAGPipeline:
    def __init__(self):
        # Initialize embedding model
        print("Loading embedding model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB
        print("Initializing vector database...")
        self.chroma_client = chromadb.PersistentClient(path="./vectorstore")
        
        # Create or get collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="niral_knowledge",
            metadata={"description": "NIRAL event and information knowledge base"}
        )
        
        print("RAG Pipeline initialized successfully")
    
    def load_knowledge_base(self):
        """Load and index knowledge base"""
        print("Loading knowledge base...")
        
        # Load knowledge base JSON
        kb_path = os.path.join('data', 'knowledge_base.json')
        with open(kb_path, 'r', encoding='utf-8') as f:
            kb_data = json.load(f)
        
        # Load events JSON
        events_path = os.path.join('data', 'events.json')
        if os.path.exists(events_path):
            with open(events_path, 'r', encoding='utf-8') as f:
                events_data = json.load(f)
        else:
            events_data = []
        
        # Prepare documents for indexing
        documents = []
        metadatas = []
        ids = []
        
        # Index NIRAL information
        niral_info = kb_data.get('niral', {})
        niral_text = f"NIRAL 2026: {niral_info.get('description', '')} Dates: {niral_info.get('dates', '')}. {niral_info.get('history', '')} Vision: {niral_info.get('vision', '')} Mission: {niral_info.get('mission', '')}"
        documents.append(niral_text)
        metadatas.append({'type': 'niral_info', 'source': 'knowledge_base'})
        ids.append('niral_main')
        
        # Index IST Department information
        ist_info = kb_data.get('ist_department', {})
        ist_text = f"{ist_info.get('name', '')} at {ist_info.get('college', '')}, {ist_info.get('university', '')}. {ist_info.get('description', '')} Focus areas: {', '.join(ist_info.get('focus_areas', []))}"
        documents.append(ist_text)
        metadatas.append({'type': 'ist_info', 'source': 'knowledge_base'})
        ids.append('ist_main')
        
        # Index event types
        for event_type, type_info in kb_data.get('event_types', {}).items():
            type_text = f"{event_type.title()} events: {type_info.get('description', '')} Examples: {', '.join(type_info.get('examples', []))}"
            documents.append(type_text)
            metadatas.append({'type': 'event_type', 'event_type': event_type, 'source': 'knowledge_base'})
            ids.append(f'event_type_{event_type}')
        
        # Index FAQs
        for idx, faq in enumerate(kb_data.get('faqs', [])):
            faq_text = f"Q: {faq.get('question', '')} A: {faq.get('answer', '')}"
            documents.append(faq_text)
            metadatas.append({'type': 'faq', 'source': 'knowledge_base'})
            ids.append(f'faq_{idx}')
        
        # Index contact information
        for role, contact in kb_data.get('contact_coordinators', {}).items():
            contact_text = f"{contact.get('name', '')} - {contact.get('designation', '')}. Email: {contact.get('email', '')} Phone: {contact.get('phone', '')}"
            documents.append(contact_text)
            metadatas.append({'type': 'contact', 'role': role, 'source': 'knowledge_base'})
            ids.append(f'contact_{role}')
        
        # Index events
        for event in events_data:
            event_text = f"Event: {event.get('title', '')}. Type: {event.get('type', '')}. Description: {event.get('description', '')}. Date: {event.get('date', '')} Time: {event.get('time', '')}. Duration: {event.get('duration_hours', 0)} hours. Prize Pool: ₹{event.get('prize_pool', 0)}. Tags: {', '.join(event.get('tags', []))}"
            documents.append(event_text)
            metadatas.append({'type': 'event', 'event_id': event.get('id', ''), 'source': 'database'})
            ids.append(f"event_{event.get('id', '')}")
        
        # Add documents to collection
        print(f"Indexing {len(documents)} documents...")
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Successfully indexed {len(documents)} documents")
    
    def retrieve_context(self, query, top_k=5):
        """Retrieve relevant context for a query"""
        # Query the collection
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        # Extract documents and metadata
        contexts = []
        if results['documents'] and len(results['documents']) > 0:
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                contexts.append({
                    'text': doc,
                    'metadata': metadata
                })
        
        return contexts
    
    def format_context(self, contexts):
        """Format retrieved contexts for LLM"""
        if not contexts:
            return "No relevant information found."
        
        formatted = "Relevant Information:\n\n"
        for idx, ctx in enumerate(contexts, 1):
            formatted += f"{idx}. {ctx['text']}\n\n"
        
        return formatted

# Initialize global RAG pipeline
rag_pipeline = None

def get_rag_pipeline():
    global rag_pipeline
    if rag_pipeline is None:
        rag_pipeline = RAGPipeline()
        rag_pipeline.load_knowledge_base()
    return rag_pipeline
