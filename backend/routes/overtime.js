const express = require('express');
const router = express.Router();
const ApprovedOvertime = require('../models/ApprovedOvertime');

// GET approved overtime for an employee and cutoff
router.get('/approved', async (req, res) => {
  const { empID, start, end } = req.query;
  if (!empID || !start || !end) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const records = await ApprovedOvertime.find({
      employeeID: empID,
      date: { $gte: start, $lte: end },
      status: 'approved'
    });
    // Return as { 'YYYY-MM-DD': { minutes, ... } }
    const result = {};
    records.forEach(r => {
      result[r.date] = {
        minutes: r.minutes,
        status: r.status,
        approvedBy: r.approvedBy,
        payPeriod: r.payPeriod,
        _id: r._id
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST approve overtime (create or update)
router.post('/approved', async (req, res) => {
  const { employeeID, date, minutes, status, approvedBy, payPeriod } = req.body;
  if (!employeeID || !date || typeof minutes !== 'number') return res.status(400).json({ error: 'Missing required fields' });
  try {
    let record = await ApprovedOvertime.findOne({ employeeID, date });
    if (record) {
      record.minutes = minutes;
      record.status = status || 'approved';
      record.approvedBy = approvedBy;
      record.payPeriod = payPeriod;
      await record.save();
    } else {
      record = await ApprovedOvertime.create({ employeeID, date, minutes, status, approvedBy, payPeriod });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE declined overtime (by record ID)
router.delete('/approved/:id', async (req, res) => {
  try {
    await ApprovedOvertime.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
