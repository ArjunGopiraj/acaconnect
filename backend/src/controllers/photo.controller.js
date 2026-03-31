const PhotoFile = require("../models/PhotoFile");
const PhotoCategory = require("../models/PhotoCategory");
const ParticipantNotificationService = require("../services/participantNotification.service");

exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { upload_type, event_id, category_id, names } = req.body;
    if (!upload_type || !["event", "category"].includes(upload_type)) {
      return res.status(400).json({ message: "Invalid upload_type" });
    }
    if (upload_type === "event" && !event_id) {
      return res.status(400).json({ message: "event_id required for event uploads" });
    }
    if (upload_type === "category" && !category_id) {
      return res.status(400).json({ message: "category_id required for category uploads" });
    }

    const parsedNames = JSON.parse(names || "[]");

    const docs = req.files.map((file, i) => ({
      name: parsedNames[i] || file.originalname,
      filename: file.filename,
      original_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
      upload_type,
      event_id: upload_type === "event" ? event_id : null,
      category_id: upload_type === "category" ? category_id : null,
      uploaded_by: req.user.id
    }));

    const saved = await PhotoFile.insertMany(docs);

    // Send notifications
    try {
      if (upload_type === 'event' && event_id) {
        const Event = require('../models/Events');
        const event = await Event.findById(event_id);
        if (event) {
          await ParticipantNotificationService.notifyEventParticipants(
            event_id,
            `New photos uploaded for "${event.title}" - Check the Gallery!`,
            'event_update'
          );
        }
      } else if (upload_type === 'category' && category_id) {
        const category = await PhotoCategory.findById(category_id);
        if (category) {
          await ParticipantNotificationService.notifyAllParticipants(
            `New photos added to "${category.name}" gallery!`,
            null,
            'announcement'
          );
        }
      }
    } catch (e) { console.error('Photo notification error:', e); }

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await PhotoFile.find()
      .populate("event_id", "title")
      .populate("category_id", "name")
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch photos", error: error.message });
  }
};

exports.getByEvent = async (req, res) => {
  try {
    const photos = await PhotoFile.find({ upload_type: "event", event_id: req.params.eventId })
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch photos", error: error.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const photos = await PhotoFile.find({ upload_type: "category", category_id: req.params.categoryId })
      .populate("uploaded_by", "name")
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch photos", error: error.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await PhotoFile.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "..", "..", "uploads", "photos", photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Photo deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// Category CRUD
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const existing = await PhotoCategory.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = await PhotoCategory.create({ name, created_by: req.user.id });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await PhotoCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const photos = await PhotoFile.find({ category_id: req.params.id });
    if (photos.length > 0) {
      return res.status(400).json({ message: "Cannot delete category with photos. Delete photos first." });
    }
    const cat = await PhotoCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
