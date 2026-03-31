const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugTechopsAPI() {
  try {
    // First login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'techops@test.com',
      password: 'techops123'
    });
    
    console.log('Login successful!');
    console.log('User:', loginResponse.data.user);
    
    const token = loginResponse.data.token;
    
    // Decode token to see what's inside
    console.log('\n2. Decoding token...');
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
    
    // Test a simple endpoint first
    console.log('\n3. Testing /events endpoint (should work)...');
    try {
      const simpleResponse = await axios.get('http://localhost:5000/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Simple events fetch successful!');
    } catch (err) {
      console.log('Simple events fetch failed:', err.response?.status, err.response?.data?.message);
    }
    
    // Test techops/events endpoint
    console.log('\n4. Testing /techops/events...');
    const eventsResponse = await axios.get('http://localhost:5000/techops/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Techops events fetch successful!');
    console.log('Events count:', eventsResponse.data.events?.length || 0);
    
  } catch (error) {
    console.error('\nError in step 4:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

debugTechopsAPI();