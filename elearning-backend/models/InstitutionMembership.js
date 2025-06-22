const mongoose = require('mongoose');

const institutionMembershipSchema = new mongoose.Schema({
  // User and Institution relationship
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  // Membership details
  role: {
    type: String,
    enum: ['Student', 'Instructor', 'Admin', 'Moderator'],
    required: true
  },
  adminType: {
    type: String,
    enum: ['primary', 'secondary'],
    default: null
  },
  // Status and approval
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated', 'rejected'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Member information
  memberDetails: {
    department: { type: String, default: null },
    studentId: { type: String, default: null },
    staffId: { type: String, default: null },
    academicYear: { type: String, default: null },
    enrollmentDate: { type: Date, default: null },
    graduationDate: { type: Date, default: null },
    studentLevel: { 
      type: String, 
      enum: ['undergraduate', 'postgraduate', 'phd', 'diploma', 'certificate'],
      default: 'undergraduate'
    }
  },
  // Permissions and access
  permissions: [{
    type: String,
    enum: [
      'view_courses', 'enroll_courses', 'take_assessments', 'view_results',
      'manage_courses', 'create_assessments', 'grade_assessments', 'view_analytics',
      'approve_members', 'manage_moderators', 'manage_settings', 'view_reports'
    ]
  }],
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  coursesEnrolled: {
    type: Number,
    default: 0
  },
  assessmentsTaken: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  // Membership lifecycle
  joinedAt: {
    type: Date,
    default: Date.now
  },
  terminatedAt: {
    type: Date,
    default: null
  },
  terminationReason: {
    type: String,
    default: null
  },
  // Metadata
  notes: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Compound indexes for efficient queries
institutionMembershipSchema.index({ user: 1, institution: 1 }, { unique: true });
institutionMembershipSchema.index({ institution: 1, role: 1 });
institutionMembershipSchema.index({ institution: 1, status: 1 });
institutionMembershipSchema.index({ institution: 1, approvalStatus: 1 });
institutionMembershipSchema.index({ user: 1, status: 1 });
institutionMembershipSchema.index({ approvedBy: 1 });
institutionMembershipSchema.index({ lastActivity: -1 });

// Virtual for membership duration
institutionMembershipSchema.virtual('membershipDuration').get(function() {
  const endDate = this.terminatedAt || Date.now();
  return Math.floor((endDate - this.joinedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for display status
institutionMembershipSchema.virtual('displayStatus').get(function() {
  if (this.status === 'pending' && this.approvalStatus === 'pending') {
    return 'Pending Approval';
  }
  if (this.status === 'active' && this.approvalStatus === 'approved') {
    return 'Active Member';
  }
  if (this.status === 'suspended') {
    return 'Suspended';
  }
  if (this.status === 'terminated') {
    return 'Terminated';
  }
  if (this.approvalStatus === 'rejected') {
    return 'Rejected';
  }
  return this.status;
});

// Method to check if user has specific permission
institutionMembershipSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to activate membership
institutionMembershipSchema.methods.activate = function(approvedBy) {
  this.status = 'active';
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject membership
institutionMembershipSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'rejected';
  this.approvalStatus = 'rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static method to get pending approvals for institution
institutionMembershipSchema.statics.getPendingApprovals = function(institutionId) {
  return this.find({
    institution: institutionId,
    approvalStatus: 'pending'
  }).populate('user institution approvedBy rejectedBy');
};

// Static method to get active members by role
institutionMembershipSchema.statics.getActiveMembers = function(institutionId, role = null) {
  const query = {
    institution: institutionId,
    status: 'active',
    approvalStatus: 'approved'
  };
  
  if (role) {
    query.role = role;
  }
  
  return this.find(query).populate('user institution');
};

module.exports = mongoose.model('InstitutionMembership', institutionMembershipSchema);
