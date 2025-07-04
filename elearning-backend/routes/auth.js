const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institution = require('../models/Institution');
const UserApproval = require('../models/UserApproval');
const InstitutionMembership = require('../models/InstitutionMembership');
const { loginRateLimit, twoFactorRateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

// In-memory storage for development (when MongoDB is not available)
let inMemoryUsers = [
  {
    _id: '1',
    name: 'Demo User',
    username: 'demo',
    email: 'demo@example.com',
    phoneNumber: '+1-555-0001',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Student'
  },
  {
    _id: '2',
    name: 'Instructor User',
    username: 'instructor',
    email: 'instructor@example.com',
    phoneNumber: '+1-555-0002',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Instructor'
  },
  {
    _id: '3',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    phoneNumber: '+1-555-0003',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Admin'
  },
  {
    _id: '4',
    name: 'Super Admin',
    username: 'superadmin',
    email: 'superadmin@app.com',
    phoneNumber: '+1-555-0004',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Super Admin',
    isSuperAdmin: true,
    permissions: ['manage_users', 'manage_institutions', 'manage_platform', 'view_analytics', 'approve_admins']
  },
  {
    _id: '5',
    name: 'Super Moderator',
    username: 'supermod',
    email: 'supermod@app.com',
    phoneNumber: '+1-555-0005',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    role: 'Super Moderator',
    permissions: ['manage_institutions', 'view_analytics', 'approve_admins', 'approve_moderators']
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
    const { name, username: providedUsername, email, phoneNumber, password, role = 'Student' } = req.body;

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
      // Use MongoDB - Check for duplicates with creative error messages
      const existingUser = await User.findOne({
        $or: [
          { email },
          { username },
          ...(phoneNumber ? [{ phoneNumber }] : [])
        ]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({
            message: '🎭 Plot twist! That email is already starring in someone else\'s learning journey. Time for a new email to take the spotlight!'
          });
        }
        if (existingUser.username === username) {
          return res.status(400).json({
            message: '🎯 Oops! That username is already claimed by another scholar. How about trying a different creative alias?'
          });
        }
        if (phoneNumber && existingUser.phoneNumber === phoneNumber) {
          return res.status(400).json({
            message: '📱 Ring ring! That phone number is already connected to another learner\'s adventure. Please dial up a different number!'
          });
        }
      }

      const user = new User({ name, username, email, phoneNumber, password: hashedPassword, role });
      await user.save();

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      });
    } else {
      // Use in-memory storage for development
      const existingUser = inMemoryUsers.find(user =>
        user.email === email ||
        user.username === username ||
        (phoneNumber && user.phoneNumber === phoneNumber)
      );

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({
            message: '🎭 Plot twist! That email is already starring in someone else\'s learning journey. Time for a new email to take the spotlight!'
          });
        }
        if (existingUser.username === username) {
          return res.status(400).json({
            message: '🎯 Oops! That username is already claimed by another scholar. How about trying a different creative alias?'
          });
        }
        if (phoneNumber && existingUser.phoneNumber === phoneNumber) {
          return res.status(400).json({
            message: '📱 Ring ring! That phone number is already connected to another learner\'s adventure. Please dial up a different number!'
          });
        }
      }

      const newUser = {
        _id: (inMemoryUsers.length + 1).toString(),
        name,
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        role
      };

      inMemoryUsers.push(newUser);

      res.status(201).json({
        message: 'User registered successfully (development mode)',
        user: {
          id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role
        }
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

    // Prevent Super Admin and Super Moderator from using normal login
    if (user.role === 'Super Admin' || user.role === 'Super Moderator') {
      return res.status(403).json({
        message: 'Super Admin and Super Moderator accounts must use the dedicated admin login portal.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled for this user
    const requires2FA = user.twoFactorAuth && user.twoFactorAuth.enabled;

    if (requires2FA) {
      // Check if account is locked due to failed 2FA attempts
      if (user.is2FALocked()) {
        const lockTimeRemaining = Math.ceil((user.twoFactorAuth.lockedUntil - Date.now()) / 60000);
        return res.status(423).json({
          message: `Account locked due to failed 2FA attempts. Try again in ${lockTimeRemaining} minutes.`
        });
      }

      // Return partial success - password verified, now need 2FA
      const tempToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          step: 'password_verified',
          requires2FA: true
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '10m' } // Short-lived token for 2FA step
      );

      return res.json({
        message: 'Password verified. 2FA verification required.',
        requires2FA: true,
        tempToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // No 2FA required or not enabled - complete login
    await completeRegularLogin(user, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Super Admin Login (Super Admin/Super Moderator) - New unified endpoint
router.post('/super-admin-login', loginRateLimit, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email/username, password, and role are required' });
    }

    // Validate role is a super admin role
    if (!['Super Admin', 'Super Moderator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid admin role specified' });
    }

    let user;

    if (isMongoConnected()) {
      // Use MongoDB - search by email or username for super admin roles only
      user = await User.findOne({
        $and: [
          {
            $or: [
              { email: email.toLowerCase() },
              { username: email.toLowerCase() }
            ]
          },
          { role: { $in: ['Super Admin', 'Super Moderator'] } }
        ]
      });
    } else {
      // Use fallback data for super admin accounts
      const fallbackSuperAdmins = [
        {
          _id: 'super-admin-1',
          name: 'Super Administrator',
          username: 'superadmin',
          email: 'superadmin@app.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', // secret123
          role: 'Super Admin',
          permissions: ['manage_users', 'manage_institutions', 'manage_platform', 'view_analytics', 'approve_admins', 'approve_moderators', 'create_secondary_admins'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          twoFactorAuth: {
            enabled: false,
            secret: null,
            backupCodes: []
          }
        },
        {
          _id: 'super-mod-1',
          name: 'Super Moderator',
          username: 'supermod',
          email: 'supermod@app.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDxy', // secret123
          role: 'Super Moderator',
          permissions: ['manage_institutions', 'view_analytics', 'approve_admins', 'approve_moderators'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          twoFactorAuth: {
            enabled: false,
            secret: null,
            backupCodes: []
          }
        }
      ];

      user = fallbackSuperAdmins.find(admin =>
        (admin.email === email.toLowerCase() || admin.username === email.toLowerCase()) &&
        ['Super Admin', 'Super Moderator'].includes(admin.role)
      );
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or insufficient privileges' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          step: 'password_verified',
          requires2FA: true
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        message: '2FA verification required',
        requires2FA: true,
        tempToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorAuth?.enabled || false
      }
    });

  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// App Admin Login (Super Admin/Super Moderator) - Legacy endpoint for backward compatibility
router.post('/app-admin-login', loginRateLimit, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email/username, password, and role are required' });
    }

    // Validate role is a super admin role
    if (!['Super Admin', 'Super Moderator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid admin role specified' });
    }

    let user;

    if (isMongoConnected()) {
      // Use MongoDB - search by email or username for super admin roles only
      user = await User.findOne({
        $and: [
          {
            $or: [
              { email: email },
              { username: email.toLowerCase() }
            ]
          },
          {
            role: role // Must match the requested role exactly
          }
        ]
      });
    } else {
      // Use in-memory storage for development
      user = inMemoryUsers.find(u =>
        (u.email === email || u.username === email.toLowerCase()) &&
        u.role === role
      );
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or insufficient privileges' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Additional security check for super admin roles
    if (!['Super Admin', 'Super Moderator'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient privileges' });
    }

    // Check if 2FA is enabled for this user
    const requires2FA = user.twoFactorAuth && user.twoFactorAuth.enabled;

    if (requires2FA) {
      // Check if account is locked due to failed 2FA attempts
      if (user.is2FALocked()) {
        const lockTimeRemaining = Math.ceil((user.twoFactorAuth.lockedUntil - Date.now()) / 60000);
        return res.status(423).json({
          message: `Account locked due to failed 2FA attempts. Try again in ${lockTimeRemaining} minutes.`
        });
      }

      // Return partial success - password verified, now need 2FA
      const tempToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          step: 'password_verified',
          requires2FA: true
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '10m' } // Short-lived token for 2FA step
      );

      return res.json({
        message: 'Password verified. 2FA verification required.',
        requires2FA: true,
        tempToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // No 2FA required or not enabled - complete login
    await completeLogin(user, res);
  } catch (err) {
    console.error('App Admin login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Complete regular user login helper function
async function completeRegularLogin(user, res) {
  // Update last login
  if (isMongoConnected() && user._id) {
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      permissions: user.permissions || [],
      twoFactorVerified: user.twoFactorAuth?.enabled || false
    },
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
      phoneNumber: user.phoneNumber,
      role: user.role,
      permissions: user.permissions || [],
      lastLogin: user.lastLogin,
      twoFactorEnabled: user.twoFactorAuth?.enabled || false
    }
  });
}

// Complete login helper function
async function completeLogin(user, res) {
  // Update last login
  if (isMongoConnected() && user._id) {
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      isSuperAdmin: user.role === 'Super Admin',
      permissions: user.permissions || [],
      twoFactorVerified: user.twoFactorAuth?.enabled || false
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '1d' }
  );

  res.json({
    message: `${user.role} login successful`,
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      permissions: user.permissions || [],
      isSuperAdmin: user.role === 'Super Admin',
      lastLogin: user.lastLogin,
      twoFactorEnabled: user.twoFactorAuth?.enabled || false
    }
  });
}

// Verify 2FA and complete login
router.post('/app-admin-verify-2fa', twoFactorRateLimit, async (req, res) => {
  try {
    const { tempToken, token, isBackupCode = false } = req.body;

    if (!tempToken || !token) {
      return res.status(400).json({ message: 'Temporary token and 2FA token are required' });
    }

    // Verify temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback-secret');

    if (decoded.step !== 'password_verified' || !decoded.requires2FA) {
      return res.status(400).json({ message: 'Invalid temporary token' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if account is locked
    if (user.is2FALocked()) {
      const lockTimeRemaining = Math.ceil((user.twoFactorAuth.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      verified = await user.useBackupCode(token.toUpperCase());
    } else {
      // Verify TOTP token
      const speakeasy = require('speakeasy');
      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (verified) {
      await user.reset2FAFailedAttempts();
      await completeLogin(user, res);
    } else {
      await user.increment2FAFailedAttempts();
      res.status(400).json({
        message: 'Invalid 2FA token',
        attemptsRemaining: Math.max(0, 5 - user.twoFactorAuth.failedAttempts)
      });
    }
  } catch (err) {
    console.error('2FA verification error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid temporary token' });
    }
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
});

// Verify 2FA for regular user login
router.post('/verify-2fa', twoFactorRateLimit, async (req, res) => {
  try {
    const { tempToken, token, isBackupCode = false } = req.body;

    if (!tempToken || !token) {
      return res.status(400).json({ message: 'Temporary token and 2FA token are required' });
    }

    // Verify temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback-secret');

    if (decoded.step !== 'password_verified' || !decoded.requires2FA) {
      return res.status(400).json({ message: 'Invalid temporary token' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if account is locked
    if (user.is2FALocked()) {
      const lockTimeRemaining = Math.ceil((user.twoFactorAuth.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      verified = await user.useBackupCode(token.toUpperCase());
    } else {
      // Verify TOTP token
      const speakeasy = require('speakeasy');
      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (verified) {
      await user.reset2FAFailedAttempts();
      await completeRegularLogin(user, res);
    } else {
      await user.increment2FAFailedAttempts();
      res.status(400).json({
        message: 'Invalid 2FA token',
        attemptsRemaining: Math.max(0, 5 - user.twoFactorAuth.failedAttempts)
      });
    }
  } catch (err) {
    console.error('2FA verification error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid temporary token' });
    }
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth API is working!',
    mongoConnected: isMongoConnected(),
    availableUsers: isMongoConnected() ? 'Check MongoDB' : inMemoryUsers.map(u => ({ id: u._id, name: u.name, username: u.username, email: u.email, phoneNumber: u.phoneNumber, role: u.role }))
  });
});



module.exports = router;