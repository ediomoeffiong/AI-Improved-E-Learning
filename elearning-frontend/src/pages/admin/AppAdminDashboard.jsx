import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AppAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 15847,
    totalInstitutions: 127,
    totalAdmins: 254,
    totalModerators: 89,
    activeUsers: 8934,
    newRegistrations: 234,
    systemHealth: 98.5,
    serverLoad: 67
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'login',
      user: 'John Doe (Student)',
      institution: 'University of Lagos',
      timestamp: '2024-01-15 14:30:25',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      type: 'registration',
      user: 'Jane Smith (Instructor)',
      institution: 'Ahmadu Bello University',
      timestamp: '2024-01-15 14:28:15',
      ip: '10.0.0.45',
      status: 'pending_approval'
    },
    {
      id: 3,
      type: 'quiz_completed',
      user: 'Mike Johnson (Student)',
      institution: 'University of Ibadan',
      timestamp: '2024-01-15 14:25:10',
      details: 'Mathematics Quiz - Score: 85%',
      status: 'completed'
    },
    {
      id: 4,
      type: 'admin_action',
      user: 'Sarah Wilson (Admin)',
      institution: 'Federal University of Technology, Akure',
      timestamp: '2024-01-15 14:20:05',
      details: 'Approved 3 student registrations',
      status: 'completed'
    },
    {
      id: 5,
      type: 'system_alert',
      user: 'System',
      institution: 'Platform Wide',
      timestamp: '2024-01-15 14:15:00',
      details: 'High server load detected - Auto-scaling initiated',
      status: 'resolved'
    }
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'High Server Load',
      message: 'Server load is at 85%. Consider scaling resources.',
      timestamp: '2024-01-15 14:15:00',
      status: 'active'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2:00 AM.',
      timestamp: '2024-01-15 12:00:00',
      status: 'scheduled'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'institutions', name: 'Institutions', icon: '🏫' },
    { id: 'activities', name: 'Activity Monitor', icon: '📈' },
    { id: 'system', name: 'System Health', icon: '⚙️' },
    { id: 'reports', name: 'Reports', icon: '📋' }
  ];

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
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
                ⚡ Super Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Platform-wide monitoring and management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                  System Healthy
                </span>
              </div>
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
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
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
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Institutions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInstitutions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Admins</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moderators</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalModerators}</p>
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
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.institution}</p>
                          {activity.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{activity.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Alerts</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' :
                      alert.type === 'error' ? 'bg-red-50 border-red-400 dark:bg-red-900/20' :
                      'bg-blue-50 border-blue-400 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.institution}</p>
                          {activity.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{activity.details}</p>
                          )}
                          {activity.ip && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">IP: {activity.ip}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
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
                to="/super-admin/universities"
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">🏫</span>
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
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Admin Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verify institution admin requests</p>
                  </div>
                </div>
              </Link>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Institution performance metrics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Institution Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">127</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified Universities</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">5</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">254</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">89</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Moderators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && activeTab !== 'activities' && activeTab !== 'institutions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section is under development. Advanced {activeTab} management features will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppAdminDashboard;
