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
    const { type, department, leaveType, purpose, startDate, endDate, time, reason, leavePaymentStatus, dayType } = req.body;
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
      leavePaymentStatus,
      dayType,
      requestedBy: user._id,
      requestedByName: requestedByName,
      requestedByEmployeeID: employee ? employee.employeeID : null, // Ensure this is referencing EmployeeDetails
      status: 'pending', // Set default status
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

// Admin/HR: Get only own requisitions
router.get('/admin-hr-history', auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (user.role === 'admin' || user.role === 'hr') {
      // Only requisitions requested by this admin or HR
      const requisitions = await Requisition.find({ requestedBy: user._id });
      return res.status(200).json({ success: true, requisitions });
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
  } catch (err) {
    console.error('Error fetching admin/hr requisitions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// HR: Update status and remarks
router.put('/update/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'hr' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { status, remarks, leavePaymentStatus } = req.body;
    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Requisition not found' });
    }
    if (status) requisition.status = status;
    if (remarks !== undefined) requisition.remarks = remarks;
    if (leavePaymentStatus !== undefined) requisition.leavePaymentStatus = leavePaymentStatus;
    await requisition.save();
    res.status(200).json({ success: true, message: 'Requisition updated', requisition });
  } catch (err) {
    console.error('Error updating requisition:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;