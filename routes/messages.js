const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Get messages for a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, content, type, fileUrl, fileName, fileSize } = req.body;

    // Check if room exists and user is a participant
    const room = await Room.findOne({
      _id: roomId,
      participants: req.user.userId
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      sender: req.user.userId,
      roomId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize
    });

    await message.save();

    // Update room's last message
    room.lastMessage = message._id;
    await room.save();

    // Populate sender information
    await message.populate('sender', 'username avatar');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:roomId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        roomId: req.params.roomId,
        sender: { $ne: req.user.userId },
        readBy: { $ne: req.user.userId }
      },
      { $addToSet: { readBy: req.user.userId } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 