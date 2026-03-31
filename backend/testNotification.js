const mongoose = require('mongoose');
const NotificationService = require('./src/services/notification.service');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Notification = require('./src/models/Notification');

const testNotification = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    console.log('Testing notification service...');
    const result = await NotificationService.notifyRole(
      'GENERAL_SECRETARY',
      'Test notification from HR team'
    );
    
    console.log('Notification result:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testNotification();