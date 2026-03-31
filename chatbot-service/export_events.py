import json
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection - use same URI as backend
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'college_events')
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

def export_events_to_json():
    """Export published events from MongoDB to JSON for RAG"""
    try:
        events_collection = db['events']
        
        # Fetch all published events
        events = list(events_collection.find({'status': 'PUBLISHED'}))
        
        # Convert to JSON-serializable format
        events_data = []
        for event in events:
            event_dict = {
                'id': str(event['_id']),
                'title': event.get('title', ''),
                'description': event.get('description', ''),
                'type': event.get('type', ''),
                'date': event.get('date', '').isoformat() if isinstance(event.get('date'), datetime) else str(event.get('date', '')),
                'time': event.get('time', ''),
                'duration_hours': event.get('duration_hours', 0),
                'expected_participants': event.get('expected_participants', 0),
                'prize_pool': event.get('prize_pool', 0),
                'tags': event.get('tags', []),
                'requirements': event.get('requirements', {}),
                'status': event.get('status', '')
            }
            events_data.append(event_dict)
        
        # Save to JSON file
        output_path = os.path.join(os.path.dirname(__file__), 'data', 'events.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(events_data, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(events_data)} events to {output_path}")
        return events_data
    
    except Exception as e:
        print(f"Error exporting events: {e}")
        return []

if __name__ == '__main__':
    export_events_to_json()
