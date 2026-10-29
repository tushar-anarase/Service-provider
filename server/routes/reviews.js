const router = require('express').Router();
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// POST /api/reviews - Customer submits review
router.post('/', auth, authorize('customer'), async (req, res) => {
  try {
    const { requestId, rating, comment, tags } = req.body;
    const request = await ServiceRequest.findById(requestId);
    if (!request || request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.isReviewed) return res.status(400).json({ message: 'Already reviewed' });
    if (request.status !== 'completed') return res.status(400).json({ message: 'Job not completed' });

    const review = await Review.create({
      request: requestId,
      customer: req.user._id,
      provider: request.provider,
      rating, comment, tags,
    });

    // Update provider average rating
    const allReviews = await Review.find({ provider: request.provider });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(request.provider, {
      'providerProfile.rating': Math.round(avgRating * 10) / 10,
      'providerProfile.totalReviews': allReviews.length,
    });

    request.isReviewed = true;
    await request.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/provider/:providerId
router.get('/provider/:providerId', async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
