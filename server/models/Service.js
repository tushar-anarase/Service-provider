const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🔧' },
  category: { type: String, required: true },
  basePrice: { type: Number, default: 0 },
  priceUnit: { type: String, enum: ['per_hour', 'per_job', 'per_visit'], default: 'per_visit' },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  estimatedDuration: { type: String, default: '1-2 hours' },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
