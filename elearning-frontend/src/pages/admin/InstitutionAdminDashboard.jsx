import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';

const InstitutionAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin dashboard data...');
        const data = await dashboardAPI.getAdminDashboardData();
        console.log('Admin dashboard data received:', data);

        setDashboardData(data);
        setLastUpdated(new Date());

        // Check if backend returned an error message
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Unable to load admin dashboard data. Please try again.');

        // Set empty data structure to prevent crashes
        setDashboardData({
          stats: {
            totalUsers: 0,
            pendingApprovals: 0,
            activeUsers: 0,
            totalCourses: 0,
            publishedCourses: 0,
            totalEnrollments: 0,
            totalQuizzes: 0,
            quizAttempts: 0,
            userRole: user?.role || 'Admin',
            institutionName: user?.institution || 'Your Institution'
          },
          recentUsers: [],
          recentActivities: [],
          systemHealth: {
            database: 'unknown',
            api: 'unknown',
            lastUpdated: new Date()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [user]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.getAdminDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(data.error || null);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Use real data from API or fallback to empty arrays
  const pendingApprovals = dashboardData?.recentUsers?.filter(user => user.approvalStatus === 'pending') || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const stats = dashboardData?.stats || {};

  // Calculate top performers from recent activities (simplified)
  const topPerformers = recentActivities
    .filter(activity => activity.type === 'quiz' && activity.score)
    .reduce((acc, activity) => {
      const existing = acc.find(p => p.name === activity.user);
      if (existing) {
        existing.totalScore += activity.score;
        existing.quizzesCompleted += 1;
        existing.avgScore = existing.totalScore / existing.quizzesCompleted;
      } else {
        acc.push({
          name: activity.user,
          department: 'Unknown',
          avgScore: activity.score,
          totalScore: activity.score,
          quizzesCompleted: 1
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 4);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'approvals', name: 'Pending Approvals', icon: '✅', badge: stats.pendingApprovals || pendingApprovals.length },
    { id: 'users', name: 'Users', icon: '👥', badge: stats.totalUsers || 0 },
    { id: 'courses', name: 'Courses', icon: '📚', badge: stats.totalCourses || 0 },
    { id: 'activities', name: 'Activities', icon: '📈' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const handleApproval = (id, action) => {
    setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
    // TODO: Implement actual approval/rejection API call
    console.log(`${action} approval for ID: ${id}`);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return '📝';
      case 'cbt_completed': return '💻';
      case 'login': return '🔐';
      case 'course_created': return '📚';
      default: return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ROLE_ICONS[user?.role]} Institution Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.institutionName || 'Your Institution'} - Management Portal
                </p>
                {error && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 dark:text-yellow-400">{error}</span>
                  </div>
                )}
              </div>
              {lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {dashboardData?.systemHealth && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  dashboardData.systemHealth.database === 'connected'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {dashboardData.systemHealth.database === 'connected' ? '🟢 Online' : '🔴 Offline'}
                </div>
              )}
              <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  {stats.userRole || 'Admin'}
                </span>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <Link
                to="/admin/settings"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalUsers || 0).toLocaleString()}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {(stats.activeUsers || 0).toLocaleString()} active this month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals || 0}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Requires attention
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses || 0}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {stats.publishedCourses || 0} published
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Activity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.quizAttempts || 0}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {stats.totalQuizzes || 0} quizzes available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Platform Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Enrollments</span>
                    <span className="font-bold text-gray-900 dark:text-white">{(stats.totalEnrollments || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Quiz Attempts</span>
                    <span className="font-bold text-gray-900 dark:text-white">{(stats.quizAttempts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Active Users (30 days)</span>
                    <span className="font-bold text-gray-900 dark:text-white">{(stats.activeUsers || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Published Courses</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stats.publishedCourses || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {topPerformers.length > 0 ? 'Top Quiz Performers' : 'Recent Users'}
                </h3>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? (
                    topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{performer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{performer.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 dark:text-green-400">{Math.round(performer.avgScore)}%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{performer.quizzesCompleted} quiz{performer.quizzesCompleted !== 1 ? 'es' : ''}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    dashboardData?.recentUsers?.slice(0, 4).map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : user.approvalStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No user data available</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.userEmail}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{activity.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.score && (
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              activity.status === 'passed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {activity.score}%
                            </span>
                          )}
                          {activity.status && !activity.score && (
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              activity.status === 'active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Recent Activities</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User activities will appear here as they interact with the platform.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Quick Link to Full Approval System */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200">Advanced Approval System</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Access the full user approval system with advanced filtering and bulk actions
                  </p>
                </div>
                <Link
                  to="/admin/approvals"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Open Full System
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Pending Approvals</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.slice(0, 3).map((approval) => (
                      <div key={approval.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{approval.name || 'Unknown User'}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{approval.email}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                              {approval.role}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(approval.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{approval.approvalStatus}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {approval.institution || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproval(approval.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(approval.id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Pending Approvals</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">All user requests have been processed. New requests will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Moderators Tab */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            {/* Quick Link to Full Moderator Verification System */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-orange-900 dark:text-orange-200">Moderator Verification System</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Review and approve moderator requests for your institution
                  </p>
                </div>
                <Link
                  to="/admin/moderators"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Open Verification System
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Moderator Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Moderators</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">5/5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moderator Limit</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Users</h3>
              </div>
              <div className="p-6">
                {dashboardData?.recentUsers?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'Student' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            user.role === 'Instructor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.role}
                          </span>
                          <div className="mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.approvalStatus === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : user.approvalStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {user.approvalStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Course Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCourses || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.publishedCourses || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEnrollments || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Detailed course management features are under development.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content placeholder */}
        {!['overview', 'approvals', 'users', 'courses'].includes(activeTab) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section is under development. Advanced {activeTab} management features will be available here.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionAdminDashboard;
