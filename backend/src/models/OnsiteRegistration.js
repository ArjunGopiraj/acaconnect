const mongoose = require('mongoose');

const onsiteRegistrationSchema = new mongoose.Schema({
  participant_details: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    college: { type: String, default: 'Walk-in' },
    department: { type: String, default: 'N/A' },
    year: { type: String, default: 'N/A' },
    is_onsite: { type: Boolean, default: true },
    registered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registration_date: { type: Date, default: Date.now }
  },
  events: [{
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    event_title: { type: String, required: true },
    registration_fee: { type: Number, default: 0 }
  }],
  total_fee: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'REJECTED'], 
    default: 'PENDING_PAYMENT' 
  },
  payment_confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payment_confirmed_at: { type: Date },
  verification_comments: { type: String, default: '' },
  registered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnsiteRegistration', onsiteRegistrationSchema);