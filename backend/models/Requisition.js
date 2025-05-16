const mongoose = require('mongoose');

const requisitionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  department: { type: String },
  leaveType: { type: String },
  purpose: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  time: { type: String },
  reason: { type: String, required: true },
  dateRequested: { type: Date, default: Date.now },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByName: { type: String, required: true }, // Name of the requester
  requestedByEmployeeID: { type: String }, // Employee ID of the requester
  remarks: { type: String }, // New field for remarks
  status: { type: String },  // New field for status
});

const Requisition = mongoose.model('Requisition', requisitionSchema);

module.exports = Requisition;