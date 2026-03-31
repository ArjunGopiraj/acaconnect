const mongoose = require('mongoose');
const Event = require('./src/models/Events');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college_events');

async function checkEvents() {
  try {
    console.log('Checking events in database...');
    
    // Get all events
    const allEvents = await Event.find({});
    console.log(`Total events in database: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\nEvent statuses:');
      allEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} - Status: ${event.status}`);
      });
      
      // Check published events specifically
      const publishedEvents = await Event.find({ status: 'PUBLISHED' });
      console.log(`\nPublished events: ${publishedEvents.length}`);
      
      if (publishedEvents.length > 0) {
        console.log('Published events:');
        publishedEvents.forEach((event, index) => {
          console.log(`${index + 1}. ${event.title}`);
        });
      }
    } else {
      console.log('No events found in database');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking events:', error);
    mongoose.connection.close();
  }
}

checkEvents();