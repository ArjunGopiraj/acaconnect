const mongoose = require('mongoose');
const Event = require('./src/models/Events');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college-events');

async function testGSTData() {
  try {
    console.log('=== TESTING GST DATA ===');
    
    // Find all events
    const allEvents = await Event.find({});
    console.log(`Total events in database: ${allEvents.length}`);
    
    // Find events with logistics acknowledged
    const acknowledgedEvents = await Event.find({
      'logistics.requirements_acknowledged': true
    });
    console.log(`Events with logistics acknowledged: ${acknowledgedEvents.length}`);
    
    // Find events with logistics data
    const eventsWithExpenses = await Event.find({
      'logistics.expense_submitted': true
    });
    console.log(`Events with expenses submitted: ${eventsWithExpenses.length}`);
    
    // Check any events with logistics object
    const eventsWithLogistics = await Event.find({
      'logistics': { $exists: true }
    });
    console.log(`Events with logistics object: ${eventsWithLogistics.length}`);
    
    eventsWithLogistics.forEach(event => {
      console.log(`\nEvent: ${event.title}`);
      console.log('Logistics data:', event.logistics);
      if (event.logistics) {
        console.log('GST Number:', event.logistics.gst_number);
        console.log('GST Verified:', event.logistics.gst_verified);
        console.log('No GST Reason:', event.logistics.no_gst_reason);
        console.log('Expense submitted:', event.logistics.expense_submitted);
        console.log('Requirements acknowledged:', event.logistics.requirements_acknowledged);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testGSTData();