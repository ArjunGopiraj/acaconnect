const mongoose = require('mongoose');

const technicalItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'pieces',
    enum: ['pieces', 'sets', 'units', 'items']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TechnicalItem', technicalItemSchema);