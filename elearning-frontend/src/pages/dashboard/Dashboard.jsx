import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { dashboardAPI } from '../../services/api';
import GamificationStats from '../../components/gamification/GamificationStats';
import Leaderboard from '../../components/gamification/Leaderboard';
import Achievements from '../../components/gamification/Achievements';
import GamifiedCalendar from '../../components/calendar/GamifiedCalendar';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import DashboardTabs from '../../components/navigation/DashboardTabs';
import { DashboardBreadcrumb } from '../../components/navigation/Breadcrumb';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, getUserName, user } = useAuth();
  const { updateUserStats, userStats } = useGamification();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        const data = await dashboardAPI.getDashboardData();
        console.log('Dashboard data received:', data);

        // Check if we received real data or mock data
        const isRealData = data && (
          (data.stats && typeof data.stats.totalCourses === 'number') ||
          (data.courseProgress && Array.isArray(data.courseProgress)) ||
          (data.recentActivities && Array.isArray(data.recentActivities))
        );

        if (isRealData) {
          console.log('Using real dashboard data');
          setDashboardData(data);

          // Check if backend returned an error message
          if (data.error) {
            setError(data.error);
          } else {
            setError(null);
          }

          // Update gamification context with real streak data
          if (data.streakData && updateUserStats) {
            updateUserStats(prevStats => ({
              ...prevStats,
              currentStreak: data.streakData.currentStreak || 0,
              longestStreak: data.streakData.longestStreak || 0,
              lastActivityDate: new Date().toISOString().split('T')[0]
            }));
          }
        } else {
          console.log('Received empty or invalid data, using fallback');
          throw new Error('Invalid data received from server');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to load real-time data. Showing demo data.');

        // Enhanced fallback with more realistic demo data
        const demoData = {
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

        console.log('Using empty data structure for new user');
        setDashboardData(demoData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, updateUserStats]);

  // Default announcements (can be moved to backend later)
  const recentAnnouncements = [
    { id: 1, title: 'New Course Available', content: 'Check out our new course on React Native!', date: '2023-05-14' },
    { id: 2, title: 'Platform Maintenance', content: 'The platform will be down for maintenance on May 21st from 2-4 AM.', date: '2023-05-13' },
  ];

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to the Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to view your personalized dashboard.</p>
          <Link to="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Error Banner */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 pt-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header with Glass Effect */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 sm:py-8 space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || user?.name || 'Student'}! 👋
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium">
                Here's what's happening with your learning journey today.
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => window.location.reload()}
                className="group relative inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 btn-mobile"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to="/courses/available"
                className="group relative inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 btn-mobile flex-1 sm:flex-none justify-center"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <DashboardBreadcrumb activeTab={activeTab} />

        {/* Enhanced Dashboard Navigation */}
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dashboardData={dashboardData}
        />

      {/* Gamification Stats - Show on Overview Tab */}
      {activeTab === 'overview' && <GamificationStats />}

        {/* Modern Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link
            to="/courses/available"
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white dark:hover:bg-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📚</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Browse Courses</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Discover new learning opportunities and expand your knowledge</p>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                <span>Explore now</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/courses/my-courses"
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white dark:hover:bg-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">🎯</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Track your learning progress and continue where you left off</p>
              <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-semibold">
                <span>Continue learning</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/courses/dashboard"
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white dark:hover:bg-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Course Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Manage your learning journey and track detailed analytics</p>
              <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-semibold">
                <span>View dashboard</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white dark:hover:bg-gray-800">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📈</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Learning Stats</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {dashboardData?.stats?.totalCourses > 0
                  ? `${dashboardData.stats.inProgressCourses || 0} of ${dashboardData.stats.totalCourses} courses in progress`
                  : 'No courses enrolled yet'
                }
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{dashboardData?.stats?.averageProgress || 0}%</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">avg progress</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-1">🔥</span>
                    <span>{dashboardData?.stats?.currentStreak || 0} day streak</span>
                  </div>
                  {dashboardData?.stats?.totalQuizzes > 0 && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="mr-1">📝</span>
                      <span>{dashboardData.stats.totalQuizzes} quizzes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Dashboard Content */}
        {activeTab === 'gamification' ? (
          <>
            {/* Gamification Tab Content */}
            <div className="space-y-8">
              <GamificationStats />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Leaderboard />
                <Achievements />
              </div>
            </div>
          </>
        ) : activeTab === 'calendar' ? (
          <>
            {/* Calendar Tab Content */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
              <GamifiedCalendar />
            </div>
          </>
        ) : activeTab === 'courses' ? (
          <>
            {/* Courses Tab Content */}
            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Courses</h2>
                <p className="text-gray-600 dark:text-gray-400">Course management content will be displayed here.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Course Progress */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Progress</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="space-y-6">
                {dashboardData?.courseProgress?.length > 0 ? (
                  dashboardData.courseProgress.map((course) => (
                    <div key={course.id} className="group bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              course.status === 'completed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                              {course.status === 'completed' ? '✓ Completed' : '📚 In Progress'}
                            </span>
                          </div>
                          {course.instructor && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              👨‍🏫 Instructor: {course.instructor}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{course.progress}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">progress</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              course.status === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                        </span>
                        {course.completedLessons && course.totalLessons && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Start Your Learning Journey</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">You haven't enrolled in any courses yet. Explore our course catalog to begin your educational adventure!</p>
                    <div className="space-y-4">
                      <Link
                        to="/courses/available"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Courses
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        or <Link to="/quiz/dashboard" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold underline decoration-2 underline-offset-2">try a quiz</Link> to test your knowledge
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {dashboardData?.courseProgress?.length > 0 && (
                <div className="mt-6">
                  <Link
                    to="/courses/my-courses"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-semibold group"
                  >
                    View all courses
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activities & Upcoming Events */}
            <div className="space-y-6 lg:space-y-8">
              {/* Recent Activities */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  {dashboardData?.recentActivities?.length > 0 ? (
                    dashboardData.recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="group flex items-center space-x-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                          activity.type === 'quiz' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          activity.type === 'course' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          activity.type === 'assessment' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          <span className="text-lg">
                            {activity.type === 'quiz' ? '📝' :
                             activity.type === 'course' ? '📚' :
                             activity.type === 'assessment' ? '🎯' : '📋'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                            {activity.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                            {activity.score && (
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                activity.status === 'Passed'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              }`}>
                                {activity.score}% - {activity.status}
                              </span>
                            )}
                            {activity.progress && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full font-medium">
                                {activity.progress}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Activities Yet</h4>
                      <p className="text-gray-600 dark:text-gray-400">Your learning activities will appear here as you progress through courses and quizzes.</p>
                    </div>
                  )}
                </div>
                {dashboardData?.recentActivities?.length > 5 && (
                  <div className="mt-6">
                    <Link
                      to="/progress/activity-logs"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-semibold group"
                    >
                      View all activities
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  {dashboardData?.upcomingEvents?.length > 0 ? (
                    dashboardData.upcomingEvents.map((event) => (
                      <div key={event.id} className="group p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                          {event.priority === 'high' && (
                            <span className="px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full font-medium">
                              🔥 High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Upcoming Events</h4>
                      <p className="text-gray-600 dark:text-gray-400">Your scheduled events and deadlines will appear here.</p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-sm font-semibold group"
                  >
                    View calendar
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;