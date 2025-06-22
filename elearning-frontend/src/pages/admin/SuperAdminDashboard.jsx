import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_COLORS, ROLE_ICONS } from '../../constants/roles';
import CreateAdminForm from '../../components/admin/CreateAdminForm';

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
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - will be replaced with actual API calls
      const mockStats = {
        totalUsers: 15847,
        totalInstitutions: 234,
        pendingApprovals: 23,
        superAdmins: 3,
        institutionAdmins: 156
      };

      const mockRecentUsers = [
        { id: 1, name: 'John Doe', email: 'john@university.edu', role: 'Admin', createdAt: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@college.edu', role: 'Moderator', createdAt: '2024-01-14' },
        { id: 3, name: 'Mike Johnson', email: 'mike@institute.edu', role: 'Instructor', createdAt: '2024-01-13' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@school.edu', role: 'Student', createdAt: '2024-01-12' },
        { id: 5, name: 'David Brown', email: 'david@academy.edu', role: 'Admin', createdAt: '2024-01-11' }
      ];

      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[currentUser?.role] || 'text-gray-600 bg-gray-100'}`}>
                {ROLE_ICONS[currentUser?.role]} {currentUser?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent User Registrations</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{user.createdAt}</p>
                        </div>
                      </div>
                    ))}
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

        {/* System Health Status - Show on overview tab */}
        {activeTab === 'overview' && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database: Online</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Services: Operational</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Background Jobs: Processing</span>
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
