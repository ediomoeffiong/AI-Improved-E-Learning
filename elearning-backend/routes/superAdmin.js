const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institution = require('../models/Institution');
const UserApproval = require('../models/UserApproval');
const InstitutionMembership = require('../models/InstitutionMembership');
const auth = require('../middleware/auth');

// Import additional models for activity tracking
let Course, Enrollment, Quiz, QuizAttempt;
try {
  Course = require('../models/Course');
  Enrollment = require('../models/Enrollment');
  Quiz = require('../models/Quiz');
  QuizAttempt = require('../models/QuizAttempt');
} catch (err) {
  // Models might not exist, will handle gracefully in code
  console.log('Some models not found, will use fallback data for activities');
}

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

// Get all pending user approvals (all types)
router.get('/pending-approvals', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { type, status = 'pending', page = 1, limit = 20 } = req.query;

    // Build query
    const query = { status };
    if (type && type !== 'all') {
      query.approvalType = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [approvals, totalCount] = await Promise.all([
      UserApproval.find(query)
        .populate('user', 'name email username phoneNumber role')
        .populate('institution', 'name code')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserApproval.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      approvals,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
});

// Get pending institution admin approvals (legacy endpoint)
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

// General approval endpoint for all types of user approvals
router.post('/approve-user/:approvalId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { action, notes, adminType, moderatorType } = req.body; // action: 'approve' or 'reject'

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
      let updateData = {
        isVerified: true,
        verificationStatus: 'approved',
        verifiedBy: req.user.userId,
        verifiedAt: new Date()
      };

      // Handle different approval types
      switch (approval.approvalType) {
        case 'admin_verification':
          updateData.role = 'Admin';
          updateData.adminType = adminType || 'primary';
          if (approval.institution) {
            updateData.institution = approval.institution._id;
            updateData.institutionName = approval.institution.name;
          }
          break;

        case 'moderator_verification':
          updateData.role = 'Moderator';
          if (approval.institution) {
            updateData.institution = approval.institution._id;
            updateData.institutionName = approval.institution.name;
          }
          break;

        case 'institution_join':
          updateData.role = approval.requestedRole;
          if (approval.institution) {
            updateData.institution = approval.institution._id;
            updateData.institutionName = approval.institution.name;
            updateData.institutionApprovalStatus = 'approved';
            updateData.institutionApprovedBy = req.user.userId;
          }
          break;

        case 'role_upgrade':
          updateData.role = approval.requestedRole;
          break;

        default:
          updateData.role = approval.requestedRole;
      }

      // Update user
      await User.findByIdAndUpdate(approval.user._id, updateData);

      // Update approval status
      approval.status = 'approved';
      approval.reviewedBy = req.user.userId;
      approval.reviewedAt = new Date();
      approval.approvalNotes = notes;
      approval.workflowStage = 'completed';
      await approval.save();

      res.json({
        message: `${approval.approvalType.replace('_', ' ')} approved successfully`,
        approval: approval
      });
    } else {
      // Reject the approval
      approval.status = 'rejected';
      approval.reviewedBy = req.user.userId;
      approval.reviewedAt = new Date();
      approval.reviewNotes = notes;
      approval.workflowStage = 'rejected';
      await approval.save();

      res.json({
        message: `${approval.approvalType.replace('_', ' ')} request rejected`,
        approval: approval
      });
    }
  } catch (error) {
    console.error('Error processing user approval:', error);
    res.status(500).json({ message: 'Error processing approval' });
  }
});

// Approve or reject institution admin (legacy endpoint)
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

// Create test institutions (for development/testing only)
router.post('/create-test-institutions', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Test data creation not allowed in production' });
    }

    const testInstitutions = [
      {
        name: 'Federal University of Technology, Bauchi',
        code: 'FUTBAUCHI',
        type: 'university',
        location: {
          state: 'Bauchi',
          city: 'Bauchi',
          address: 'PMB 65, Bauchi',
          country: 'Nigeria'
        },
        contact: {
          email: 'info@futbauchi.edu.ng',
          phone: '+234-803-123-4567',
          website: 'https://futbauchi.edu.ng'
        },
        status: 'pending',
        createdBy: req.user.userId,
        settings: {
          allowSelfRegistration: true,
          requireApproval: true,
          maxAdmins: 2,
          maxModerators: 5,
          enableCBT: true,
          enableClassroom: false
        },
        stats: {
          totalUsers: 150,
          totalStudents: 120,
          totalInstructors: 25,
          totalAdmins: 1,
          totalModerators: 3,
          activeCourses: 15,
          totalAssessments: 45
        },
        isActive: true
      },
      {
        name: 'Kano State Polytechnic',
        code: 'KANOPOLY',
        type: 'polytechnic',
        location: {
          state: 'Kano',
          city: 'Kano',
          address: 'No. 3 Murtala Mohammed Way, Kano',
          country: 'Nigeria'
        },
        contact: {
          email: 'info@kanopoly.edu.ng',
          phone: '+234-802-234-5678',
          website: 'https://kanopoly.edu.ng'
        },
        status: 'pending',
        createdBy: req.user.userId,
        settings: {
          allowSelfRegistration: true,
          requireApproval: true,
          maxAdmins: 2,
          maxModerators: 5,
          enableCBT: false,
          enableClassroom: true
        },
        stats: {
          totalUsers: 89,
          totalStudents: 75,
          totalInstructors: 10,
          totalAdmins: 2,
          totalModerators: 2,
          activeCourses: 8,
          totalAssessments: 20
        },
        isActive: true
      },
      {
        name: 'University of Lagos',
        code: 'UNILAG',
        type: 'university',
        location: {
          state: 'Lagos',
          city: 'Lagos',
          address: 'Akoka, Yaba, Lagos',
          country: 'Nigeria'
        },
        contact: {
          email: 'info@unilag.edu.ng',
          phone: '+234-801-345-6789',
          website: 'https://unilag.edu.ng'
        },
        status: 'verified',
        verifiedBy: req.user.userId,
        verifiedAt: new Date(),
        createdBy: req.user.userId,
        settings: {
          allowSelfRegistration: true,
          requireApproval: true,
          maxAdmins: 2,
          maxModerators: 8,
          enableCBT: true,
          enableClassroom: true
        },
        stats: {
          totalUsers: 2500,
          totalStudents: 2200,
          totalInstructors: 280,
          totalAdmins: 2,
          totalModerators: 8,
          activeCourses: 150,
          totalAssessments: 450
        },
        isActive: true
      }
    ];

    // Check if institutions already exist
    const existingInstitutions = await Institution.find({
      code: { $in: testInstitutions.map(inst => inst.code) }
    });

    if (existingInstitutions.length > 0) {
      return res.status(400).json({
        message: 'Some test institutions already exist',
        existing: existingInstitutions.map(inst => inst.code)
      });
    }

    // Create institutions
    const savedInstitutions = await Institution.insertMany(testInstitutions);

    res.json({
      message: `Created ${savedInstitutions.length} test institutions`,
      institutions: savedInstitutions
    });
  } catch (error) {
    console.error('Error creating test institutions:', error);
    res.status(500).json({ message: 'Error creating test institutions' });
  }
});

// Create test approval data (for development/testing only)
router.post('/create-test-approvals', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Test data creation not allowed in production' });
    }

    // Find some existing users and institutions for test data
    const [users, institutions] = await Promise.all([
      User.find({ role: { $in: ['Student', 'User'] } }).limit(3),
      Institution.find().limit(2)
    ]);

    if (users.length === 0 || institutions.length === 0) {
      return res.status(400).json({ message: 'Need existing users and institutions to create test approvals' });
    }

    const testApprovals = [];

    // Create admin verification request
    if (users[0] && institutions[0]) {
      testApprovals.push(new UserApproval({
        user: users[0]._id,
        approvalType: 'admin_verification',
        currentRole: users[0].role,
        requestedRole: 'Admin',
        requestedAdminType: 'primary',
        institution: institutions[0]._id,
        institutionName: institutions[0].name,
        reason: 'I am the IT director at this institution and would like to become an admin',
        additionalInfo: 'I have 5 years of experience managing educational platforms',
        userDetails: {
          name: users[0].name,
          email: users[0].email,
          phoneNumber: users[0].phoneNumber
        },
        priority: 'normal'
      }));
    }

    // Create moderator verification request
    if (users[1] && institutions[1]) {
      testApprovals.push(new UserApproval({
        user: users[1]._id,
        approvalType: 'moderator_verification',
        currentRole: users[1].role,
        requestedRole: 'Moderator',
        institution: institutions[1]._id,
        institutionName: institutions[1].name,
        reason: 'I am a senior student and would like to help moderate the platform',
        additionalInfo: 'I have been using the platform for 2 years and understand the community guidelines',
        userDetails: {
          name: users[1].name,
          email: users[1].email,
          phoneNumber: users[1].phoneNumber
        },
        priority: 'normal'
      }));
    }

    // Create institution join request
    if (users[2] && institutions[0]) {
      testApprovals.push(new UserApproval({
        user: users[2]._id,
        approvalType: 'institution_join',
        currentRole: users[2].role,
        requestedRole: 'Student',
        institution: institutions[0]._id,
        institutionName: institutions[0].name,
        reason: 'I am a new student at this institution',
        additionalInfo: 'I have just enrolled and need access to institutional features',
        userDetails: {
          name: users[2].name,
          email: users[2].email,
          phoneNumber: users[2].phoneNumber,
          studentId: 'STU2024001'
        },
        priority: 'high'
      }));
    }

    // Save all test approvals
    const savedApprovals = await Promise.all(testApprovals.map(approval => approval.save()));

    res.json({
      message: `Created ${savedApprovals.length} test approval requests`,
      approvals: savedApprovals
    });
  } catch (error) {
    console.error('Error creating test approvals:', error);
    res.status(500).json({ message: 'Error creating test approvals' });
  }
});

// Get platform statistics
router.get('/stats', auth, requireSuperAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Ensure Institution model is properly loaded
    if (!Institution) {
      throw new Error('Institution model not loaded');
    }

    // Calculate date ranges for trend analysis
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [
      totalUsers,
      totalInstitutions,
      totalCourses,
      totalEnrollments,
      totalQuizzes,
      totalQuizAttempts,
      pendingApprovals,
      superAdmins,
      institutionAdmins,
      newUsersThisMonth,
      newUsersLastMonth,
      newInstitutionsThisMonth,
      newInstitutionsLastMonth,
      newCoursesThisMonth,
      newCoursesLastMonth,
      pendingApprovalsLastMonth,
      recentUsers,
      recentActivities,
      institutionStats
    ] = await Promise.all([
      User.countDocuments(),
      Institution.countDocuments(),
      Course?.countDocuments() || Promise.resolve(0),
      Enrollment?.countDocuments() || Promise.resolve(0),
      Quiz?.countDocuments() || Promise.resolve(0),
      QuizAttempt?.countDocuments() || Promise.resolve(0),
      UserApproval.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $in: ['Super Admin', 'Super Moderator'] } }),
      User.countDocuments({ role: 'Admin' }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Institution.countDocuments({ createdAt: { $gte: thisMonth } }),
      Institution.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Course?.countDocuments({ createdAt: { $gte: thisMonth } }) || Promise.resolve(0),
      Course?.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }) || Promise.resolve(0),
      UserApproval.countDocuments({
        status: 'pending',
        createdAt: { $gte: lastMonth, $lt: thisMonth }
      }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      // Generate real-time activities based on actual data
      Promise.resolve().then(async () => {
        const activities = [];

        // Recent user registrations
        const recentUserRegistrations = await User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name role institution createdAt');

        recentUserRegistrations.forEach(user => {
          activities.push({
            description: `${user.name} registered as ${user.role}${user.institution ? ` from ${user.institution}` : ''}`,
            date: user.createdAt,
            type: 'user_registration',
            user: user.name,
            role: user.role
          });
        });

        // Recent course activities (if Course model exists)
        try {
          const recentCourses = await Course.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title instructor createdAt');

          recentCourses.forEach(course => {
            activities.push({
              description: `Course "${course.title}" was published`,
              date: course.createdAt,
              type: 'course_published',
              course: course.title
            });
          });
        } catch (err) {
          // Course model might not exist, skip
        }

        // Recent quiz attempts (if QuizAttempt model exists)
        try {
          const recentQuizAttempts = await QuizAttempt.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('user', 'name')
            .populate('quiz', 'title');

          recentQuizAttempts.forEach(attempt => {
            activities.push({
              description: `${attempt.user?.name || 'A user'} completed quiz "${attempt.quiz?.title || 'Unknown Quiz'}"`,
              date: attempt.createdAt,
              type: 'quiz_attempt',
              user: attempt.user?.name,
              score: attempt.score
            });
          });
        } catch (err) {
          // QuizAttempt model might not exist, skip
        }

        // Recent enrollments (if Enrollment model exists)
        try {
          const recentEnrollments = await Enrollment.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('user', 'name')
            .populate('course', 'title');

          recentEnrollments.forEach(enrollment => {
            activities.push({
              description: `${enrollment.user?.name || 'A user'} enrolled in "${enrollment.course?.title || 'Unknown Course'}"`,
              date: enrollment.createdAt,
              type: 'course_enrollment',
              user: enrollment.user?.name
            });
          });
        } catch (err) {
          // Enrollment model might not exist, skip
        }

        // Sort activities by date and return top 15
        return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
      }),
      // Institution statistics
      Institution.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'institution',
            as: 'users'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'institution',
            as: 'courses'
          }
        },
        {
          $project: {
            name: 1,
            'location.state': 1,
            userCount: { $size: '$users' },
            courseCount: { $size: '$courses' }
          }
        },
        { $sort: { userCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate additional analytics metrics
    const [
      completedEnrollments,
      averageQuizScore,
      totalQuizScores,
      activeUsersThisWeek,
      totalTimeSpent
    ] = await Promise.all([
      Enrollment?.countDocuments({ status: 'completed' }) || Promise.resolve(0),
      QuizAttempt?.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
      ]).then(result => result[0]?.avgScore || 0) || Promise.resolve(0),
      QuizAttempt?.countDocuments() || Promise.resolve(0),
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Enrollment?.aggregate([
        { $group: { _id: null, totalTime: { $sum: '$totalTimeSpent' } } }
      ]).then(result => result[0]?.totalTime || 0) || Promise.resolve(0)
    ]);

    // Calculate revenue (mock data - would come from actual payment records)
    const revenueThisMonth = Math.floor(Math.random() * 50000) + 10000;

    // Calculate growth trends (percentage change from last month)
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      usersGrowth: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
      institutionsGrowth: calculateGrowth(newInstitutionsThisMonth, newInstitutionsLastMonth),
      coursesGrowth: calculateGrowth(newCoursesThisMonth, newCoursesLastMonth),
      approvalsChange: calculateGrowth(pendingApprovals, pendingApprovalsLastMonth)
    };

    // Calculate analytics metrics
    const analytics = {
      growthRate: trends.usersGrowth,
      revenueThisMonth,
      satisfactionRating: Math.min(5.0, Math.max(3.0, (averageQuizScore / 20) + 3.5)), // Convert quiz scores to 3-5 rating
      courseCompletionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      activeUsersThisWeek,
      averageQuizScore: Math.round(averageQuizScore),
      totalTimeSpentHours: Math.round(totalTimeSpent / 3600), // Convert seconds to hours
      platformUtilization: totalUsers > 0 ? Math.round((activeUsersThisWeek / totalUsers) * 100) : 0
    };

    // System health metrics
    const systemHealth = {
      database: 'connected',
      api: 'operational',
      totalStorage: '2.4 GB',
      activeConnections: Math.floor(Math.random() * 100) + 50,
      serverUptime: '15 days, 4 hours',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
      errorRate: '0.02%'
    };

    // If totalInstitutions is 0 but we know institutions exist, try a direct count
    let finalInstitutionCount = totalInstitutions;
    if (totalInstitutions === 0) {
      try {
        finalInstitutionCount = await Institution.countDocuments();
        console.log('🔧 Fallback institution count:', finalInstitutionCount);
      } catch (err) {
        console.error('❌ Fallback institution count failed:', err);
        finalInstitutionCount = 0;
      }
    }

    res.json({
      stats: {
        totalUsers,
        totalInstitutions: finalInstitutionCount,
        totalCourses,
        totalEnrollments,
        totalQuizzes,
        totalQuizAttempts,
        pendingApprovals,
        superAdmins,
        institutionAdmins,
        newUsersThisMonth,
        revenueThisMonth,
        completedEnrollments,
        activeUsersThisWeek,
        totalTimeSpentHours: analytics.totalTimeSpentHours
      },
      trends,
      analytics,
      recentUsers,
      recentActivities,
      institutionStats,
      systemHealth
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

// Manage user actions (approve, disapprove, pause, disable)
router.post('/manage-user/:userId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, notes } = req.body;

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow management of Admin and Moderator roles
    if (!['Admin', 'Moderator'].includes(user.role)) {
      return res.status(400).json({ message: 'Can only manage Admin and Moderator users' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = {
          approvalStatus: 'approved',
          isVerified: true,
          verifiedBy: req.user.userId,
          verifiedAt: new Date(),
          status: 'active',
          isActive: true
        };
        message = `${user.role} ${user.name} has been approved`;
        break;

      case 'disapprove':
        updateData = {
          approvalStatus: 'rejected',
          isVerified: false,
          status: 'inactive',
          isActive: false,
          rejectedBy: req.user.userId,
          rejectedAt: new Date(),
          rejectionReason: notes
        };
        message = `${user.role} ${user.name} has been disapproved`;
        break;

      case 'pause':
        updateData = {
          status: 'suspended',
          isActive: false,
          suspendedBy: req.user.userId,
          suspendedAt: new Date(),
          suspensionReason: notes
        };
        message = `${user.role} ${user.name} has been paused/suspended`;
        break;

      case 'disable':
        updateData = {
          isActive: false,
          status: 'disabled',
          disabledBy: req.user.userId,
          disabledAt: new Date(),
          disableReason: notes
        };
        message = `${user.role} ${user.name} has been disabled`;
        break;

      case 'enable':
        updateData = {
          isActive: true,
          status: 'active',
          enabledBy: req.user.userId,
          enabledAt: new Date()
        };
        message = `${user.role} ${user.name} has been enabled`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    // Add management notes if provided
    if (notes) {
      updateData.managementNotes = notes;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    // Log the action for audit trail
    console.log(`Super Admin ${req.user.userId} performed ${action} on user ${userId}: ${message}`);

    res.json({
      message,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        approvalStatus: updatedUser.approvalStatus,
        status: updatedUser.status,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error managing user:', error);
    res.status(500).json({ message: 'Error managing user' });
  }
});

module.exports = router;
