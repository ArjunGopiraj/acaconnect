const DesignFile = require("../models/DesignFile");

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { category, event_id, names } = req.body;
    if (!category || !["event", "general"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (category === "event" && !event_id) {
      return res.status(400).json({ message: "event_id required for event category" });
    }

    const parsedNames = JSON.parse(names || "[]");

    const docs = req.files.map((file, i) => ({
      name: parsedNames[i] || file.originalname,
      filename: file.filename,
      original_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
      category,
      event_id: category === "event" ? event_id : null,
      uploaded_by: req.user.id
    }));

    const saved = await DesignFile.insertMany(docs);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const files = await DesignFile.find()
      .populate("event_id", "title")
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files", error: error.message });
  }
};

exports.getByEvent = async (req, res) => {
  try {
    const files = await DesignFile.find({ category: "event", event_id: req.params.eventId })
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files", error: error.message });
  }
};

exports.getGeneral = async (req, res) => {
  try {
    const files = await DesignFile.find({ category: "general" })
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files", error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await DesignFile.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "..", "..", "uploads", "designs", file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
