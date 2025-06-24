const rateLimit = require('express-rate-limit');

// Helper function to get client IP safely
const getClientIP = (req) => {
  // In production with trust proxy enabled, req.ip will be the real client IP
  // In development, it will be the direct connection IP
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// Rate limiter for 2FA verification attempts
const twoFactorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many 2FA verification attempts',
    message: 'Please wait 15 minutes before trying again',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator to include user ID if available
  keyGenerator: (req) => {
    return req.user?.userId || getClientIP(req);
  }
});

// Rate limiter for 2FA setup attempts
const twoFactorSetupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 setup attempts per hour
  message: {
    error: 'Too many 2FA setup attempts',
    message: 'Please wait 1 hour before trying again',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || getClientIP(req);
  }
});

// Rate limiter for login attempts
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Please wait 15 minutes before trying again',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Rate limiter for backup code generation
const backupCodeRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each user to 3 backup code generations per day
  message: {
    error: 'Too many backup code generation attempts',
    message: 'Please wait 24 hours before generating new backup codes',
    retryAfter: 24 * 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || getClientIP(req);
  }
});

// Rate limiter for password reset attempts
const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Please wait 1 hour before trying again',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  twoFactorRateLimit,
  twoFactorSetupRateLimit,
  loginRateLimit,
  backupCodeRateLimit,
  passwordResetRateLimit
};
