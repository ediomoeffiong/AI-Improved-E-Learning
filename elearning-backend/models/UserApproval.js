const mongoose = require('mongoose');

const userApprovalSchema = new mongoose.Schema({
  // User requesting approval
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type of approval request
  approvalType: {
    type: String,
    enum: ['role_upgrade', 'institution_join', 'admin_verification', 'moderator_verification'],
    required: true
  },
  // Current and requested information
  currentRole: {
    type: String,
    required: true
  },
  requestedRole: {
    type: String,
    required: true
  },
  requestedAdminType: {
    type: String,
    enum: ['primary', 'secondary'],
    default: null
  },
  // Institution context
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null
  },
  institutionName: {
    type: String,
    default: null
  },
  // Request details
  reason: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    default: null
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // User details at time of request
  userDetails: {
    name: String,
    email: String,
    phoneNumber: String,
    department: String,
    studentId: String,
    staffId: String
  },
  // Approval status and workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Approval details
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: null
  },
  approvalNotes: {
    type: String,
    default: null
  },
  // Workflow tracking
  workflowStage: {
    type: String,
    enum: ['submitted', 'under_review', 'pending_approval', 'completed', 'rejected'],
    default: 'submitted'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Expiration and follow-up
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  // Metadata
  submittedFrom: {
    type: String,
    default: 'web'
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Indexes for efficient queries
userApprovalSchema.index({ user: 1 });
userApprovalSchema.index({ status: 1 });
userApprovalSchema.index({ approvalType: 1 });
userApprovalSchema.index({ institution: 1 });
userApprovalSchema.index({ reviewedBy: 1 });
userApprovalSchema.index({ workflowStage: 1 });
userApprovalSchema.index({ expiresAt: 1 });
userApprovalSchema.index({ createdAt: -1 });

// Virtual for request age in days
userApprovalSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for time until expiration
userApprovalSchema.virtual('daysUntilExpiration').get(function() {
  return Math.floor((this.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
});

// Method to check if request is expired
userApprovalSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to check if request is urgent
userApprovalSchema.methods.isUrgent = function() {
  return this.priority === 'urgent' || this.daysUntilExpiration <= 3;
};

// Static method to get pending requests for a specific approver
userApprovalSchema.statics.getPendingForApprover = function(approverId, institutionId = null) {
  const query = { 
    status: 'pending',
    $or: [
      { reviewedBy: approverId },
      { assignedTo: approverId }
    ]
  };
  
  if (institutionId) {
    query.institution = institutionId;
  }
  
  return this.find(query).populate('user institution reviewedBy assignedTo');
};

module.exports = mongoose.model('UserApproval', userApprovalSchema);
