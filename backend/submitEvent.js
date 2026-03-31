require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const event = await Event.findOne({ title: 'Test Event' });
    if (!event) {
      console.log('Event not found');
      mongoose.connection.close();
      return;
    }
    
    console.log(`\nBefore: ${event.title} - Status: ${event.status}`);
    
    event.status = 'PENDING_TREASURER';
    await event.save();
    
    console.log(`After: ${event.title} - Status: ${event.status}`);
    console.log('\n✅ Event submitted for treasurer approval!');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
