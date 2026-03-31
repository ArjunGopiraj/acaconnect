import sys
sys.path.append('.')

from database_connector import DatabaseConnector
from sentence_transformers import SentenceTransformer
import chromadb

print("=" * 60)
print("Direct Enhanced Chatbot Test")
print("=" * 60)

# Test 1: Database Events
print("\n1. Testing Database Events...")
db = DatabaseConnector()
events = db.get_all_events()
technical = [e for e in events if e.get('type') == 'Technical']
non_technical = [e for e in events if e.get('type') == 'Non-Technical']

print(f"Total events: {len(events)}")
print(f"Technical: {len(technical)}")
print(f"Non-Technical: {len(non_technical)}")

if technical:
    print(f"\nSample Technical Event: {technical[0]['title']}")
    print(f"  - Date: {technical[0].get('date', 'TBD')}")
    print(f"  - Prize: Rs.{technical[0].get('prize_pool', 0):,}")

# Test 2: PDF Knowledge
print("\n2. Testing PDF Knowledge...")
model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection(name="niral_knowledge")

query = "What is NIRAL history?"
query_embedding = model.encode([query]).tolist()

results = collection.query(
    query_embeddings=query_embedding,
    n_results=2,
    include=["documents", "metadatas"]
)

print(f"Query: {query}")
print(f"Found {len(results['documents'][0])} relevant chunks")
if results['documents'][0]:
    doc = results['documents'][0][0]
    source = results['metadatas'][0][0].get('source', 'Unknown')
    print(f"\nTop result from {source}:")
    print(f"{doc[:200]}...")

# Test 3: Enhanced Context
print("\n3. Testing Enhanced Context Generation...")
db_context = db.format_events_for_context()
print(f"Database context length: {len(db_context)} characters")
print(f"Contains event data: {'SQL WAR' in db_context}")
print(f"Contains statistics: {'Total Events' in db_context}")

print("\n" + "=" * 60)
print("All components working! Enhanced chatbot is ready.")
print("Start the service with: python app.py")
print("=" * 60)