const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Classroom', 'Computer Lab', 'Auditorium', 'Conference Room'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  equipment: [{
    type: String
  }],
  location: String,
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
