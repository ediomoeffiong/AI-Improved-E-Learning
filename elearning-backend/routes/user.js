const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const User = require('../models/User');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Accessible by all authenticated users
router.get('/profile', auth, (req, res) => {
  res.json({ message: `Hello, ${req.user.role}` });
});

// Only for Instructors
router.get('/instructor', auth, roleCheck(['Instructor']), (req, res) => {
  res.json({ message: 'Welcome, Instructor!' });
});

// Only for Admins
router.get('/admin', auth, roleCheck(['Admin']), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

// Update username
router.put('/username', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    const normalizedUsername = username.toLowerCase();

    if (isMongoConnected()) {
      // Check if username already exists (excluding current user)
      const existingUser = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update username
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username: normalizedUsername },
        { new: true, select: '-password' }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Username updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      // For development mode with in-memory storage
      const authModule = require('./auth');
      const inMemoryUsers = authModule.inMemoryUsers || [];

      // Check if username already exists (excluding current user)
      const existingUser = inMemoryUsers.find(u =>
        u.username === normalizedUsername && u._id !== userId
      );

      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update username in memory
      const userIndex = inMemoryUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      inMemoryUsers[userIndex].username = normalizedUsername;

      res.json({
        message: 'Username updated successfully (development mode)',
        user: {
          id: inMemoryUsers[userIndex]._id,
          name: inMemoryUsers[userIndex].name,
          username: inMemoryUsers[userIndex].username,
          email: inMemoryUsers[userIndex].email,
          role: inMemoryUsers[userIndex].role
        }
      });
    }
  } catch (err) {
    console.error('Username update error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;