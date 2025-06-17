import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InstitutionAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [institutionStats, setInstitutionStats] = useState({
    totalStudents: 2847,
    totalInstructors: 156,
    pendingApprovals: 23,
    activeCourses: 89,
    completedQuizzes: 1234,
    averageCBTScore: 78.5,
    monthlyLogins: 5678,
    institutionName: 'University of Lagos'
  });

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@student.unilag.edu.ng',
      role: 'Student',
      department: 'Computer Science',
      studentId: 'CS/2024/001',
      submittedAt: '2024-01-15 10:30:00',
      documents: ['Student ID', 'Admission Letter']
    },
    {
      id: 2,
      name: 'Dr. Jane Smith',
      email: 'jane.smith@unilag.edu.ng',
      role: 'Instructor',
      department: 'Mathematics',
      staffId: 'MATH/2024/15',
      submittedAt: '2024-01-15 09:15:00',
      documents: ['Staff ID', 'Employment Letter']
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'quiz_completed',
      user: 'Alice Johnson',
      course: 'Introduction to Programming',
      score: 92,
      timestamp: '2024-01-15 14:30:00',
      department: 'Computer Science'
    },
    {
      id: 2,
      type: 'cbt_completed',
      user: 'Bob Wilson',
      course: 'Calculus I',
      score: 85,
      timestamp: '2024-01-15 14:25:00',
      department: 'Mathematics'
    },
    {
      id: 3,
      type: 'login',
      user: 'Prof. Mary Brown',
      role: 'Instructor',
      timestamp: '2024-01-15 14:20:00',
      department: 'Physics'
    },
    {
      id: 4,
      type: 'course_created',
      user: 'Dr. David Lee',
      course: 'Advanced Chemistry',
      timestamp: '2024-01-15 14:15:00',
      department: 'Chemistry'
    }
  ]);

  const [topPerformers, setTopPerformers] = useState([
    { name: 'Alice Johnson', department: 'Computer Science', avgScore: 94.5, quizzesCompleted: 15 },
    { name: 'Bob Wilson', department: 'Mathematics', avgScore: 91.2, quizzesCompleted: 12 },
    { name: 'Carol Davis', department: 'Physics', avgScore: 89.8, quizzesCompleted: 18 },
    { name: 'David Brown', department: 'Chemistry', avgScore: 87.3, quizzesCompleted: 14 }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'approvals', name: 'Pending Approvals', icon: '✅', badge: pendingApprovals.length },
    { id: 'moderators', name: 'Moderator Verification', icon: '🛡️' },
    { id: 'students', name: 'Students', icon: '🎓' },
    { id: 'instructors', name: 'Instructors', icon: '👨‍🏫' },
    { id: 'activities', name: 'Activities', icon: '📈' },
    { id: 'reports', name: 'Reports', icon: '📋' }
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
                👑 Institution Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {institutionStats.institutionName} - Management Portal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  Primary Admin
                </span>
              </div>
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
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{institutionStats.totalStudents.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instructors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{institutionStats.totalInstructors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{institutionStats.pendingApprovals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{institutionStats.activeCourses}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Completed Quizzes</span>
                    <span className="font-bold text-gray-900 dark:text-white">{institutionStats.completedQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average CBT Score</span>
                    <span className="font-bold text-gray-900 dark:text-white">{institutionStats.averageCBTScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Logins</span>
                    <span className="font-bold text-gray-900 dark:text-white">{institutionStats.monthlyLogins.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{performer.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{performer.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">{performer.avgScore}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{performer.quizzesCompleted} quizzes</p>
                      </div>
                    </div>
                  ))}
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.department}</p>
                          {activity.course && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{activity.course}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                            {activity.score}%
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
                  {pendingApprovals.slice(0, 3).map((approval) => (
                    <div key={approval.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{approval.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{approval.email}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                            {approval.role}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{approval.submittedAt}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{approval.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {approval.role === 'Student' ? 'Student ID' : 'Staff ID'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {approval.studentId || approval.staffId}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documents Submitted</p>
                        <div className="flex flex-wrap gap-2">
                          {approval.documents.map((doc, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {doc}
                            </span>
                          ))}
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
                  ))}
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

        {/* Other tabs content placeholder */}
        {activeTab !== 'overview' && activeTab !== 'approvals' && activeTab !== 'moderators' && (
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

export default InstitutionAdminDashboard;
