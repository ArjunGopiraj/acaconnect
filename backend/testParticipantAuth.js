const axios = require('axios');

async function testParticipantAuth() {
  try {
    // Test participant login first
    console.log('Testing participant login...');
    const loginResponse = await axios.post('http://localhost:5000/participant-auth/login', {
      email: '2024179001@student.annauniv.edu',
      password: 'Arjunpar@123'
    });
    
    console.log('Login successful:', loginResponse.data.user.name);
    const token = loginResponse.data.token;
    
    // Test my-registrations endpoint
    console.log('Testing my-registrations endpoint...');
    const regResponse = await axios.get('http://localhost:5000/events/my-registrations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Found ${regResponse.data.length} registrations`);
    regResponse.data.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.event_id?.title} - ${reg.payment_status}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testParticipantAuth();