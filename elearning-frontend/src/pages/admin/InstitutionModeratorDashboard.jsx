import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InstitutionModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [moderatorStats, setModeratorStats] = useState({
    assignedStudents: 847,
    assignedInstructors: 23,
    recentQuizzes: 156,
    averageScore: 82.3,
    flaggedActivities: 5,
    monthlyReports: 12,
    institutionName: 'University of Lagos',
    department: 'Computer Science'
  });

  const [assignedUsers, setAssignedUsers] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      role: 'Student',
      department: 'Computer Science',
      lastActive: '2024-01-15 14:30:00',
      status: 'active',
      recentScore: 92,
      totalQuizzes: 15
    },
    {
      id: 2,
      name: 'Bob Wilson',
      role: 'Student',
      department: 'Computer Science',
      lastActive: '2024-01-15 13:45:00',
      status: 'active',
      recentScore: 78,
      totalQuizzes: 12
    },
    {
      id: 3,
      name: 'Dr. Carol Davis',
      role: 'Instructor',
      department: 'Computer Science',
      lastActive: '2024-01-15 12:20:00',
      status: 'active',
      coursesCreated: 3,
      studentsEnrolled: 145
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'quiz_completed',
      user: 'Alice Johnson',
      course: 'Data Structures',
      score: 92,
      timestamp: '2024-01-15 14:30:00',
      flagged: false
    },
    {
      id: 2,
      type: 'suspicious_activity',
      user: 'Bob Wilson',
      course: 'Algorithms',
      details: 'Multiple rapid submissions detected',
      timestamp: '2024-01-15 14:25:00',
      flagged: true
    },
    {
      id: 3,
      type: 'course_update',
      user: 'Dr. Carol Davis',
      course: 'Introduction to Programming',
      details: 'Added new quiz module',
      timestamp: '2024-01-15 14:20:00',
      flagged: false
    },
    {
      id: 4,
      type: 'login',
      user: 'David Brown',
      timestamp: '2024-01-15 14:15:00',
      flagged: false
    }
  ]);

  const [flaggedActivities, setFlaggedActivities] = useState([
    {
      id: 1,
      user: 'Bob Wilson',
      type: 'Rapid Quiz Submissions',
      description: 'Completed 5 quizzes in 10 minutes',
      severity: 'medium',
      timestamp: '2024-01-15 14:25:00',
      status: 'pending'
    },
    {
      id: 2,
      user: 'Emma Davis',
      type: 'Unusual Login Pattern',
      description: 'Login from multiple locations within 1 hour',
      severity: 'high',
      timestamp: '2024-01-15 13:45:00',
      status: 'investigating'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'Assigned Users', icon: '👥' },
    { id: 'activities', name: 'Activities', icon: '📈' },
    { id: 'flagged', name: 'Flagged Items', icon: '🚩', badge: flaggedActivities.length },
    { id: 'reports', name: 'Reports', icon: '📋' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return '📝';
      case 'suspicious_activity': return '⚠️';
      case 'course_update': return '📚';
      case 'login': return '🔐';
      default: return '📌';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleFlaggedAction = (id, action) => {
    setFlaggedActivities(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: action } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🛡️ Moderator Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {moderatorStats.institutionName} - {moderatorStats.department} Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 dark:bg-orange-900 px-3 py-1 rounded-full">
                <span className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                  Moderator
                </span>
              </div>
              <Link
                to="/moderator/settings"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
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
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Students</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moderatorStats.assignedStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Instructors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moderatorStats.assignedInstructors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moderatorStats.recentQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <span className="text-2xl">🚩</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged Activities</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{moderatorStats.flaggedActivities}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">📊</span>
                    <p className="font-medium text-gray-900 dark:text-white">Generate Report</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create activity summary</p>
                  </div>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🔍</span>
                    <p className="font-medium text-gray-900 dark:text-white">Review Flagged</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check suspicious activities</p>
                  </div>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">📧</span>
                    <p className="font-medium text-gray-900 dark:text-white">Send Notification</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alert users or admins</p>
                  </div>
                </button>
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
                    <div key={activity.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      activity.flagged ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                          {activity.course && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{activity.course}</p>
                          )}
                          {activity.details && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                            {activity.score}%
                          </span>
                        )}
                        {activity.flagged && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium ml-2">
                            Flagged
                          </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Activities Tab */}
        {activeTab === 'flagged' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Flagged Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {flaggedActivities.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{item.user}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Flagged</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.timestamp}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleFlaggedAction(item.id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleFlaggedAction(item.id, 'escalated')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Escalate to Admin
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Investigate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assigned Users</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          user.role === 'Student' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'
                        }`}>
                          <span className="text-xl">{user.role === 'Student' ? '🎓' : '👨‍🏫'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role} - {user.department}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Last active: {user.lastActive}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {user.role === 'Student' ? (
                          <>
                            <p className="font-bold text-green-600 dark:text-green-400">Score: {user.recentScore}%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.totalQuizzes} quizzes completed</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-purple-600 dark:text-purple-400">{user.coursesCreated} courses</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.studentsEnrolled} students enrolled</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content placeholder */}
        {activeTab !== 'overview' && activeTab !== 'flagged' && activeTab !== 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section is under development. Advanced {activeTab} features will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionModeratorDashboard;
