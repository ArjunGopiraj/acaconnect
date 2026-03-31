const mongoose = require('mongoose');
const Participant = require('./src/models/Participant');
const Registration = require('./src/models/Registration');

mongoose.connect('mongodb://localhost:27017/college_events');

const nameReplacements = {
  'john.doe@example.com': 'Karthik Venkatesh',
  'jane.smith@example.com': 'Divya Krishnan',
  'mike.johnson@example.com': 'Aditya Menon',
  'arjun.sharma@example.com': 'Arjun Sharma', // Already Indian
  'priya.patel@example.com': 'Priya Patel', // Already Indian
  'rahul.kumar@example.com': 'Rahul Kumar', // Already Indian
  'sneha.reddy@example.com': 'Sneha Reddy', // Already Indian
  'vikram.singh@example.com': 'Vikram Singh' // Already Indian
};

async function replaceAINames() {
  console.log('\n=== REPLACING AI-GENERATED NAMES ===\n');
  
  for (const [email, newName] of Object.entries(nameReplacements)) {
    const participant = await Participant.findOne({ email });
    
    if (participant && participant.name !== newName) {
      const oldName = participant.name;
      
      // Update participant name
      await Participant.updateOne({ email }, { name: newName });
      
      // Update all registrations with this participant
      await Registration.updateMany(
        { participant_email: email },
        { participant_name: newName }
      );
      
      console.log(`✓ ${oldName} → ${newName} (${email})`);
    }
  }
  
  console.log('\n✅ Name replacement complete!\n');
  mongoose.connection.close();
}

replaceAINames().catch(console.error);
