import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, superAdminAPI } from '../../services/api';

const ModernSuperAdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper function to format trend percentages (prevent negative values)
  const formatTrend = (value) => {
    if (!value || value === 0) return null;
    if (value < 0) return '+0%'; // Show +0% instead of negative values
    return `+${value}%`;
  };
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    pendingApprovals: 0,
    superAdmins: 0,
    institutionAdmins: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    systemHealth: 'good',
    trends: {
      usersGrowth: 0,
      institutionsGrowth: 0,
      approvalsChange: 0,
      coursesGrowth: 0
    }
  });
  const [analytics, setAnalytics] = useState({
    growthRate: 0,
    revenueThisMonth: 0,
    satisfactionRating: 0,
    courseCompletionRate: 0,
    activeUsersThisWeek: 0,
    averageQuizScore: 0,
    totalTimeSpentHours: 0,
    platformUtilization: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true);
        setError(null);
      }

      const response = await superAdminAPI.getStats();
      
      setStats({
        totalUsers: response.stats.totalUsers || 0,
        totalInstitutions: response.stats.totalInstitutions || 0,
        pendingApprovals: response.stats.pendingApprovals || 0,
        superAdmins: response.stats.superAdmins || 0,
        institutionAdmins: response.stats.institutionAdmins || 0,
        totalCourses: response.stats.totalCourses || 0,
        totalEnrollments: response.stats.totalEnrollments || 0,
        systemHealth: response.systemHealth || 'good',
        trends: {
          usersGrowth: response.trends?.usersGrowth || 0,
          institutionsGrowth: response.trends?.institutionsGrowth || 0,
          approvalsChange: response.trends?.approvalsChange || 0,
          coursesGrowth: response.trends?.coursesGrowth || 0
        }
      });

      // Set analytics data from real backend response
      setAnalytics({
        growthRate: response.analytics?.growthRate || 0,
        revenueThisMonth: response.analytics?.revenueThisMonth || 0,
        satisfactionRating: response.analytics?.satisfactionRating || 0,
        courseCompletionRate: response.analytics?.courseCompletionRate || 0,
        activeUsersThisWeek: response.analytics?.activeUsersThisWeek || 0,
        averageQuizScore: response.analytics?.averageQuizScore || 0,
        totalTimeSpentHours: response.analytics?.totalTimeSpentHours || 0,
        platformUtilization: response.analytics?.platformUtilization || 0
      });

      setRecentUsers(response.recentUsers || []);
      setRecentActivities(response.recentActivities || []);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 dark:border-t-red-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Super Admin Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400">Initializing command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      
      {/* Modern Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 lg:py-8 space-y-4 lg:space-y-0">
            
            {/* Header Left - Title and Status */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-red-500 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl lg:text-3xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 bg-clip-text text-transparent">
                  Super Admin
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 font-medium mt-1 lg:mt-2">
                  Welcome back, {currentUser?.name || 'Administrator'} 👋
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mt-2 lg:mt-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      stats.systemHealth === 'good' ? 'bg-green-500' :
                      stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      stats.systemHealth === 'good' ? 'text-green-600 dark:text-green-400' :
                      stats.systemHealth === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      System {stats.systemHealth === 'good' ? 'Online' : stats.systemHealth === 'warning' ? 'Warning' : 'Critical'}
                    </span>
                  </div>
                  {lastUpdated && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right - Quick Actions */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              {/* Mobile: Compact icon-only buttons */}
              <div className="flex sm:hidden items-center gap-2 w-full">
                <button
                  onClick={() => fetchDashboardData()}
                  className="group relative flex items-center justify-center w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
                  title="Refresh Dashboard"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <Link
                  to="/super-admin/settings"
                  className="group relative flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 hover:from-blue-700 hover:via-blue-800 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                  title="Super Admin Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>

              {/* Tablet and Desktop: Full buttons with text */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => fetchDashboardData()}
                  className="group relative inline-flex items-center px-4 md:px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link
                  to="/super-admin/settings"
                  className="group relative inline-flex items-center px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 hover:from-blue-700 hover:via-blue-800 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-12">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-6 lg:mb-8 overflow-x-auto" aria-label="Breadcrumb">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap">
            Home
          </Link>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Super Admin</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </nav>
        
        {/* Error Banner */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">System Alert</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation System */}
        <div className="mb-12">
          {/* Main Navigation */}
          <nav className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 lg:p-3 border border-white/30 dark:border-gray-700/50 shadow-2xl mb-6 overflow-x-auto">
            <div className="flex gap-1 lg:gap-2 min-w-max">
              {[
                {
                  id: 'overview',
                  label: 'Dashboard Overview',
                  shortLabel: 'Overview',
                  icon: '🏠',
                  category: 'main',
                  description: 'Platform overview and key metrics'
                },
                {
                  id: 'users',
                  label: 'User Management',
                  shortLabel: 'Users',
                  icon: '👥',
                  badge: stats.pendingApprovals > 0 ? stats.pendingApprovals : null,
                  category: 'management',
                  description: 'Manage users and approvals'
                },
                {
                  id: 'institutions',
                  label: 'Institution Oversight',
                  shortLabel: 'Institutions',
                  icon: '🏛️',
                  category: 'management',
                  description: 'Manage educational institutions'
                },
                {
                  id: 'analytics',
                  label: 'Platform Analytics',
                  shortLabel: 'Analytics',
                  icon: '📊',
                  category: 'insights',
                  description: 'Detailed analytics and reports'
                },
                {
                  id: 'system',
                  label: 'System Health',
                  shortLabel: 'System',
                  icon: '⚙️',
                  category: 'technical',
                  description: 'System monitoring and health'
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-2 lg:space-x-3 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                  title={tab.description}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {tab.description}
                  </div>
                </button>
              ))}
            </div>
          </nav>


        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon="👥"
                gradient="from-blue-500 to-cyan-500"
                description="Platform users"
                trend={formatTrend(stats.trends?.usersGrowth)}
              />
              <StatCard
                title="Institutions"
                value={stats.totalInstitutions.toLocaleString()}
                icon="🏛️"
                gradient="from-green-500 to-emerald-500"
                description="Verified institutions"
                trend={null}
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals.toLocaleString()}
                icon="⏳"
                gradient="from-yellow-500 to-orange-500"
                description="Awaiting review"
                trend={formatTrend(stats.trends?.approvalsChange)}
              />
              <StatCard
                title="Total Courses"
                value={stats.totalCourses.toLocaleString()}
                icon="📚"
                gradient="from-purple-500 to-indigo-500"
                description="Available courses"
                trend={formatTrend(stats.trends?.coursesGrowth)}
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <QuickActionCard
                title="User Management"
                description="Review and manage all platform users"
                icon="👥"
                gradient="from-blue-500 to-cyan-500"
                onClick={() => setActiveTab('users')}
                badge={stats.pendingApprovals > 0 ? stats.pendingApprovals : null}
              />
              <QuickActionCard
                title="Institution Oversight"
                description="Manage and verify educational institutions"
                icon="🏛️"
                gradient="from-green-500 to-emerald-500"
                onClick={() => setActiveTab('institutions')}
              />
              <QuickActionCard
                title="System Analytics"
                description="View detailed platform analytics and reports"
                icon="📊"
                gradient="from-purple-500 to-indigo-500"
                onClick={() => setActiveTab('analytics')}
              />
              <QuickActionCard
                title="System Health"
                description="Monitor platform performance and status"
                icon="⚙️"
                gradient="from-blue-600 via-blue-700 to-red-500"
                onClick={() => setActiveTab('system')}
              />
              <QuickActionCard
                title="Global Settings"
                description="Configure platform-wide settings"
                icon="🔧"
                gradient="from-yellow-500 to-orange-500"
                onClick={() => window.location.href = '/super-admin/settings'}
              />
              <QuickActionCard
                title="Activity Monitor"
                description="Real-time platform activity tracking"
                icon="📈"
                gradient="from-indigo-500 to-purple-500"
                onClick={() => window.location.href = '/super-admin/activity-monitor'}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentUsersCard users={recentUsers} />
              <RecentActivitiesCard activities={recentActivities} />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-12">
            {/* User Management Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-10 shadow-lg">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl">👥</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive user administration and oversight</p>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total Users</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">All registered users</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">⏳</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApprovals}</span>
                  </div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Pending Approvals</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Awaiting review</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">👑</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.institutionAdmins}</span>
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Institution Admins</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Verified administrators</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.superAdmins}</span>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Super Admins</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Platform administrators</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/super-admin/user-approvals"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">✅</span>
                  Review Approvals
                  {stats.pendingApprovals > 0 && (
                    <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
                <Link
                  to="/super-admin/users"
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">👥</span>
                  All Users
                </Link>
                <Link
                  to="/super-admin/user-roles"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">🔐</span>
                  Manage Roles
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === 'institutions' && (
          <div className="space-y-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-10 shadow-lg">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl">🏛️</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Institution Management</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Oversee and manage educational institutions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🏛️</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalInstitutions}</span>
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Total Institutions</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Verified institutions</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📚</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCourses}</span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total Courses</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Across all institutions</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEnrollments}</span>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Total Enrollments</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Student enrollments</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/super-admin/institutions"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">🏛️</span>
                  Manage Institutions
                </Link>
                <Link
                  to="/super-admin/institution-verification"
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">✅</span>
                  Verification Queue
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-10 shadow-lg">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl">📊</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Analytics</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">📈</span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Growth Rate</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate}%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">This month</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${(analytics.revenueThisMonth / 1000).toFixed(1)}K
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">This month</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">⭐</span>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Satisfaction</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.satisfactionRating.toFixed(1)}/5
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Average rating</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Completion</h3>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.courseCompletionRate}%
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Course completion</p>
                </div>
              </div>

              {/* Additional Analytics Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Active Users</h3>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analytics.activeUsersThisWeek.toLocaleString()}
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">This week</p>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">🧠</span>
                  </div>
                  <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">Quiz Performance</h3>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {analytics.averageQuizScore}%
                  </p>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">Average score</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">⏱️</span>
                  </div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Study Time</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {analytics.totalTimeSpentHours.toLocaleString()}h
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Total hours</p>
                </div>

                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Utilization</h3>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {analytics.platformUtilization}%
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400">Platform usage</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/super-admin/analytics"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">📊</span>
                  Detailed Analytics
                </Link>
                <Link
                  to="/super-admin/reports"
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">📋</span>
                  Generate Reports
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-10 shadow-lg">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl">⚙️</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Health</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Monitor platform performance and status</p>
                </div>
              </div>

              {/* System Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className={`rounded-2xl p-6 ${
                  stats.systemHealth === 'good' ? 'bg-green-50 dark:bg-green-900/20' :
                  stats.systemHealth === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stats.systemHealth === 'good' ? 'bg-green-500' :
                      stats.systemHealth === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      <span className="text-white text-lg">
                        {stats.systemHealth === 'good' ? '✅' : stats.systemHealth === 'warning' ? '⚠️' : '❌'}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      stats.systemHealth === 'good' ? 'bg-green-500' :
                      stats.systemHealth === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    stats.systemHealth === 'good' ? 'text-green-900 dark:text-green-100' :
                    stats.systemHealth === 'warning' ? 'text-yellow-900 dark:text-yellow-100' :
                    'text-red-900 dark:text-red-100'
                  }`}>
                    Overall Status
                  </h3>
                  <p className={`text-sm ${
                    stats.systemHealth === 'good' ? 'text-green-600 dark:text-green-400' :
                    stats.systemHealth === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.systemHealth === 'good' ? 'All systems operational' :
                     stats.systemHealth === 'warning' ? 'Some issues detected' :
                     'Critical issues present'}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">💾</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">98%</span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Database Health</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Optimal performance</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🌐</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</span>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">API Uptime</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Last 30 days</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/super-admin/system-monitor"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 hover:from-blue-700 hover:via-blue-800 hover:to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">📊</span>
                  System Monitor
                </Link>
                <Link
                  to="/super-admin/logs"
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">📋</span>
                  View Logs
                </Link>
                <Link
                  to="/super-admin/maintenance"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">🔧</span>
                  Maintenance
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Stat Card Component
const StatCard = ({ title, value, icon, gradient, description, trend }) => (
  <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300" style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
            trend.startsWith('-') ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
          }`}>
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, gradient, onClick, badge }) => (
  <button
    onClick={onClick}
    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left w-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300" style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        {badge && badge > 0 && (
          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
        <span>Access now</span>
        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </button>
);

// Recent Users Card Component
const RecentUsersCard = ({ users }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Users</h3>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
        <span className="text-white text-lg">👥</span>
      </div>
    </div>
    <div className="space-y-4">
      {users.length > 0 ? (
        users.slice(0, 5).map((user, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{user.name || 'Unknown User'}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email || 'No email'}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No recent users</p>
        </div>
      )}
    </div>
  </div>
);

// Recent Activities Card Component
const RecentActivitiesCard = ({ activities }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
        <span className="text-white text-lg">📊</span>
      </div>
    </div>
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📈</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{activity.action || 'System Activity'}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description || 'Platform activity'}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'Recent'}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No recent activities</p>
        </div>
      )}
    </div>
  </div>
);

export default ModernSuperAdminDashboard;
