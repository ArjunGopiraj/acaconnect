const mongoose = require("mongoose");

const designFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filename: { type: String, required: true },
  original_name: { type: String, required: true },
  file_type: { type: String, required: true },
  file_size: { type: Number },
  category: { type: String, enum: ["event", "general"], required: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("DesignFile", designFileSchema);
