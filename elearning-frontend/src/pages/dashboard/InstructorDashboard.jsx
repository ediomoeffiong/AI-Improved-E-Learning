import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  // Fetch instructor dashboard data
  useEffect(() => {
    const fetchInstructorDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching instructor dashboard data...');
        
        // For now, use enhanced mock data specific to instructors
        const instructorData = {
          stats: {
            totalCourses: 5,
            publishedCourses: 4,
            draftCourses: 1,
            totalStudents: 247,
            activeStudents: 189,
            totalQuizzes: 23,
            averageQuizScore: 78.5,
            totalAssignments: 15,
            pendingGrading: 8,
            courseRating: 4.6,
            totalRevenue: 12450,
            thisMonthRevenue: 2340
          },
          myCourses: [
            { 
              id: 1, 
              title: 'Introduction to React', 
              students: 89, 
              progress: 75, 
              status: 'published',
              rating: 4.7,
              revenue: 4500,
              lastUpdated: new Date()
            },
            { 
              id: 2, 
              title: 'Advanced JavaScript', 
              students: 67, 
              progress: 60, 
              status: 'published',
              rating: 4.5,
              revenue: 3200,
              lastUpdated: new Date()
            },
            { 
              id: 3, 
              title: 'Node.js Fundamentals', 
              students: 45, 
              progress: 40, 
              status: 'published',
              rating: 4.8,
              revenue: 2800,
              lastUpdated: new Date()
            },
            { 
              id: 4, 
              title: 'Database Design', 
              students: 34, 
              progress: 85, 
              status: 'published',
              rating: 4.4,
              revenue: 1950,
              lastUpdated: new Date()
            },
            { 
              id: 5, 
              title: 'Web Security Basics', 
              students: 12, 
              progress: 20, 
              status: 'draft',
              rating: 0,
              revenue: 0,
              lastUpdated: new Date()
            }
          ],
          recentActivities: [
            { id: 1, type: 'submission', student: 'Alice Johnson', course: 'React Basics', item: 'Assignment 3', date: new Date(), status: 'pending' },
            { id: 2, type: 'enrollment', student: 'Bob Wilson', course: 'Advanced JavaScript', date: new Date(), status: 'new' },
            { id: 3, type: 'quiz', student: 'Carol Davis', course: 'Node.js Fundamentals', item: 'Quiz 2', score: 92, date: new Date(), status: 'completed' },
            { id: 4, type: 'question', student: 'David Brown', course: 'Database Design', item: 'Module 4 Discussion', date: new Date(), status: 'unanswered' }
          ],
          upcomingDeadlines: [
            { id: 1, type: 'assignment', course: 'React Basics', title: 'Final Project Review', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: 'high' },
            { id: 2, type: 'quiz', course: 'Advanced JavaScript', title: 'Module 5 Quiz Grading', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), priority: 'medium' }
          ]
        };
        
        setDashboardData(instructorData);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching instructor dashboard data:', err);
        setError('Unable to load instructor dashboard data. Please try again.');
        
        // Set empty data structure to prevent crashes
        setDashboardData({
          stats: {
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            totalStudents: 0,
            activeStudents: 0,
            totalQuizzes: 0,
            averageQuizScore: 0,
            totalAssignments: 0,
            pendingGrading: 0,
            courseRating: 0,
            totalRevenue: 0,
            thisMonthRevenue: 0
          },
          myCourses: [],
          recentActivities: [],
          upcomingDeadlines: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorDashboardData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate refresh - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'courses', name: 'My Courses', icon: '📚', badge: dashboardData?.stats?.totalCourses || 0 },
    { id: 'students', name: 'Students', icon: '🎓', badge: dashboardData?.stats?.totalStudents || 0 },
    { id: 'grading', name: 'Grading', icon: '📝', badge: dashboardData?.stats?.pendingGrading || 0 },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'content', name: 'Content Creation', icon: '✏️' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission': return '📄';
      case 'enrollment': return '🎓';
      case 'quiz': return '📝';
      case 'question': return '❓';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ROLE_ICONS[USER_ROLES.INSTRUCTOR]} Instructor Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.name || 'Instructor'}!
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
            <div className="flex space-x-4">
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
              <Link to="/courses/create" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Create Course
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Courses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats?.totalCourses || 0}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {dashboardData?.stats?.publishedCourses || 0} published
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats?.totalStudents || 0}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {dashboardData?.stats?.activeStudents || 0} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grading</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats?.pendingGrading || 0}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {dashboardData?.stats?.totalAssignments || 0} total assignments
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats?.courseRating || 0}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Average rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* My Courses */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">My Courses</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6">
                    <div className="space-y-4">
                      {dashboardData?.myCourses?.length > 0 ? (
                        dashboardData.myCourses.slice(0, 3).map((course) => (
                          <div key={course.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {course.students} students
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    course.status === 'published' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>
                                    {course.status}
                                  </span>
                                  {course.rating > 0 && (
                                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                      ⭐ {course.rating}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{course.progress}% complete</span>
                              <span>Updated: {new Date(course.lastUpdated).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="mb-4">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Create Your First Course</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Start sharing your knowledge with students around the world!</p>
                          <Link to="/courses/create" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Create Course
                          </Link>
                        </div>
                      )}
                    </div>
                    {dashboardData?.myCourses?.length > 3 && (
                      <div className="mt-4">
                        <button 
                          onClick={() => setActiveTab('courses')}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 text-sm font-medium"
                        >
                          View all courses →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activities & Upcoming */}
              <div className="space-y-6">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Activities</h2>
                  <div className="space-y-3">
                    {dashboardData?.recentActivities?.length > 0 ? (
                      dashboardData.recentActivities.slice(0, 4).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm bg-purple-500">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {activity.student}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.course} - {activity.item || activity.type}
                            </p>
                          </div>
                          <div className="text-right">
                            {activity.score && (
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                {activity.score}%
                              </span>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Deadlines</h2>
                  <div className="space-y-3">
                    {dashboardData?.upcomingDeadlines?.length > 0 ? (
                      dashboardData.upcomingDeadlines.map((deadline) => (
                        <div key={deadline.id} className="border-l-4 border-purple-500 pl-4 py-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{deadline.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.course}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(deadline.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No upcoming deadlines</p>
                      </div>
                    )}
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
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
