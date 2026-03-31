const mongoose = require("mongoose");

const participantNotificationSchema = new mongoose.Schema({
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    default: null
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['attendance', 'event_update', 'registration', 'announcement'],
    default: 'announcement'
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("ParticipantNotification", participantNotificationSchema);