const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  providerResponse: { type: String, default: '' },
  tags: [{ type: String }], // e.g., "Professional", "On time", "Clean work"
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
