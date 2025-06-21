const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const QuizAttempt = require('../models/QuizAttempt');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Accessible by all authenticated users
router.get('/profile', auth, (req, res) => {
  res.json({ message: `Hello, ${req.user.role}` });
});

// @route   GET /api/user/activities
// @desc    Get user's activity logs with filtering and pagination
// @access  Private
router.get('/activities', auth, async (req, res) => {
  try {
    const {
      type,
      course,
      difficulty,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    if (isMongoConnected()) {
      const userId = req.user.userId;

      // Get user activities from the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const userActivities = await UserActivity.find({
        user: userId,
        date: { $gte: ninetyDaysAgo },
        hasActivity: true
      }).sort({ date: -1 });

      // Get quiz attempts
      const quizAttempts = await QuizAttempt.find({
        user: userId,
        status: 'completed',
        submittedAt: { $gte: ninetyDaysAgo }
      })
        .populate('quiz', 'title course category difficulty')
        .sort({ submittedAt: -1 });

      // Get assessment attempts
      const assessmentAttempts = await AssessmentAttempt.find({
        user: userId,
        status: 'completed',
        submittedAt: { $gte: ninetyDaysAgo }
      })
        .populate('assessment', 'title category difficulty')
        .sort({ submittedAt: -1 });

      // Get course progress
      const enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title category level')
        .sort({ lastAccessed: -1 });

      // Build comprehensive activity list
      const activities = [];

      // Add quiz activities
      quizAttempts.forEach(attempt => {
        activities.push({
          id: attempt._id,
          type: 'quiz',
          title: attempt.quiz?.title || 'Quiz Attempt',
          course: attempt.quiz?.course || 'Unknown Course',
          date: attempt.submittedAt.toISOString().split('T')[0],
          time: attempt.submittedAt.toLocaleTimeString(),
          duration: `${Math.round(attempt.timeSpent / 60)} minutes`,
          result: `${attempt.percentage}%`,
          pointsEarned: Math.round(attempt.percentage / 10),
          streakContribution: true,
          difficulty: attempt.quiz?.difficulty || 'Intermediate',
          icon: '🧠',
          status: attempt.passed ? 'completed' : 'failed',
          score: attempt.percentage,
          attempts: attempt.attemptNumber,
          perfectScore: attempt.percentage === 100,
          timeSpent: attempt.timeSpent
        });
      });

      // Add assessment activities
      assessmentAttempts.forEach(attempt => {
        activities.push({
          id: attempt._id,
          type: 'assessment',
          title: attempt.assessment?.title || 'Assessment',
          course: attempt.assessment?.category || 'General Assessment',
          date: attempt.submittedAt.toISOString().split('T')[0],
          time: attempt.submittedAt.toLocaleTimeString(),
          duration: `${Math.round(attempt.timeSpent / 60)} minutes`,
          result: attempt.passed ? 'Passed' : 'Failed',
          pointsEarned: Math.round(attempt.percentage / 5),
          streakContribution: true,
          difficulty: attempt.assessment?.difficulty || 'Intermediate',
          icon: '📊',
          status: attempt.passed ? 'completed' : 'failed',
          score: attempt.percentage,
          attempts: attempt.attemptNumber,
          perfectScore: attempt.percentage === 100,
          timeSpent: attempt.timeSpent
        });
      });

      // Add course progress activities
      userActivities.forEach(activity => {
        activity.activities.courses.progress.forEach(courseProgress => {
          const enrollment = enrollments.find(e => e.course._id.toString() === courseProgress.courseId.toString());
          if (enrollment) {
            activities.push({
              id: `course-${courseProgress._id}`,
              type: 'course',
              title: `Lesson Progress: ${enrollment.course.title}`,
              course: enrollment.course.title,
              date: courseProgress.timestamp.toISOString().split('T')[0],
              time: courseProgress.timestamp.toLocaleTimeString(),
              duration: `${Math.round(courseProgress.timeSpent / 60)} minutes`,
              result: `${courseProgress.lessonsCompleted} lessons completed`,
              pointsEarned: courseProgress.lessonsCompleted * 5,
              streakContribution: true,
              difficulty: enrollment.course.level || 'Beginner',
              icon: '📚',
              status: 'completed',
              score: null,
              attempts: 1,
              perfectScore: false,
              timeSpent: courseProgress.timeSpent
            });
          }
        });
      });

      // Apply filters
      let filteredActivities = activities;

      if (type && type !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === type);
      }

      if (course && course !== 'all') {
        filteredActivities = filteredActivities.filter(activity =>
          activity.course.toLowerCase().includes(course.toLowerCase())
        );
      }

      if (difficulty && difficulty !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.difficulty === difficulty);
      }

      if (search) {
        filteredActivities = filteredActivities.filter(activity =>
          activity.title.toLowerCase().includes(search.toLowerCase()) ||
          activity.course.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply sorting
      filteredActivities.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'date':
            aValue = new Date(a.date + ' ' + a.time);
            bValue = new Date(b.date + ' ' + b.time);
            break;
          case 'points':
            aValue = a.pointsEarned;
            bValue = b.pointsEarned;
            break;
          case 'duration':
            aValue = parseInt(a.duration);
            bValue = parseInt(b.duration);
            break;
          case 'score':
            aValue = a.score || 0;
            bValue = b.score || 0;
            break;
          default:
            aValue = a.title;
            bValue = b.title;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

      // Calculate analytics
      const analytics = {
        totalActivities: activities.length,
        totalPoints: activities.reduce((sum, activity) => sum + activity.pointsEarned, 0),
        totalTime: activities.reduce((sum, activity) => sum + (activity.timeSpent || 0), 0),
        averageScore: activities.filter(a => a.score).reduce((sum, a, _, arr) => sum + a.score / arr.length, 0),
        streakDays: activities.filter(a => a.streakContribution).length,
        perfectScores: activities.filter(a => a.perfectScore).length,
        typeBreakdown: activities.reduce((acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        }, {}),
        difficultyBreakdown: activities.reduce((acc, activity) => {
          acc[activity.difficulty] = (acc[activity.difficulty] || 0) + 1;
          return acc;
        }, {})
      };

      res.json({
        activities: paginatedActivities,
        analytics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredActivities.length / limit),
          totalItems: filteredActivities.length,
          hasNext: endIndex < filteredActivities.length,
          hasPrev: startIndex > 0
        }
      });

    } else {
      // Mock data for when MongoDB is not connected
      const mockActivities = [
        {
          id: 1,
          type: 'quiz',
          title: 'JavaScript Fundamentals Quiz',
          course: 'Advanced JavaScript Concepts',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          duration: '45 minutes',
          result: '85%',
          pointsEarned: 25,
          streakContribution: true,
          difficulty: 'Intermediate',
          icon: '🧠',
          status: 'completed',
          score: 85,
          attempts: 1,
          perfectScore: false,
          timeSpent: 2700
        },
        {
          id: 2,
          type: 'course',
          title: 'React Basics Progress',
          course: 'Frontend Development',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: new Date(Date.now() - 86400000).toLocaleTimeString(),
          duration: '2 hours',
          result: '3 lessons completed',
          pointsEarned: 15,
          streakContribution: true,
          difficulty: 'Beginner',
          icon: '📚',
          status: 'completed',
          score: null,
          attempts: 1,
          perfectScore: false,
          timeSpent: 7200
        }
      ];

      const analytics = {
        totalActivities: mockActivities.length,
        totalPoints: mockActivities.reduce((sum, activity) => sum + activity.pointsEarned, 0),
        totalTime: mockActivities.reduce((sum, activity) => sum + (activity.timeSpent || 0), 0),
        averageScore: mockActivities.filter(a => a.score).reduce((sum, a, _, arr) => sum + a.score / arr.length, 0),
        streakDays: mockActivities.filter(a => a.streakContribution).length,
        perfectScores: mockActivities.filter(a => a.perfectScore).length,
        typeBreakdown: { quiz: 1, course: 1 },
        difficultyBreakdown: { Intermediate: 1, Beginner: 1 }
      };

      res.json({
        activities: mockActivities,
        analytics,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockActivities.length,
          hasNext: false,
          hasPrev: false
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Only for Instructors
router.get('/instructor', auth, roleCheck(['Instructor']), (req, res) => {
  res.json({ message: 'Welcome, Instructor!' });
});

// Only for Admins
router.get('/admin', auth, roleCheck(['Admin']), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

// Update username
router.put('/username', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    const normalizedUsername = username.toLowerCase();

    if (isMongoConnected()) {
      // Check if username already exists (excluding current user)
      const existingUser = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update username
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username: normalizedUsername },
        { new: true, select: '-password' }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Username updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      // For development mode with in-memory storage
      const authModule = require('./auth');
      const inMemoryUsers = authModule.inMemoryUsers || [];

      // Check if username already exists (excluding current user)
      const existingUser = inMemoryUsers.find(u =>
        u.username === normalizedUsername && u._id !== userId
      );

      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update username in memory
      const userIndex = inMemoryUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      inMemoryUsers[userIndex].username = normalizedUsername;

      res.json({
        message: 'Username updated successfully (development mode)',
        user: {
          id: inMemoryUsers[userIndex]._id,
          name: inMemoryUsers[userIndex].name,
          username: inMemoryUsers[userIndex].username,
          email: inMemoryUsers[userIndex].email,
          role: inMemoryUsers[userIndex].role
        }
      });
    }
  } catch (err) {
    console.error('Username update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update phone number
router.put('/phone', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    if (isMongoConnected()) {
      // Check if phone number already exists (excluding current user)
      const existingUser = await User.findOne({
        phoneNumber: phoneNumber,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({
          message: '📱 Ring ring! That phone number is already connected to another learner\'s adventure. Please dial up a different number!'
        });
      }

      // Update phone number
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { phoneNumber: phoneNumber },
        { new: true, select: '-password' }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Phone number updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          role: updatedUser.role
        }
      });
    } else {
      // For development mode with in-memory storage
      const authModule = require('./auth');
      const inMemoryUsers = authModule.inMemoryUsers || [];

      // Check if phone number already exists (excluding current user)
      const existingUser = inMemoryUsers.find(u =>
        u.phoneNumber === phoneNumber && u._id !== userId
      );

      if (existingUser) {
        return res.status(400).json({
          message: '📱 Ring ring! That phone number is already connected to another learner\'s adventure. Please dial up a different number!'
        });
      }

      // Update phone number in memory
      const userIndex = inMemoryUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      inMemoryUsers[userIndex].phoneNumber = phoneNumber;

      res.json({
        message: 'Phone number updated successfully (development mode)',
        user: {
          id: inMemoryUsers[userIndex]._id,
          name: inMemoryUsers[userIndex].name,
          username: inMemoryUsers[userIndex].username,
          email: inMemoryUsers[userIndex].email,
          phoneNumber: inMemoryUsers[userIndex].phoneNumber,
          role: inMemoryUsers[userIndex].role
        }
      });
    }
  } catch (err) {
    console.error('Phone number update error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;