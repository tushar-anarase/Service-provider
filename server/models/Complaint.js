const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complainant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', default: null },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['service_quality', 'payment_issue', 'provider_behavior', 'customer_behavior', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'closed'],
    default: 'open',
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminResponse: { type: String, default: '' },
  resolvedAt: { type: Date },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
