const mongoose = require('mongoose');
const Event = require('./src/models/Events');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college-events');

async function testGSTSaving() {
  try {
    console.log('=== TESTING GST DATA SAVING ===');
    
    // Create a test event
    const testEvent = new Event({
      title: 'Test Event for GST',
      type: 'Technical',
      description: 'Test event to verify GST functionality',
      date: new Date(),
      time: '10:00 AM',
      duration_hours: 2,
      expected_participants: 50,
      created_by: new mongoose.Types.ObjectId(),
      status: 'PUBLISHED',
      logistics: {
        requirements_acknowledged: true,
        acknowledged_at: new Date()
      }
    });
    
    await testEvent.save();
    console.log('Test event created:', testEvent._id);
    
    // Update with GST data (simulating expense submission)
    const updatedEvent = await Event.findByIdAndUpdate(
      testEvent._id,
      {
        'logistics.total_expense': 5000,
        'logistics.expense_breakdown': {
          refreshments: 2000,
          stationery: 1000,
          technical: 2000,
          certificates: 0,
          goodies: 0,
          trophies: 0,
          other: 0
        },
        'logistics.expense_submitted': true,
        'logistics.expense_submitted_at': new Date(),
        'logistics.gst_number': '29AAAAA1234F000',
        'logistics.gst_verified': true,
        'logistics.no_gst_reason': ''
      },
      { new: true }
    );
    
    console.log('Event updated with GST data');
    console.log('GST Number saved:', updatedEvent.logistics.gst_number);
    console.log('GST Verified saved:', updatedEvent.logistics.gst_verified);
    console.log('No GST Reason saved:', updatedEvent.logistics.no_gst_reason);
    
    // Verify by fetching the event again
    const fetchedEvent = await Event.findById(testEvent._id);
    console.log('\\n=== VERIFICATION ===');
    console.log('Fetched GST Number:', fetchedEvent.logistics.gst_number);
    console.log('Fetched GST Verified:', fetchedEvent.logistics.gst_verified);
    console.log('Fetched No GST Reason:', fetchedEvent.logistics.no_gst_reason);
    
    // Clean up - delete test event
    await Event.findByIdAndDelete(testEvent._id);
    console.log('\\nTest event cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testGSTSaving();