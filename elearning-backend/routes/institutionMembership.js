const express = require('express');
const User = require('../models/User');
const Institution = require('../models/Institution');
const UserApproval = require('../models/UserApproval');
const InstitutionMembership = require('../models/InstitutionMembership');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Request to join an institution
router.post('/join-request', auth, async (req, res) => {
  try {
    const { 
      institutionId, 
      requestedRole = 'Student', 
      department, 
      studentId, 
      staffId, 
      additionalInfo 
    } = req.body;

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution ID is required' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Get institution
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    if (institution.status !== 'verified') {
      return res.status(400).json({ message: 'Institution is not verified' });
    }

    // Check if user already has a membership or pending request
    const existingMembership = await InstitutionMembership.findOne({
      user: req.user.userId,
      institution: institutionId
    });

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return res.status(400).json({ message: 'You are already a member of this institution' });
      }
      if (existingMembership.approvalStatus === 'pending') {
        return res.status(400).json({ message: 'You already have a pending request for this institution' });
      }
    }

    // Get current user
    const currentUser = await User.findById(req.user.userId);

    // Create membership request
    const membershipData = {
      user: req.user.userId,
      institution: institutionId,
      role: requestedRole,
      status: 'pending',
      approvalStatus: 'pending',
      memberDetails: {
        department: department || '',
        studentId: studentId || '',
        staffId: staffId || '',
        academicYear: new Date().getFullYear().toString(),
        enrollmentDate: new Date(),
        studentLevel: 'undergraduate'
      }
    };

    let membership;
    if (existingMembership) {
      // Update existing membership
      Object.assign(existingMembership, membershipData);
      membership = await existingMembership.save();
    } else {
      // Create new membership
      membership = new InstitutionMembership(membershipData);
      await membership.save();
    }

    // Create approval request for tracking
    const approvalRequest = new UserApproval({
      user: req.user.userId,
      approvalType: 'institution_join',
      currentRole: currentUser.role,
      requestedRole: requestedRole,
      institution: institutionId,
      institutionName: institution.name,
      reason: `Request to join ${institution.name} as ${requestedRole}`,
      additionalInfo: additionalInfo || '',
      userDetails: {
        name: currentUser.name,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        department: department,
        studentId: studentId,
        staffId: staffId
      }
    });

    await approvalRequest.save();

    // Update user's institution request status
    await User.findByIdAndUpdate(req.user.userId, {
      institutionApprovalStatus: 'pending'
    });

    res.status(201).json({
      message: 'Institution join request submitted successfully',
      membership: {
        id: membership._id,
        institution: institution.name,
        role: requestedRole,
        status: membership.status,
        approvalStatus: membership.approvalStatus,
        submittedAt: membership.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting join request:', error);
    res.status(500).json({ message: 'Error submitting join request' });
  }
});

// Get user's institution membership status
router.get('/my-status', auth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const memberships = await InstitutionMembership.find({
      user: req.user.userId
    })
    .populate('institution', 'name code type location')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

    const approvalRequests = await UserApproval.find({
      user: req.user.userId,
      approvalType: 'institution_join'
    })
    .populate('institution', 'name code')
    .sort({ createdAt: -1 });

    res.json({
      memberships,
      approvalRequests
    });
  } catch (error) {
    console.error('Error fetching membership status:', error);
    res.status(500).json({ message: 'Error fetching membership status' });
  }
});

// Cancel pending join request
router.delete('/cancel-request/:membershipId', auth, async (req, res) => {
  try {
    const { membershipId } = req.params;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const membership = await InstitutionMembership.findOne({
      _id: membershipId,
      user: req.user.userId,
      approvalStatus: 'pending'
    });

    if (!membership) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    // Update membership status
    membership.status = 'cancelled';
    membership.approvalStatus = 'cancelled';
    await membership.save();

    // Update related approval request
    await UserApproval.findOneAndUpdate(
      {
        user: req.user.userId,
        institution: membership.institution,
        approvalType: 'institution_join',
        status: 'pending'
      },
      {
        status: 'cancelled'
      }
    );

    // Update user status if no other pending requests
    const otherPendingRequests = await InstitutionMembership.countDocuments({
      user: req.user.userId,
      approvalStatus: 'pending'
    });

    if (otherPendingRequests === 0) {
      await User.findByIdAndUpdate(req.user.userId, {
        institutionApprovalStatus: 'not_applicable'
      });
    }

    res.json({ message: 'Join request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Error cancelling request' });
  }
});

// Get available institutions for joining
router.get('/available-institutions', auth, async (req, res) => {
  try {
    const { search, state, type, page = 1, limit = 20 } = req.query;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const query = { 
      status: 'verified',
      'settings.allowSelfRegistration': true
    };

    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (state && state !== 'all') {
      query['location.state'] = state;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const institutions = await Institution.find(query)
      .select('name code type location contact stats settings')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Institution.countDocuments(query);

    // Check user's existing memberships
    const userMemberships = await InstitutionMembership.find({
      user: req.user.userId
    }).select('institution status approvalStatus');

    const membershipMap = {};
    userMemberships.forEach(membership => {
      membershipMap[membership.institution.toString()] = {
        status: membership.status,
        approvalStatus: membership.approvalStatus
      };
    });

    // Add membership status to institutions
    const institutionsWithStatus = institutions.map(institution => ({
      ...institution.toObject(),
      userMembership: membershipMap[institution._id.toString()] || null
    }));

    res.json({
      institutions: institutionsWithStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching available institutions:', error);
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Update institution settings (for users who enable institution features)
router.post('/update-settings', auth, async (req, res) => {
  try {
    const { 
      institutionId, 
      department, 
      studentId, 
      staffId, 
      academicYear, 
      studentLevel,
      phoneNumber 
    } = req.body;

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution selection is required' });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Get institution
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Update user's phone number if provided
    const updateData = {};
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }

    await User.findByIdAndUpdate(req.user.userId, updateData);

    // Check if user already has membership
    let membership = await InstitutionMembership.findOne({
      user: req.user.userId,
      institution: institutionId
    });

    const memberDetails = {
      department: department || '',
      studentId: studentId || '',
      staffId: staffId || '',
      academicYear: academicYear || new Date().getFullYear().toString(),
      studentLevel: studentLevel || 'undergraduate'
    };

    if (membership) {
      // Update existing membership
      membership.memberDetails = { ...membership.memberDetails, ...memberDetails };
      if (membership.approvalStatus === 'rejected') {
        // Reset to pending if previously rejected
        membership.status = 'pending';
        membership.approvalStatus = 'pending';
        membership.rejectedBy = null;
        membership.rejectedAt = null;
        membership.rejectionReason = null;
      }
      await membership.save();
    } else {
      // Create new membership request
      membership = new InstitutionMembership({
        user: req.user.userId,
        institution: institutionId,
        role: 'Student', // Default role
        status: 'pending',
        approvalStatus: 'pending',
        memberDetails
      });
      await membership.save();
    }

    // Update user's institution status
    await User.findByIdAndUpdate(req.user.userId, {
      institutionApprovalStatus: 'pending'
    });

    res.json({
      message: 'Institution settings updated. Your request is pending approval.',
      membership: {
        id: membership._id,
        institution: institution.name,
        status: membership.status,
        approvalStatus: membership.approvalStatus
      }
    });
  } catch (error) {
    console.error('Error updating institution settings:', error);
    res.status(500).json({ message: 'Error updating institution settings' });
  }
});

// Get institution details
router.get('/institution/:institutionId', auth, async (req, res) => {
  try {
    const { institutionId } = req.params;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Check user's membership status
    const membership = await InstitutionMembership.findOne({
      user: req.user.userId,
      institution: institutionId
    });

    res.json({
      institution,
      userMembership: membership
    });
  } catch (error) {
    console.error('Error fetching institution details:', error);
    res.status(500).json({ message: 'Error fetching institution details' });
  }
});

module.exports = router;
