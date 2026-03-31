require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const NotificationService = require('./src/services/notification.service');

async function testExpenseSubmission() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a published event
    const event = await Event.findOne({ status: 'PUBLISHED' });
    if (!event) {
      console.log('No published events found');
      process.exit(1);
    }

    console.log('Found event:', event.title);
    console.log('Event ID:', event._id);

    // Simulate expense submission
    const expenseBreakdown = {
      refreshments: 1000,
      stationery: 200,
      technical: 0,
      certificates: 0,
      goodies: 0,
      trophies: 1000,
      other: 100
    };
    
    const totalExpense = Object.values(expenseBreakdown).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    console.log('Total expense:', totalExpense);

    // Update event with expense data
    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      {
        'logistics.total_expense': totalExpense,
        'logistics.expense_breakdown': expenseBreakdown,
        'logistics.expense_submitted': true,
        'logistics.expense_submitted_at': new Date()
      },
      { new: true }
    );

    console.log('Event updated successfully');

    // Send notification
    console.log('Sending notification to treasurer...');
    await NotificationService.notifyRole(
      'TREASURER',
      `Logistics has submitted expenses for event "${updatedEvent.title}" - Total: ₹${totalExpense}`
    );

    console.log('Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testExpenseSubmission();