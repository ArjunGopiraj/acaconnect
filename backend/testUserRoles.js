const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testUserRoles() {
  try {
    // Test admin login
    console.log('Testing admin login...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    console.log('Admin role:', adminResponse.data.user.role);
    
    // Test event team login
    console.log('\\nTesting event team login...');
    const eventResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'event@test.com',
      password: 'event123'
    });
    console.log('Event team role:', eventResponse.data.user.role);
    
    // Check valid transitions for EVENT_TEAM from DRAFT
    const transitionsResponse = await axios.get(`${BASE_URL}/events/transitions/DRAFT`, {
      headers: { Authorization: `Bearer ${eventResponse.data.token}` }
    });
    
    console.log('\\nValid transitions for EVENT_TEAM from DRAFT:');
    console.log(transitionsResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testUserRoles();