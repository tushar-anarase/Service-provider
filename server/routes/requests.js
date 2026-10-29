const router = require('express').Router();
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const upload = require('../middleware/upload');
const { auth, authorize } = require('../middleware/auth');

const sendNotification = async (io, userId, data) => {
  try {
    const notif = await Notification.create({ user: userId, ...data });
    io.to(`user_${userId}`).emit('notification', notif);
  } catch (e) { console.error('Notification error', e); }
};

// POST /api/requests - Customer creates request
router.post('/', auth, authorize('customer'), upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const data = JSON.parse(req.body.data || '{}');
    const request = await ServiceRequest.create({
      ...data,
      customer: req.user._id,
      images,
      statusHistory: [{ status: 'pending', note: 'Request created' }],
    });

    // Find matching providers and notify them
    const providers = await User.find({
      role: 'provider',
      isActive: true,
      'providerProfile.isVerifiedProvider': true,
      'providerProfile.availabilityStatus': 'available',
      'providerProfile.skills': { $in: [data.serviceType] },
    }).limit(10);

    for (const provider of providers) {
      await sendNotification(req.io, provider._id, {
        title: 'New Service Request Nearby!',
        message: `A customer needs ${data.serviceType} service in ${data.location?.city}`,
        type: 'new_request',
        relatedId: request._id,
        relatedModel: 'ServiceRequest',
      });
    }

    await request.populate(['customer', 'service']);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests - Get requests based on role
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      query.$or = [
        { provider: req.user._id },
        { status: 'pending', provider: null },
      ];
    }
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('customer', 'name phone avatar address')
        .populate('provider', 'name phone avatar providerProfile')
        .populate('service', 'name icon category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ServiceRequest.countDocuments(query),
    ]);

    res.json({ requests, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/available - Provider sees available pending requests
router.get('/available', auth, authorize('provider'), async (req, res) => {
  try {
    const { city, serviceType } = req.query;
    const query = { status: 'pending', provider: null };
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    const requests = await ServiceRequest.find(query)
      .populate('customer', 'name avatar address')
      .populate('service', 'name icon category')
      .sort({ urgency: -1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name phone email avatar address')
      .populate('provider', 'name phone email avatar providerProfile')
      .populate('service', 'name icon category basePrice');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/accept - Provider accepts request
router.put('/:id/accept', auth, authorize('provider'), async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already handled' });

    request.provider = req.user._id;
    request.status = 'accepted';
    request.statusHistory.push({ status: 'accepted', note: 'Provider accepted the request' });
    await request.save();
    await request.populate(['customer', 'provider', 'service']);

    await sendNotification(req.io, request.customer._id, {
      title: 'Your request has been accepted!',
      message: `${req.user.name} has accepted your service request`,
      type: 'request_accepted',
      relatedId: request._id,
      relatedModel: 'ServiceRequest',
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/reject - Provider rejects request
router.put('/:id/reject', auth, authorize('provider'), async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'rejected';
    request.rejectionReason = req.body.reason || '';
    request.statusHistory.push({ status: 'rejected', note: req.body.reason || 'Provider rejected' });
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/status - Provider updates job status
router.put('/:id/status', auth, authorize('provider'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['on_the_way', 'arrived', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const request = await ServiceRequest.findById(req.params.id);
    if (!request || request.provider?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    request.statusHistory.push({ status, note: note || '' });

    if (status === 'completed') {
      request.payment.status = 'pending';
      // Update provider stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'providerProfile.completedJobs': 1 },
      });
    }

    await request.save();
    await request.populate(['customer', 'provider', 'service']);

    const statusMessages = {
      on_the_way: 'Your service provider is on the way!',
      arrived: 'Your service provider has arrived!',
      in_progress: 'Work is in progress!',
      completed: 'Your service has been completed!',
    };

    await sendNotification(req.io, request.customer._id, {
      title: `Status Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
      message: statusMessages[status],
      type: 'status_update',
      relatedId: request._id,
      relatedModel: 'ServiceRequest',
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/quotation - Provider submits quotation
router.put('/:id/quotation', auth, authorize('provider'), async (req, res) => {
  try {
    const { amount, breakdown, estimatedDuration } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request || request.provider?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    request.quotation = { amount, breakdown, estimatedDuration, submittedAt: new Date() };
    await request.save();

    await sendNotification(req.io, request.customer, {
      title: 'Quotation Received',
      message: `Your provider sent a quotation of ₹${amount}`,
      type: 'quotation',
      relatedId: request._id,
      relatedModel: 'ServiceRequest',
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/approve-quotation - Customer approves quotation
router.put('/:id/approve-quotation', auth, authorize('customer'), async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request || request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    request.quotation.isApproved = true;
    request.payment.amount = request.quotation.amount;
    await request.save();

    await sendNotification(req.io, request.provider, {
      title: 'Quotation Approved!',
      message: 'Customer has approved your quotation. Proceed with the service.',
      type: 'quotation_approved',
      relatedId: request._id,
      relatedModel: 'ServiceRequest',
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const canCancel = ['pending', 'accepted'].includes(request.status);
    if (!canCancel) return res.status(400).json({ message: 'Cannot cancel at this stage' });

    request.status = 'cancelled';
    request.cancellation = {
      cancelledBy: req.user.role,
      reason: req.body.reason || '',
      cancelledAt: new Date(),
    };
    request.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled' });
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/payment - Mark payment
router.post('/:id/payment', auth, authorize('customer'), async (req, res) => {
  try {
    const { method, transactionId } = req.body;
    const request = await ServiceRequest.findById(req.params.id).populate('provider');
    if (!request || request.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot process payment' });
    }

    const payment = await Payment.create({
      request: request._id,
      customer: request.customer,
      provider: request.provider._id,
      amount: request.payment.amount || request.quotation.amount,
      method: method || 'cash',
      transactionId: transactionId || '',
      status: 'completed',
      paidAt: new Date(),
    });

    request.payment.status = 'paid';
    request.payment.method = method;
    request.payment.paidAt = new Date();
    request.payment.transactionId = payment.invoiceNumber;
    await request.save();

    // Update provider earnings
    await User.findByIdAndUpdate(request.provider._id, {
      $inc: { 'providerProfile.totalEarnings': payment.providerAmount },
    });

    await sendNotification(req.io, request.provider._id, {
      title: 'Payment Received!',
      message: `₹${payment.providerAmount} has been credited for job completion`,
      type: 'payment',
      relatedId: payment._id,
      relatedModel: 'Payment',
    });

    res.json({ request, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
