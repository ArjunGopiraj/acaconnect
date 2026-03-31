const axios = require('axios');

async function testMLService() {
  try {
    const response = await axios.post('http://localhost:5001/recommend-cf', {
      interests: ['Programming & Coding', 'Database & SQL'],
      events: [
        { id: '6977e66df51b849353f77a91', tags: ['Database & SQL', 'Programming & Coding'], title: 'SQL WAR' },
        { id: '6977e66df51b849353f77a9b', tags: ['UI/UX Design', 'Web Development'], title: 'UI/UX DEVELOPMENT' }
      ],
      method: 'item',
      k: 5
    });
    
    console.log('ML Service Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\nFirst recommendation:');
    console.log(response.data.recommendations[0]);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testMLService();
