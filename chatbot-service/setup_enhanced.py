#!/usr/bin/env python3
"""
Enhanced NIRAL Chatbot Setup Script
Processes PDFs and initializes the enhanced RAG system
"""

import os
import sys
from pdf_processor import PDFProcessor
from database_connector import DatabaseConnector

def main():
    print("=" * 60)
    print("NIRAL Enhanced Chatbot Setup")
    print("=" * 60)
    
    # Check if PDFs directory exists
    pdf_dir = "./data/pdfs"
    if not os.path.exists(pdf_dir):
        print(f"Creating PDF directory: {pdf_dir}")
        os.makedirs(pdf_dir)
    
    # Check for PDFs
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
    
    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}")
        print("Please add your PDFs (NIRAL history, IST history, rulebook, etc.) to this directory")
        print("Then run this script again.")
        return
    
    print(f"Found {len(pdf_files)} PDF files:")
    for pdf in pdf_files:
        print(f"  - {pdf}")
    
    # Process PDFs
    print("\nProcessing PDFs...")
    processor = PDFProcessor()
    processor.process_pdfs(pdf_dir)
    
    # Test database connection
    print("\nTesting database connection...")
    try:
        db = DatabaseConnector()
        events = db.get_all_events()
        stats = db.get_event_stats()
        print(f"Database connected successfully!")
        print(f"Found {stats['total_events']} events in database")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Make sure MongoDB is running and the backend has populated events")
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("Enhanced chatbot is ready with:")
    print(f"- {len(pdf_files)} PDF documents processed")
    print(f"- Real-time database integration")
    print("- Anti-hallucination safeguards")
    print("\nStart the chatbot with: python app.py")
    print("=" * 60)

if __name__ == "__main__":
    main()