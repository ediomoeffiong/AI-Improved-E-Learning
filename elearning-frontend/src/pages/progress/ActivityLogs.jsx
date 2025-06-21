import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { userAPI } from '../../services/api';

function ActivityLogs() {
  const { isAuthenticated, getUserName } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // State for real data
  const [activityData, setActivityData] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalActivities: 0,
    totalPoints: 0,
    totalTime: 0,
    averageScore: 0,
    streakDays: 0,
    perfectScores: 0,
    typeBreakdown: {},
    difficultyBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const filters = {
          type: selectedType !== 'all' ? selectedType : undefined,
          course: selectedCourse !== 'all' ? selectedCourse : undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          search: searchQuery || undefined,
          sortBy,
          sortOrder,
          limit: 50
        };

        const response = await userAPI.getActivities(filters);
        setActivityData(response.activities || []);
        setAnalytics(response.analytics || analytics);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again.');
        // Fallback to empty data
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isAuthenticated, selectedType, selectedCourse, selectedDifficulty, searchQuery, sortBy, sortOrder]);

  // Enhanced mock data for activity logs with gamification (fallback for non-authenticated users)
  const fallbackActivityData = [
    {
      id: 1,
      type: 'quiz',
      title: 'JavaScript Fundamentals Quiz',
      course: 'Advanced JavaScript Concepts',
      date: '2023-05-15',
      time: '10:30 AM',
      duration: '45 minutes',
      result: '85%',
      pointsEarned: 25,
      streakContribution: true,
      difficulty: 'Intermediate',
      icon: '🧠',
      status: 'completed',
      score: 85,
      attempts: 1,
      perfectScore: false
    },
    {
      id: 2,
      type: 'course',
      title: 'React Basics Progress',
      course: 'Frontend Development',
      date: '2023-05-14',
      time: '3:45 PM',
      duration: '2 hours',
      result: '3 lessons completed',
      pointsEarned: 15,
      streakContribution: true,
      difficulty: 'Beginner',
      icon: '📚',
      status: 'completed',
      score: null,
      attempts: 1,
      perfectScore: false
    }
  ];

  // Use real data if authenticated, fallback data otherwise
  const currentActivityData = isAuthenticated() ? activityData : fallbackActivityData;
  const currentAnalytics = isAuthenticated() ? analytics : {
    totalActivities: fallbackActivityData.length,
    totalPoints: fallbackActivityData.reduce((sum, activity) => sum + activity.pointsEarned, 0),
    totalTime: 7200, // 2 hours in seconds
    averageScore: 85,
    streakDays: 2,
    perfectScores: 0,
    typeBreakdown: { quiz: 1, course: 1 },
    difficultyBreakdown: { Intermediate: 1, Beginner: 1 }
  };

  // Get unique courses and difficulties for filter dropdowns
  const courses = [...new Set(currentActivityData.map(activity => activity.course))];
  const difficulties = [...new Set(currentActivityData.map(activity => activity.difficulty))];

  // For authenticated users, filtering is handled by the API
  // For non-authenticated users, we filter client-side
  const filteredActivities = isAuthenticated() ? currentActivityData : currentActivityData.filter(activity => {
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    const matchesCourse = selectedCourse === 'all' || activity.course === selectedCourse;
    const matchesDifficulty = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.course.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCourse && matchesDifficulty && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date + ' ' + a.time);
        bValue = new Date(b.date + ' ' + b.time);
        break;
      case 'points':
        aValue = a.pointsEarned;
        bValue = b.pointsEarned;
        break;
      case 'duration':
        aValue = parseInt(a.duration);
        bValue = parseInt(b.duration);
        break;
      case 'score':
        aValue = a.score || 0;
        bValue = b.score || 0;
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleExport = () => {
    if (isAuthenticated()) {
      addPoints(5, 'Exported activity data');
    }
    // Export logic would go here
    console.log('Exporting activity data...');
  };

  // Loading state
  if (loading && isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Activities</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Learning Activity Dashboard</h1>
              {isAuthenticated() && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  <span>💎 {userStats.diamonds}</span>
                  <span>⭐ {userStats.points}</span>
                  <span>🔥 {userStats.currentStreak}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isAuthenticated()
                ? `Track your learning journey, ${getUserName()}! ${currentAnalytics.totalActivities} activities completed`
                : 'Comprehensive overview of your learning activities and progress'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">📈</span>
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export {isAuthenticated() && '(+5 pts)'}
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Activities</p>
                  <p className="text-3xl font-bold">{currentAnalytics.totalActivities}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Points Earned</p>
                  <p className="text-3xl font-bold">{currentAnalytics.totalPoints}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Study Time</p>
                  <p className="text-3xl font-bold">{Math.round(currentAnalytics.totalTime / 3600)}h</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold">{Math.round(currentAnalytics.averageScore || 0)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🔍</span>
            Filters & Search
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                📱 Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                📊 Table
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎯 Activity Type
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="quiz">🧠 Quizzes</option>
              <option value="assignment">📊 Assignments</option>
              <option value="video">🎥 Videos</option>
              <option value="reading">📚 Readings</option>
              <option value="forum">💬 Discussions</option>
              <option value="achievement">🏆 Achievements</option>
              <option value="practice">⚡ Practice</option>
            </select>
          </div>

          <div>
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📚 Course
            </label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Courses</option>
              {courses.map((course, index) => (
                <option key={index} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⚡ Difficulty
            </label>
            <select
              id="difficulty-filter"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              {difficulties.map((difficulty, index) => (
                <option key={index} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📈 Sort By
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">📅 Date</option>
              <option value="points">⭐ Points</option>
              <option value="duration">⏱️ Duration</option>
              <option value="score">🎯 Score</option>
              <option value="title">📝 Title</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔍 Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search activities..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredActivities.length} of {currentActivityData.length} activities
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Activity Display */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${
                    activity.type === 'quiz' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    activity.type === 'assignment' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                    activity.type === 'video' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    activity.type === 'reading' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    activity.type === 'forum' ? 'bg-gradient-to-r from-indigo-500 to-blue-500' :
                    activity.type === 'achievement' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {activity.icon}
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      activity.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      activity.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      activity.difficulty === 'Expert' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {activity.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">+{activity.pointsEarned}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 leading-tight">{activity.title}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{activity.course}</p>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span>📅 {activity.date}</span>
                <span>⏱️ {activity.duration}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    activity.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    activity.status === 'graded' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    activity.status === 'participated' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {activity.result}
                  </span>
                  {activity.perfectScore && (
                    <span className="text-yellow-400 text-lg" title="Perfect Score!">🏆</span>
                  )}
                  {activity.streakContribution && (
                    <span className="text-orange-400 text-lg" title="Streak Contribution">🔥</span>
                  )}
                </div>
                {activity.score && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{activity.score}%</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Result
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg bg-gray-100 dark:bg-gray-700">
                          {activity.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{activity.difficulty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        activity.type === 'assignment' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.type === 'video' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        activity.type === 'reading' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        activity.type === 'forum' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                        activity.type === 'achievement' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.date}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {activity.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">{activity.result}</span>
                        {activity.perfectScore && <span className="text-yellow-400">🏆</span>}
                        {activity.streakContribution && <span className="text-orange-400">🔥</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400">+{activity.pointsEarned}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Summary & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filteredActivities.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Activities Shown</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {filteredActivities.reduce((sum, activity) => sum + activity.pointsEarned, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {filteredActivities.filter(a => a.perfectScore).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Perfect Scores</div>
          </div>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/progress/recommendations"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                🤖 AI Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized learning suggestions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/progress/reports"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                📊 Detailed Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View comprehensive analytics</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                🏠 Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Return to main dashboard</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Analytics Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-72 right-8 z-50">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Toggle Analytics Dashboard"
          >
            <span className="text-xl">📈</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityLogs;