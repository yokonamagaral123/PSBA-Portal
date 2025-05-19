const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String, // User's name as a string
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String, // Store as YYYY-MM-DD
    required: false
  },
  time: {
    type: String, // Store as HH:mm (24-hour)
    required: false
  }
});

module.exports = mongoose.model('Announcement', announcementSchema);