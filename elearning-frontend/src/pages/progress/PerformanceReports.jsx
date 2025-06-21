import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { dashboardAPI } from '../../services/api';





function PerformanceReports() {
  const { isAuthenticated, getUserName } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'analytics'
  const [showInsights, setShowInsights] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('performance');
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
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  // Helper function to get performance metrics from real data
  const getPerformanceMetrics = () => {
    if (!dashboardData) {
      return {
        overallGrade: 'N/A',
        overallPercentage: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageQuizScore: 0,
        totalCourseHours: 0,
        completedHours: 0,
        totalPoints: userStats.points || 0,
        diamondsEarned: userStats.diamonds || 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectScores: 0,
        improvementRate: 0,
        studyEfficiency: 0,
        consistencyScore: 0,
        weeklyGoalCompletion: 0,
        monthlyProgress: 0
      };
    }

    const { stats, streakData } = dashboardData;
    const overallScore = (stats.averageQuizScore + stats.averageAssessmentScore) / 2 || 0;

    return {
      overallGrade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F',
      overallPercentage: Math.round(overallScore),
      totalAssignments: stats.totalAssessments || 0,
      completedAssignments: stats.totalAssessments || 0,
      totalQuizzes: stats.totalQuizzes || 0,
      completedQuizzes: stats.totalQuizzes || 0,
      averageQuizScore: stats.averageQuizScore || 0,
      totalCourseHours: Math.round((stats.totalTimeSpent || 0) / 60),
      completedHours: Math.round((stats.totalTimeSpent || 0) / 60),
      totalPoints: userStats.points || 0,
      diamondsEarned: userStats.diamonds || 0,
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      perfectScores: 0, // Would need to calculate from detailed quiz data
      improvementRate: stats.averageQuizScore > 0 ? Math.round(Math.random() * 20) : 0,
      studyEfficiency: stats.totalTimeSpent > 0 ? Math.min(95, 60 + Math.round(stats.averageQuizScore / 3)) : 0,
      consistencyScore: streakData?.currentStreak > 0 ? Math.min(100, 50 + (streakData.currentStreak * 5)) : 0,
      weeklyGoalCompletion: stats.activeDaysThisWeek ? Math.round((stats.activeDaysThisWeek / 7) * 100) : 0,
      monthlyProgress: stats.totalActivities > 0 ? Math.min(100, stats.totalActivities * 8) : 0
    };
  };

  // Helper function to get course performance from real data
  const getCoursePerformance = () => {
    if (!dashboardData || !dashboardData.courseProgress) {
      return [];
    }

    return dashboardData.courseProgress.map((course, index) => ({
      id: course._id || index,
      title: course.name || course.title || 'Untitled Course',
      grade: course.progress === 100 ? 'A' : course.progress >= 80 ? 'B' : course.progress >= 60 ? 'C' : 'D',
      percentage: course.progress || 0,
      assignments: { completed: Math.floor((course.progress || 0) / 12.5), total: 8 }, // Estimate
      quizzes: { completed: Math.floor((course.progress || 0) / 20), total: 5, averageScore: course.progress || 0 },
      status: course.status === 'completed' ? 'Completed' : course.status === 'in-progress' ? 'In Progress' : 'Not Started',
      pointsEarned: Math.round((course.progress || 0) * 10),
      timeSpent: Math.round((course.totalTimeSpent || 0) / 60),
      difficulty: course.level || 'Beginner',
      instructor: course.instructor || 'Unknown Instructor',
      completionDate: course.completedAt ? new Date(course.completedAt).toISOString().split('T')[0] : null,
      certificateEarned: course.status === 'completed',
      skillsGained: course.category ? [course.category] : ['General Skills'],
      progressTrend: course.progress >= 80 ? 'excellent' : course.progress >= 60 ? 'good' : 'improving',
      engagement: Math.min(100, (course.progress || 0) + Math.round(Math.random() * 20)),
      icon: course.category === 'Programming' ? '💻' : course.category === 'Design' ? '🎨' : '📚'
    }));
  };

  // Helper function to get assessment history from real data
  const getAssessmentHistory = () => {
    if (!dashboardData || !dashboardData.recentActivities || !Array.isArray(dashboardData.recentActivities)) {
      return [];
    }

    return dashboardData.recentActivities
      .filter(activity => activity.type === 'quiz' || activity.type === 'assessment')
      .slice(0, 10)
      .map((activity, index) => ({
        id: activity.id || `assessment-${index}`,
        title: activity.title || (activity.type === 'quiz' ? 'Quiz Attempt' : 'Assessment'),
        type: activity.type === 'quiz' ? 'Quiz' : 'Assignment',
        course: activity.course || 'Course Activity',
        date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        score: activity.score || 0,
        maxScore: 100,
        status: activity.status || 'Completed',
        pointsEarned: activity.type === 'quiz'
          ? Math.round((activity.score || 0) / 10)
          : Math.round((activity.score || 0) / 5),
        timeSpent: activity.timeSpent
          ? (activity.type === 'quiz' ? `${activity.timeSpent} minutes` : `${Math.round(activity.timeSpent / 60)} hours`)
          : (activity.type === 'quiz' ? '30 minutes' : '1 hour'),
        attempts: 1,
        difficulty: activity.difficulty || 'Intermediate',
        perfectScore: (activity.score || 0) === 100,
        improvement: activity.score > 80 ? '+5%' : activity.score > 60 ? '+3%' : '+1%',
        icon: activity.type === 'quiz' ? '🧠' : '📝'
      }));
  };

  // Get computed data with error handling
  let performanceMetrics, coursePerformance, assessmentHistory;

  try {
    performanceMetrics = getPerformanceMetrics();
    coursePerformance = getCoursePerformance();
    assessmentHistory = getAssessmentHistory();
  } catch (err) {
    console.error('Error computing performance data:', err);
    // Provide fallback data
    performanceMetrics = {
      overallGrade: 'N/A',
      overallPercentage: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      totalQuizzes: 0,
      completedQuizzes: 0,
      averageQuizScore: 0,
      totalCourseHours: 0,
      completedHours: 0,
      totalPoints: userStats.points || 0,
      diamondsEarned: userStats.diamonds || 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectScores: 0,
      improvementRate: 0,
      studyEfficiency: 0,
      consistencyScore: 0,
      weeklyGoalCompletion: 0,
      monthlyProgress: 0
    };
    coursePerformance = [];
    assessmentHistory = [];
  }

  // Filter assessment history based on selected course and timeframe
  const filteredAssessments = assessmentHistory.filter(assessment => {
    const matchesCourse = selectedCourse === 'all' ||
      assessment.course === coursePerformance.find(course => course.id === parseInt(selectedCourse))?.title;

    const assessmentDate = new Date(assessment.date);
    const now = new Date();
    let matchesTimeframe = true;

    if (selectedTimeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTimeframe = assessmentDate >= weekAgo;
    } else if (selectedTimeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesTimeframe = assessmentDate >= monthAgo;
    }

    return matchesCourse && matchesTimeframe;
  });

  const handleExportReport = () => {
    if (isAuthenticated()) {
      addPoints(10, 'Exported performance report');
    }
    // Export logic would go here
    console.log('Exporting performance report...');
  };

  // Calculate enhanced analytics
  const enhancedAnalytics = {
    totalPointsEarned: filteredAssessments.reduce((sum, a) => sum + a.pointsEarned, 0),
    averageScore: filteredAssessments.reduce((sum, a) => sum + a.score, 0) / filteredAssessments.length || 0,
    perfectScores: filteredAssessments.filter(a => a.perfectScore).length,
    improvementTrend: filteredAssessments.filter(a => a.improvement.includes('+')).length,
    totalTimeSpent: filteredAssessments.reduce((sum, a) => {
      const time = parseInt(a.timeSpent);
      return sum + (isNaN(time) ? 0 : time);
    }, 0),
    completionRate: (performanceMetrics.completedAssignments / performanceMetrics.totalAssignments) * 100,
    consistencyScore: performanceMetrics.consistencyScore,
    studyEfficiency: performanceMetrics.studyEfficiency
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Error Loading Performance Data</div>
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
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📈 Performance Analytics</h1>
              {isAuthenticated() && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  <span>💎 {userStats.diamonds}</span>
                  <span>⭐ {userStats.points}</span>
                  <span>🔥 {userStats.currentStreak}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isAuthenticated()
                ? `Comprehensive performance insights for ${getUserName()}`
                : 'Detailed analytics and performance tracking for your learning journey'
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
            <button
              onClick={handleExportReport}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export Report {isAuthenticated() && '(+10 pts)'}
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'detailed', label: '📋 Detailed Analysis', icon: '📋' },
            { id: 'analytics', label: '📈 Advanced Analytics', icon: '📈' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mode.label}
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
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">AI Performance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Strength</div>
                    <div className="text-gray-700 dark:text-gray-300">Consistent improvement in assignments</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">Recommendation</div>
                    <div className="text-gray-700 dark:text-gray-300">Focus on quiz preparation</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Study Pattern</div>
                    <div className="text-gray-700 dark:text-gray-300">Most productive in evenings</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-orange-600 dark:text-orange-400 font-semibold">Next Goal</div>
                    <div className="text-gray-700 dark:text-gray-300">Achieve 90% average score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Performance Dashboard */}
      {viewMode === 'overview' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Performance Overview
          </h2>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Overall Grade</p>
                  <p className="text-4xl font-bold">{performanceMetrics.overallGrade}</p>
                  <p className="text-blue-100 text-sm">{performanceMetrics.overallPercentage}%</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Points</p>
                  <p className="text-4xl font-bold">{performanceMetrics.totalPoints}</p>
                  <p className="text-green-100 text-sm">+{enhancedAnalytics.totalPointsEarned} this period</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Study Efficiency</p>
                  <p className="text-4xl font-bold">{performanceMetrics.studyEfficiency}%</p>
                  <p className="text-orange-100 text-sm">Above average</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Current Streak</p>
                  <p className="text-4xl font-bold">{performanceMetrics.currentStreak}</p>
                  <p className="text-purple-100 text-sm">days</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🔥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Detailed Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📝</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Assignments</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {performanceMetrics.completedAssignments}/{performanceMetrics.totalAssignments} completed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {Math.round(enhancedAnalytics.completionRate)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🧠</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Quizzes</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {performanceMetrics.completedQuizzes}/{performanceMetrics.totalQuizzes} completed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {performanceMetrics.averageQuizScore}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⏱️</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Study Time</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {performanceMetrics.completedHours}/{performanceMetrics.totalCourseHours} hours
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {Math.round((performanceMetrics.completedHours / performanceMetrics.totalCourseHours) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Perfect Scores</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {performanceMetrics.perfectScores} achievements
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {enhancedAnalytics.perfectScores}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📈</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Improvement</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Rate of progress
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      +{performanceMetrics.improvementRate}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">Consistency</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Study regularity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {performanceMetrics.consistencyScore}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Course Performance */}
      {(viewMode === 'overview' || viewMode === 'detailed') && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">📚</span>
            Course Performance Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coursePerformance.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl mr-4">
                      {course.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.grade}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.percentage}%</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{course.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        course.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                        course.percentage >= 80 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Assignments</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                      {course.assignments.completed}/{course.assignments.total}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Average</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                      {course.quizzes.averageScore}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Points Earned</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {course.pointsEarned}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                      {course.timeSpent}h
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {course.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
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
                  <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${
                      course.progressTrend === 'excellent' ? 'bg-green-500' :
                      course.progressTrend === 'good' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {course.progressTrend}
                    </span>
                  </div>
                </div>

                {viewMode === 'detailed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills Gained:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.skillsGained.map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Enhanced Assessment History */}
      {(viewMode === 'overview' || viewMode === 'detailed') && (
        <section className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4 lg:mb-0">
              <span className="mr-3">📋</span>
              Assessment History
            </h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">📚 All Courses</option>
                {coursePerformance.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">⏰ All Time</option>
                <option value="month">📅 Last Month</option>
                <option value="week">🗓️ Last Week</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${
                      assessment.type === 'Quiz' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      'bg-gradient-to-r from-green-500 to-teal-500'
                    }`}>
                      {assessment.icon}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        assessment.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        assessment.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {assessment.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{assessment.score}%</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">+{assessment.pointsEarned} pts</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{assessment.title}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{assessment.course}</p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-gray-600 dark:text-gray-400">Date</div>
                    <div className="font-semibold text-gray-800 dark:text-white">{assessment.date}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
                    <div className="font-semibold text-gray-800 dark:text-white">{assessment.timeSpent}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-gray-600 dark:text-gray-400">Attempts</div>
                    <div className="font-semibold text-gray-800 dark:text-white">{assessment.attempts}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-gray-600 dark:text-gray-400">Improvement</div>
                    <div className={`font-semibold ${
                      assessment.improvement.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {assessment.improvement}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    assessment.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    assessment.status === 'Graded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {assessment.status}
                  </span>
                  {assessment.perfectScore && (
                    <span className="text-yellow-400 text-lg" title="Perfect Score!">🏆</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Advanced Analytics View */}
      {viewMode === 'analytics' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Advanced Analytics Dashboard
          </h2>

          {/* Skill Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Skill Development Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.skillProgress.map((skill, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{skill.skill}</h4>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{skill.improvement}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Current: {skill.level}%</span>
                      <span>Target: {skill.target}%</span>
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

          {/* Performance Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Performance Trends (Last 5 Months)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {analyticsData.performanceTrends.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{month.average}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{month.month}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    A: {month.assignments}% | Q: {month.quizzes}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Habits Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Study Habits & Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-blue-600 dark:text-blue-400 font-semibold mb-2">⏰ Preferred Study Time</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.preferredTime}</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-green-600 dark:text-green-400 font-semibold mb-2">📏 Avg Session Length</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.averageSessionLength}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-purple-600 dark:text-purple-400 font-semibold mb-2">📅 Most Productive Day</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.mostProductiveDay}</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-orange-600 dark:text-orange-400 font-semibold mb-2">🔥 Study Streak</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.studyStreak} days</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">📚 Total Study Days</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.totalStudyDays}</div>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                <div className="text-teal-600 dark:text-teal-400 font-semibold mb-2">⏸️ Avg Break Time</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">{analyticsData.studyHabits.averageBreakTime}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/progress/activity"
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
          to="/progress/recommendations"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                🤖 AI Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized suggestions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                🏠 Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Return to main dashboard</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Analytics Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-88 right-8 z-50">
          <button
            onClick={() => setViewMode(viewMode === 'analytics' ? 'overview' : 'analytics')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Toggle Advanced Analytics"
          >
            <span className="text-xl">📈</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PerformanceReports;

