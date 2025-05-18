const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcements");

// Create a new announcement
router.post("/", async (req, res) => {
  try {
    const { message, createdBy } = req.body;
    if (!message || !createdBy) {
      return res.status(400).json({ success: false, message: "Message and createdBy are required" });
    }
    const announcement = new Announcement({ message, createdBy });
    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch all announcements (latest first)
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;