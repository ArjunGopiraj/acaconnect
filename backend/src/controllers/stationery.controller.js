const Stationery = require("../models/Stationery");

exports.getAllStationery = async (req, res) => {
  try {
    const items = await Stationery.find({ isActive: true }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stationery items", error: error.message });
  }
};

exports.createStationery = async (req, res) => {
  try {
    const item = await Stationery.create(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create stationery item", error: error.message });
  }
};

exports.updateStationery = async (req, res) => {
  try {
    const item = await Stationery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Stationery item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update stationery item", error: error.message });
  }
};

exports.deleteStationery = async (req, res) => {
  try {
    await Stationery.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Stationery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete stationery item", error: error.message });
  }
};