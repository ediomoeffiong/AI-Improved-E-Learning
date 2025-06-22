const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: { type: String, required: true, unique: true },
  phoneNumber: {
    type: String,
    sparse: true, // Allows null values but enforces uniqueness when present
    unique: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Student', 'Instructor', 'Admin', 'Moderator', 'Super Admin', 'Super Moderator'],
    default: 'Student',
  },
  // Admin type for institution admins (Primary or Secondary)
  adminType: {
    type: String,
    enum: ['primary', 'secondary', null],
    default: null
  },
  // Institution association
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null
  },
  institutionName: {
    type: String,
    default: null
  },
  // Verification and approval status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  // Institution membership approval
  institutionApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_applicable'],
    default: 'not_applicable'
  },
  institutionApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  institutionApprovedAt: {
    type: Date,
    default: null
  },
  // Additional user information
  department: {
    type: String,
    default: null
  },
  studentId: {
    type: String,
    default: null
  },
  staffId: {
    type: String,
    default: null
  },
  // Permissions and access control
  permissions: [{
    type: String,
    enum: [
      'manage_users', 'manage_institutions', 'manage_platform', 'view_analytics',
      'approve_admins', 'approve_moderators', 'approve_members', 'manage_courses',
      'manage_assessments', 'view_reports', 'create_secondary_admins'
    ]
  }],
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Super Admin specific fields
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ institution: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ institutionApprovalStatus: 1 });

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Method to check if user can approve other users
userSchema.methods.canApprove = function(targetRole) {
  const roleHierarchy = {
    'Super Admin': 6,
    'Super Moderator': 5,
    'Admin': 4,
    'Moderator': 3,
    'Instructor': 2,
    'Student': 1
  };

  const userLevel = roleHierarchy[this.role] || 0;
  const targetLevel = roleHierarchy[targetRole] || 0;

  return userLevel > targetLevel;
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', userSchema);