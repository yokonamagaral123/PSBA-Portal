const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const auth = require('../middleware/auth');

// Get all holidays for a year
router.get('/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);
    const holidays = await Holiday.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    res.json({ success: true, holidays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a new holiday (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, date, type } = req.body;
    if (!name || !date || !type) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    const holiday = new Holiday({
      name,
      date,
      type,
      isCustom: true
    });
    await holiday.save();
    res.json({ success: true, holiday });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a holiday (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
