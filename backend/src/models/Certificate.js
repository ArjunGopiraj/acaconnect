const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participant_name: {
    type: String,
    required: true
  },
  participant_college: {
    type: String,
    required: true
  },
  event_name: {
    type: String,
    required: true
  },
  event_date: {
    type: Date,
    required: true
  },
  certificate_path: {
    type: String,
    required: true
  },
  generated_at: {
    type: Date,
    default: Date.now
  },
  downloaded_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate certificates
certificateSchema.index({ participant_id: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);