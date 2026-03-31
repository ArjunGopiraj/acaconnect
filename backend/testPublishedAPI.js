const axios = require('axios');

async function testPublishedAPI() {
  try {
    console.log('Testing /events/published API...');
    const response = await axios.get('http://localhost:5000/events/published');
    
    console.log(`Found ${response.data.length} published events`);
    
    const sqlWar = response.data.find(e => e.title === 'SQL WAR');
    if (sqlWar) {
      console.log('\nSQL WAR found:');
      console.log('- Title:', sqlWar.title);
      console.log('- Status:', sqlWar.status);
      console.log('- Has hospitality object:', !!sqlWar.hospitality);
      console.log('- Hospitality object:', JSON.stringify(sqlWar.hospitality, null, 2));
      console.log('- Venue field:', sqlWar.venue);
    } else {
      console.log('SQL WAR not found in published events');
    }
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testPublishedAPI();