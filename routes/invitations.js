const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create invitation
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, email } = req.body;

    // Check if room exists and user is a participant
    const room = await Room.findOne({
      _id: roomId,
      participants: req.user.userId
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Invitation expires in 7 days

    const invitation = new Invitation({
      roomId,
      invitedBy: req.user.userId,
      email,
      token,
      expiresAt
    });

    await invitation.save();

    // Send invitation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const invitationLink = `${process.env.FRONTEND_URL}/invite/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'You have been invited to join a chat room',
      html: `
        <h1>You've been invited to join a chat room!</h1>
        <p>Click the link below to accept the invitation and create your account:</p>
        <a href="${invitationLink}">${invitationLink}</a>
        <p>This invitation will expire in 7 days.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitation details
router.get('/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('roomId', 'name type');

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept invitation
router.post('/:token/accept', async (req, res) => {
  try {
    const { username, password } = req.body;
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    // Create new user
    const user = new User({
      username,
      email: invitation.email,
      password // Password will be hashed by the User model
    });

    await user.save();

    // Add user to room
    const room = await Room.findById(invitation.roomId);
    room.participants.push(user._id);
    await room.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 