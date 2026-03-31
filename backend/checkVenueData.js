const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college_events');

async function checkVenueData() {
  try {
    const events = await Event.find({ status: 'PUBLISHED' });
    
    console.log('Checking venue allocation data...\n');
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Venue field: ${event.venue || 'Not set'}`);
      console.log(`   Hospitality object:`, event.hospitality || 'Not set');
      console.log('');
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkVenueData();