import os
import pdfplumber
from sentence_transformers import SentenceTransformer
import chromadb
import json
from typing import List, Dict
import re

class PDFProcessor:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks"""
        sentences = re.split(r'[.!?]+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
    
    def process_pdfs(self, pdf_dir: str):
        """Process all PDFs in directory"""
        collection = self.client.get_or_create_collection(name="niral_knowledge")
        
        for filename in os.listdir(pdf_dir):
            if filename.endswith('.pdf'):
                pdf_path = os.path.join(pdf_dir, filename)
                print(f"Processing {filename}...")
                
                # Extract text
                text = self.extract_text_from_pdf(pdf_path)
                
                # Chunk text
                chunks = self.chunk_text(text)
                
                # Generate embeddings and store
                for i, chunk in enumerate(chunks):
                    embedding = self.model.encode(chunk).tolist()
                    
                    collection.add(
                        embeddings=[embedding],
                        documents=[chunk],
                        metadatas=[{
                            "source": filename,
                            "chunk_id": i,
                            "type": "pdf_content"
                        }],
                        ids=[f"{filename}_{i}"]
                    )
                
                print(f"Added {len(chunks)} chunks from {filename}")

if __name__ == "__main__":
    processor = PDFProcessor()
    processor.process_pdfs("./data/pdfs")