const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  providerAmount: { type: Number, default: 0 },
  method: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
  status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'pending' },
  transactionId: { type: String, default: '' },
  invoiceNumber: { type: String, unique: true },
  notes: { type: String, default: '' },
  paidAt: { type: Date },
}, { timestamps: true });

// Auto-generate invoice number
paymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  // Calculate platform fee (10%) and provider amount
  if (this.amount) {
    this.platformFee = Math.round(this.amount * 0.1);
    this.providerAmount = this.amount - this.platformFee;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
