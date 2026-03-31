const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  aggregated_amount: Number,
  predicted_amount: Number,
  treasurer_status: {
    type: String,
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);
