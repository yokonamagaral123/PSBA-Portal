const express = require('express');
const router = express.Router();
const Logger = require('../models/Logger');
const EmployeeDetails = require('../models/EmployeeDetails');
const jwt = require('jsonwebtoken');

// Middleware to get user from token
function getUserFromToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Get all attendance for logged-in user
router.get('/mine', async (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false });
  const employee = await EmployeeDetails.findOne({ email: user.email });
  if (!employee) return res.status(404).json({ success: false });
  const records = await Logger.find({ employeeID: employee.employeeID });
  res.json({ success: true, records });
});

// Log time in/out
router.post('/log', async (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false });
  const employee = await EmployeeDetails.findOne({ email: user.email });
  if (!employee) return res.status(404).json({ success: false });
  const { date, timeIn, timeOut, remarks, schedule } = req.body;
  let record = await Logger.findOne({ employeeID: employee.employeeID, date });
  if (!record) {
    record = new Logger({ employeeID: employee.employeeID, email: user.email, date });
  }
  if (timeIn) record.timeIn = timeIn;
  if (timeOut) record.timeOut = timeOut;
  if (remarks) record.remarks = remarks;
  if (schedule) record.schedule = schedule;
  await record.save();
  res.json({ success: true, record });
});

// Get all attendance records (admin view)
router.get('/all', async (req, res) => {
  try {
    const records = await Logger.find({});
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
