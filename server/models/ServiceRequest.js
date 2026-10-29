const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],

  // Location
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },

  // Urgency
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
  },

  // Scheduling
  scheduledDate: { type: Date },
  scheduledTime: { type: String },

  // Status flow: pending -> accepted -> on_the_way -> arrived -> in_progress -> completed
  status: {
    type: String,
    enum: [
      'pending',
      'assigned',
      'accepted',
      'rejected',
      'on_the_way',
      'arrived',
      'in_progress',
      'completed',
      'cancelled',
    ],
    default: 'pending',
  },

  // Timeline of status changes
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],

  // Quotation from provider
  quotation: {
    amount: { type: Number, default: 0 },
    breakdown: { type: String, default: '' },
    estimatedDuration: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    submittedAt: Date,
  },

  // Cancellation
  cancellation: {
    cancelledBy: { type: String, enum: ['customer', 'provider', 'admin'], default: null },
    reason: { type: String, default: '' },
    cancelledAt: Date,
  },

  // Payment
  payment: {
    method: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    amount: { type: Number, default: 0 },
    paidAt: Date,
    transactionId: { type: String, default: '' },
  },

  isReviewed: { type: Boolean, default: false },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

// Index for geospatial queries
serviceRequestSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
