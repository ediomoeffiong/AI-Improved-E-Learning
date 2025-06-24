const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institution = require('../models/Institution');
const UserApproval = require('../models/UserApproval');
const InstitutionMembership = require('../models/InstitutionMembership');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is Super Admin or Super Moderator
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !['Super Admin', 'Super Moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Super Admin privileges required' });
  }
  next();
};

// Middleware to check if user is Super Admin only
const requireSuperAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Access denied: Super Admin privileges required' });
  }
  next();
};

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all users with filtering and pagination
router.get('/users', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search, institution } = req.query;
    
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const query = {};
    
    // Apply filters
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      if (status === 'verified') {
        query.isVerified = true;
      } else if (status === 'unverified') {
        query.isVerified = false;
      } else if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (institution && institution !== 'all') {
      query.institution = institution;
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .populate('institution', 'name code')
      .populate('verifiedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create new Super Admin or Super Moderator
router.post('/create-admin', auth, requireSuperAdminOnly, async (req, res) => {
  try {
    const { name, username, email, phoneNumber, password, role } = req.body;

    // Validation
    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Super Admin', 'Super Moderator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only Super Admin and Super Moderator can be created.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Set permissions based on role
    const permissions = role === 'Super Admin' 
      ? ['manage_users', 'manage_institutions', 'manage_platform', 'view_analytics', 'approve_admins', 'approve_moderators', 'create_secondary_admins']
      : ['manage_institutions', 'view_analytics', 'approve_admins', 'approve_moderators'];

    // Create new admin user
    const newAdmin = new User({
      name,
      username: username.toLowerCase(),
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      isSuperAdmin: role === 'Super Admin',
      isVerified: true,
      verificationStatus: 'not_required',
      permissions,
      isActive: true,
      createdBy: req.user.userId
    });

    await newAdmin.save();

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        phoneNumber: newAdmin.phoneNumber,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        isVerified: newAdmin.isVerified,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

// Get pending institution admin approvals
router.get('/pending-admins', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const pendingApprovals = await UserApproval.find({
      approvalType: 'admin_verification',
      status: 'pending'
    })
    .populate('user', 'name email username phoneNumber')
    .populate('institution', 'name code')
    .sort({ createdAt: -1 });

    res.json({ approvals: pendingApprovals });
  } catch (error) {
    console.error('Error fetching pending admin approvals:', error);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
});

// Approve or reject institution admin
router.post('/approve-admin/:approvalId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { action, notes, adminType } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const approval = await UserApproval.findById(approvalId).populate('user institution');
    
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'This approval request has already been processed' });
    }

    if (action === 'approve') {
      // Update user role and verification status
      await User.findByIdAndUpdate(approval.user._id, {
        role: 'Admin',
        adminType: adminType || 'primary',
        isVerified: true,
        verificationStatus: 'approved',
        verifiedBy: req.user.userId,
        verifiedAt: new Date(),
        institution: approval.institution._id,
        institutionName: approval.institution.name
      });

      // Update approval status
      approval.status = 'approved';
      approval.reviewedBy = req.user.userId;
      approval.reviewedAt = new Date();
      approval.approvalNotes = notes;
      await approval.save();

      res.json({ 
        message: 'Institution Admin approved successfully',
        approval: approval
      });
    } else {
      // Reject the approval
      approval.status = 'rejected';
      approval.reviewedBy = req.user.userId;
      approval.reviewedAt = new Date();
      approval.reviewNotes = notes;
      await approval.save();

      res.json({ 
        message: 'Institution Admin request rejected',
        approval: approval
      });
    }
  } catch (error) {
    console.error('Error processing admin approval:', error);
    res.status(500).json({ message: 'Error processing approval' });
  }
});

// Get platform statistics
router.get('/stats', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const [
      totalUsers,
      totalInstitutions,
      pendingApprovals,
      superAdmins,
      institutionAdmins,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Institution.countDocuments(),
      UserApproval.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $in: ['Super Admin', 'Super Moderator'] } }),
      User.countDocuments({ role: 'Admin' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
    ]);

    res.json({
      stats: {
        totalUsers,
        totalInstitutions,
        pendingApprovals,
        superAdmins,
        institutionAdmins
      },
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// ==================== INSTITUTION MANAGEMENT ROUTES ====================

// Get all institutions with filtering and pagination
router.get('/institutions', auth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      state,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Build query
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (state && state !== 'all') {
      query['location.state'] = state;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [institutions, totalCount] = await Promise.all([
      Institution.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('verifiedBy', 'name email')
        .populate('createdBy', 'name email'),
      Institution.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      institutions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Get institution statistics
router.get('/institutions/stats', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const [
      totalInstitutions,
      verifiedInstitutions,
      pendingInstitutions,
      suspendedInstitutions,
      typeStats,
      stateStats,
      recentInstitutions
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: 'verified' }),
      Institution.countDocuments({ status: 'pending' }),
      Institution.countDocuments({ status: 'suspended' }),
      Institution.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Institution.aggregate([
        { $group: { _id: '$location.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Institution.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name code status createdAt location.state')
    ]);

    res.json({
      stats: {
        totalInstitutions,
        verifiedInstitutions,
        pendingInstitutions,
        suspendedInstitutions
      },
      typeStats,
      stateStats,
      recentInstitutions
    });
  } catch (error) {
    console.error('Error fetching institution statistics:', error);
    res.status(500).json({ message: 'Error fetching institution statistics' });
  }
});

// Get single institution details
router.get('/institutions/:institutionId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { institutionId } = req.params;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const institution = await Institution.findById(institutionId)
      .populate('verifiedBy', 'name email role')
      .populate('createdBy', 'name email role');

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Get institution members count
    const memberStats = await InstitutionMembership.aggregate([
      { $match: { institution: institution._id } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities (memberships, approvals, etc.)
    const recentActivities = await InstitutionMembership.find({
      institution: institution._id
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('approvedBy', 'name email');

    res.json({
      institution,
      memberStats,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching institution details:', error);
    res.status(500).json({ message: 'Error fetching institution details' });
  }
});

// Update institution status (verify, suspend, reject)
router.patch('/institutions/:institutionId/status', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'suspended', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const updateData = {
      status,
      adminNotes: notes || ''
    };

    if (status === 'verified') {
      updateData.verifiedBy = req.user.userId;
      updateData.verifiedAt = new Date();
    }

    const institution = await Institution.findByIdAndUpdate(
      institutionId,
      updateData,
      { new: true }
    ).populate('verifiedBy', 'name email');

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({
      message: `Institution ${status} successfully`,
      institution
    });
  } catch (error) {
    console.error('Error updating institution status:', error);
    res.status(500).json({ message: 'Error updating institution status' });
  }
});

// Update institution settings
router.patch('/institutions/:institutionId/settings', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { settings } = req.body;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Validate settings
    const allowedSettings = [
      'allowSelfRegistration',
      'requireApproval',
      'maxAdmins',
      'maxModerators',
      'enableCBT',
      'enableClassroom'
    ];

    const validSettings = {};
    Object.keys(settings).forEach(key => {
      if (allowedSettings.includes(key)) {
        validSettings[`settings.${key}`] = settings[key];
      }
    });

    const institution = await Institution.findByIdAndUpdate(
      institutionId,
      validSettings,
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({
      message: 'Institution settings updated successfully',
      institution
    });
  } catch (error) {
    console.error('Error updating institution settings:', error);
    res.status(500).json({ message: 'Error updating institution settings' });
  }
});

// Bulk operations on institutions
router.post('/institutions/bulk-action', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { action, institutionIds, data } = req.body;

    if (!['verify', 'suspend', 'reject', 'activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ message: 'Invalid bulk action' });
    }

    if (!Array.isArray(institutionIds) || institutionIds.length === 0) {
      return res.status(400).json({ message: 'Institution IDs are required' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    let updateData = {};

    switch (action) {
      case 'verify':
        updateData = {
          status: 'verified',
          verifiedBy: req.user.userId,
          verifiedAt: new Date()
        };
        break;
      case 'suspend':
        updateData = {
          status: 'suspended',
          adminNotes: data?.notes || 'Suspended by Super Admin'
        };
        break;
      case 'reject':
        updateData = {
          status: 'rejected',
          adminNotes: data?.notes || 'Rejected by Super Admin'
        };
        break;
      case 'activate':
        updateData = { isActive: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
    }

    const result = await Institution.updateMany(
      { _id: { $in: institutionIds } },
      updateData
    );

    res.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Error performing bulk action' });
  }
});

// Create new institution (manual addition)
router.post('/institutions', auth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      location,
      contact,
      settings
    } = req.body;

    // Validation
    if (!name || !code || !type || !location || !contact) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const institutionData = {
      name,
      code: code.toUpperCase(),
      type,
      location,
      contact,
      status: 'verified', // Manually created institutions are auto-verified
      verifiedBy: req.user.userId,
      verifiedAt: new Date(),
      createdBy: req.user.userId,
      settings: {
        allowSelfRegistration: true,
        requireApproval: true,
        maxAdmins: 2,
        maxModerators: 5,
        enableCBT: false,
        enableClassroom: false,
        ...settings
      },
      stats: {
        totalUsers: 0,
        totalStudents: 0,
        totalInstructors: 0,
        totalAdmins: 0,
        totalModerators: 0,
        activeCourses: 0,
        totalAssessments: 0
      },
      isActive: true
    };

    const institution = new Institution(institutionData);
    await institution.save();

    res.status(201).json({
      message: 'Institution created successfully',
      institution
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Institution with this ${field} already exists`
      });
    }
    console.error('Error creating institution:', error);
    res.status(500).json({ message: 'Error creating institution' });
  }
});

module.exports = router;
