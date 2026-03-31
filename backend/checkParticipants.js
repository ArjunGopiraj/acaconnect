const mongoose = require('mongoose');
const Participant = require('./src/models/Participant');

mongoose.connect('mongodb://localhost:27017/college_events');

async function checkParticipants() {
  try {
    console.log('Checking participants in database...');
    
    const participants = await Participant.find({});
    console.log(`Total participants: ${participants.length}`);
    
    participants.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - ${p.email}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkParticipants();