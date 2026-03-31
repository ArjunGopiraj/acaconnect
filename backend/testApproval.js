require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const event = await Event.findOne({ status: 'PENDING_TREASURER' });
    if (!event) {
      console.log('No pending event found');
      mongoose.connection.close();
      return;
    }
    
    console.log(`\nEvent: ${event.title}`);
    console.log(`Current Status: ${event.status}`);
    
    try {
      // Simulate approval
      event.treasurer_comments = 'Test approval';
      event.status = 'TREASURER_APPROVED';
      await event.save();
      
      console.log('First save successful');
      
      // Change to PENDING_GEN_SEC
      event.status = 'PENDING_GEN_SEC';
      await event.save();
      
      console.log(`\n✅ Approval successful!`);
      console.log(`New Status: ${event.status}`);
    } catch (error) {
      console.error('\n❌ Error during approval:');
      console.error(error.message);
      console.error(error.stack);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection Error:', err);
    process.exit(1);
  });
