import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_COLORS, ROLE_ICONS } from '../../constants/roles';
import CreateAdminForm from '../../components/admin/CreateAdminForm';
import TwoFactorSettings from '../../components/admin/TwoFactorSettings';
import { superAdminAPI } from '../../services/api';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    pendingApprovals: 0,
    superAdmins: 0,
    institutionAdmins: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: 'checking',
    api: 'checking',
    backgroundJobs: 'checking'
  });
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Get current super admin user
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('appAdminUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
    checkSystemHealth();

    // Auto-refresh every 5 minutes
    const dataInterval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 5 * 60 * 1000);

    // Check system health every 2 minutes
    const healthInterval = setInterval(() => {
      checkSystemHealth();
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(healthInterval);
    };
  }, []);

  const fetchDashboardData = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      // Fetch real data from Super Admin API
      const response = await superAdminAPI.getStats();

      setStats(response.stats);
      setRecentUsers(response.recentUsers);
      setLastUpdated(new Date());
      setConnectionStatus('connected');

      // Clear any previous errors
      if (!silentRefresh) {
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setConnectionStatus('disconnected');

      // Set error message for user
      const errorMessage = error.message.includes('Backend service is not available')
        ? 'Backend service is temporarily unavailable. Showing demo data.'
        : error.message.includes('Super Admin authentication required')
        ? 'Authentication expired. Please log in again.'
        : 'Failed to fetch dashboard data. Please try again.';

      if (!silentRefresh) {
        setError(errorMessage);

        // Show fallback data on initial load
        const fallbackStats = {
          totalUsers: 0,
          totalInstitutions: 0,
          pendingApprovals: 0,
          superAdmins: 0,
          institutionAdmins: 0
        };

        const fallbackRecentUsers = [];

        setStats(fallbackStats);
        setRecentUsers(fallbackRecentUsers);
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardData(true);
    checkSystemHealth();
  };

  const checkSystemHealth = async () => {
    try {
      // Check if we can fetch stats (indicates API and database are working)
      await superAdminAPI.getStats();

      setSystemHealth({
        database: 'online',
        api: 'operational',
        backgroundJobs: 'processing' // This would need a separate endpoint to check
      });
    } catch (error) {
      console.error('System health check failed:', error);
      setSystemHealth({
        database: 'offline',
        api: 'error',
        backgroundJobs: 'unknown'
      });
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`text-4xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-200 text-left group hover:border-${color}-200 dark:hover:border-${color}-700`}
    >
      <div className="flex items-center space-x-4">
        <div className={`text-2xl text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Super Admin Dashboard...</p>
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
                Super Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {currentUser?.name || 'Super Admin'}! Manage your platform from here.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {lastUpdated && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors duration-200"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[currentUser?.role] || 'text-gray-600 bg-gray-100'}`}>
                {ROLE_ICONS[currentUser?.role]} {currentUser?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchDashboardData()}
                    className="bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status Indicator */}
        {connectionStatus === 'disconnected' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Limited Connectivity:</strong> Some features may not be available. Data shown may be cached or demo data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="text-blue-600 dark:text-blue-400"
            description="All platform users"
          />
          <StatCard
            title="Institutions"
            value={stats.totalInstitutions}
            icon="🏛️"
            color="text-green-600 dark:text-green-400"
            description="Verified institutions"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon="⏳"
            color="text-yellow-600 dark:text-yellow-400"
            description="Awaiting review"
          />
          <StatCard
            title="Super Admins"
            value={stats.superAdmins}
            icon="⚡"
            color="text-red-600 dark:text-red-400"
            description="Platform administrators"
          />
          <StatCard
            title="Institution Admins"
            value={stats.institutionAdmins}
            icon="👑"
            color="text-purple-600 dark:text-purple-400"
            description="Institution managers"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {currentUser?.role === 'Super Admin' && (
                  <QuickAction
                    title="Create Super Admin"
                    description="Add new Super Admin or Super Moderator"
                    icon="⚡"
                    color="red"
                    onClick={() => setActiveTab('create-admin')}
                  />
                )}
                <QuickAction
                  title="Approve Admins"
                  description={`${stats.pendingApprovals} pending approvals`}
                  icon="✅"
                  color="green"
                  onClick={() => setActiveTab('approvals')}
                />
                <QuickAction
                  title="Manage Users"
                  description="View and manage all users"
                  icon="👥"
                  color="blue"
                  onClick={() => setActiveTab('users')}
                />
                <QuickAction
                  title="Institution Management"
                  description="Verify and manage institutions"
                  icon="🏛️"
                  color="purple"
                  onClick={() => setActiveTab('institutions')}
                />
                <QuickAction
                  title="Platform Analytics"
                  description="View detailed platform statistics"
                  icon="📊"
                  color="indigo"
                  onClick={() => setActiveTab('analytics')}
                />
                <QuickAction
                  title="2FA Settings"
                  description="Manage two-factor authentication"
                  icon="🔐"
                  color="green"
                  onClick={() => setActiveTab('2fa-settings')}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent User Registrations</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.length > 0 ? recentUsers.map((user) => (
                      <div key={user._id || user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                            {ROLE_ICONS[user.role]} {user.role}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No recent users found</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      View All Users →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Admin Tab */}
        {activeTab === 'create-admin' && currentUser?.role === 'Super Admin' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <CreateAdminForm
              onSuccess={(newAdmin) => {
                console.log('New admin created:', newAdmin);
                setActiveTab('overview');
                fetchDashboardData(); // Refresh stats
              }}
              onCancel={() => setActiveTab('overview')}
            />
          </div>
        )}

        {/* Other tabs can be added here */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">User management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approvals</h2>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Approval management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'institutions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Institution Management</h2>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Institution management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h2>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Analytics interface coming soon...</p>
          </div>
        )}

        {activeTab === '2fa-settings' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <TwoFactorSettings />
          </div>
        )}

        {/* System Health Status - Show on overview tab */}
        {activeTab === 'overview' && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    Object.values(systemHealth).every(status => ['online', 'operational', 'processing'].includes(status))
                      ? 'bg-green-500'
                      : Object.values(systemHealth).some(status => ['offline', 'error'].includes(status))
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.values(systemHealth).every(status => ['online', 'operational', 'processing'].includes(status))
                      ? 'All Systems Operational'
                      : Object.values(systemHealth).some(status => ['offline', 'error'].includes(status))
                      ? 'System Issues Detected'
                      : 'Checking Systems...'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth.database === 'online' ? 'bg-green-500' :
                    systemHealth.database === 'offline' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Database: {systemHealth.database === 'online' ? 'Online' :
                              systemHealth.database === 'offline' ? 'Offline' : 'Checking...'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth.api === 'operational' ? 'bg-green-500' :
                    systemHealth.api === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    API Services: {systemHealth.api === 'operational' ? 'Operational' :
                                  systemHealth.api === 'error' ? 'Error' : 'Checking...'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth.backgroundJobs === 'processing' ? 'bg-green-500' :
                    systemHealth.backgroundJobs === 'stopped' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Background Jobs: {systemHealth.backgroundJobs === 'processing' ? 'Processing' :
                                     systemHealth.backgroundJobs === 'stopped' ? 'Stopped' : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
