const mongoose = require('mongoose');
const Participant = require('./src/models/Participant');

mongoose.connect('mongodb://localhost:27017/college_events');

async function findAINames() {
  const participants = await Participant.find({});
  
  console.log('\n=== ALL PARTICIPANTS ===\n');
  participants.forEach(p => {
    console.log(`${p.name} (${p.email})`);
  });
  
  mongoose.connection.close();
}

findAINames().catch(console.error);
