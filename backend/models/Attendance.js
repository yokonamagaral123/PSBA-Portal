const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  data: [
    {
      empID: { type: String },
      date: { type: String },
      time: { type: String }
    }
  ],
  importedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);