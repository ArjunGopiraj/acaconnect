const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const Notification = require("../models/Notification");

router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user_id: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
});

module.exports = router;
