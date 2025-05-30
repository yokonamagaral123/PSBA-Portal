const mongoose = require('mongoose');

const ApprovedOvertimeSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  date: { type: String, required: true }, // ISO date string (YYYY-MM-DD)
  minutes: { type: Number, required: true },
  status: { type: String, enum: ['approved', 'declined'], default: 'approved' },
  approvedBy: { type: String }, // Admin user ID or name
  payPeriod: { type: String }, // e.g., 'May 1–15, 2025'
}, { timestamps: true });

module.exports = mongoose.model('ApprovedOvertime', ApprovedOvertimeSchema);
