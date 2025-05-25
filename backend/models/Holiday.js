const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Regular Holiday', 'Special Non-Working Holiday'], required: true },
  isCustom: { type: Boolean, default: false },
});

module.exports = mongoose.model('Holiday', HolidaySchema);
