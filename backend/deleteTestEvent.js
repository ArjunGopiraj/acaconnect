const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const eventId = '699fecdecb4e5d3b419d6764';

async function deleteTestEvent() {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    await axios.delete(`${BASE_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Test event deleted successfully');
  } catch (error) {
    console.error('❌ Failed to delete event:', error.response?.data?.message || error.message);
  }
}

deleteTestEvent();