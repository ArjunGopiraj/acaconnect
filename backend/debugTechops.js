const axios = require('axios');

async function testTechopsAPI() {
  try {
    // First login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'techops@test.com',
      password: 'techops123'
    });
    
    console.log('Login successful!');
    console.log('User role:', loginResponse.data.user.role);
    
    const token = loginResponse.data.token;
    
    // Test techops/events endpoint
    console.log('\n2. Testing /techops/events...');
    const eventsResponse = await axios.get('http://localhost:5000/techops/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Events fetch successful!');
    console.log('Events count:', eventsResponse.data.events?.length || 0);
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTechopsAPI();