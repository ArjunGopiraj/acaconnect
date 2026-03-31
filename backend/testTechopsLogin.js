const axios = require('axios');

async function testTechopsLogin() {
  try {
    console.log('Testing TECHOPS login...');
    
    const response = await axios.post('http://localhost:5000/auth/login', {
      email: 'techops@test.com',
      password: 'techops123'
    });
    
    console.log('Login successful!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token ? 'Generated' : 'Missing');
    
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else if (error.request) {
      console.error('No response from server. Is the backend running?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTechopsLogin();