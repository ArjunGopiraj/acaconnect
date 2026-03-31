const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function cleanupTestEvents() {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    // Get all events
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const events = eventsResponse.data;
    const testEvents = events.filter(event => 
      event.title === 'AI & Machine Learning Workshop 2024'
    );
    
    console.log(`Found ${testEvents.length} test events to delete`);
    
    for (const event of testEvents) {
      try {
        await axios.delete(`${BASE_URL}/events/${event._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Deleted event: ${event._id}`);
      } catch (error) {
        console.log(`❌ Failed to delete ${event._id}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('🧹 Cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data?.message || error.message);
  }
}

cleanupTestEvents();