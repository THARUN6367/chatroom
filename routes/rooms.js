const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get all rooms for a user
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.user.userId })
      .populate('participants', 'username avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, participants, description } = req.body;

    // Add current user to participants
    const roomParticipants = [...new Set([...participants, req.user.userId])];

    const room = new Room({
      name,
      type,
      participants: roomParticipants,
      description,
      admins: [req.user.userId]
    });

    await room.save();

    // Populate room data
    await room.populate('participants', 'username avatar status');
    await room.populate('lastMessage');

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room details
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      participants: req.user.userId
    })
      .populate('participants', 'username avatar status')
      .populate('lastMessage');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room
router.put('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      admins: req.user.userId
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, avatar } = req.body;

    if (name) room.name = name;
    if (description) room.description = description;
    if (avatar) room.avatar = avatar;

    await room.save();

    // Populate room data
    await room.populate('participants', 'username avatar status');
    await room.populate('lastMessage');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add participants to room
router.post('/:roomId/participants', auth, async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      admins: req.user.userId
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { participants } = req.body;

    // Add new participants
    room.participants = [...new Set([...room.participants, ...participants])];
    await room.save();

    // Populate room data
    await room.populate('participants', 'username avatar status');
    await room.populate('lastMessage');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove participant from room
router.delete('/:roomId/participants/:userId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      admins: req.user.userId
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove participant
    room.participants = room.participants.filter(
      p => p.toString() !== req.params.userId
    );

    await room.save();

    // Populate room data
    await room.populate('participants', 'username avatar status');
    await room.populate('lastMessage');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Invite users to room
router.post('/:roomId/invite', auth, async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      participants: req.user.userId
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { userIds } = req.body;

    // Add new participants
    room.participants = [...new Set([...room.participants, ...userIds])];
    await room.save();

    // Populate room data
    await room.populate('participants', 'username avatar status');
    await room.populate('lastMessage');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 