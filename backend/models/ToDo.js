const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  email: { type: String, required: true }, 
  task: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ToDo', todoSchema);