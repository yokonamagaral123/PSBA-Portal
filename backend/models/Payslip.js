const mongoose = require('mongoose');

const PayslipSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  payPeriod: { type: String, required: true },
  email: { type: String, required: true }, // Add email for unique user identification
  payrollSummary: {
    periodPay: Number,
    monthlyBasicPay: Number,
    ratePerDay: Number,
    ratePerHour: Number,
    ratePerMinute: Number,
    late: String,
    undertime: String,
    absent: String,
    lateDeduction: Number,
    undertimeDeduction: Number,
    absentDeduction: Number,
    totalLateUndertimeAbsentDeduction: Number,
  },
  additionalPay: {
    overtime: String,
    overtimeMultiplier: Number,
    totalOvertimePay: Number,
  },
  employeeDeductions: {
    sssEE: Number,
    philHealthEE: Number,
    pagIbigEE: Number,
    totalEmployeeDeductions: Number,
  },
  employerContributions: {
    sssER: Number,
    sssEC: Number,
    philHealthER: Number,
    pagIbigER: Number,
  },
  taxComputation: {
    taxableIncome: Number,
    withholdingTax: Number,
    totalDeduction: Number,
    netPay: Number,
    isTaxable: Boolean
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payslip', PayslipSchema);