const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Participant = require('./src/models/Participant');

mongoose.connect('mongodb://localhost:27017/college_events');

// Add more registrations with strong interest-event alignment
const strategicRegistrations = [
  // Users with Programming interests registering for programming events
  { email: 'rahul@gmail.com', events: ['6977e66df51b849353f77a91', '6977e66df51b849353f77a94', '6977e66df51b849353f77a98'] }, // SQL, DSA, Technical
  { email: 'jeeva@gmail.com', events: ['6977e66df51b849353f77a91', '6977e66df51b849353f77a94', '6977e66df51b849353f77a98'] }, // SQL, DSA, Technical
  { email: 'aryan123@gamil.com', events: ['6977e66df51b849353f77a91', '6977e66df51b849353f77a94', '6977e66df51b849353f77a98'] }, // SQL, DSA, Technical
  { email: 'priya.patel@example.com', events: ['6977e66df51b849353f77a91', '6977e66df51b849353f77a98', '6977e66df51b849353f77a94'] }, // SQL, Technical, DSA
  { email: 'arjun.sharma@example.com', events: ['6977e66df51b849353f77a94', '6977e66df51b849353f77a91'] }, // DSA, SQL
  { email: '2024179001@student.annauniv.edu', events: ['6977e66df51b849353f77a98'] }, // Technical
  { email: 'arjun.sundar@test.com', events: ['6977e66df51b849353f77a91'] }, // SQL
  
  // Users with Creative interests registering for creative events
  { email: 'arya@gmail.com', events: ['6977e66df51b849353f77a9b', '6977e66df51b849353f77aaa', '6977e66df51b849353f77aad', '6977e66df51b849353f77a9e'] }, // UI/UX, ADZAP, Photo, Pitch
  { email: 'john.doe@example.com', events: ['6977e66df51b849353f77a9b', '6977e66df51b849353f77aaa', '6977e66df51b849353f77aad', '6977e66df51b849353f77a9e'] }, // UI/UX, ADZAP, Photo, Pitch
  { email: 'rahul.kumar@example.com', events: ['6977e66df51b849353f77aaa', '6977e66df51b849353f77a9e'] }, // ADZAP, Pitch
  { email: 'aryan123@gamil.com', events: ['6977e66df51b849353f77a9e'] }, // Pitch Project
  
  // Users with Quiz interests registering for quiz events
  { email: 'sachin@gmail.com', events: ['6977e66df51b849353f77aa4', '6977e66df51b849353f77a98'] }, // Anime Quiz, Technical
  { email: 'surya@gmail.com', events: ['6977e66df51b849353f77aa4', '6977e66df51b849353f77a98'] }, // Anime Quiz, Technical
  { email: 'sneha.reddy@example.com', events: ['6977e66df51b849353f77aa4'] }, // Anime Quiz
  { email: 'vikram.singh@example.com', events: ['6977e66df51b849353f77aa4'] }, // Anime Quiz
  { email: 'jane.smith@example.com', events: ['6977e66df51b849353f77a98'] }, // Technical
  
  // Users with Management interests registering for management events
  { email: 'mike.johnson@example.com', events: ['6977e66df51b849353f77aa1', '6977e66df51b849353f77aa7'] }, // Treasure Hunt, IPL
  { email: 'vikram.singh@example.com', events: ['6977e66df51b849353f77aa1', '6977e66df51b849353f77aa7'] }, // Treasure Hunt, IPL
  { email: 'jane.smith@example.com', events: ['6977e66df51b849353f77aa1', '6977e66df51b849353f77aa7'] }, // Treasure Hunt, IPL
  { email: 'sachin@gmail.com', events: ['6977e66df51b849353f77aa1', '6977e66df51b849353f77aa7'] }, // Treasure Hunt, IPL
  { email: 'sneha.reddy@example.com', events: ['6977e66df51b849353f77aa1'] }, // Treasure Hunt
  
  // More cross-interest registrations
  { email: '2024179001@student.annauniv.edu', events: ['6977e66df51b849353f77a91', '6977e66df51b849353f77a94'] }, // SQL, DSA
  { email: 'arjun.sundar@test.com', events: ['6977e66df51b849353f77a94', '6977e66df51b849353f77a98'] }, // DSA, Technical
];

async function addStrategicRegistrations() {
  console.log('Adding strategic registrations to increase relevance...\n');
  
  let added = 0;
  
  for (const userReg of strategicRegistrations) {
    const participant = await Participant.findOne({ email: userReg.email });
    
    if (!participant) {
      console.log(`Participant ${userReg.email} not found, skipping...`);
      continue;
    }
    
    for (const eventId of userReg.events) {
      // Check if registration already exists
      const existing = await Registration.findOne({
        event_id: eventId,
        participant_id: participant._id
      });
      
      if (!existing) {
        await Registration.create({
          event_id: eventId,
          participant_id: participant._id,
          participant_email: participant.email,
          participant_name: participant.name,
          registration_fee: 0,
          payment_status: 'COMPLETED',
          payment_method: 'FREE',
          verification_status: 'APPROVED'
        });
        added++;
        console.log(`✓ Added: ${participant.name} -> Event ${eventId}`);
      }
    }
  }
  
  console.log(`\n✅ Added ${added} strategic registrations`);
  console.log('\nNext steps:');
  console.log('1. Run: node buildInteractionMatrix.js');
  console.log('2. Restart ML service');
  console.log('3. Run: python test_hybrid_accuracy.py');
  
  mongoose.connection.close();
}

addStrategicRegistrations().catch(console.error);
