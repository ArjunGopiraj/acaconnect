const axios = require('axios');

async function testWithRealEvents() {
    try {
        // Get actual published events from backend
        const eventsResponse = await axios.get('http://localhost:5000/events/published');
        const publishedEvents = eventsResponse.data;
        
        console.log('='.repeat(70));
        console.log('TESTING WITH YOUR ACTUAL EVENTS');
        console.log('='.repeat(70));
        console.log(`\nFound ${publishedEvents.length} published events in database:\n`);
        
        publishedEvents.forEach((event, i) => {
            console.log(`${i+1}. ${event.title}`);
            console.log(`   Tags: ${event.tags ? event.tags.join(', ') : 'No tags'}`);
        });
        
        // Test with user interests
        const userInterests = ['Programming & Coding', 'Database & SQL'];
        
        console.log('\n' + '='.repeat(70));
        console.log(`USER INTERESTS: ${userInterests.join(', ')}`);
        console.log('='.repeat(70));
        
        // Call ML recommendation API
        const mlResponse = await axios.post('http://localhost:5000/ml/recommend', {
            interests: userInterests
        });
        
        if (mlResponse.data.success) {
            console.log(`\n✓ ${mlResponse.data.message}`);
            console.log(`\nRECOMMENDATIONS:\n`);
            
            mlResponse.data.events.forEach((event, i) => {
                if (event.similarity > 0) {
                    console.log(`${i+1}. ${event.title}`);
                    console.log(`   Match Score: ${(event.similarity * 100).toFixed(1)}%`);
                    console.log(`   Tags: ${event.tags ? event.tags.join(', ') : 'No tags'}`);
                    console.log();
                }
            });
        } else {
            console.log('Error:', mlResponse.data.message);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWithRealEvents();
