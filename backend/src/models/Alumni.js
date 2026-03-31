const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  linkedin: { type: String, default: '' },
  batch: { type: String, required: true },
  location: { type: String, default: '' },
  organization: { type: String, default: '' },
  position: { type: String, default: '' },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Alumni", alumniSchema);
