const mongoose = require('mongoose');

const SalaryDetailsSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  dailyRate: {
    type: Number,
    required: true,
  },
  hourlyRate: {
    type: Number,
    required: true,
  },
  perMinuteRate: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('SalaryDetails', SalaryDetailsSchema);
