const express = require("express");
const router = express.Router();
const ToDo = require("../models/ToDo");
const auth = require("../middleware/auth");

// Get all to-dos for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const todos = await ToDo.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, todos });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a new to-do for the logged-in user
router.post("/", auth, async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, message: "Task is required" });
    }
    const todo = new ToDo({ email: req.user.email, task });
    await todo.save();
    res.status(201).json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;