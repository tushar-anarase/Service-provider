const router = require('express').Router();
const Complaint = require('../models/Complaint');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');

// POST /api/complaints
router.post('/', auth, upload.array('attachments', 3), async (req, res) => {
  try {
    const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const complaint = await Complaint.create({ ...req.body, complainant: req.user._id, attachments });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ complainant: req.user._id })
      .populate('against', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
