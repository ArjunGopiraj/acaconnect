const mongoose = require("mongoose");

const photoCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("PhotoCategory", photoCategorySchema);
