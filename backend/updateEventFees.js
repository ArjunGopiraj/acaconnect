require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

async function updateEventFees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const events = await Event.find({ status: 'PUBLISHED' });
    console.log(`Found ${events.length} published events`);

    // Set 3 events as free (₹0)
    const freeEventTitles = ['TREASURE HUNT', 'ANIME / CINEMA QUIZ', 'PHOTOGRAPHY CONTEST'];
    
    for (const event of events) {
      let fee = 0;
      
      if (freeEventTitles.includes(event.title.toUpperCase())) {
        fee = 0; // Free events
      } else if (event.type === 'Technical') {
        fee = 100; // Technical events: ₹100
      } else if (event.type === 'Non-Technical') {
        fee = 50; // Non-Technical events: ₹50
      } else if (event.type === 'Hackathon') {
        fee = 200; // Hackathons: ₹200
      } else if (event.type === 'Workshop' || event.type === 'Seminar') {
        fee = 150; // Workshops/Seminars: ₹150
      }

      event.registration_fee = fee;
      await event.save();
      
      console.log(`Updated ${event.title}: ₹${fee}`);
    }

    console.log('\n✅ All events updated with registration fees!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateEventFees();
