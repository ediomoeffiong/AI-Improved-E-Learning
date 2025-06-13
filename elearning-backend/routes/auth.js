const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// In-memory storage for development (when MongoDB is not available)
let inMemoryUsers = [
  {
    _id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Student'
  },
  {
    _id: '2',
    name: 'Instructor User',
    email: 'instructor@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Instructor'
  },
  {
    _id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Admin'
  }
];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const user = new User({ name, email, password: hashedPassword, role });
      await user.save();

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      // Use in-memory storage for development
      const existingUser = inMemoryUsers.find(user => user.email === email);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const newUser = {
        _id: (inMemoryUsers.length + 1).toString(),
        name,
        email,
        password: hashedPassword,
        role
      };

      inMemoryUsers.push(newUser);

      res.status(201).json({
        message: 'User registered successfully (development mode)',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findOne({ email });
    } else {
      // Use in-memory storage for development
      user = inMemoryUsers.find(u => u.email === email);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth API is working!',
    mongoConnected: isMongoConnected(),
    availableUsers: isMongoConnected() ? 'Check MongoDB' : inMemoryUsers.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role }))
  });
});

module.exports = router;