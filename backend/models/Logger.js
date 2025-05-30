const mongoose = require('mongoose');

const loggerSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeIn: { type: String },
  timeOut: { type: String },
  remarks: { type: String },
  schedule: { type: String },
});

module.exports = mongoose.model('Logger', loggerSchema);
