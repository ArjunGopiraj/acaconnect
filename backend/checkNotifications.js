const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

const checkNotifications = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    const notifications = await Notification.find({})
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${notifications.length} recent notifications:`);
    notifications.forEach(notif => {
      console.log(`- ${notif.user_id?.name} (${notif.user_id?.email}): ${notif.message}`);
      console.log(`  Created: ${notif.createdAt}, Read: ${notif.is_read}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkNotifications();