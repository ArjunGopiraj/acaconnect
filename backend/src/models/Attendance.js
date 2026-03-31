const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },
  registration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true
  },
  participant_name: {
    type: String,
    required: true
  },
  participant_email: {
    type: String,
    required: true
  },
  attendance_status: {
    type: String,
    enum: ['PRESENT', 'ABSENT'],
    default: 'ABSENT'
  },
  marked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  marked_at: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Compound index to ensure one attendance record per participant per event
attendanceSchema.index({ event_id: 1, participant_id: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);