const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Participant = require('./src/models/Participant');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college_events')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function addMoreRegistrations() {
  try {
    // Get all participants and events
    const participants = await Participant.find({});
    const events = await Event.find({ status: 'PUBLISHED' });
    
    console.log(`Found ${participants.length} participants and ${events.length} events`);
    
    // Create registration patterns that show clear co-occurrence
    const patterns = [
      // Pattern 1: Programming enthusiasts register for SQL, DSA, and Tech Quiz together
      {
        interests: ['Programming & Coding', 'Database & SQL'],
        events: ['SQL WAR', 'DEBUGGING WITH DSA', 'Tech Quiz Challenge']
      },
      // Pattern 2: Creative people register for UI/UX, Photography, and Adzap together
      {
        interests: ['UI/UX Design', 'Creative & Marketing'],
        events: ['UI/UX DEVELOPMENT', 'PHOTOGRAPHY CONTEST', 'ADZAP']
      },
      // Pattern 3: All-rounders register for Pitch, Technical Connections, and IPL
      {
        interests: ['Project & Presentation', 'Management & Strategy'],
        events: ['PITCH YOUR PROJECT CUM PRESENTATION', 'TECHNICAL CONNECTIONS', 'IPL AUCTION']
      },
      // Pattern 4: Fun seekers register for Treasure Hunt, Anime Quiz, and Choreo
      {
        interests: ['Fun & Engagement', 'General Quiz'],
        events: ['TREASURE HUNT', 'ANIME / CINEMA QUIZ', 'Choreo Night']
      },
      // Pattern 5: Cross-pattern - Programming + UI/UX (to show CF discovering this)
      {
        interests: ['Programming & Coding', 'UI/UX Design'],
        events: ['SQL WAR', 'UI/UX DEVELOPMENT', 'PITCH YOUR PROJECT CUM PRESENTATION']
      }
    ];
    
    let registrationCount = 0;
    
    // For each participant, assign them to a pattern and register for those events
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const pattern = patterns[i % patterns.length]; // Cycle through patterns
      
      console.log(`\nProcessing ${participant.name} (${participant.email})`);
      console.log(`Pattern: ${pattern.interests.join(', ')}`);
      
      for (const eventTitle of pattern.events) {
        const event = events.find(e => e.title === eventTitle);
        if (!event) {
          console.log(`  ⚠️  Event not found: ${eventTitle}`);
          continue;
        }
        
        // Check if already registered
        const existing = await Registration.findOne({
          participant_id: participant._id,
          event_id: event._id
        });
        
        if (existing) {
          console.log(`  ✓ Already registered: ${eventTitle}`);
          continue;
        }
        
        // Create registration
        const registration = new Registration({
          event_id: event._id,
          participant_id: participant._id,
          participant_email: participant.email,
          participant_name: participant.name,
          registration_date: new Date(),
          payment_status: 'COMPLETED',
          payment_method: event.registration_fee > 0 ? 'UPI' : 'FREE',
          payment_id: event.registration_fee > 0 ? `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}` : null,
          payment_date: event.registration_fee > 0 ? new Date() : null,
          registration_fee: event.registration_fee || 0,
          verification_status: 'APPROVED'
        });
        
        await registration.save();
        registrationCount++;
        console.log(`  ✅ Registered: ${eventTitle}`);
      }
    }
    
    console.log(`\n✅ Added ${registrationCount} new registrations!`);
    console.log('\nNow run: node backend/buildInteractionMatrix.js');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addMoreRegistrations();
