const router = require('express').Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const { auth, authorize } = require('../middleware/auth');

// GET /api/providers - List all providers
router.get('/', async (req, res) => {
  try {
    const { skill, city, available, verified } = req.query;
    const query = { role: 'provider', isActive: true };
    if (skill) query['providerProfile.skills'] = { $in: [skill] };
    if (city) query['providerProfile.serviceAreas'] = { $in: [city] };
    if (available === 'true') query['providerProfile.availabilityStatus'] = 'available';
    if (verified === 'true') query['providerProfile.isVerifiedProvider'] = true;

    const providers = await User.find(query)
      .select('name avatar phone address providerProfile createdAt')
      .sort({ 'providerProfile.rating': -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/providers/:id
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findById(req.params.id)
      .select('name avatar phone address providerProfile createdAt');
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/providers/profile - Provider updates own profile
router.put('/profile', auth, authorize('provider'), async (req, res) => {
  try {
    const { skills, experience, bio, serviceAreas, workingDays, workingHours } = req.body;
    const update = {
      'providerProfile.skills': skills,
      'providerProfile.experience': experience,
      'providerProfile.bio': bio,
      'providerProfile.serviceAreas': serviceAreas,
      'providerProfile.workingDays': workingDays,
      'providerProfile.workingHours': workingHours,
      'providerProfile.profileCompleted': true,
    };
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/providers/availability
router.put('/availability', auth, authorize('provider'), async (req, res) => {
  try {
    const { availabilityStatus } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'providerProfile.availabilityStatus': availabilityStatus },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/providers/upload-document
router.post('/upload-document', auth, authorize('provider'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { 'providerProfile.documents': filePath } },
      { new: true }
    );
    res.json({ path: filePath, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
