const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  twoFactorRateLimit,
  twoFactorSetupRateLimit,
  backupCodeRateLimit
} = require('../middleware/rateLimiter');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Helper function to generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false,
      usedAt: null
    });
  }
  return codes;
};

// Middleware to check if user can use 2FA (now available for all users)
const require2FAEligible = (req, res, next) => {
  // 2FA is now available for all authenticated users
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required to access 2FA features'
    });
  }
  next();
};

// Setup 2FA - Generate secret and QR code
router.post('/setup', twoFactorSetupRateLimit, auth, require2FAEligible, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorAuth.enabled) {
      return res.status(400).json({ 
        message: '2FA is already enabled. Disable it first to set up again.' 
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${user.email} (${user.role})`,
      issuer: 'AI-Improved E-Learning Platform',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store temporary secret (not enabled yet)
    user.twoFactorAuth.secret = secret.base32;
    await user.save();

    res.json({
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes: generateBackupCodes().map(bc => bc.code) // Preview backup codes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Error setting up 2FA' });
  }
});

// Verify and enable 2FA
router.post('/verify-setup', twoFactorRateLimit, auth, require2FAEligible, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.twoFactorAuth.secret) {
      return res.status(400).json({ message: 'No 2FA setup in progress' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Enable 2FA and generate backup codes
    const backupCodes = generateBackupCodes();
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.enabledAt = new Date();
    user.twoFactorAuth.backupCodes = backupCodes;
    user.twoFactorAuth.failedAttempts = 0;
    user.twoFactorAuth.lockedUntil = null;
    
    await user.save();

    res.json({
      message: '2FA enabled successfully',
      backupCodes: backupCodes.map(bc => bc.code),
      warning: 'Save these backup codes in a secure location. They will not be shown again.'
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Error verifying 2FA setup' });
  }
});

// Verify 2FA token during login
router.post('/verify', twoFactorRateLimit, auth, async (req, res) => {
  try {
    const { token, isBackupCode = false } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
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
      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (verified) {
      await user.reset2FAFailedAttempts();
      res.json({ 
        message: '2FA verification successful',
        verified: true 
      });
    } else {
      await user.increment2FAFailedAttempts();
      res.status(400).json({ 
        message: 'Invalid token',
        attemptsRemaining: Math.max(0, 5 - user.twoFactorAuth.failedAttempts)
      });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Error verifying 2FA token' });
  }
});

// Get 2FA status
router.get('/status', auth, require2FAEligible, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      enabled: user.twoFactorAuth.enabled,
      enabledAt: user.twoFactorAuth.enabledAt,
      lastVerifiedAt: user.twoFactorAuth.lastVerifiedAt,
      backupCodesRemaining: user.twoFactorAuth.backupCodes.filter(bc => !bc.used).length,
      isLocked: user.is2FALocked(),
      lockedUntil: user.twoFactorAuth.lockedUntil,
      failedAttempts: user.twoFactorAuth.failedAttempts
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ message: 'Error fetching 2FA status' });
  }
});

// Generate new backup codes
router.post('/backup-codes/regenerate', backupCodeRateLimit, auth, require2FAEligible, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA must be enabled to generate backup codes' });
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();
    user.twoFactorAuth.backupCodes = newBackupCodes;
    await user.save();

    res.json({
      message: 'New backup codes generated',
      backupCodes: newBackupCodes.map(bc => bc.code),
      warning: 'Previous backup codes are now invalid. Save these new codes securely.'
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ message: 'Error generating backup codes' });
  }
});

// Disable 2FA
router.post('/disable', auth, require2FAEligible, async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to disable 2FA' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Verify 2FA token if provided
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid 2FA token' });
      }
    }

    // Disable 2FA
    user.twoFactorAuth = {
      enabled: false,
      secret: null,
      backupCodes: [],
      enabledAt: null,
      lastVerifiedAt: null,
      failedAttempts: 0,
      lockedUntil: null
    };

    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
});

module.exports = router;
