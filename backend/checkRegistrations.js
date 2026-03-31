const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Participant = require('./src/models/Participant');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college_events');

async function checkRegistrations() {
  try {
    console.log('Checking registrations in database...');
    
    const allRegistrations = await Registration.find({})
      .populate('participant_id', 'name email')
      .populate('event_id', 'title');
    
    console.log(`Total registrations: ${allRegistrations.length}`);
    
    if (allRegistrations.length > 0) {
      console.log('\nRegistrations:');
      allRegistrations.forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.participant_id?.name || 'Unknown'} (${reg.participant_id?.email || 'No email'}) -> ${reg.event_id?.title || 'Unknown event'} - Status: ${reg.payment_status}`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking registrations:', error);
    mongoose.connection.close();
  }
}

checkRegistrations();