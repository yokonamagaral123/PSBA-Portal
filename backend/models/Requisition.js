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
  remarks: { type: String, default: 'N/A' }, // New field for remarks
  status: { type: String },  // New field for status
  leavePaymentStatus: { type: String, enum: ['with pay', 'without pay', 'N/A'], default: 'N/A' },
  dayType: { type: String, enum: ['whole day', 'half day', 'N/A'], default: 'N/A' },
  hrApprovalStatus: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }, // Two-step approval status
  lastModifiedByEmployeeID: { type: String }, // Employee ID of last modifier
  lastModifiedByName: { type: String }, // Name of last modifier
  lastModifiedDate: { type: Date }, // Date of last modification
});

const Requisition = mongoose.model('Requisition', requisitionSchema);

module.exports = Requisition;