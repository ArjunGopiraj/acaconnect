import chromadb
from sentence_transformers import SentenceTransformer
import sys
import io

# Fix encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection('niral_knowledge')

# Search for SQL-related content
search_terms = ['SQL', 'database', 'query', 'SQL WAR']

for term in search_terms:
    print(f"\n{'='*80}")
    print(f"Searching for: {term}")
    print('='*80)
    
    query_embedding = model.encode([term]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=2,
        include=['documents', 'metadatas']
    )
    
    for i, (doc, meta) in enumerate(zip(results['documents'][0], results['metadatas'][0])):
        print(f"\n{i+1}. From {meta.get('source')}:")
        print(doc[:300] + "...")
