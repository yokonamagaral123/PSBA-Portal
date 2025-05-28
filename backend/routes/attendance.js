const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// POST /api/attendance/import - Import and replace attendance data
router.post('/import', async (req, res) => {
  try {
    const { data } = req.body; // Expecting { data: [...] }
    await Attendance.replaceOne(
      {}, // Empty filter: always replace the only document
      { data, importedAt: new Date() },
      { upsert: true }
    );
    res.json({ success: true, message: 'Attendance data imported and replaced.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attendance - Get the latest attendance data
router.get('/', async (req, res) => {
  try {
    const record = await Attendance.findOne();
    res.json(record ? record.data : []);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;