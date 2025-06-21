import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { dashboardAPI } from '../../services/api';



function ProgressDashboard() {
  const { isAuthenticated, getUserName } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [activeView, setActiveView] = useState('overview');
  const [showInsights, setShowInsights] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await dashboardAPI.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const handleQuickAction = (action) => {
    if (isAuthenticated()) {
      addPoints(5, `Quick action: ${action}`);
    }
  };

  // Helper function to get progress overview from real data
  const getProgressOverview = () => {
    if (!dashboardData) {
      return {
        coursesCompleted: 0,
        coursesInProgress: 0,
        totalQuizzesTaken: 0,
        averageScore: 0,
        totalHoursSpent: 0,
        lastActivity: 'No activity yet',
        totalPoints: userStats.points || 0,
        diamondsEarned: userStats.diamonds || 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectScores: 0,
        improvementRate: 0,
        studyEfficiency: 0,
        consistencyScore: 0,
        weeklyGoalCompletion: 0,
        monthlyProgress: 0,
        certificatesEarned: 0,
        skillsLearned: 0,
        totalAssignments: 0,
        assignmentsCompleted: 0
      };
    }

    const { stats, courseProgress, recentActivities, streakData } = dashboardData;

    return {
      coursesCompleted: stats.completedCourses || 0,
      coursesInProgress: stats.inProgressCourses || 0,
      totalQuizzesTaken: stats.totalQuizzes || 0,
      averageScore: stats.averageQuizScore || 0,
      totalHoursSpent: Math.round((stats.totalTimeSpent || 0) / 60), // Convert minutes to hours
      lastActivity: recentActivities && recentActivities.length > 0
        ? `${Math.floor((new Date() - new Date(recentActivities[0].date)) / (1000 * 60 * 60))} hours ago`
        : 'No recent activity',
      totalPoints: userStats.points || 0,
      diamondsEarned: userStats.diamonds || 0,
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      perfectScores: recentActivities && Array.isArray(recentActivities) ? recentActivities.filter(a =>
        (a.type === 'quiz' || a.type === 'assessment') && a.score === 100
      ).length : 0,
      improvementRate: stats.averageQuizScore > 0 ? Math.round(Math.random() * 20) : 0, // Placeholder calculation
      studyEfficiency: stats.totalTimeSpent > 0 ? Math.min(95, 60 + Math.round(stats.averageQuizScore / 3)) : 0,
      consistencyScore: streakData?.currentStreak > 0 ? Math.min(100, 50 + (streakData.currentStreak * 5)) : 0,
      weeklyGoalCompletion: stats.activeDaysThisWeek ? Math.round((stats.activeDaysThisWeek / 7) * 100) : 0,
      monthlyProgress: stats.totalActivities > 0 ? Math.min(100, stats.totalActivities * 8) : 0,
      certificatesEarned: courseProgress ? courseProgress.filter(c => c.status === 'completed').length : 0,
      skillsLearned: courseProgress ? courseProgress.length * 3 : 0, // Estimate 3 skills per course
      totalAssignments: stats.totalAssessments || 0,
      assignmentsCompleted: stats.totalAssessments || 0
    };
  };

  // Helper function to get course progress from real data
  const getCourseProgress = () => {
    if (!dashboardData || !dashboardData.courseProgress) {
      return [];
    }

    return dashboardData.courseProgress.map((course, index) => ({
      id: course._id || index,
      title: course.name || course.title || 'Untitled Course',
      progress: course.progress || 0,
      status: course.status === 'completed' ? 'Completed' :
              course.status === 'in-progress' ? 'In Progress' : 'Not Started',
      grade: course.progress === 100 ? 'A' : course.progress >= 80 ? 'B' : course.progress >= 60 ? 'C' : 'D',
      lastAccessed: course.lastAccessed ? new Date(course.lastAccessed).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      pointsEarned: Math.round(course.progress * 10), // Estimate points based on progress
      timeSpent: Math.round((course.totalTimeSpent || 0) / 60), // Convert minutes to hours
      difficulty: course.level || 'Beginner',
      instructor: course.instructor || 'Unknown Instructor',
      completionDate: course.completedAt ? new Date(course.completedAt).toISOString().split('T')[0] : null,
      certificateEarned: course.status === 'completed',
      skillsGained: course.category ? [course.category] : ['General Skills'],
      nextMilestone: course.progress < 100 ? `${100 - course.progress}% remaining` : null,
      icon: course.category === 'Programming' ? '💻' : course.category === 'Design' ? '🎨' : '📚',
      image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    }));
  };

  // Helper function to get recent activities from real data
  const getRecentActivities = () => {
    if (!dashboardData || !dashboardData.recentActivities || !Array.isArray(dashboardData.recentActivities)) {
      return [];
    }

    return dashboardData.recentActivities.slice(0, 10).map((activity, index) => ({
      id: activity.id || `activity-${index}`,
      type: activity.type || 'general',
      title: activity.title || 'Learning Activity',
      course: activity.course || 'Course Activity',
      date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: activity.date ? new Date(activity.date).toLocaleTimeString() : new Date().toLocaleTimeString(),
      result: activity.type === 'quiz' || activity.type === 'assessment'
        ? `${activity.score || 0}%`
        : activity.type === 'course'
          ? `${activity.progress || 0}% progress`
          : activity.status || 'Completed',
      pointsEarned: activity.type === 'quiz'
        ? Math.round((activity.score || 0) / 10)
        : activity.type === 'assessment'
          ? Math.round((activity.score || 0) / 5)
          : 5,
      streakContribution: true,
      icon: activity.type === 'quiz' ? '🧠' :
            activity.type === 'assessment' ? '📝' :
            activity.type === 'course' ? '📚' : '📖',
      difficulty: activity.difficulty || 'Intermediate'
    }));
  };

  // Helper function to get analytics data from real data
  const getAnalyticsData = () => {
    if (!dashboardData) {
      return {
        weeklyProgress: [],
        skillProgress: [],
        upcomingDeadlines: [],
        achievements: []
      };
    }

    const { weeklyActivity, courseProgress } = dashboardData;

    // Generate weekly progress from real data
    const weeklyProgress = weeklyActivity && Array.isArray(weeklyActivity) && weeklyActivity.length > 0
      ? weeklyActivity.slice(-7).map((day, index) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || 'Day',
          hours: Math.round((day.timeSpent || 0) / 60 * 10) / 10, // Convert minutes to hours
          points: (day.totalActivities || 0) * 25
        }))
      : Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          hours: 0,
          points: 0
        }));

    // Generate skill progress from course data
    const skillProgress = courseProgress && Array.isArray(courseProgress) && courseProgress.length > 0
      ? courseProgress.slice(0, 5).map(course => ({
          skill: course.category || 'General',
          level: course.progress || 0,
          improvement: course.progress > 0 ? `+${Math.round(course.progress / 10)}%` : '+0%'
        }))
      : [
          { skill: 'No Skills Yet', level: 0, improvement: '+0%' }
        ];

    return {
      weeklyProgress,
      skillProgress,
      upcomingDeadlines: [
        { id: 1, title: 'Continue Learning', course: 'Your Courses', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'medium' }
      ],
      achievements: [
        { id: 1, title: 'Getting Started', icon: '🎯', unlocked: dashboardData.stats.totalCourses > 0, date: new Date().toISOString().split('T')[0] },
        { id: 2, title: 'First Quiz', icon: '🧠', unlocked: dashboardData.stats.totalQuizzes > 0, date: new Date().toISOString().split('T')[0] },
        { id: 3, title: 'Course Completer', icon: '🎓', unlocked: dashboardData.stats.completedCourses > 0, date: new Date().toISOString().split('T')[0] },
        { id: 4, title: 'Streak Master', icon: '🔥', unlocked: (dashboardData.streakData?.currentStreak || 0) >= 7, progress: Math.min(100, (dashboardData.streakData?.currentStreak || 0) * 14) }
      ]
    };
  };

  // Get computed data with error handling
  let progressOverview, courseProgress, recentActivities, analyticsData;

  try {
    progressOverview = getProgressOverview();
    courseProgress = getCourseProgress();
    recentActivities = getRecentActivities();
    analyticsData = getAnalyticsData();
  } catch (err) {
    console.error('Error computing dashboard data:', err);
    // Provide fallback data
    progressOverview = {
      coursesCompleted: 0,
      coursesInProgress: 0,
      totalQuizzesTaken: 0,
      averageScore: 0,
      totalHoursSpent: 0,
      lastActivity: 'No activity yet',
      totalPoints: userStats.points || 0,
      diamondsEarned: userStats.diamonds || 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectScores: 0,
      improvementRate: 0,
      studyEfficiency: 0,
      consistencyScore: 0,
      weeklyGoalCompletion: 0,
      monthlyProgress: 0,
      certificatesEarned: 0,
      skillsLearned: 0,
      totalAssignments: 0,
      assignmentsCompleted: 0
    };
    courseProgress = [];
    recentActivities = [];
    analyticsData = {
      weeklyProgress: Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        hours: 0,
        points: 0
      })),
      skillProgress: [{ skill: 'No Skills Yet', level: 0, improvement: '+0%' }],
      upcomingDeadlines: [],
      achievements: []
    };
  }

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">📊 Progress Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Please sign in to view your learning progress and achievements.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-blue-700 dark:text-blue-300">Sign in to track your courses, quizzes, and learning achievements!</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Error Loading Dashboard</div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Progress Dashboard</h1>
              {isAuthenticated() && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  <span>💎 {userStats.diamonds}</span>
                  <span>⭐ {userStats.points}</span>
                  <span>🔥 {progressOverview.currentStreak}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isAuthenticated()
                ? `Welcome back, ${getUserName()}! Here's your learning progress overview`
                : 'Track your learning journey and achievements'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">🧠</span>
              {showInsights ? 'Hide' : 'Show'} AI Insights
            </button>
            <Link
              to="/progress/reports"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">📈</span>
              Detailed Reports
            </Link>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: '🎯 Overview', icon: '🎯' },
            { id: 'courses', label: '📚 Courses', icon: '📚' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'achievements', label: '🏆 Achievements', icon: '🏆' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* AI Insights Panel */}
        {showInsights && isAuthenticated() && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-indigo-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">AI Learning Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Study Pattern</div>
                    <div className="text-gray-700 dark:text-gray-300">Most productive on Thursdays</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">Recommendation</div>
                    <div className="text-gray-700 dark:text-gray-300">Focus on JavaScript practice</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Next Goal</div>
                    <div className="text-gray-700 dark:text-gray-300">Complete 2 more courses</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-orange-600 dark:text-orange-400 font-semibold">Efficiency</div>
                    <div className="text-gray-700 dark:text-gray-300">{progressOverview.studyEfficiency}% above average</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Progress Overview */}
      {(activeView === 'overview' || activeView === 'analytics') && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Progress Overview
          </h2>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Courses Completed</p>
                  <p className="text-4xl font-bold">{progressOverview.coursesCompleted}</p>
                  <p className="text-green-100 text-sm">🏆 {progressOverview.certificatesEarned} certificates</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">In Progress</p>
                  <p className="text-4xl font-bold">{progressOverview.coursesInProgress}</p>
                  <p className="text-blue-100 text-sm">📚 Active learning</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📖</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Average Score</p>
                  <p className="text-4xl font-bold">{progressOverview.averageScore}%</p>
                  <p className="text-purple-100 text-sm">🎯 Great performance</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Streak</p>
                  <p className="text-4xl font-bold">{progressOverview.currentStreak}</p>
                  <p className="text-orange-100 text-sm">🔥 days in a row</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🔥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progressOverview.totalQuizzesTaken}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{progressOverview.totalHoursSpent}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progressOverview.totalPoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progressOverview.perfectScores}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Perfect Scores</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progressOverview.skillsLearned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Skills Learned</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{progressOverview.studyEfficiency}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Course Progress */}
      {(activeView === 'overview' || activeView === 'courses') && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">📚</span>
              Course Progress
            </h2>
            <Link
              to="/courses/available"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">🔍</span>
              Browse Courses
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courseProgress.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {course.difficulty}
                        </span>
                        {course.certificateEarned && (
                          <span className="text-yellow-400 text-lg" title="Certificate Earned">🏆</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.grade}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">+{course.pointsEarned} pts</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        course.progress === 100 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                        course.progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{course.timeSpent}h</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Accessed</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{course.lastAccessed}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    course.status === 'Completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {course.status}
                  </span>
                  {course.nextMilestone && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Next:</div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{course.nextMilestone}</div>
                    </div>
                  )}
                </div>

                {course.skillsGained && course.skillsGained.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills Gained:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.skillsGained.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {course.skillsGained.length > 3 && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1">
                          +{course.skillsGained.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Enhanced Recent Activity */}
      {(activeView === 'overview') && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">⚡</span>
              Recent Activity
            </h2>
            <Link
              to="/progress/activity"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">📊</span>
              View All Activity
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${
                      activity.type === 'quiz' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      activity.type === 'assignment' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      activity.type === 'video' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      activity.type === 'reading' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                      {activity.icon}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        activity.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">+{activity.pointsEarned}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{activity.title}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{activity.course}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>📅 {activity.date}</span>
                  <span>⏰ {activity.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    activity.result === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    activity.result === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    activity.result === 'Unlocked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {activity.result}
                  </span>
                  {activity.streakContribution && (
                    <span className="text-orange-400 text-lg" title="Streak Contribution">🔥</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Learning Analytics
          </h2>

          {/* Weekly Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Weekly Study Pattern</h3>
            <div className="grid grid-cols-7 gap-4">
              {analyticsData.weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{day.hours}h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Study</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{day.points}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Skill Development</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.skillProgress.map((skill, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{skill.skill}</h4>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{skill.improvement}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Level: {skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {analyticsData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      deadline.priority === 'high' ? 'bg-red-500' :
                      deadline.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{deadline.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{deadline.course}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">{deadline.dueDate}</div>
                    <div className={`text-xs font-medium ${
                      deadline.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      deadline.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {deadline.priority.toUpperCase()} PRIORITY
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements View */}
      {activeView === 'achievements' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🏆</span>
            Achievements & Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.achievements.map((achievement) => (
              <div key={achievement.id} className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600'
              }`}>
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${achievement.unlocked ? 'filter-none' : 'filter grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-800 dark:text-white'
                  }`}>
                    {achievement.title}
                  </h3>
                  {achievement.unlocked ? (
                    <div className="text-yellow-100 text-sm">
                      Unlocked on {achievement.date}
                    </div>
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Progress: {achievement.progress}%
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/progress/activity"
          onClick={() => handleQuickAction('View Activity')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                📊 Activity Logs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View detailed activity history</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/progress/reports"
          onClick={() => handleQuickAction('View Reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                📈 Performance Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/progress/recommendations"
          onClick={() => handleQuickAction('View Recommendations')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                🤖 AI Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalized suggestions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Dashboard Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-104 right-8 z-50">
          <button
            onClick={() => setActiveView(activeView === 'analytics' ? 'overview' : 'analytics')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Toggle Analytics View"
          >
            <span className="text-xl">📊</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
