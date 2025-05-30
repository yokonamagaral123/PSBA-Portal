const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const auth = require('../middleware/auth');

// Save a new payslip
router.post('/save', auth, async (req, res) => {
  try {
    const payslip = new Payslip(req.body);
    await payslip.save();
    res.status(201).json({ message: 'Payslip saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save payslip.', error: err.message });
  }
});

// Get payslips for the logged-in user (by email from token)
router.get('/', auth, async (req, res) => {
  try {
    const { payPeriod } = req.query;
    const filter = { email: req.user.email };
    if (payPeriod) filter.payPeriod = payPeriod;
    const payslips = await Payslip.find(filter).sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payslips.', error: err.message });
  }
});

module.exports = router;
