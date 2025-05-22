const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Requisition = require('../models/Requisition');

// Get leave credits for the logged-in user (only approved requests)
router.get('/leave-credits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Calculate sick leave used (approved, with pay, by dayType)
    const sickUsedDocs = await Requisition.find({
      requestedBy: user._id,
      leaveType: 'Sick Leave',
      type: 'Leave Request',
      status: 'approved',
      leavePaymentStatus: { $in: ['with pay', undefined, null, 'N/A'] } // Only count with pay or unset
    });
    const sickUsed = sickUsedDocs.reduce((sum, req) => sum + (req.dayType === 'half day' ? 0.5 : 1), 0);

    // Calculate vacation leave used (approved, with pay, by dayType)
    const vacationUsedDocs = await Requisition.find({
      requestedBy: user._id,
      leaveType: 'Vacation Leave',
      type: 'Leave Request',
      status: 'approved',
      leavePaymentStatus: { $in: ['with pay', undefined, null, 'N/A'] }
    });
    const vacationUsed = vacationUsedDocs.reduce((sum, req) => sum + (req.dayType === 'half day' ? 0.5 : 1), 0);

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