// Test if ML service is running
const axios = require('axios');

async function testMLService() {
    try {
        console.log('Testing ML service health...');
        const response = await axios.get('http://localhost:5001/health');
        console.log('✓ ML Service is running!');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('✗ ML Service is NOT running!');
        console.log('Error:', error.message);
        console.log('\nPlease start the ML service:');
        console.log('  cd ml-service');
        console.log('  python app.py');
    }
}

testMLService();
