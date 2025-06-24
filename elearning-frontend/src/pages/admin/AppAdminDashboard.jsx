import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';
import { dashboardAPI } from '../../services/api';

const AppAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Force component refresh - version 2.0
  console.log('AppAdminDashboard v2.0 loaded');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get current super admin user
  const currentUser = JSON.parse(localStorage.getItem('appAdminUser') || '{}');

  // Fetch super admin dashboard data
  useEffect(() => {
    const fetchSuperAdminDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching super admin dashboard data...');

        const data = await dashboardAPI.getSuperAdminDashboardData();
        setDashboardData(data);
        setLastUpdated(new Date());
        setError(data.error || null);
      } catch (err) {
        console.error('Error fetching super admin dashboard data:', err);
        setError('Unable to load dashboard data. Please try again.');

        // Set empty data structure to prevent crashes
        setDashboardData({
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
            userRole: 'Super Admin'
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
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdminDashboardData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.getSuperAdminDashboardData();
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
  const stats = dashboardData?.stats || {};
  const recentActivities = dashboardData?.recentActivities || [];
  const recentUsers = dashboardData?.recentUsers || [];
  const institutionStats = dashboardData?.institutionStats || [];
  const systemHealth = dashboardData?.systemHealth || {};



  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'institutions', name: 'Institutions', icon: '🏫' },
    { id: 'activities', name: 'Activity Monitor', icon: '📈' },
    { id: 'system', name: 'System Health', icon: '⚙️' },
    { id: 'analytics', name: 'Analytics', icon: '📊' }
  ];

  // Debug logging
  console.log('AppAdminDashboard tabs (no badges):', tabs);
  console.log('Stats:', stats);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔐';
      case 'registration': return '📝';
      case 'quiz_completed': return '✅';
      case 'admin_action': return '👑';
      case 'system_alert': return '⚠️';
      default: return '📌';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';

    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ROLE_ICONS[USER_ROLES.SUPER_ADMIN]} Super Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Platform-wide monitoring and management
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
              {systemHealth && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.database === 'connected'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {systemHealth.database === 'connected' ? '🟢 System Healthy' : '🔴 System Issues'}
                </div>
              )}
              <div className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full">
                <span className="text-red-800 dark:text-red-200 text-sm font-medium">
                  {currentUser?.name || 'Super Admin'}
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
                to="/app-admin/settings"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="tab-text">{tab.name}</span>
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
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalUsers || 0).toLocaleString()}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {(stats.activeUsers || 0).toLocaleString()} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Institutions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInstitutions || 0}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Verified institutions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalCourses || 0).toLocaleString()}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {(stats.totalEnrollments || 0).toLocaleString()} enrollments
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
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Activity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalQuizAttempts || 0).toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {stats.totalQuizzes || 0} quizzes available
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsersThisMonth || 0}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      This month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${(stats.revenueThisMonth || 0).toLocaleString()}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      This month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemHealth?.database === 'connected' ? '98.5%' : 'N/A'}
                    </p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">
                      Uptime: {systemHealth?.serverUptime || 'Unknown'}
                    </p>
                  </div>
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
                      <div key={activity.id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{activity.user || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.institution || activity.userEmail || 'Unknown'}</p>
                            {(activity.details || activity.title) && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{activity.details || activity.title}</p>
                            )}
                            {activity.score && (
                              <p className="text-sm text-green-600 dark:text-green-400">Score: {activity.score}%</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status ? activity.status.replace('_', ' ') : 'Unknown'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() :
                             activity.date ? new Date(activity.date).toLocaleString() : 'Unknown time'}
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Platform activities will appear here as they occur.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Health Monitoring */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
              </div>
              <div className="p-6">
                {systemHealth ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Database</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          systemHealth.database === 'connected'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {systemHealth.database}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">API Status</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          systemHealth.api === 'operational'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {systemHealth.api}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {systemHealth.totalStorage || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connections</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {systemHealth.activeConnections || 0}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Server Uptime</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {systemHealth.serverUptime || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {systemHealth.errorRate || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">System health data unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Monitor Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Activity Monitor</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id || Math.random()} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{activity.user || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.institution || activity.userEmail || 'Unknown'}</p>
                            {(activity.details || activity.title) && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{activity.details || activity.title}</p>
                            )}
                            {activity.ip && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">IP: {activity.ip}</p>
                            )}
                            {activity.score && (
                              <p className="text-sm text-green-600 dark:text-green-400">Score: {activity.score}%</p>
                            )}
                            {activity.revenue && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">Revenue: ${activity.revenue}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status ? activity.status.replace('_', ' ') : 'Unknown'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() :
                             activity.date ? new Date(activity.date).toLocaleString() : 'Unknown time'}
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
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Activities Found</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Platform activities will appear here as they occur.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/super-admin/users"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">User Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage all platform users</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/super-admin/user-approvals"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Pending Approvals</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.pendingApprovals || 0} users awaiting approval</p>
                  </div>
                </div>
              </Link>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">User Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User activity and statistics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(stats.totalUsers || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(stats.activeUsers || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApprovals || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.newUsersThisMonth || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === 'institutions' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/super-admin/institutions"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Institution Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage all institutions</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/super-admin/universities"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">University Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve new universities</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/super-admin/admins"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Admin Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verify institution admin requests</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Institution Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Institution Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInstitutions || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Institutions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(stats.totalInstitutions || 0) - 5}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified Institutions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">5</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCourses || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {!['overview', 'activities', 'institutions', 'users'].includes(activeTab) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This section is under development. Advanced {activeTab} management features will be available here.
            </p>
            <button
              onClick={() => setActiveTab('overview')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppAdminDashboard;
