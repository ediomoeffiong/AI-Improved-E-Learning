const express = require('express');
const auth = require('../middleware/auth');
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

      // Calculate streak data
      const streakData = await UserActivity.calculateStreak(userId);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivities = await UserActivity.find({
        user: userId,
        date: { $gte: sevenDaysAgo },
        hasActivity: true
      }).sort({ date: -1 });

      // Calculate statistics
      const stats = {
        // Course stats
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        inProgressCourses: enrollments.filter(e => e.status === 'in-progress').length,
        averageProgress: enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
          : 0,
        
        // Quiz stats
        totalQuizzes: quizAttempts.length,
        averageQuizScore: quizAttempts.length > 0
          ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
          : 0,
        
        // Assessment stats
        totalAssessments: assessmentAttempts.length,
        averageAssessmentScore: assessmentAttempts.length > 0
          ? Math.round(assessmentAttempts.reduce((sum, a) => sum + a.percentage, 0) / assessmentAttempts.length)
          : 0,
        
        // Time stats
        totalTimeSpent: enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0) +
                       quizAttempts.reduce((sum, a) => sum + a.timeSpent, 0) +
                       assessmentAttempts.reduce((sum, a) => sum + a.timeSpent, 0),
        
        // Streak stats
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        
        // Activity stats
        activeDaysThisWeek: recentActivities.length,
        totalActivities: recentActivities.reduce((sum, activity) => 
          sum + activity.activities.quizzes.count + 
          activity.activities.courses.count + 
          activity.activities.assessments.count, 0)
      };

      // Format course progress data
      const courseProgress = enrollments.slice(0, 5).map(enrollment => ({
        id: enrollment.course._id,
        name: enrollment.course.title,
        instructor: enrollment.course.instructor,
        progress: enrollment.progress,
        status: enrollment.status,
        lastAccessed: enrollment.lastAccessed,
        thumbnail: enrollment.course.thumbnail,
        category: enrollment.course.category,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons
      }));

      // Format recent activities
      const recentActivityList = [];
      
      // Add recent quiz attempts
      quizAttempts.slice(0, 5).forEach(attempt => {
        recentActivityList.push({
          id: attempt._id,
          type: 'quiz',
          title: attempt.quiz.title,
          course: attempt.quiz.course,
          score: attempt.percentage,
          status: attempt.passed ? 'Passed' : 'Failed',
          date: attempt.submittedAt,
          timeSpent: attempt.timeSpent,
          difficulty: attempt.quiz.difficulty
        });
      });

      // Add recent assessment attempts
      assessmentAttempts.slice(0, 5).forEach(attempt => {
        recentActivityList.push({
          id: attempt._id,
          type: 'assessment',
          title: attempt.assessment.title,
          score: attempt.percentage,
          status: attempt.passed ? 'Passed' : 'Failed',
          date: attempt.submittedAt,
          timeSpent: attempt.timeSpent,
          difficulty: attempt.assessment.difficulty
        });
      });

      // Add recent course progress
      enrollments.filter(e => e.lastAccessed > sevenDaysAgo).slice(0, 3).forEach(enrollment => {
        recentActivityList.push({
          id: enrollment._id,
          type: 'course',
          title: enrollment.course.title,
          progress: enrollment.progress,
          status: enrollment.status,
          date: enrollment.lastAccessed,
          timeSpent: enrollment.totalTimeSpent
        });
      });

      // Sort recent activities by date
      recentActivityList.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Get upcoming events/deadlines (mock for now, can be enhanced later)
      const upcomingEvents = [
        {
          id: 1,
          title: 'Complete React Course',
          type: 'course_deadline',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          priority: 'high'
        }
      ];

      res.json({
        stats,
        courseProgress,
        recentActivities: recentActivityList.slice(0, 10),
        upcomingEvents,
        streakData,
        weeklyActivity: recentActivities.map(activity => ({
          date: activity.date,
          totalActivities: activity.activities.quizzes.count + 
                          activity.activities.courses.count + 
                          activity.activities.assessments.count,
          timeSpent: activity.totalTimeSpent
        }))
      });

    } else {
      // Fallback to mock data when MongoDB is not connected
      const mockDashboardData = {
        stats: {
          totalCourses: 3,
          completedCourses: 1,
          inProgressCourses: 2,
          averageProgress: 70,
          totalQuizzes: 5,
          averageQuizScore: 85,
          totalAssessments: 2,
          averageAssessmentScore: 78,
          totalTimeSpent: 240,
          currentStreak: 7,
          longestStreak: 15,
          activeDaysThisWeek: 5,
          totalActivities: 12
        },
        courseProgress: [
          { id: 1, name: 'Introduction to React', instructor: 'John Doe', progress: 75, status: 'in-progress', lastAccessed: new Date(), category: 'Programming' },
          { id: 2, name: 'Advanced JavaScript', instructor: 'Jane Smith', progress: 45, status: 'in-progress', lastAccessed: new Date(), category: 'Programming' },
          { id: 3, name: 'UI/UX Design Principles', instructor: 'Mike Johnson', progress: 100, status: 'completed', lastAccessed: new Date(), category: 'Design' }
        ],
        recentActivities: [
          { id: 1, type: 'quiz', title: 'JavaScript Fundamentals', score: 85, status: 'Passed', date: new Date(), timeSpent: 15 },
          { id: 2, type: 'course', title: 'React Basics', progress: 75, status: 'in-progress', date: new Date(), timeSpent: 45 },
          { id: 3, type: 'assessment', title: 'Web Development Assessment', score: 78, status: 'Passed', date: new Date(), timeSpent: 30 }
        ],
        upcomingEvents: [
          { id: 1, title: 'Complete React Course', type: 'course_deadline', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: 'high' }
        ],
        streakData: { currentStreak: 7, longestStreak: 15 },
        weeklyActivity: [
          { date: new Date(), totalActivities: 3, timeSpent: 90 },
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000), totalActivities: 2, timeSpent: 60 }
        ]
      };

      res.json(mockDashboardData);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
