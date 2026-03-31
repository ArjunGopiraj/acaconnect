const mongoose = require('mongoose');

const refreshmentItemSchema = new mongoose.Schema({
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
    enum: ['pieces', 'bottles', 'cups', 'plates', 'packets', 'servings']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RefreshmentItem', refreshmentItemSchema);