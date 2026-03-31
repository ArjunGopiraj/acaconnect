const Notification = require('../models/Notification');
const User = require('../models/User');
const Role = require('../models/Role');

class NotificationService {
  static async notifyRole(roleName, message, eventId = null) {
    try {
      console.log(`=== NOTIFICATION SERVICE: Notifying role ${roleName} ===`);
      console.log('Message:', message);
      
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        console.log(`Role ${roleName} not found`);
        return;
      }
      
      const users = await User.find({ role_id: role._id });
      console.log(`Found ${users.length} users with role ${roleName}`);
      
      const notifications = users.map(user => ({
        user_id: user._id,
        message,
        type: 'workflow',
        event_id: eventId,
        is_read: false
      }));
      
      const result = await Notification.insertMany(notifications);
      console.log(`Successfully created ${result.length} notifications`);
      console.log(`Sent notifications to ${users.length} users with role ${roleName}`);
      return notifications;
    } catch (error) {
      console.error('Error creating role notifications:', error);
    }
  }

  static async notifyEventCreator(creatorId, message, eventId = null) {
    try {
      const notification = new Notification({
        user_id: creatorId,
        message,
        type: 'event_update',
        event_id: eventId,
        is_read: false
      });
      
      await notification.save();
      console.log(`Sent notification to event creator: ${message}`);
      return notification;
    } catch (error) {
      console.error('Error creating event creator notification:', error);
    }
  }

  static async notifyUser(userId, message, eventId = null) {
    try {
      const notification = new Notification({
        user_id: userId,
        message,
        type: 'personal',
        event_id: eventId,
        is_read: false
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating user notification:', error);
    }
  }

  static async notifyOnsiteRegistration(registrationId, participantName, totalFee) {
    try {
      const message = `New onsite registration: ${participantName} - Total Fee: ₹${totalFee}. Please confirm payment receipt.`;
      await this.notifyRole('TREASURER', message);
      console.log(`Sent onsite registration notification to treasurers`);
    } catch (error) {
      console.error('Error sending onsite registration notification:', error);
    }
  }

  static async notifyAll(message, eventId = null) {
    try {
      const users = await User.find({});
      const notifications = users.map(user => ({
        user_id: user._id,
        message,
        type: 'announcement',
        event_id: eventId,
        is_read: false
      }));
      
      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating global notifications:', error);
    }
  }
}

module.exports = NotificationService;