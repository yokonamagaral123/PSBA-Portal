const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  email: { type: String, required: true }, 
  task: { type: String, required: true },
  dueDate: { type: Date },
  time: { type: String }, 
  done: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ToDo', todoSchema);