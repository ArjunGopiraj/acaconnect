const ParticipantNotification = require('../models/ParticipantNotification');
const Participant = require('../models/Participant');

class ParticipantNotificationService {
  static async notifyParticipant(participantId, message, eventId = null, type = 'announcement') {
    try {
      const notification = new ParticipantNotification({
        participant_id: participantId,
        message,
        type,
        event_id: eventId,
        is_read: false
      });
      
      await notification.save();
      console.log(`Sent notification to participant ${participantId}: ${message}`);
      return notification;
    } catch (error) {
      console.error('Error creating participant notification:', error);
      throw error;
    }
  }

  static async notifyEventParticipants(eventId, message, type = 'event_update') {
    try {
      // Get all participants registered for the event
      const Registration = require('../models/Registration');
      const registrations = await Registration.find({ 
        event_id: eventId,
        payment_status: 'COMPLETED'
      }).populate('participant_id');
      
      const notifications = registrations.map(reg => ({
        participant_id: reg.participant_id._id,
        message,
        type,
        event_id: eventId,
        is_read: false
      }));
      
      if (notifications.length > 0) {
        const result = await ParticipantNotification.insertMany(notifications);
        console.log(`Sent ${result.length} notifications to event participants`);
        return result;
      }
      
      return [];
    } catch (error) {
      console.error('Error creating event participant notifications:', error);
      throw error;
    }
  }

  static async notifyAllParticipants(message, eventId = null, type = 'announcement') {
    try {
      const participants = await Participant.find({});
      const notifications = participants.map(participant => ({
        participant_id: participant._id,
        message,
        type,
        event_id: eventId,
        is_read: false
      }));
      
      if (notifications.length > 0) {
        const result = await ParticipantNotification.insertMany(notifications);
        console.log(`Sent ${result.length} notifications to all participants`);
        return result;
      }
      
      return [];
    } catch (error) {
      console.error('Error creating global participant notifications:', error);
      throw error;
    }
  }

  static async notifyAttendanceMarked(participantId, eventTitle, attendanceStatus, eventId) {
    try {
      const message = attendanceStatus === 'PRESENT' 
        ? `Your attendance has been marked as PRESENT for "${eventTitle}". Thank you for participating!`
        : `Your attendance has been marked as ABSENT for "${eventTitle}".`;
      
      return await this.notifyParticipant(participantId, message, eventId, 'attendance');
    } catch (error) {
      console.error('Error creating attendance notification:', error);
      throw error;
    }
  }
}

module.exports = ParticipantNotificationService;