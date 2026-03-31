const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college-events');

async function createTestEvent() {
  try {
    const testEvent = new Event({
      title: 'GST Test Event',
      type: 'Technical',
      description: 'Test event for GST functionality',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '10:00 AM',
      duration_hours: 3,
      expected_participants: 100,
      created_by: new mongoose.Types.ObjectId(),
      status: 'PUBLISHED',
      requirements: {
        refreshments_needed: true,
        refreshment_items: [{ item_name: 'Tea/Coffee', quantity: 100 }],
        stationary_needed: true,
        stationary_items: [{ item_name: 'Notebooks', quantity: 50 }]
      }
    });
    
    await testEvent.save();
    console.log('Test event created successfully!');
    console.log('Event ID:', testEvent._id);
    console.log('Event Title:', testEvent.title);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestEvent();