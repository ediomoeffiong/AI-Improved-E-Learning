const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const NotificationReadStatus = require('../models/NotificationReadStatus');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private (with demo mode support)
router.get('/', async (req, res) => {
  try {
    console.log('📧 Notifications API called');

    // Check for demo mode or valid auth
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId, userRole, isDemoMode = false;

    console.log('🔑 Token received:', token ? 'Present' : 'None');

    if (token === 'demo-token' || !token) {
      // Demo mode - use default demo user
      userId = 'demo-user-id';
      userRole = 'Student';
      isDemoMode = true;
      console.log('🎭 Using demo mode for notifications');
    } else {
      // Try to verify the token
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        userId = decoded.userId;
        userRole = decoded.role;
        console.log('✅ Valid token, user role:', userRole);
      } catch (err) {
        // If token is invalid, fall back to demo mode
        userId = 'demo-user-id';
        userRole = 'Student';
        isDemoMode = true;
        console.log('❌ Invalid token, falling back to demo mode');
      }
    }

    const { limit = 10, unreadOnly = false } = req.query;

    if (isMongoConnected() && !isDemoMode) {
      const notifications = [];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Role-based notifications
      if (userRole === 'Admin' || userRole === 'Super Admin' || userRole === 'Moderator') {
        // Admin notifications: new user registrations, pending approvals
        const pendingUsers = await User.find({ 
          approvalStatus: 'pending',
          createdAt: { $gte: oneWeekAgo }
        }).sort({ createdAt: -1 }).limit(5);

        pendingUsers.forEach(user => {
          notifications.push({
            id: `approval_${user._id}`,
            type: 'user_approval',
            title: 'New User Registration',
            message: `${user.name} (${user.role}) needs approval`,
            data: { userId: user._id, userRole: user.role },
            timestamp: user.createdAt,
            isRead: false,
            priority: 'high',
            icon: 'user-plus'
          });
        });

        // Recent enrollments
        const recentEnrollments = await Enrollment.find({
          createdAt: { $gte: oneDayAgo }
        })
        .populate('user', 'name')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(3);

        recentEnrollments.forEach(enrollment => {
          notifications.push({
            id: `enrollment_${enrollment._id}`,
            type: 'enrollment',
            title: 'New Course Enrollment',
            message: `${enrollment.user.name} enrolled in ${enrollment.course.title}`,
            data: { enrollmentId: enrollment._id, courseId: enrollment.course._id },
            timestamp: enrollment.createdAt,
            isRead: false,
            priority: 'medium',
            icon: 'academic-cap'
          });
        });
      }

      if (userRole === 'Student') {
        // Student notifications: course updates, quiz results, achievements
        const userEnrollments = await Enrollment.find({ user: userId })
          .populate('course', 'title lastUpdated')
          .sort({ createdAt: -1 });

        // Check for course updates
        userEnrollments.forEach(enrollment => {
          if (enrollment.course.lastUpdated > oneDayAgo) {
            notifications.push({
              id: `course_update_${enrollment.course._id}`,
              type: 'course_update',
              title: 'Course Updated',
              message: `${enrollment.course.title} has new content`,
              data: { courseId: enrollment.course._id },
              timestamp: enrollment.course.lastUpdated,
              isRead: false,
              priority: 'medium',
              icon: 'book-open'
            });
          }
        });

        // Recent quiz attempts
        const recentQuizAttempts = await QuizAttempt.find({
          user: userId,
          status: 'completed',
          submittedAt: { $gte: oneDayAgo }
        })
        .populate('quiz', 'title')
        .sort({ submittedAt: -1 })
        .limit(3);

        recentQuizAttempts.forEach(attempt => {
          const passed = attempt.percentage >= (attempt.quiz.passingScore || 70);
          notifications.push({
            id: `quiz_result_${attempt._id}`,
            type: 'quiz_result',
            title: passed ? 'Quiz Passed!' : 'Quiz Completed',
            message: `You scored ${attempt.percentage}% on ${attempt.quiz.title}`,
            data: { attemptId: attempt._id, quizId: attempt.quiz._id },
            timestamp: attempt.submittedAt,
            isRead: false,
            priority: passed ? 'high' : 'medium',
            icon: passed ? 'check-circle' : 'clock'
          });
        });
      }

      // System notifications for all users
      const systemNotifications = [
        {
          id: 'system_welcome',
          type: 'system',
          title: 'Welcome to AI E-Learning!',
          message: 'Explore our courses and start your learning journey',
          data: {},
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
          priority: 'low',
          icon: 'sparkles'
        }
      ];

      notifications.push(...systemNotifications);

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Check read status from database and update notifications
      if (notifications.length > 0) {
        try {
          const notificationIds = notifications.map(n => n.id);
          const readNotificationIds = await NotificationReadStatus.getReadStatus(userId, notificationIds);

          // Update isRead status based on database records
          notifications.forEach(notification => {
            if (readNotificationIds.includes(notification.id)) {
              notification.isRead = true;
            }
          });
        } catch (error) {
          console.error('Error checking read status:', error);
          // Continue with default isRead values if database check fails
        }
      }

      // Filter unread if requested
      const filteredNotifications = unreadOnly === 'true'
        ? notifications.filter(n => !n.isRead)
        : notifications;

      // Apply limit
      const limitedNotifications = filteredNotifications.slice(0, parseInt(limit));

      res.json({
        notifications: limitedNotifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        totalCount: notifications.length
      });

    } else {
      // Mock notifications for demo mode
      const now = new Date(); // Define now for demo mode
      const mockNotifications = [
        {
          id: 'mock_1',
          type: 'user_approval',
          title: 'New User Registration',
          message: 'John Doe (Student) needs approval',
          data: { userId: 'demo-user-1' },
          timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
          isRead: false,
          priority: 'high',
          icon: 'user-plus'
        },
        {
          id: 'mock_2',
          type: 'enrollment',
          title: 'New Course Enrollment',
          message: 'Sarah Smith enrolled in React Fundamentals',
          data: { enrollmentId: 'demo-enrollment-1' },
          timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
          priority: 'medium',
          icon: 'academic-cap'
        },
        {
          id: 'mock_3',
          type: 'quiz_result',
          title: 'Quiz Completed',
          message: 'You scored 85% on JavaScript Basics',
          data: { attemptId: 'demo-attempt-1' },
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: true,
          priority: 'medium',
          icon: 'check-circle'
        },
        {
          id: 'mock_4',
          type: 'system',
          title: 'Welcome to Demo Mode!',
          message: 'You are viewing sample data for demonstration',
          data: {},
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
          isRead: false,
          priority: 'low',
          icon: 'sparkles'
        }
      ];

      // Check read status from database for mock notifications too
      try {
        const notificationIds = mockNotifications.map(n => n.id);
        const readNotificationIds = await NotificationReadStatus.getReadStatus(userId, notificationIds);

        // Update isRead status based on database records
        mockNotifications.forEach(notification => {
          if (readNotificationIds.includes(notification.id)) {
            notification.isRead = true;
          }
        });
      } catch (error) {
        console.error('Error checking read status for mock notifications:', error);
        // Continue with default isRead values if database check fails
      }

      const filteredNotifications = unreadOnly === 'true'
        ? mockNotifications.filter(n => !n.isRead)
        : mockNotifications;

      const limitedNotifications = filteredNotifications.slice(0, parseInt(limit));

      res.json({
        notifications: limitedNotifications,
        unreadCount: mockNotifications.filter(n => !n.isRead).length,
        totalCount: mockNotifications.length
      });
    }

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (with demo mode support)
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Check for demo mode or valid auth
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId;

    if (token === 'demo-token' || !token) {
      // Demo mode - use default demo user
      userId = 'demo-user-id';
    } else {
      // Try to verify the token
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        userId = decoded.userId;
      } catch (err) {
        // If token is invalid, fall back to demo mode
        userId = 'demo-user-id';
      }
    }

    // Mark notification as read in database
    await NotificationReadStatus.markAsRead(userId, notificationId);

    console.log(`✅ Marked notification ${notificationId} as read for user ${userId}`);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private (with demo mode support)
router.put('/mark-all-read', async (req, res) => {
  try {
    // Check for demo mode or valid auth
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId, userRole, isDemoMode = false;

    if (token === 'demo-token' || !token) {
      // Demo mode - use default demo user
      userId = 'demo-user-id';
      userRole = 'Student';
      isDemoMode = true;
    } else {
      // Try to verify the token
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        userId = decoded.userId;
        userRole = decoded.role;
      } catch (err) {
        // If token is invalid, fall back to demo mode
        userId = 'demo-user-id';
        userRole = 'Student';
      }
    }

    // Get all current notification IDs for this user to mark them as read
    // We need to regenerate the notifications to get their IDs
    const notifications = [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (isMongoConnected() && !isDemoMode) {
      // Generate the same notifications as in the GET endpoint to get their IDs
      if (userRole === 'Admin' || userRole === 'Super Admin' || userRole === 'Moderator') {
        const pendingUsers = await User.find({
          approvalStatus: 'pending',
          createdAt: { $gte: oneWeekAgo }
        }).sort({ createdAt: -1 }).limit(5);

        pendingUsers.forEach(user => {
          notifications.push({ id: `approval_${user._id}` });
        });

        const recentEnrollments = await Enrollment.find({
          createdAt: { $gte: oneDayAgo }
        }).populate('user', 'name').populate('course', 'title').sort({ createdAt: -1 }).limit(3);

        recentEnrollments.forEach(enrollment => {
          notifications.push({ id: `enrollment_${enrollment._id}` });
        });
      }

      if (userRole === 'Student') {
        const userEnrollments = await Enrollment.find({ user: userId })
          .populate('course', 'title lastUpdated')
          .sort({ createdAt: -1 });

        userEnrollments.forEach(enrollment => {
          if (enrollment.course.lastUpdated > oneDayAgo) {
            notifications.push({ id: `course_update_${enrollment.course._id}` });
          }
        });

        const recentQuizAttempts = await QuizAttempt.find({
          user: userId,
          submittedAt: { $gte: oneDayAgo }
        }).populate('quiz', 'title passingScore').sort({ submittedAt: -1 }).limit(3);

        recentQuizAttempts.forEach(attempt => {
          notifications.push({ id: `quiz_result_${attempt._id}` });
        });
      }

      // Add system notifications
      const systemNotifications = [
        { id: 'system_maintenance' },
        { id: 'system_update' }
      ];
      notifications.push(...systemNotifications);
    } else {
      // Mock notification IDs for demo mode
      const mockNotificationIds = ['mock_1', 'mock_2', 'mock_3', 'mock_4'];
      mockNotificationIds.forEach(id => {
        notifications.push({ id });
      });
    }

    // Extract notification IDs and mark them all as read
    const notificationIds = notifications.map(n => n.id);
    if (notificationIds.length > 0) {
      await NotificationReadStatus.markAllAsRead(userId, notificationIds);
      console.log(`✅ Marked ${notificationIds.length} notifications as read for user ${userId}`);
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

module.exports = router;
