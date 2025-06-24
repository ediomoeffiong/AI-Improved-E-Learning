const express = require('express');
const auth = require('../middleware/auth');
const { authWithUser } = require('../middleware/auth');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const UserActivity = require('../models/UserActivity');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Assessment = require('../models/Assessment');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// @route   GET /api/dashboard
// @desc    Get comprehensive dashboard data for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const userId = req.user.userId;

      // Get user's enrollments with course details
      const enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title description instructor category level duration price thumbnail')
        .sort({ lastAccessed: -1 });

      // Get user's quiz attempts
      const quizAttempts = await QuizAttempt.find({ user: userId, status: 'completed' })
        .populate('quiz', 'title course category difficulty')
        .sort({ submittedAt: -1 })
        .limit(10);

      // Get user's assessment attempts
      const assessmentAttempts = await AssessmentAttempt.find({ user: userId, status: 'completed' })
        .populate('assessment', 'title category difficulty')
        .sort({ submittedAt: -1 })
        .limit(10);

      // Calculate streak data - handle case where UserActivity.calculateStreak might not exist
      let streakData = { currentStreak: 0, longestStreak: 0 };
      try {
        if (UserActivity.calculateStreak) {
          streakData = await UserActivity.calculateStreak(userId);
        }
      } catch (error) {
        console.log('Streak calculation not available, using default values');
      }

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivities = await UserActivity.find({
        user: userId,
        date: { $gte: sevenDaysAgo },
        hasActivity: true
      }).sort({ date: -1 }).catch(() => []);

      // Calculate statistics with safe defaults
      const stats = {
        // Course stats
        totalCourses: enrollments.length || 0,
        completedCourses: enrollments.filter(e => e.status === 'completed').length || 0,
        inProgressCourses: enrollments.filter(e => e.status === 'in-progress').length || 0,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0,

        // Quiz stats
        totalQuizzes: quizAttempts.length || 0,
        averageQuizScore: quizAttempts.length > 0
          ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / quizAttempts.length)
          : 0,

        // Assessment stats
        totalAssessments: assessmentAttempts.length || 0,
        averageAssessmentScore: assessmentAttempts.length > 0
          ? Math.round(assessmentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessmentAttempts.length)
          : 0,

        // Time stats (convert to minutes)
        totalTimeSpent: Math.round((
          enrollments.reduce((sum, e) => sum + (e.totalTimeSpent || 0), 0) +
          quizAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) +
          assessmentAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
        ) / 60) || 0,

        // Streak stats
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,

        // Activity stats
        activeDaysThisWeek: recentActivities.length || 0,
        totalActivities: recentActivities.reduce((sum, activity) => {
          if (activity.activities) {
            return sum + (activity.activities.quizzes?.count || 0) +
                       (activity.activities.courses?.count || 0) +
                       (activity.activities.assessments?.count || 0);
          }
          return sum;
        }, 0) || 0
      };

      // Format course progress data with safe defaults
      const courseProgress = enrollments.slice(0, 5).map(enrollment => ({
        id: enrollment.course._id,
        name: enrollment.course.title || 'Untitled Course',
        instructor: enrollment.course.instructor || 'Unknown Instructor',
        progress: enrollment.progress || 0,
        status: enrollment.status || 'not-started',
        lastAccessed: enrollment.lastAccessed || enrollment.createdAt || new Date(),
        thumbnail: enrollment.course.thumbnail || null,
        category: enrollment.course.category || 'General',
        completedLessons: enrollment.completedLessons || 0,
        totalLessons: enrollment.totalLessons || 0
      }));

      // Format recent activities
      const recentActivityList = [];
      
      // Add recent quiz attempts with safe defaults
      quizAttempts.slice(0, 5).forEach(attempt => {
        if (attempt.quiz) {
          recentActivityList.push({
            id: attempt._id,
            type: 'quiz',
            title: attempt.quiz.title || 'Quiz',
            course: attempt.quiz.course || null,
            score: attempt.percentage || 0,
            status: attempt.passed ? 'Passed' : 'Failed',
            date: attempt.submittedAt || attempt.createdAt || new Date(),
            timeSpent: attempt.timeSpent || 0,
            difficulty: attempt.quiz.difficulty || 'Unknown'
          });
        }
      });

      // Add recent assessment attempts with safe defaults
      assessmentAttempts.slice(0, 5).forEach(attempt => {
        if (attempt.assessment) {
          recentActivityList.push({
            id: attempt._id,
            type: 'assessment',
            title: attempt.assessment.title || 'Assessment',
            score: attempt.percentage || 0,
            status: attempt.passed ? 'Passed' : 'Failed',
            date: attempt.submittedAt || attempt.createdAt || new Date(),
            timeSpent: attempt.timeSpent || 0,
            difficulty: attempt.assessment.difficulty || 'Unknown'
          });
        }
      });

      // Add recent course progress with safe defaults
      enrollments.filter(e => e.lastAccessed && e.lastAccessed > sevenDaysAgo).slice(0, 3).forEach(enrollment => {
        if (enrollment.course) {
          recentActivityList.push({
            id: enrollment._id,
            type: 'course',
            title: enrollment.course.title || 'Course',
            progress: enrollment.progress || 0,
            status: enrollment.status || 'not-started',
            date: enrollment.lastAccessed || enrollment.createdAt || new Date(),
            timeSpent: enrollment.totalTimeSpent || 0
          });
        }
      });

      // Sort recent activities by date
      recentActivityList.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Get upcoming events/deadlines (can be enhanced with real data later)
      const upcomingEvents = [];

      // Add course deadlines if any courses have due dates
      enrollments.forEach(enrollment => {
        if (enrollment.course && enrollment.status === 'in-progress') {
          // For now, we'll create a generic completion reminder
          upcomingEvents.push({
            id: `course-${enrollment._id}`,
            title: `Continue ${enrollment.course.title}`,
            type: 'course_reminder',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            priority: enrollment.progress > 50 ? 'medium' : 'low'
          });
        }
      });

      // Prepare weekly activity data with safe defaults
      const weeklyActivity = recentActivities.map(activity => ({
        date: activity.date || new Date(),
        totalActivities: activity.activities ? (
          (activity.activities.quizzes?.count || 0) +
          (activity.activities.courses?.count || 0) +
          (activity.activities.assessments?.count || 0)
        ) : 0,
        timeSpent: activity.totalTimeSpent || 0
      }));

      console.log('Dashboard data prepared for user:', userId);
      console.log('Stats:', stats);
      console.log('Course Progress count:', courseProgress.length);
      console.log('Recent Activities count:', recentActivityList.length);

      res.json({
        stats,
        courseProgress,
        recentActivities: recentActivityList.slice(0, 10),
        upcomingEvents: upcomingEvents.slice(0, 5),
        streakData,
        weeklyActivity
      });

    } else {
      // Return empty dashboard data when MongoDB is not connected (for new users)
      console.log('MongoDB not connected, returning empty dashboard data for user:', req.user.id);
      const emptyDashboardData = {
        stats: {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          averageProgress: 0,
          totalQuizzes: 0,
          averageQuizScore: 0,
          totalAssessments: 0,
          averageAssessmentScore: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
          activeDaysThisWeek: 0,
          totalActivities: 0
        },
        courseProgress: [],
        recentActivities: [],
        upcomingEvents: [],
        streakData: { currentStreak: 0, longestStreak: 0 },
        weeklyActivity: []
      };

      res.json(emptyDashboardData);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    // Return empty dashboard structure even on error to prevent frontend crashes
    const errorDashboard = {
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0,
        totalQuizzes: 0,
        averageQuizScore: 0,
        totalAssessments: 0,
        averageAssessmentScore: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        activeDaysThisWeek: 0,
        totalActivities: 0
      },
      courseProgress: [],
      recentActivities: [],
      upcomingEvents: [],
      streakData: { currentStreak: 0, longestStreak: 0 },
      weeklyActivity: [],
      error: 'Unable to load dashboard data at this time'
    };

    res.status(200).json(errorDashboard); // Return 200 with error message instead of 500
  }
});

// Admin Dashboard Data
router.get('/admin', authWithUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.userDetails?.role || req.user.role;

    console.log('Fetching admin dashboard data for user:', userId, 'role:', userRole);

    // Check if user has admin privileges
    if (!['Admin', 'Moderator', 'Super Admin', 'Super Moderator'].includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (isMongoConnected()) {
      // Get institution-specific data for Institution Admins/Moderators
      let institutionFilter = {};
      if (userRole === 'Admin' || userRole === 'Moderator') {
        // For institution admins/moderators, filter by their institution
        const currentUser = await User.findById(userId);
        if (currentUser && currentUser.institution) {
          institutionFilter = { institution: currentUser.institution };
        }
      }

      // Get user statistics
      const totalUsersQuery = userRole === 'Admin' || userRole === 'Moderator'
        ? User.countDocuments({ ...institutionFilter, role: { $in: ['Student', 'Instructor'] } })
        : User.countDocuments();

      const pendingApprovalsQuery = userRole === 'Admin' || userRole === 'Moderator'
        ? User.countDocuments({ ...institutionFilter, approvalStatus: 'pending' })
        : User.countDocuments({ approvalStatus: 'pending' });

      const activeUsersQuery = userRole === 'Admin' || userRole === 'Moderator'
        ? User.countDocuments({ ...institutionFilter, lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        : User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });

      // Get course statistics
      const totalCoursesQuery = Course.countDocuments(institutionFilter.institution ? { institution: institutionFilter.institution } : {});
      const publishedCoursesQuery = Course.countDocuments({
        ...(institutionFilter.institution ? { institution: institutionFilter.institution } : {}),
        status: 'published'
      });

      // Get enrollment statistics
      const totalEnrollmentsQuery = institutionFilter.institution
        ? Enrollment.countDocuments().populate('user', 'institution').then(enrollments =>
            enrollments.filter(e => e.user && e.user.institution === institutionFilter.institution).length)
        : Enrollment.countDocuments();

      // Get quiz statistics
      const totalQuizzesQuery = Quiz.countDocuments(institutionFilter.institution ? { institution: institutionFilter.institution } : {});
      const quizAttemptsQuery = institutionFilter.institution
        ? QuizAttempt.countDocuments().populate('user', 'institution').then(attempts =>
            attempts.filter(a => a.user && a.user.institution === institutionFilter.institution).length)
        : QuizAttempt.countDocuments();

      // Execute all queries
      const [
        totalUsers,
        pendingApprovals,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalQuizzes,
        quizAttempts
      ] = await Promise.all([
        totalUsersQuery,
        pendingApprovalsQuery,
        activeUsersQuery,
        totalCoursesQuery,
        publishedCoursesQuery,
        totalEnrollmentsQuery,
        totalQuizzesQuery,
        quizAttemptsQuery
      ]);

      // Get recent users (last 10)
      const recentUsersQuery = userRole === 'Admin' || userRole === 'Moderator'
        ? User.find(institutionFilter).sort({ createdAt: -1 }).limit(10).select('name email role createdAt approvalStatus')
        : User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt approvalStatus institution');

      const recentUsers = await recentUsersQuery;

      // Get recent activities (enrollments, quiz attempts)
      const recentEnrollments = await Enrollment.find(institutionFilter.institution ? {} : {})
        .populate('user', 'name email institution')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentQuizAttempts = await QuizAttempt.find()
        .populate('user', 'name email institution')
        .populate('quiz', 'title')
        .sort({ submittedAt: -1 })
        .limit(5);

      // Filter activities by institution if needed
      const filteredEnrollments = institutionFilter.institution
        ? recentEnrollments.filter(e => e.user && e.user.institution === institutionFilter.institution)
        : recentEnrollments;

      const filteredQuizAttempts = institutionFilter.institution
        ? recentQuizAttempts.filter(a => a.user && a.user.institution === institutionFilter.institution)
        : recentQuizAttempts;

      // Combine and format recent activities
      const recentActivities = [
        ...filteredEnrollments.map(enrollment => ({
          id: enrollment._id,
          type: 'enrollment',
          user: enrollment.user?.name || 'Unknown User',
          userEmail: enrollment.user?.email || '',
          title: `Enrolled in ${enrollment.course?.title || 'Unknown Course'}`,
          date: enrollment.createdAt,
          status: enrollment.status || 'active'
        })),
        ...filteredQuizAttempts.map(attempt => ({
          id: attempt._id,
          type: 'quiz',
          user: attempt.user?.name || 'Unknown User',
          userEmail: attempt.user?.email || '',
          title: `Completed ${attempt.quiz?.title || 'Unknown Quiz'}`,
          date: attempt.submittedAt,
          score: attempt.percentage || 0,
          status: attempt.passed ? 'passed' : 'failed'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      const adminStats = {
        totalUsers: totalUsers || 0,
        pendingApprovals: pendingApprovals || 0,
        activeUsers: activeUsers || 0,
        totalCourses: totalCourses || 0,
        publishedCourses: publishedCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalQuizzes: totalQuizzes || 0,
        quizAttempts: quizAttempts || 0,
        userRole: userRole,
        institutionName: req.userDetails?.institution?.name || req.userDetails?.institution || 'Platform Wide'
      };

      console.log('Admin dashboard data prepared:', adminStats);

      res.json({
        stats: adminStats,
        recentUsers: recentUsers || [],
        recentActivities: recentActivities || [],
        systemHealth: {
          database: 'connected',
          api: 'operational',
          lastUpdated: new Date()
        }
      });

    } else {
      // Return empty admin dashboard data when MongoDB is not connected
      console.log('MongoDB not connected, returning empty admin dashboard data');
      const emptyAdminData = {
        stats: {
          totalUsers: 0,
          pendingApprovals: 0,
          activeUsers: 0,
          totalCourses: 0,
          publishedCourses: 0,
          totalEnrollments: 0,
          totalQuizzes: 0,
          quizAttempts: 0,
          userRole: userRole,
          institutionName: 'Platform Wide'
        },
        recentUsers: [],
        recentActivities: [],
        systemHealth: {
          database: 'disconnected',
          api: 'limited',
          lastUpdated: new Date()
        }
      };

      res.json(emptyAdminData);
    }

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);

    // Return empty admin dashboard structure even on error
    const errorAdminData = {
      stats: {
        totalUsers: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        totalCourses: 0,
        publishedCourses: 0,
        totalEnrollments: 0,
        totalQuizzes: 0,
        quizAttempts: 0,
        userRole: req.userDetails?.role || req.user?.role || 'Unknown',
        institutionName: req.userDetails?.institution?.name || req.userDetails?.institution || 'Platform Wide'
      },
      recentUsers: [],
      recentActivities: [],
      systemHealth: {
        database: 'error',
        api: 'error',
        lastUpdated: new Date()
      },
      error: 'Unable to load admin dashboard data at this time'
    };

    res.status(200).json(errorAdminData);
  }
});

// Super Admin Dashboard Data
router.get('/super-admin', authWithUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.userDetails?.role || req.user.role;

    console.log('Fetching super admin dashboard data for user:', userId, 'role:', userRole);

    // Check if user is Super Admin
    if (userRole !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
    }

    if (isMongoConnected()) {
      // Get platform-wide statistics
      const [
        totalUsers,
        totalInstitutions,
        totalCourses,
        totalEnrollments,
        totalQuizzes,
        totalQuizAttempts,
        pendingApprovals,
        activeUsers,
        newUsersThisMonth,
        revenueThisMonth
      ] = await Promise.all([
        User.countDocuments(),
        User.distinct('institution').then(institutions => institutions.filter(i => i).length),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Quiz.countDocuments(),
        QuizAttempt.countDocuments(),
        User.countDocuments({ approvalStatus: 'pending' }),
        User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        Enrollment.aggregate([
          { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
          { $unwind: '$courseData' },
          { $group: { _id: null, total: { $sum: '$courseData.price' } } }
        ]).then(result => result[0]?.total || 0)
      ]);

      // Get recent platform activities
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role institution createdAt approvalStatus');

      const recentEnrollments = await Enrollment.find()
        .populate('user', 'name email institution')
        .populate('course', 'title price')
        .sort({ createdAt: -1 })
        .limit(10);

      const recentQuizAttempts = await QuizAttempt.find()
        .populate('user', 'name email institution')
        .populate('quiz', 'title')
        .sort({ submittedAt: -1 })
        .limit(10);

      // Get institution statistics
      const institutionStats = await User.aggregate([
        { $match: { institution: { $exists: true, $ne: null } } },
        { $group: {
          _id: '$institution',
          userCount: { $sum: 1 },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] } },
          studentCount: { $sum: { $cond: [{ $eq: ['$role', 'Student'] }, 1, 0] } },
          instructorCount: { $sum: { $cond: [{ $eq: ['$role', 'Instructor'] }, 1, 0] } }
        }},
        { $sort: { userCount: -1 } },
        { $limit: 10 }
      ]);

      // Get system health metrics
      const systemHealth = {
        database: 'connected',
        api: 'operational',
        totalStorage: '2.4 GB', // This would come from actual system metrics
        activeConnections: Math.floor(Math.random() * 100) + 50, // Mock data
        serverUptime: '15 days, 4 hours',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
        errorRate: '0.02%'
      };

      // Format recent activities
      const recentActivities = [
        ...recentEnrollments.map(enrollment => ({
          id: enrollment._id,
          type: 'enrollment',
          user: enrollment.user?.name || 'Unknown User',
          userEmail: enrollment.user?.email || '',
          institution: enrollment.user?.institution || 'Unknown',
          title: `Enrolled in ${enrollment.course?.title || 'Unknown Course'}`,
          date: enrollment.createdAt,
          revenue: enrollment.course?.price || 0
        })),
        ...recentQuizAttempts.map(attempt => ({
          id: attempt._id,
          type: 'quiz',
          user: attempt.user?.name || 'Unknown User',
          userEmail: attempt.user?.email || '',
          institution: attempt.user?.institution || 'Unknown',
          title: `Completed ${attempt.quiz?.title || 'Unknown Quiz'}`,
          date: attempt.submittedAt,
          score: attempt.percentage || 0
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

      const superAdminStats = {
        totalUsers: totalUsers || 0,
        totalInstitutions: totalInstitutions || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalQuizzes: totalQuizzes || 0,
        totalQuizAttempts: totalQuizAttempts || 0,
        pendingApprovals: pendingApprovals || 0,
        activeUsers: activeUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        revenueThisMonth: revenueThisMonth || 0,
        userRole: userRole
      };

      console.log('Super Admin dashboard data prepared:', superAdminStats);

      res.json({
        stats: superAdminStats,
        recentUsers: recentUsers || [],
        recentActivities: recentActivities || [],
        institutionStats: institutionStats || [],
        systemHealth: systemHealth
      });

    } else {
      // Return empty super admin dashboard data when MongoDB is not connected
      console.log('MongoDB not connected, returning empty super admin dashboard data');
      const emptySuperAdminData = {
        stats: {
          totalUsers: 0,
          totalInstitutions: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          totalQuizzes: 0,
          totalQuizAttempts: 0,
          pendingApprovals: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          revenueThisMonth: 0,
          userRole: userRole
        },
        recentUsers: [],
        recentActivities: [],
        institutionStats: [],
        systemHealth: {
          database: 'disconnected',
          api: 'limited',
          totalStorage: 'Unknown',
          activeConnections: 0,
          serverUptime: 'Unknown',
          lastBackup: null,
          errorRate: 'Unknown'
        }
      };

      res.json(emptySuperAdminData);
    }

  } catch (error) {
    console.error('Error fetching super admin dashboard data:', error);

    // Return empty super admin dashboard structure even on error
    const errorSuperAdminData = {
      stats: {
        totalUsers: 0,
        totalInstitutions: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalQuizzes: 0,
        totalQuizAttempts: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        revenueThisMonth: 0,
        userRole: req.userDetails?.role || req.user?.role || 'Unknown'
      },
      recentUsers: [],
      recentActivities: [],
      institutionStats: [],
      systemHealth: {
        database: 'error',
        api: 'error',
        totalStorage: 'Unknown',
        activeConnections: 0,
        serverUptime: 'Unknown',
        lastBackup: null,
        errorRate: 'Unknown'
      },
      error: 'Unable to load super admin dashboard data at this time'
    };

    res.status(200).json(errorSuperAdminData);
  }
});

// Super Moderator Dashboard Data
router.get('/super-moderator', authWithUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.userDetails?.role || req.user.role;

    console.log('Fetching super moderator dashboard data for user:', userId, 'role:', userRole);

    // Check if user is Super Moderator
    if (userRole !== 'Super Moderator') {
      return res.status(403).json({ message: 'Access denied. Super Moderator privileges required.' });
    }

    if (isMongoConnected()) {
      // Get moderation-specific statistics
      const [
        totalUsers,
        totalInstitutions,
        pendingApprovals,
        flaggedContent,
        moderationActions,
        reportsGenerated,
        suspendedUsers,
        activeReports
      ] = await Promise.all([
        User.countDocuments(),
        User.distinct('institution').then(institutions => institutions.filter(i => i).length),
        User.countDocuments({ approvalStatus: 'pending' }),
        // Mock flagged content - would come from a FlaggedContent model
        Promise.resolve(Math.floor(Math.random() * 20) + 5),
        // Mock moderation actions - would come from a ModerationAction model
        Promise.resolve(Math.floor(Math.random() * 100) + 50),
        // Mock reports - would come from a Report model
        Promise.resolve(Math.floor(Math.random() * 30) + 10),
        User.countDocuments({ status: 'suspended' }),
        // Mock active reports
        Promise.resolve(Math.floor(Math.random() * 15) + 3)
      ]);

      // Get recent moderation activities
      const recentUsers = await User.find({ approvalStatus: 'pending' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role institution createdAt approvalStatus');

      const recentActivities = await User.find()
        .sort({ updatedAt: -1 })
        .limit(15)
        .select('name email role institution updatedAt approvalStatus status');

      // Get institution oversight data
      const institutionOversight = await User.aggregate([
        { $match: { institution: { $exists: true, $ne: null } } },
        { $group: {
          _id: '$institution',
          totalUsers: { $sum: 1 },
          pendingUsers: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] } },
          suspendedUsers: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] } }
        }},
        { $sort: { totalUsers: -1 } },
        { $limit: 10 }
      ]);

      // Mock content moderation data (would come from actual content models)
      const contentModerationQueue = [
        {
          id: 1,
          type: 'course',
          title: 'Inappropriate Course Content',
          reporter: 'user@example.com',
          institution: 'University A',
          severity: 'high',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: 2,
          type: 'comment',
          title: 'Spam Comment Reported',
          reporter: 'student@example.com',
          institution: 'University B',
          severity: 'medium',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: 3,
          type: 'quiz',
          title: 'Plagiarized Quiz Content',
          reporter: 'instructor@example.com',
          institution: 'University C',
          severity: 'high',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'reviewing'
        }
      ];

      // System monitoring data
      const systemMonitoring = {
        database: 'connected',
        moderationQueue: 'active',
        api: 'operational',
        contentScanners: 'running',
        alertSystem: 'active',
        lastScan: new Date(Date.now() - 30 * 60 * 1000),
        queueProcessingTime: '2.3 seconds',
        falsePositiveRate: '3.2%'
      };

      // Format recent moderation activities
      const formattedActivities = recentActivities.map(user => ({
        id: user._id,
        type: 'user_update',
        user: user.name || 'Unknown User',
        userEmail: user.email || '',
        institution: user.institution || 'Unknown',
        action: user.approvalStatus === 'approved' ? 'User Approved' :
                user.status === 'suspended' ? 'User Suspended' : 'Profile Updated',
        date: user.updatedAt,
        status: user.approvalStatus || user.status || 'active'
      }));

      const superModeratorStats = {
        totalUsers: totalUsers || 0,
        totalInstitutions: totalInstitutions || 0,
        pendingApprovals: pendingApprovals || 0,
        flaggedContent: flaggedContent || 0,
        moderationActions: moderationActions || 0,
        reportsGenerated: reportsGenerated || 0,
        suspendedUsers: suspendedUsers || 0,
        activeReports: activeReports || 0,
        userRole: userRole
      };

      console.log('Super Moderator dashboard data prepared:', superModeratorStats);

      res.json({
        stats: superModeratorStats,
        recentUsers: recentUsers || [],
        recentActivities: formattedActivities || [],
        institutionOversight: institutionOversight || [],
        contentModerationQueue: contentModerationQueue || [],
        systemMonitoring: systemMonitoring
      });

    } else {
      // Return empty super moderator dashboard data when MongoDB is not connected
      console.log('MongoDB not connected, returning empty super moderator dashboard data');
      const emptySuperModeratorData = {
        stats: {
          totalUsers: 0,
          totalInstitutions: 0,
          pendingApprovals: 0,
          flaggedContent: 0,
          moderationActions: 0,
          reportsGenerated: 0,
          suspendedUsers: 0,
          activeReports: 0,
          userRole: userRole
        },
        recentUsers: [],
        recentActivities: [],
        institutionOversight: [],
        contentModerationQueue: [],
        systemMonitoring: {
          database: 'disconnected',
          moderationQueue: 'inactive',
          api: 'limited',
          contentScanners: 'offline',
          alertSystem: 'inactive',
          lastScan: null,
          queueProcessingTime: 'Unknown',
          falsePositiveRate: 'Unknown'
        }
      };

      res.json(emptySuperModeratorData);
    }

  } catch (error) {
    console.error('Error fetching super moderator dashboard data:', error);

    // Return empty super moderator dashboard structure even on error
    const errorSuperModeratorData = {
      stats: {
        totalUsers: 0,
        totalInstitutions: 0,
        pendingApprovals: 0,
        flaggedContent: 0,
        moderationActions: 0,
        reportsGenerated: 0,
        suspendedUsers: 0,
        activeReports: 0,
        userRole: req.userDetails?.role || req.user?.role || 'Unknown'
      },
      recentUsers: [],
      recentActivities: [],
      institutionOversight: [],
      contentModerationQueue: [],
      systemMonitoring: {
        database: 'error',
        moderationQueue: 'error',
        api: 'error',
        contentScanners: 'error',
        alertSystem: 'error',
        lastScan: null,
        queueProcessingTime: 'Unknown',
        falsePositiveRate: 'Unknown'
      },
      error: 'Unable to load super moderator dashboard data at this time'
    };

    res.status(200).json(errorSuperModeratorData);
  }
});

// Super Admin User Management API
router.get('/super-admin/users', authWithUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.userDetails?.role || req.user.role;

    console.log('Fetching super admin users data for user:', userId, 'role:', userRole);

    // Check if user is Super Admin
    if (userRole !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
    }

    if (isMongoConnected()) {
      // Get all users with detailed information
      const users = await User.find()
        .select('name email role institution approvalStatus status createdAt lastLogin')
        .sort({ createdAt: -1 });

      // Get additional statistics for each user type
      const userStats = await Promise.all(
        users.map(async (user) => {
          let additionalStats = {};

          if (user.role === 'Student') {
            const enrollments = await Enrollment.countDocuments({ user: user._id });
            const quizAttempts = await QuizAttempt.countDocuments({ user: user._id });
            additionalStats = { coursesEnrolled: enrollments, quizzesTaken: quizAttempts };
          } else if (user.role === 'Instructor') {
            const courses = await Course.countDocuments({ instructor: user._id });
            const totalEnrollments = await Enrollment.countDocuments({
              course: { $in: await Course.find({ instructor: user._id }).distinct('_id') }
            });
            additionalStats = { coursesCreated: courses, studentsEnrolled: totalEnrollments };
          } else if (['Admin', 'Moderator'].includes(user.role)) {
            const institutionUsers = await User.countDocuments({
              institution: user.institution,
              _id: { $ne: user._id }
            });
            additionalStats = { usersManaged: institutionUsers };
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution || 'Not specified',
            approvalStatus: user.approvalStatus || 'approved',
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            ...additionalStats
          };
        })
      );

      // Calculate summary statistics
      const totalUsers = users.length;
      const pendingApprovals = users.filter(u => u.approvalStatus === 'pending').length;
      const suspendedUsers = users.filter(u => u.status === 'suspended').length;
      const adminsAndModerators = users.filter(u => ['Admin', 'Moderator'].includes(u.role)).length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const institutions = [...new Set(users.map(u => u.institution).filter(i => i))];

      console.log('Super Admin users data prepared:', {
        totalUsers,
        pendingApprovals,
        suspendedUsers,
        adminsAndModerators
      });

      res.json({
        users: userStats,
        summary: {
          totalUsers,
          pendingApprovals,
          suspendedUsers,
          adminsAndModerators,
          activeUsers,
          totalInstitutions: institutions.length
        },
        institutions: institutions.sort()
      });

    } else {
      // Return empty users data when MongoDB is not connected
      console.log('MongoDB not connected, returning empty users data');
      res.json({
        users: [],
        summary: {
          totalUsers: 0,
          pendingApprovals: 0,
          suspendedUsers: 0,
          adminsAndModerators: 0,
          activeUsers: 0,
          totalInstitutions: 0
        },
        institutions: []
      });
    }

  } catch (error) {
    console.error('Error fetching super admin users data:', error);
    res.status(500).json({
      message: 'Error fetching users data',
      users: [],
      summary: {
        totalUsers: 0,
        pendingApprovals: 0,
        suspendedUsers: 0,
        adminsAndModerators: 0,
        activeUsers: 0,
        totalInstitutions: 0
      },
      institutions: []
    });
  }
});

// Super Admin User Actions API
router.post('/super-admin/users/:userId/action', authWithUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.userDetails?.role || req.user.role;
    const targetUserId = req.params.userId;
    const { action } = req.body;

    console.log('Super admin user action:', { userId, userRole, targetUserId, action });

    // Check if user is Super Admin
    if (userRole !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
    }

    if (!['approve', 'suspend', 'activate', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve, suspend, activate, or reject.' });
    }

    if (isMongoConnected()) {
      // Find the target user
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Prevent super admin from modifying other super admins
      if (targetUser.role === 'Super Admin' || targetUser.role === 'Super Moderator') {
        return res.status(403).json({ message: 'Cannot modify Super Admin or Super Moderator accounts.' });
      }

      // Apply the action
      let updateData = {};
      let actionMessage = '';

      switch (action) {
        case 'approve':
          updateData = { approvalStatus: 'approved', status: 'active' };
          actionMessage = 'User approved successfully';
          break;
        case 'reject':
          updateData = { approvalStatus: 'rejected', status: 'inactive' };
          actionMessage = 'User rejected successfully';
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          actionMessage = 'User suspended successfully';
          break;
        case 'activate':
          updateData = { status: 'active' };
          actionMessage = 'User activated successfully';
          break;
      }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        targetUserId,
        updateData,
        { new: true, select: 'name email role institution approvalStatus status' }
      );

      console.log('User action completed:', { action, targetUserId, updateData });

      res.json({
        message: actionMessage,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          institution: updatedUser.institution,
          approvalStatus: updatedUser.approvalStatus,
          status: updatedUser.status
        }
      });

    } else {
      // Mock response when MongoDB is not connected
      console.log('MongoDB not connected, returning mock user action response');
      res.json({
        message: `User ${action} completed (demo mode)`,
        user: {
          id: targetUserId,
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'Student',
          institution: 'Demo University',
          approvalStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
          status: action === 'suspend' ? 'suspended' : action === 'activate' ? 'active' : 'active'
        }
      });
    }

  } catch (error) {
    console.error('Error performing user action:', error);
    res.status(500).json({ message: 'Error performing user action. Please try again.' });
  }
});

module.exports = router;
