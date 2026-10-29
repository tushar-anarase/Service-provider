const router = require('express').Router();
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalCustomers, totalProviders, totalRequests, totalPayments,
      pendingRequests, completedRequests, openComplaints, verifiedProviders,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      ServiceRequest.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      ServiceRequest.countDocuments({ status: 'pending' }),
      ServiceRequest.countDocuments({ status: 'completed' }),
      Complaint.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'provider', 'providerProfile.isVerifiedProvider': true }),
    ]);

    // Monthly request data for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await ServiceRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalCustomers, totalProviders, totalRequests,
      totalRevenue: totalPayments[0]?.total || 0,
      pendingRequests, completedRequests, openComplaints, verifiedProviders,
      monthlyData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/toggle-active
router.put('/users/:id/toggle-active', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/providers/:id/verify
router.put('/providers/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'providerProfile.isVerifiedProvider': true, isVerified: true },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/requests
router.get('/requests', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const query = {};
    if (status) query.status = status;
    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('customer', 'name email phone')
        .populate('provider', 'name email phone')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      ServiceRequest.countDocuments(query),
    ]);
    res.json({ requests, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/payments
router.get('/payments', auth, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/complaints
router.get('/complaints', auth, authorize('admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('complainant', 'name email role')
      .populate('against', 'name email role')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/complaints/:id
router.put('/complaints/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse, resolvedAt: status === 'resolved' ? new Date() : null },
      { new: true }
    ).populate('complainant against');
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
