// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  'Super Admin': 6,
  'Super Moderator': 5,
  'Admin': 4,
  'Moderator': 3,
  'Instructor': 2,
  'Student': 1
};

// Basic role check
function roleCheck(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

// Hierarchical role check - user must have role level >= minimum required level
function hierarchicalRoleCheck(minimumRole) {
  return (req, res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        message: `Access denied: ${minimumRole} privileges or higher required`
      });
    }
    next();
  };
}

// Permission-based access control
function permissionCheck(requiredPermissions = []) {
  return async (req, res, next) => {
    try {
      // For Super Admin/Super Moderator, check permissions from token
      if (['Super Admin', 'Super Moderator'].includes(req.user.role)) {
        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({
            message: 'Access denied: insufficient permissions'
          });
        }
        return next();
      }

      // For other roles, fetch from database if connected
      if (require('mongoose').connection.readyState === 1) {
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);

        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }

        const userPermissions = user.permissions || [];
        const hasPermission = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({
            message: 'Access denied: insufficient permissions'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
}

// Institution-specific access control
function institutionAccessCheck(req, res, next) {
  return async (req, res, next) => {
    try {
      // Super Admins and Super Moderators have access to all institutions
      if (['Super Admin', 'Super Moderator'].includes(req.user.role)) {
        return next();
      }

      // For institution-specific roles, verify they belong to the institution
      if (require('mongoose').connection.readyState === 1) {
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);

        if (!user || !user.institution) {
          return res.status(403).json({
            message: 'Access denied: no institution association'
          });
        }

        // Add institution info to request for use in route handlers
        req.userInstitution = user.institution;
      }

      next();
    } catch (error) {
      console.error('Institution access check error:', error);
      res.status(500).json({ message: 'Error checking institution access' });
    }
  };
}

// Combined middleware for common access patterns
const accessControl = {
  // Super Admin only
  superAdminOnly: hierarchicalRoleCheck('Super Admin'),

  // Super Admin or Super Moderator
  superAdminOrModerator: hierarchicalRoleCheck('Super Moderator'),

  // Institution Admin or higher
  institutionAdminOrHigher: hierarchicalRoleCheck('Admin'),

  // Institution Moderator or higher
  institutionModeratorOrHigher: hierarchicalRoleCheck('Moderator'),

  // Instructor or higher
  instructorOrHigher: hierarchicalRoleCheck('Instructor'),

  // Any authenticated user
  anyUser: (req, res, next) => next(),

  // Institution-specific admin access
  institutionAdmin: [
    roleCheck(['Admin']),
    institutionAccessCheck
  ],

  // Institution-specific moderator access
  institutionModerator: [
    roleCheck(['Admin', 'Moderator']),
    institutionAccessCheck
  ]
};

module.exports = roleCheck;
module.exports.hierarchicalRoleCheck = hierarchicalRoleCheck;
module.exports.permissionCheck = permissionCheck;
module.exports.institutionAccessCheck = institutionAccessCheck;
module.exports.accessControl = accessControl;
module.exports.ROLE_HIERARCHY = ROLE_HIERARCHY;