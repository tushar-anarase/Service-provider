const router = require('express').Router();
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

// GET /api/payments/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const field = req.user.role === 'customer' ? 'customer' : 'provider';
    const payments = await Payment.find({ [field]: req.user._id })
      .populate('request', 'title service')
      .populate('customer', 'name')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/:id/invoice
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('request customer provider');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
