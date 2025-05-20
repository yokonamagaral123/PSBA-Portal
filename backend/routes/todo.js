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

// Add a new to-do for the logged-in user (with dueDate and time support)
router.post("/", auth, async (req, res) => {
  try {
    const { task, dueDate, time } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, message: "Task is required" });
    }
    const todo = new ToDo({ email: req.user.email, task, dueDate, time });
    await todo.save();
    res.status(201).json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark a to-do as done
router.patch("/:id/done", auth, async (req, res) => {
  try {
    const todo = await ToDo.findOneAndUpdate(
      { _id: req.params.id, email: req.user.email },
      { done: true },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ success: false, message: "To-Do not found" });
    }
    res.json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a to-do by ID for the logged-in user
router.delete('/:id', auth, async (req, res) => {
  try {
    // Add logging for debugging
    console.log('DELETE /api/todos/:id called', {
      id: req.params.id,
      user: req.user ? req.user.email : null
    });
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid To-Do ID format' });
    }
    const todo = await ToDo.findOneAndDelete({ _id: req.params.id, email: req.user.email });
    if (!todo) {
      console.log('To-Do not found or not owned by user', {
        id: req.params.id,
        user: req.user ? req.user.email : null
      });
      return res.status(404).json({ success: false, message: 'To-Do not found' });
    }
    res.json({ success: true, message: 'To-Do deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/todos/:id', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;