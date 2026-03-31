const mongoose = require("mongoose");

const eventTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  default_requirements: {
    volunteers_needed: Number,
    rooms_needed: Number,
    refreshments_needed: Boolean,
    stationary_needed: Boolean,
    goodies_needed: Boolean,
    physical_certificate: Boolean,
    trophies_needed: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.model("EventType", eventTypeSchema);
