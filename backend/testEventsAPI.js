const axios = require('axios');

async function testEventsAPI() {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'gensec@test.com',
      password: 'gensec123'
    });
    
    const token = loginResponse.data.token;
    
    console.log('Testing /events API...');
    const response = await axios.get('http://localhost:5000/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sqlWar = response.data.find(e => e.title === 'SQL WAR');
    if (sqlWar) {
      console.log('SQL WAR found:');
      console.log('- Title:', sqlWar.title);
      console.log('- Status:', sqlWar.status);
      console.log('- Hospitality object:', JSON.stringify(sqlWar.hospitality, null, 2));
      console.log('- Venue field:', sqlWar.venue);
    } else {
      console.log('SQL WAR not found in API response');
    }
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testEventsAPI();