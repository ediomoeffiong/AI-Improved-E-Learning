import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_COLORS, ROLE_ICONS } from '../../constants/roles';
import { dashboardAPI } from '../../services/api';

const SuperModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get current super moderator user
  const currentUser = JSON.parse(localStorage.getItem('superAdminUser') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching super moderator dashboard data...');

      const data = await dashboardAPI.getSuperModeratorDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(data.error || null);
    } catch (err) {
      console.error('Error fetching super moderator dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');

      // Set empty data structure to prevent crashes
      setDashboardData({
        stats: {
          totalUsers: 0,
          totalInstitutions: 0,
          pendingApprovals: 0,
          flaggedContent: 0,
          moderationActions: 0,
          reportsGenerated: 0,
          suspendedUsers: 0,
          activeReports: 0,
          userRole: 'Super Moderator'
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
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.getSuperModeratorDashboardData();
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
  const institutionOversight = dashboardData?.institutionOversight || [];
  const contentModerationQueue = dashboardData?.contentModerationQueue || [];
  const systemMonitoring = dashboardData?.systemMonitoring || {};

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'moderation', name: 'Content Moderation', icon: '🛡️', badge: stats.flaggedContent || 0 },
    { id: 'users', name: 'User Management', icon: '👥', badge: stats.pendingApprovals || 0 },
    { id: 'institutions', name: 'Institution Oversight', icon: '🏛️', badge: stats.totalInstitutions || 0 },
    { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
    { id: 'system', name: 'System Monitoring', icon: '⚙️' }
  ];

  const StatCard = ({ title, value, icon, color, description, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-2 ${color} rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${ROLE_COLORS[color]} rounded-lg`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Super Moderator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {ROLE_ICONS[USER_ROLES.SUPER_MODERATOR]} Super Moderator Dashboard
              </h1>
              <p className="mt-1 text-orange-100">
                Platform Moderation & Oversight Portal
              </p>
              {lastUpdated && (
                <p className="text-xs text-orange-200 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {systemMonitoring && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemMonitoring.database === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemMonitoring.database === 'connected' ? '🟢 System Online' : '🔴 System Issues'}
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-orange-200">{error}</span>
                </div>
              )}
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {currentUser?.name || 'Super Moderator'}
                </span>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
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
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.badge && tab.badge > 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Platform Users"
                value={stats.totalUsers.toLocaleString()}
                icon="👥"
                color="bg-blue-100 dark:bg-blue-900"
                description="Total registered users"
                trend={5.2}
              />
              <StatCard
                title="Flagged Content"
                value={stats.flaggedContent}
                icon="🚩"
                color="bg-red-100 dark:bg-red-900"
                description="Requires moderation"
                trend={-12.3}
              />
              <StatCard
                title="Moderation Actions"
                value={stats.moderationActions}
                icon="⚖️"
                color="bg-green-100 dark:bg-green-900"
                description="This month"
                trend={8.7}
              />
              <StatCard
                title="Institutions"
                value={stats.totalInstitutions}
                icon="🏛️"
                color="bg-purple-100 dark:bg-purple-900"
                description="Verified institutions"
                trend={2.1}
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon="⏳"
                color="bg-yellow-100 dark:bg-yellow-900"
                description="Awaiting review"
              />
              <StatCard
                title="Reports Generated"
                value={stats.reportsGenerated}
                icon="📊"
                color="bg-indigo-100 dark:bg-indigo-900"
                description="This quarter"
                trend={15.4}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <QuickAction
                    title="Review Flagged Content"
                    description={`${stats.flaggedContent} items need attention`}
                    icon="🛡️"
                    color="red"
                    onClick={() => setActiveTab('moderation')}
                  />
                  <QuickAction
                    title="User Management"
                    description="Manage user accounts and permissions"
                    icon="👥"
                    color="blue"
                    onClick={() => setActiveTab('users')}
                  />
                  <QuickAction
                    title="Institution Oversight"
                    description="Monitor institutional activities"
                    icon="🏛️"
                    color="purple"
                    onClick={() => setActiveTab('institutions')}
                  />
                  <QuickAction
                    title="Generate Reports"
                    description="Create moderation and activity reports"
                    icon="📈"
                    color="green"
                    onClick={() => setActiveTab('reports')}
                  />
                </div>
              </div>

              {/* Recent Activities */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Moderation Activities</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { action: 'Content Reviewed', user: 'System', time: '5 minutes ago', status: 'approved' },
                        { action: 'User Suspended', user: 'john.doe@example.com', time: '1 hour ago', status: 'suspended' },
                        { action: 'Institution Verified', user: 'Lagos University', time: '2 hours ago', status: 'verified' },
                        { action: 'Report Generated', user: 'Monthly Analytics', time: '1 day ago', status: 'completed' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.user}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                              activity.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              activity.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This section is under development. Advanced {activeTab} features will be available here.
            </p>
            <button 
              onClick={() => setActiveTab('overview')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperModeratorDashboard;
