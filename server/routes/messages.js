const router = require('express').Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// GET /api/messages/:requestId
router.get('/:requestId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  try {
    const { requestId, receiverId, message } = req.body;
    const msg = await Message.create({
      request: requestId,
      sender: req.user._id,
      receiver: receiverId,
      message,
    });
    await msg.populate('sender', 'name avatar role');

    // Emit via socket
    req.io.to(`user_${receiverId}`).emit('newMessage', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
