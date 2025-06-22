const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Enhanced auth middleware that also fetches user details
async function authWithUser(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;

    // Fetch full user details if MongoDB is connected
    if (require('mongoose').connection.readyState === 1) {
      const User = require('../models/User');
      const fullUser = await User.findById(decoded.userId)
        .populate('institution', 'name code')
        .select('-password');

      if (fullUser) {
        req.userDetails = fullUser;
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
module.exports.authWithUser = authWithUser;