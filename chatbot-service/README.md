# NIRAL Chatbot Service

RAG-based chatbot using Ollama + Mistral for participant assistance.

## Features

- **RAG Pipeline**: Retrieval-Augmented Generation with vector search
- **Ollama Integration**: Local LLM using Mistral model
- **Knowledge Base**: NIRAL info, IST department, events, FAQs
- **Real-time Data**: Syncs with MongoDB for latest events
- **Natural Language**: Conversational AI for user queries

## Architecture

```
User Query → Flask API → RAG Pipeline:
  1. Query Processing
  2. Vector Search (ChromaDB)
  3. Context Retrieval (Top-5 relevant docs)
  4. LLM Generation (Ollama/Mistral)
  5. Response → User
```

## Prerequisites

1. **Ollama Installed**: Download from https://ollama.ai
2. **Mistral Model**: Run `ollama pull mistral`
3. **Python 3.8+**: Required for dependencies
4. **MongoDB Running**: For event data export

## Installation

```bash
cd chatbot-service
pip install -r requirements.txt
```

## Usage

### Start Ollama (if not running)
```bash
ollama serve
```

### Start Chatbot Service
```bash
start.bat
```

Or manually:
```bash
python export_events.py  # Export events from MongoDB
python app.py            # Start Flask service
```

Service runs on: **http://localhost:5002**

## API Endpoints

### 1. Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "NIRAL Chatbot Service",
  "rag_initialized": true,
  "ollama_available": true
}
```

### 2. Chat
```
POST /chat
Content-Type: application/json

{
  "query": "What is NIRAL 2026?"
}
```

Response:
```json
{
  "success": true,
  "query": "What is NIRAL 2026?",
  "response": "NIRAL 2026 is the National Innovative Research and Academic League...",
  "contexts_used": 5
}
```

### 3. Reload Knowledge Base
```
POST /reload-knowledge
```

## Example Queries

- "What is NIRAL 2026?"
- "When is NIRAL happening?"
- "Tell me about technical events"
- "How do I register for events?"
- "What is the IST department?"
- "Who are the event coordinators?"
- "What events are happening on March 12?"
- "What is the prize pool for hackathons?"

## Knowledge Sources

1. **knowledge_base.json**: Static information about NIRAL, IST, event types, FAQs
2. **events.json**: Dynamic event data exported from MongoDB
3. **Vector Database**: ChromaDB with sentence embeddings

## Technology Stack

- **Flask**: Web framework
- **ChromaDB**: Vector database
- **Sentence Transformers**: Embeddings (all-MiniLM-L6-v2)
- **Ollama**: Local LLM runtime
- **Mistral**: Language model
- **PyMongo**: MongoDB integration

## Troubleshooting

### Ollama not available
```bash
# Start Ollama service
ollama serve

# Pull Mistral model
ollama pull mistral
```

### ChromaDB errors
```bash
# Delete vectorstore and reinitialize
rm -rf vectorstore
python app.py
```

### Events not showing
```bash
# Re-export events from MongoDB
python export_events.py
```

## Integration with Backend

Add to backend (Node.js):

```javascript
// backend/src/controllers/chatbotController.js
const axios = require('axios');

exports.chat = async (req, res) => {
  try {
    const { query } = req.body;
    
    const response = await axios.post('http://localhost:5002/chat', {
      query: query
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Chatbot service unavailable' });
  }
};
```

## Future Enhancements

- [ ] PDF document ingestion for detailed NIRAL documentation
- [ ] Conversation history and context
- [ ] Multi-turn dialogue support
- [ ] User feedback and rating system
- [ ] Analytics and query logging
- [ ] Voice input/output support
