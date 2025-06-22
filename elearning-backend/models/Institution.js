const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['university', 'polytechnic', 'college', 'institute', 'school'],
    required: true
  },
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    country: { type: String, default: 'Nigeria' }
  },
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String }
  },
  // Institution status and verification
  status: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending'
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
  // Institution settings
  settings: {
    allowSelfRegistration: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: true },
    maxAdmins: { type: Number, default: 2 },
    maxModerators: { type: Number, default: 5 },
    enableCBT: { type: Boolean, default: false },
    enableClassroom: { type: Boolean, default: false }
  },
  // Statistics
  stats: {
    totalUsers: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalInstructors: { type: Number, default: 0 },
    totalAdmins: { type: Number, default: 0 },
    totalModerators: { type: Number, default: 0 },
    activeCourses: { type: Number, default: 0 },
    totalAssessments: { type: Number, default: 0 }
  },
  // Administrative information
  adminNotes: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Indexes for efficient queries
institutionSchema.index({ name: 1 });
institutionSchema.index({ code: 1 });
institutionSchema.index({ status: 1 });
institutionSchema.index({ 'location.state': 1 });
institutionSchema.index({ type: 1 });

// Virtual for display name
institutionSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.code})`;
});

// Method to check if institution can accept new admins
institutionSchema.methods.canAddAdmin = function() {
  return this.stats.totalAdmins < this.settings.maxAdmins;
};

// Method to check if institution can accept new moderators
institutionSchema.methods.canAddModerator = function() {
  return this.stats.totalModerators < this.settings.maxModerators;
};

module.exports = mongoose.model('Institution', institutionSchema);
