const mongoose = require('mongoose');
const Event = require('./backend/src/models/Events');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college-events', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testGSTData() {
  try {
    console.log('=== TESTING GST DATA ===');
    
    // Find events with logistics data
    const events = await Event.find({
      'logistics.expense_submitted': true
    });
    
    console.log(`Found ${events.length} events with expenses`);
    
    events.forEach(event => {
      console.log(`\nEvent: ${event.title}`);
      console.log('Logistics data:', event.logistics);
      console.log('GST Number:', event.logistics?.gst_number);
      console.log('GST Verified:', event.logistics?.gst_verified);
      console.log('No GST Reason:', event.logistics?.no_gst_reason);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testGSTData();