const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'new_request', 'request_accepted', 'request_rejected', 'status_update',
      'quotation', 'quotation_approved', 'payment', 'review', 'complaint',
      'verification', 'general'
    ],
    default: 'general',
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
