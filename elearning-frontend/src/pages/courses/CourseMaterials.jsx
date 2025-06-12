import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, handleAPIError } from '../../services/api';

// Mock data for course materials
const mockMaterials = {
  courses: [
    {
      id: 1,
      title: 'Data Science Fundamentals',
      instructor: 'Dr. Emily Rodriguez',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
      progress: 75,
      materials: {
        videos: [
          { id: 1, title: 'Introduction to Data Science', duration: '15:30', watched: true, url: '#' },
          { id: 2, title: 'Python Basics for Data Science', duration: '22:45', watched: true, url: '#' },
          { id: 3, title: 'Data Visualization Techniques', duration: '18:20', watched: false, url: '#' },
          { id: 4, title: 'Statistical Analysis Methods', duration: '25:10', watched: false, url: '#' }
        ],
        documents: [
          { id: 1, title: 'Course Syllabus', type: 'PDF', size: '2.3 MB', downloadUrl: '#' },
          { id: 2, title: 'Python Cheat Sheet', type: 'PDF', size: '1.8 MB', downloadUrl: '#' },
          { id: 3, title: 'Dataset Collection', type: 'ZIP', size: '15.2 MB', downloadUrl: '#' },
          { id: 4, title: 'Reading List', type: 'PDF', size: '0.8 MB', downloadUrl: '#' }
        ],
        assignments: [
          { id: 1, title: 'Data Analysis Project', dueDate: '2024-02-15', status: 'submitted', grade: 'A-' },
          { id: 2, title: 'Visualization Challenge', dueDate: '2024-02-22', status: 'pending', grade: null },
          { id: 3, title: 'Final Project Proposal', dueDate: '2024-03-01', status: 'not_started', grade: null }
        ],
        quizzes: [
          { id: 1, title: 'Python Fundamentals Quiz', attempts: 2, bestScore: 85, status: 'completed' },
          { id: 2, title: 'Statistics Concepts Quiz', attempts: 1, bestScore: 92, status: 'completed' },
          { id: 3, title: 'Data Visualization Quiz', attempts: 0, bestScore: null, status: 'available' }
        ]
      }
    },
    {
      id: 2,
      title: 'Frontend Development with React',
      instructor: 'Prof. Michael Chen',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      progress: 45,
      materials: {
        videos: [
          { id: 5, title: 'React Fundamentals', duration: '20:15', watched: true, url: '#' },
          { id: 6, title: 'Component Lifecycle', duration: '18:30', watched: true, url: '#' },
          { id: 7, title: 'State Management', duration: '25:45', watched: false, url: '#' }
        ],
        documents: [
          { id: 5, title: 'React Documentation', type: 'PDF', size: '3.1 MB', downloadUrl: '#' },
          { id: 6, title: 'Project Starter Code', type: 'ZIP', size: '8.5 MB', downloadUrl: '#' }
        ],
        assignments: [
          { id: 4, title: 'Todo App Build', dueDate: '2024-02-20', status: 'in_progress', grade: null }
        ],
        quizzes: [
          { id: 4, title: 'React Basics Quiz', attempts: 1, bestScore: 78, status: 'completed' }
        ]
      }
    }
  ],
  recentActivity: [
    { id: 1, action: 'Downloaded', item: 'Python Cheat Sheet', course: 'Data Science Fundamentals', time: '2 hours ago' },
    { id: 2, action: 'Watched', item: 'React Fundamentals', course: 'Frontend Development', time: '1 day ago' },
    { id: 3, action: 'Submitted', item: 'Data Analysis Project', course: 'Data Science Fundamentals', time: '2 days ago' }
  ]
};

function CourseMaterials() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState(mockMaterials);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's enrolled courses and their materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch materials from the API
        // const enrollments = await enrollmentAPI.getEnrollments();
        // Process and set materials
        setMaterials(mockMaterials);
        if (mockMaterials.courses.length > 0) {
          setSelectedCourse(mockMaterials.courses[0]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError(handleAPIError(err));
        setMaterials(mockMaterials);
        if (mockMaterials.courses.length > 0) {
          setSelectedCourse(mockMaterials.courses[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'available':
      case 'not_started':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'zip':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Course Materials</h1>
              <p className="text-gray-600 dark:text-gray-400">Access all your learning resources in one place</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/courses/my-courses"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Courses
              </Link>
              <Link
                to="/courses/dashboard"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Courses</h3>
              <div className="space-y-3">
                {materials.courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCourse?.id === course.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={course.image} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{course.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{course.instructor}</p>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {materials.recentActivity.map((activity) => (
                    <div key={activity.id} className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{activity.action}</span> {activity.item}
                      <div className="text-gray-500 dark:text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCourse ? (
              <div>
                {/* Course Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center space-x-4">
                    <img src={selectedCourse.image} alt={selectedCourse.title} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{selectedCourse.instructor}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Progress:</span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedCourse.progress}%</span>
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedCourse.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: 'videos', label: 'Videos', icon: '🎥', count: selectedCourse.materials.videos.length },
                        { id: 'documents', label: 'Documents', icon: '📄', count: selectedCourse.materials.documents.length },
                        { id: 'assignments', label: 'Assignments', icon: '📝', count: selectedCourse.materials.assignments.length },
                        { id: 'quizzes', label: 'Quizzes', icon: '❓', count: selectedCourse.materials.quizzes.length }
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
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={`Search ${activeTab}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Videos Tab */}
                    {activeTab === 'videos' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Video Lectures</h3>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedCourse.materials.videos.filter(v => v.watched).length} of {selectedCourse.materials.videos.length} watched
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Create Playlist
                            </button>
                          </div>
                        </div>
                        {selectedCourse.materials.videos
                          .filter(video => video.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((video) => (
                          <div key={video.id} className="group flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md">
                            <div className="flex-shrink-0">
                              <div className="relative w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                {video.watched ? (
                                  <svg className="w-6 h-6 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v3m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3z" />
                                  </svg>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                  {video.duration}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{video.title}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {video.duration}</p>
                                {video.watched && (
                                  <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 p-2 rounded-lg transition-colors" title="Add to playlist">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v3m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3z" />
                                </svg>
                                {video.watched ? 'Rewatch' : 'Watch'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Course Documents</h3>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download All
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCourse.materials.documents
                            .filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((doc) => (
                            <div key={doc.id} className="group flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                                  {getFileIcon(doc.type)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{doc.type}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{doc.size}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 p-2 rounded-lg transition-colors" title="Preview">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* No results message */}
                        {selectedCourse.materials.documents.filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && searchTerm && (
                          <div className="text-center py-8">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No documents found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assignments</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedCourse.materials.assignments.filter(a => a.status === 'submitted').length} of {selectedCourse.materials.assignments.length} submitted
                          </div>
                        </div>
                        {selectedCourse.materials.assignments
                          .filter(assignment => assignment.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((assignment) => (
                          <div key={assignment.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{assignment.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                {assignment.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                                  </svg>
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </div>
                                {assignment.grade && (
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="font-medium text-green-600 dark:text-green-400">Grade: {assignment.grade}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                {assignment.status === 'not_started' && (
                                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Start Assignment
                                  </button>
                                )}
                                {assignment.status === 'in_progress' && (
                                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Continue
                                  </button>
                                )}
                                {assignment.status === 'submitted' && (
                                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Submission
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quizzes Tab */}
                    {activeTab === 'quizzes' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quizzes</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedCourse.materials.quizzes.filter(q => q.status === 'completed').length} of {selectedCourse.materials.quizzes.length} completed
                          </div>
                        </div>
                        {selectedCourse.materials.quizzes
                          .filter(quiz => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((quiz) => (
                          <div key={quiz.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{quiz.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                                {quiz.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  Attempts: {quiz.attempts}
                                </div>
                                {quiz.bestScore && (
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="font-medium text-green-600 dark:text-green-400">Best Score: {quiz.bestScore}%</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                {quiz.status === 'available' && (
                                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Take Quiz
                                  </button>
                                )}
                                {quiz.status === 'completed' && (
                                  <>
                                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                      View Results
                                    </button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      Retake
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No courses selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Select a course from the sidebar to view its materials</p>
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
      </div>
    </div>
  );
}

export default CourseMaterials;
