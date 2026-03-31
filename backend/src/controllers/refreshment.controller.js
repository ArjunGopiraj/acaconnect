const RefreshmentItem = require("../models/RefreshmentItem");

exports.getAllRefreshmentItems = async (req, res) => {
  try {
    const items = await RefreshmentItem.find({ isActive: true }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch refreshment items", error: error.message });
  }
};

exports.createRefreshmentItem = async (req, res) => {
  try {
    const item = await RefreshmentItem.create(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create refreshment item", error: error.message });
  }
};

exports.updateRefreshmentItem = async (req, res) => {
  try {
    const item = await RefreshmentItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Refreshment item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update refreshment item", error: error.message });
  }
};

exports.deleteRefreshmentItem = async (req, res) => {
  try {
    await RefreshmentItem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Refreshment item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete refreshment item", error: error.message });
  }
};