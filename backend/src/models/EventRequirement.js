const mongoose = require("mongoose");

const eventRequirementSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  team_type: {
    type: String,
    required: true
  },
  resource_name: String,
  quantity: Number,
  estimated_cost: Number,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("EventRequirement", eventRequirementSchema);
