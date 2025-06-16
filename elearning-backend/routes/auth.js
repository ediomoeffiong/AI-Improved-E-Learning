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
    username: 'demo',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Student'
  },
  {
    _id: '2',
    name: 'Instructor User',
    username: 'instructor',
    email: 'instructor@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Instructor'
  },
  {
    _id: '3',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Admin'
  }
];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Helper function to generate username from name
const generateUsername = (name) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
};

// Helper function to ensure unique username
const ensureUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;

  while (true) {
    let exists = false;

    if (isMongoConnected()) {
      exists = await User.findOne({ username });
    } else {
      exists = inMemoryUsers.find(u => u.username === username);
    }

    if (!exists) break;

    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, username: providedUsername, email, password, role = 'Student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Username validation
    if (providedUsername) {
      if (providedUsername.length < 3 || providedUsername.length > 20) {
        return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(providedUsername)) {
        return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
      }
    }

    // Generate or validate username
    let username;
    if (providedUsername) {
      username = providedUsername.toLowerCase();
      // Check if username already exists
      let exists = false;
      if (isMongoConnected()) {
        exists = await User.findOne({ username });
      } else {
        exists = inMemoryUsers.find(u => u.username === username);
      }
      if (exists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    } else {
      // Generate username from name
      const baseUsername = generateUsername(name);
      username = await ensureUniqueUsername(baseUsername);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }

      const user = new User({ name, username, email, password: hashedPassword, role });
      await user.save();

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
      });
    } else {
      // Use in-memory storage for development
      const existingUser = inMemoryUsers.find(user => user.email === email || user.username === username);
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }

      const newUser = {
        _id: (inMemoryUsers.length + 1).toString(),
        name,
        username,
        email,
        password: hashedPassword,
        role
      };

      inMemoryUsers.push(newUser);

      res.status(201).json({
        message: 'User registered successfully (development mode)',
        user: { id: newUser._id, name: newUser.name, username: newUser.username, email: newUser.email, role: newUser.role }
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
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    let user;

    if (isMongoConnected()) {
      // Use MongoDB - search by email or username
      user = await User.findOne({
        $or: [
          { email: email },
          { username: email.toLowerCase() }
        ]
      });
    } else {
      // Use in-memory storage for development
      user = inMemoryUsers.find(u => u.email === email || u.username === email.toLowerCase());
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
        username: user.username,
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
    availableUsers: isMongoConnected() ? 'Check MongoDB' : inMemoryUsers.map(u => ({ id: u._id, name: u.name, username: u.username, email: u.email, role: u.role }))
  });
});

module.exports = router;