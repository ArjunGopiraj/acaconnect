const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function checkEventStatus() {
  try {
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    // Get all events to see the latest one
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const events = eventsResponse.data;
    console.log('Recent events:');
    events.slice(0, 3).forEach(event => {
      console.log(`- ${event.title} (${event._id}) - Status: ${event.status}`);
    });
    
    if (events.length > 0) {
      const latestEvent = events[0];
      console.log(`\\nLatest event details:`);
      console.log(`ID: ${latestEvent._id}`);
      console.log(`Title: ${latestEvent.title}`);
      console.log(`Status: ${latestEvent.status}`);
      console.log(`Created by: ${latestEvent.created_by}`);
      
      // Check valid transitions
      const transitionsResponse = await axios.get(`${BASE_URL}/events/transitions/${latestEvent.status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`\\nValid transitions from ${latestEvent.status}:`);
      console.log(transitionsResponse.data.validTransitions);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkEventStatus();