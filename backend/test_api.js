const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testExpenseSubmission() {
  try {
    console.log('=== TESTING EXPENSE SUBMISSION API ===');
    
    // First, create a test event
    const mongoose = require('mongoose');
    const Event = require('./src/models/Events');
    
    await mongoose.connect('mongodb://localhost:27017/college-events');
    
    const testEvent = new Event({
      title: 'API Test Event',
      type: 'Technical',
      description: 'Test event for API testing',
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
    
    // Now test the API call
    const formData = new FormData();
    formData.append('expense_breakdown', JSON.stringify({
      refreshments: 2000,
      stationery: 1000,
      technical: 2000,
      certificates: 0,
      goodies: 0,
      trophies: 0,
      other: 0
    }));
    formData.append('gst_number', '29AAAAA1234F00');
    formData.append('gst_verified', 'true');
    formData.append('no_gst_reason', '');
    
    console.log('Making API call to:', `http://localhost:5000/logistics/expense/${testEvent._id}`);
    
    const response = await axios.post(
      `http://localhost:5000/logistics/expense/${testEvent._id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer test-token' // You might need a real token
        }
      }
    );
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', response.data);
    
    // Check if data was saved
    const updatedEvent = await Event.findById(testEvent._id);
    console.log('\\n=== DATABASE CHECK ===');
    console.log('GST Number in DB:', updatedEvent.logistics?.gst_number);
    console.log('GST Verified in DB:', updatedEvent.logistics?.gst_verified);
    console.log('Expense Submitted:', updatedEvent.logistics?.expense_submitted);
    
    // Clean up
    await Event.findByIdAndDelete(testEvent._id);
    console.log('Test event cleaned up');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testExpenseSubmission();