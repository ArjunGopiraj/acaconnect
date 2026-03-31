const axios = require('axios');
const Event = require('../models/Events');
const fs = require('fs');
const path = require('path');

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:5002';

exports.chat = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    const response = await axios.post(`${CHATBOT_SERVICE_URL}/chat`, { query }, { timeout: 60000 });
    
    res.json(response.data);
  } catch (error) {
    console.error('Chatbot error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Chatbot service is not running on port 5002');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Chatbot service timed out');
    }
    res.status(500).json({ 
      message: 'Chatbot service unavailable',
      error: error.message 
    });
  }
};

exports.exportEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'PUBLISHED' }).lean();
    
    const eventsData = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      duration_hours: event.duration_hours,
      expected_participants: event.expected_participants,
      prize_pool: event.prize_pool,
      tags: event.tags || [],
      requirements: event.requirements || {},
      status: event.status
    }));
    
    const filePath = path.join(__dirname, '../../../chatbot-service/data/events.json');
    fs.writeFileSync(filePath, JSON.stringify(eventsData, null, 2));
    
    await axios.post(`${CHATBOT_SERVICE_URL}/reload-knowledge`);
    
    res.json({ 
      success: true, 
      message: `Exported ${eventsData.length} events and reloaded chatbot knowledge base` 
    });
  } catch (error) {
    console.error('Export events error:', error.message);
    res.status(500).json({ 
      message: 'Failed to export events',
      error: error.message 
    });
  }
};
