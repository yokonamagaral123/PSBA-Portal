const express = require('express');
const router = express.Router();
const Requisition = require('../models/Requisition');
const User = require('../models/User');
const EmployeeDetails = require('../models/EmployeeDetails');
const auth = require('../middleware/auth');

// Protect all routes with auth middleware
router.post('/create', auth, async (req, res) => {
  console.log("Auth header:", req.headers.authorization);
  console.log("User from token:", req.user);
  // ...rest of your code
  try {
    const { type, department, leaveType, purpose, startDate, endDate, time, reason } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch employee details for the name
    const employee = await EmployeeDetails.findOne({ email: user.email });
    const requestedByName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : user.email; // fallback

    const requisition = new Requisition({
      type,
      department,
      leaveType,
      purpose,
      startDate,
      endDate,
      time,
      reason,
      requestedBy: user._id,
      requestedByName,
    });

    await requisition.save();
    res.status(201).json({ success: true, message: 'Requisition created successfully', requisition });
  } catch (err) {
    console.error('Error creating requisition:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to get requisitions (history)
router.get('/all', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let requisitions;

    if (user.role === 'admin' || user.role === 'hr') {
      // Admin/HR: see all
      requisitions = await Requisition.find();
    } else {
      // Employee: see only own
      requisitions = await Requisition.find({ requestedBy: user._id });
    }

    res.status(200).json({ success: true, requisitions });
  } catch (err) {
    console.error('Error fetching requisitions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;