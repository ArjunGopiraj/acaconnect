#!/usr/bin/env python3
"""
Test script for Enhanced NIRAL Chatbot
Tests PDF processing, database connection, and context retrieval
"""

import sys
import os
sys.path.append('.')

def test_pdf_processing():
    """Test if PDFs were processed correctly"""
    print("Testing PDF Processing...")
    try:
        import chromadb
        client = chromadb.PersistentClient(path="./chroma_db")
        collection = client.get_collection(name="niral_knowledge")
        
        # Get all documents
        results = collection.get()
        total_docs = len(results['documents'])
        
        # Group by source
        sources = {}
        for metadata in results['metadatas']:
            source = metadata.get('source', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        print(f"[OK] ChromaDB collection found with {total_docs} documents")
        print("Documents by source:")
        for source, count in sources.items():
            print(f"   - {source}: {count} chunks")
        
        return True
    except Exception as e:
        print(f"[FAIL] PDF processing test failed: {e}")
        return False

def test_database_connection():
    """Test database connection and data retrieval"""
    print("\nTesting Database Connection...")
    try:
        from database_connector import DatabaseConnector
        
        db = DatabaseConnector()
        events = db.get_all_events()
        stats = db.get_event_stats()
        
        print(f"[OK] Database connected successfully")
        print(f"Found {len(events)} events")
        print(f"Statistics: {stats['total_participants']} participants, {stats['total_registrations']} registrations")
        
        # Test context formatting
        context = db.format_events_for_context()
        print(f"Generated context: {len(context)} characters")
        
        return True
    except Exception as e:
        print(f"[FAIL] Database test failed: {e}")
        return False

def test_enhanced_context():
    """Test the enhanced context retrieval"""
    print("\nTesting Enhanced Context Retrieval...")
    try:
        from sentence_transformers import SentenceTransformer
        import chromadb
        from database_connector import DatabaseConnector
        
        # Initialize components
        model = SentenceTransformer('all-MiniLM-L6-v2')
        client = chromadb.PersistentClient(path="./chroma_db")
        db = DatabaseConnector()
        
        # Test query
        test_query = "What is NIRAL history?"
        
        # Get database context
        db_context = db.format_events_for_context()
        
        # Get PDF context
        collection = client.get_collection(name="niral_knowledge")
        query_embedding = model.encode([test_query]).tolist()
        
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=3,
            include=["documents", "metadatas"]
        )
        
        print(f"[OK] Enhanced context retrieval working")
        print(f"Database context: {len(db_context)} characters")
        print(f"PDF results: {len(results['documents'][0])} relevant chunks found")
        
        if results['documents'][0]:
            print("Sample PDF content:")
            for i, (doc, meta) in enumerate(zip(results['documents'][0][:2], results['metadatas'][0][:2])):
                source = meta.get('source', 'Unknown')
                preview = doc[:100] + "..." if len(doc) > 100 else doc
                print(f"   {i+1}. From {source}: {preview}")
        
        return True
    except Exception as e:
        print(f"[FAIL] Enhanced context test failed: {e}")
        return False

def test_service_health():
    """Test if the service can be imported and initialized"""
    print("\nTesting Service Components...")
    try:
        # Test imports
        from pdf_processor import PDFProcessor
        from database_connector import DatabaseConnector
        
        print("[OK] All modules import successfully")
        
        # Test if app.py can be imported
        import app
        print("[OK] Main app module imports successfully")
        
        return True
    except Exception as e:
        print(f"[FAIL] Service component test failed: {e}")
        return False

def main():
    print("=" * 60)
    print("NIRAL Enhanced Chatbot - Component Tests")
    print("=" * 60)
    
    tests = [
        test_pdf_processing,
        test_database_connection,
        test_enhanced_context,
        test_service_health
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("SUCCESS: All tests passed! Enhanced chatbot is ready.")
        print("\nTo start the service:")
        print("   python app.py")
        print("\nThe service will run on: http://localhost:5002")
    else:
        print("WARNING: Some tests failed. Check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()