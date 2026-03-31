const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college-events');

async function checkSpecificEvent() {
  try {
    console.log('=== CHECKING ALL EVENTS ===');
    
    const allEvents = await Event.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`Total events: ${allEvents.length}`);
    
    allEvents.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1} ---`);
      console.log('ID:', event._id);
      console.log('Title:', event.title);
      console.log('Has Logistics:', !!event.logistics);
      if (event.logistics) {
        console.log('Expense Submitted:', event.logistics.expense_submitted);
        console.log('GST Number:', event.logistics.gst_number);
        console.log('GST Verified:', event.logistics.gst_verified);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSpecificEvent();