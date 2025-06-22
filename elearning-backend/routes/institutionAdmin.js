const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institution = require('../models/Institution');
const UserApproval = require('../models/UserApproval');
const InstitutionMembership = require('../models/InstitutionMembership');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is Institution Admin
const requireInstitutionAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Institution Admin privileges required' });
  }
  next();
};

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get institution dashboard data
router.get('/dashboard', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Get current user's institution
    const currentUser = await User.findById(req.user.userId).populate('institution');
    if (!currentUser || !currentUser.institution) {
      return res.status(400).json({ message: 'Institution not found for current user' });
    }

    const institutionId = currentUser.institution._id;

    // Get institution statistics
    const [
      totalMembers,
      pendingApprovals,
      activeStudents,
      activeInstructors,
      activeModerators,
      recentMembers
    ] = await Promise.all([
      InstitutionMembership.countDocuments({ institution: institutionId, status: 'active' }),
      InstitutionMembership.countDocuments({ institution: institutionId, approvalStatus: 'pending' }),
      InstitutionMembership.countDocuments({ institution: institutionId, role: 'Student', status: 'active' }),
      InstitutionMembership.countDocuments({ institution: institutionId, role: 'Instructor', status: 'active' }),
      InstitutionMembership.countDocuments({ institution: institutionId, role: 'Moderator', status: 'active' }),
      InstitutionMembership.find({ institution: institutionId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      institution: currentUser.institution,
      stats: {
        totalMembers,
        pendingApprovals,
        activeStudents,
        activeInstructors,
        activeModerators
      },
      recentMembers
    });
  } catch (error) {
    console.error('Error fetching institution dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get pending member approvals
router.get('/pending-approvals', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || !currentUser.institution) {
      return res.status(400).json({ message: 'Institution not found for current user' });
    }

    const pendingApprovals = await InstitutionMembership.find({
      institution: currentUser.institution,
      approvalStatus: 'pending'
    })
    .populate('user', 'name email username phoneNumber')
    .sort({ createdAt: -1 });

    res.json({ approvals: pendingApprovals });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
});

// Approve or reject institution member
router.post('/approve-member/:membershipId', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const membership = await InstitutionMembership.findById(membershipId)
      .populate('user institution');
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership request not found' });
    }

    if (membership.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'This membership request has already been processed' });
    }

    // Verify the admin has permission to approve for this institution
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser.institution || currentUser.institution.toString() !== membership.institution._id.toString()) {
      return res.status(403).json({ message: 'You can only approve members for your own institution' });
    }

    if (action === 'approve') {
      // Activate membership
      await membership.activate(req.user.userId);

      // Update user's institution information
      await User.findByIdAndUpdate(membership.user._id, {
        institution: membership.institution._id,
        institutionName: membership.institution.name,
        institutionApprovalStatus: 'approved',
        institutionApprovedBy: req.user.userId,
        institutionApprovedAt: new Date()
      });

      res.json({ 
        message: 'Member approved successfully',
        membership: membership
      });
    } else {
      // Reject membership
      await membership.reject(req.user.userId, notes);

      res.json({ 
        message: 'Member request rejected',
        membership: membership
      });
    }
  } catch (error) {
    console.error('Error processing member approval:', error);
    res.status(500).json({ message: 'Error processing approval' });
  }
});

// Get institution members
router.get('/members', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || !currentUser.institution) {
      return res.status(400).json({ message: 'Institution not found for current user' });
    }

    const query = { institution: currentUser.institution };
    
    // Apply filters
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    let members = await InstitutionMembership.find(query)
      .populate('user', 'name email username phoneNumber')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Apply search filter if provided
    if (search) {
      members = members.filter(member => 
        member.user.name.toLowerCase().includes(search.toLowerCase()) ||
        member.user.email.toLowerCase().includes(search.toLowerCase()) ||
        member.user.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await InstitutionMembership.countDocuments(query);

    res.json({
      members,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching institution members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
});

// Create secondary institution admin
router.post('/create-secondary-admin', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const currentUser = await User.findById(req.user.userId).populate('institution');
    if (!currentUser || !currentUser.institution) {
      return res.status(400).json({ message: 'Institution not found for current user' });
    }

    // Check if current user is primary admin
    if (currentUser.adminType !== 'primary') {
      return res.status(403).json({ message: 'Only primary admins can create secondary admins' });
    }

    // Check institution admin limits
    const currentAdminCount = await User.countDocuments({
      institution: currentUser.institution._id,
      role: 'Admin'
    });

    if (currentAdminCount >= currentUser.institution.settings.maxAdmins) {
      return res.status(400).json({ 
        message: `Maximum of ${currentUser.institution.settings.maxAdmins} admins allowed per institution` 
      });
    }

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already an admin
    if (targetUser.role === 'Admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Update user to secondary admin
    await User.findByIdAndUpdate(userId, {
      role: 'Admin',
      adminType: 'secondary',
      institution: currentUser.institution._id,
      institutionName: currentUser.institution.name,
      isVerified: true,
      verificationStatus: 'approved',
      verifiedBy: req.user.userId,
      verifiedAt: new Date()
    });

    // Update institution membership
    await InstitutionMembership.findOneAndUpdate(
      { user: userId, institution: currentUser.institution._id },
      {
        role: 'Admin',
        adminType: 'secondary',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: req.user.userId,
        approvedAt: new Date()
      },
      { upsert: true }
    );

    res.json({ 
      message: 'Secondary admin created successfully',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: 'Admin',
        adminType: 'secondary'
      }
    });
  } catch (error) {
    console.error('Error creating secondary admin:', error);
    res.status(500).json({ message: 'Error creating secondary admin' });
  }
});

// Approve moderator request
router.post('/approve-moderator/:userId', auth, requireInstitutionAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const currentUser = await User.findById(req.user.userId).populate('institution');
    if (!currentUser || !currentUser.institution) {
      return res.status(400).json({ message: 'Institution not found for current user' });
    }

    // Check moderator limits
    const currentModeratorCount = await User.countDocuments({
      institution: currentUser.institution._id,
      role: 'Moderator'
    });

    if (currentModeratorCount >= currentUser.institution.settings.maxModerators) {
      return res.status(400).json({ 
        message: `Maximum of ${currentUser.institution.settings.maxModerators} moderators allowed per institution` 
      });
    }

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user to moderator
    await User.findByIdAndUpdate(userId, {
      role: 'Moderator',
      institution: currentUser.institution._id,
      institutionName: currentUser.institution.name,
      isVerified: true,
      verificationStatus: 'approved',
      verifiedBy: req.user.userId,
      verifiedAt: new Date()
    });

    // Update institution membership
    await InstitutionMembership.findOneAndUpdate(
      { user: userId, institution: currentUser.institution._id },
      {
        role: 'Moderator',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: req.user.userId,
        approvedAt: new Date()
      },
      { upsert: true }
    );

    res.json({ 
      message: 'Moderator approved successfully',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: 'Moderator'
      }
    });
  } catch (error) {
    console.error('Error approving moderator:', error);
    res.status(500).json({ message: 'Error approving moderator' });
  }
});

module.exports = router;
