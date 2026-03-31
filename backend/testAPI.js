const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing published events API...');
    
    // Test without authentication (should work for published events)
    const response = await axios.get('http://localhost:5000/events/published');
    console.log(`Status: ${response.status}`);
    console.log(`Events found: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('First event:', {
        title: response.data[0].title,
        status: response.data[0].status,
        date: response.data[0].date
      });
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - server might not be running');
    }
  }
}

testAPI();