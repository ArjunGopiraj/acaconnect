# CHATBOT INTEGRATION SETUP

## Prerequisites
1. Install Ollama: https://ollama.ai/download
2. Pull Mistral model: `ollama pull mistral`
3. Ensure Ollama is running: `ollama serve`

## Setup Steps

### 1. Install Python Dependencies
```bash
cd chatbot-service
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file in `chatbot-service/` folder:
```
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=college_events
```

### 3. Export Events to Chatbot
Run from backend:
```bash
cd backend
node -e "require('./src/controllers/chatbot.controller').exportEvents()"
```

Or use the API endpoint (after starting backend):
```bash
curl -X POST http://localhost:5000/chatbot/export-events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Start Chatbot Service
```bash
cd chatbot-service
python app.py
```

Service will run on http://localhost:5002

## Testing

### Test Chatbot Health
```bash
curl http://localhost:5002/health
```

### Test Chat
```bash
curl -X POST http://localhost:5002/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What events are available?"}'
```

## Usage in App

1. Login as PARTICIPANT or STUDENT
2. Go to Dashboard
3. Click the chat button (💬) in bottom-right corner
4. Ask questions about events!

## Troubleshooting

### Ollama Not Available
- Ensure Ollama is installed and running
- Check: `ollama list` to see installed models
- Install Mistral: `ollama pull mistral`

### Chatbot Service Error
- Check if port 5002 is available
- Verify MongoDB connection in .env
- Check chatbot-service/data/events.json exists

### No Events in Chatbot
- Run export_events.py to sync events
- Or use POST /chatbot/export-events API endpoint
- Ensure events are PUBLISHED in database
