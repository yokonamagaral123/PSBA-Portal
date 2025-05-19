const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Requisition = require('../models/Requisition');

// Get leave credits for the logged-in user (only approved requests)
router.get('/leave-credits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Count only approved sick leave requests (status: 'approved')
    const sickUsed = await Requisition.countDocuments({
      requestedBy: user._id,
      leaveType: 'Sick Leave',
      type: 'Leave Request',
      status: 'approved'
    });

    // Count only approved vacation leave requests (status: 'approved')
    const vacationUsed = await Requisition.countDocuments({
      requestedBy: user._id,
      leaveType: 'Vacation Leave',
      type: 'Leave Request',
      status: 'approved'
    });

    // Logger for debugging
    console.log('sickUsed:', sickUsed, 'vacationUsed:', vacationUsed);

    // Default credits
    const sickTotal = user.leaveCredits?.sick ?? 10;
    const vacationTotal = user.leaveCredits?.vacation ?? 10;

    res.json({
      sick: sickTotal - sickUsed,
      vacation: vacationTotal - vacationUsed
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;