import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, courseAPI, handleAPIError } from '../../services/api';

// Mock data for fallback
const enrolledCourses = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    progress: 75,
    nextClass: 'Tomorrow, 10:00 AM',
    category: 'Web Development',
    duration: '8 weeks',
    completedLessons: 15,
    totalLessons: 20,
    lastAccessed: '2024-01-20',
    status: 'In Progress',
    certificate: false
  },
  {
    id: 2,
    title: 'Advanced JavaScript Concepts',
    instructor: 'Prof. Michael Chen',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    progress: 100,
    nextClass: null,
    category: 'Programming',
    duration: '6 weeks',
    completedLessons: 18,
    totalLessons: 18,
    lastAccessed: '2024-01-15',
    status: 'Completed',
    certificate: true
  }
];

const allAvailableCourses = [
  {
    id: 3,
    title: 'Data Science Fundamentals',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the basics of data science, including Python, statistics, and visualization.',
    category: 'Data Science',
    duration: '6 weeks',
    rating: 4.7,
    badge: 'Popular',
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    instructor: 'Ms. Laura Kim',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Master the fundamentals of user interface and user experience design.',
    category: 'Design',
    duration: '4 weeks',
    rating: 4.5,
    badge: 'New',
  },
  {
    id: 5,
    title: 'Machine Learning Basics',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    description: 'A hands-on introduction to machine learning concepts and algorithms.',
    category: 'Data Science',
    duration: '8 weeks',
    rating: 4.8,
    badge: 'Top Rated',
  },
  {
    id: 6,
    title: 'Frontend Development with React',
    instructor: 'Prof. Michael Chen',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    description: 'Build modern web apps using React and best practices.',
    category: 'Web Development',
    duration: '5 weeks',
    rating: 4.6,
    badge: '',
  },
  {
    id: 7,
    title: 'Digital Marketing Essentials',
    instructor: 'Ms. Laura Kim',
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the core skills for digital marketing and social media.',
    category: 'Marketing',
    duration: '3 weeks',
    rating: 4.3,
    badge: '',
  },
  {
    id: 8,
    title: 'Python for Everybody',
    instructor: 'Dr. Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    description: 'A beginner-friendly course to learn Python programming.',
    category: 'Programming',
    duration: '6 weeks',
    rating: 4.9,
    badge: 'Popular',
  },
  {
    id: 9,
    title: 'Cloud Computing Fundamentals',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Understand the basics of cloud services and deployment.',
    category: 'IT',
    duration: '4 weeks',
    rating: 4.4,
    badge: '',
  },
];

const categories = [
  'All',
  ...Array.from(new Set(allAvailableCourses.map((c) => c.category)))
];
const instructors = [
  'All',
  ...Array.from(new Set(allAvailableCourses.map((c) => c.instructor)))
];

function CoursesDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modalCourse, setModalCourse] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // API state
  const [enrollments, setEnrollments] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
    averageProgress: 0
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for enhanced features
  const mockUpcomingDeadlines = [
    { id: 1, title: 'JavaScript Quiz', course: 'Advanced JavaScript', dueDate: '2024-01-25', type: 'quiz', priority: 'high' },
    { id: 2, title: 'Final Project Submission', course: 'Web Development', dueDate: '2024-01-28', type: 'assignment', priority: 'medium' },
    { id: 3, title: 'Peer Review', course: 'UI/UX Design', dueDate: '2024-01-30', type: 'review', priority: 'low' }
  ];

  const mockRecentActivity = [
    { id: 1, action: 'Completed lesson', item: 'React Hooks Basics', course: 'Frontend Development', time: '2 hours ago', type: 'completion' },
    { id: 2, action: 'Submitted assignment', item: 'Portfolio Project', course: 'Web Development', time: '1 day ago', type: 'submission' },
    { id: 3, action: 'Joined discussion', item: 'Best Practices Thread', course: 'JavaScript Concepts', time: '2 days ago', type: 'discussion' },
    { id: 4, action: 'Earned certificate', item: 'Python Fundamentals', course: 'Python for Everybody', time: '3 days ago', type: 'achievement' }
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch enrollments and stats
        const [enrollmentsData, statsData] = await Promise.all([
          enrollmentAPI.getEnrollments(),
          enrollmentAPI.getEnrollmentStats().catch(() => null)
        ]);

        setEnrollments(enrollmentsData || []);
        setRecentCourses(enrollmentsData?.slice(0, 4) || []);

        if (statsData) {
          setStats(statsData);
        } else {
          // Calculate stats from enrollments
          const totalCourses = enrollmentsData?.length || 0;
          const completedCourses = enrollmentsData?.filter(e => e.status === 'Completed').length || 0;
          const inProgressCourses = enrollmentsData?.filter(e => e.status === 'In Progress').length || 0;
          const certificates = enrollmentsData?.filter(e => e.certificate).length || 0;
          const averageProgress = totalCourses > 0
            ? Math.round(enrollmentsData.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
            : 0;

          setStats({
            totalCourses,
            completedCourses,
            inProgressCourses,
            certificates,
            averageProgress
          });
        }

        // Set mock data for enhanced features
        setUpcomingDeadlines(mockUpcomingDeadlines);
        setRecentActivity(mockRecentActivity);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(handleAPIError(err));

        // Fallback to mock data
        setEnrollments(enrolledCourses);
        setRecentCourses(enrolledCourses);
        setUpcomingDeadlines(mockUpcomingDeadlines);
        setRecentActivity(mockRecentActivity);
        setStats({
          totalCourses: enrolledCourses.length,
          completedCourses: 1,
          inProgressCourses: enrolledCourses.length - 1,
          certificates: 1,
          averageProgress: 60
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper functions
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completion':
        return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'submission':
        return <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'discussion':
        return <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
      case 'achievement':
        return <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
      default:
        return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Demo Mode Banner */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Mode</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Backend service is not available. Showing sample data for demonstration.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Course Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your learning journey and track your progress</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/courses/available"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Browse Courses
              </Link>
              <Link
                to="/courses/my-courses"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'progress', label: 'Progress', icon: '📈' },
                { id: 'schedule', label: 'Schedule', icon: '📅' },
                { id: 'activity', label: 'Activity', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedCourses}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold">{stats.inProgressCourses}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Certificates</p>
                    <p className="text-3xl font-bold">{stats.certificates}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Courses */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Continue Learning</h3>
                    <Link to="/courses/my-courses" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentCourses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <img src={course.image} alt={course.title} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{course.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{course.instructor}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-300">Progress</span>
                              <span className="font-medium text-gray-800 dark:text-white">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/courses/${course.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Continue
                        </Link>
                      </div>
                    ))}
                  </div>
                  {recentCourses.length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No courses yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Start your learning journey by enrolling in a course</p>
                      <Link
                        to="/courses/available"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{deadline.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{deadline.course}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{deadline.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {upcomingDeadlines.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming deadlines</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/courses/available"
                      className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Browse Courses</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Find new courses to learn</p>
                      </div>
                    </Link>

                    <Link
                      to="/courses/materials"
                      className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    >
                      <div className="bg-green-600 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Course Materials</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Access learning resources</p>
                      </div>
                    </Link>

                    <Link
                      to="/courses/discussion"
                      className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Discussions</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Join course discussions</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Learning Progress</h3>
            <div className="space-y-6">
              {enrollments.map((course) => (
                <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{course.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{course.instructor}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{course.progress}%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{course.completedLessons}/{course.totalLessons} lessons</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                    <span className={`font-medium ${course.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Upcoming Schedule</h3>
            <div className="space-y-4">
              {upcomingDeadlines.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {new Date(item.dueDate).getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.course}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {item.dueDate}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority} priority
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-white">
                      <span className="font-medium">{activity.action}</span> "{activity.item}"
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{activity.course}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesDashboard; 