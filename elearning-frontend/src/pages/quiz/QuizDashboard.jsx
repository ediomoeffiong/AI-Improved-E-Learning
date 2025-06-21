import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, handleAPIError } from '../../services/api';

// Enhanced mock data for quiz dashboard
const mockQuizData = {
  stats: {
    totalQuizzes: 24,
    completedQuizzes: 18,
    averageScore: 87,
    totalTimeSpent: 145, // minutes
    streak: 7,
    rank: 15,
    badges: ['Quiz Master', 'Speed Demon', 'Perfect Score']
  },
  availableQuizzes: [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
      questions: 15,
      timeLimit: 20,
      difficulty: 'Beginner',
      course: 'Frontend Development',
      category: 'Programming',
      attempts: 0,
      bestScore: null,
      isLocked: false,
      prerequisites: [],
      estimatedTime: '15-20 min',
      tags: ['javascript', 'basics', 'variables'],
      instructor: 'Prof. Michael Chen',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      title: 'React Components & Props',
      description: 'Challenge yourself with questions about React components, props, and state management.',
      questions: 12,
      timeLimit: 15,
      difficulty: 'Intermediate',
      course: 'Frontend Development',
      category: 'React',
      attempts: 2,
      bestScore: 85,
      isLocked: false,
      prerequisites: ['JavaScript Fundamentals'],
      estimatedTime: '12-15 min',
      tags: ['react', 'components', 'props'],
      instructor: 'Prof. Michael Chen',
      lastUpdated: '2024-01-18'
    },
    {
      id: 3,
      title: 'Advanced CSS Grid & Flexbox',
      description: 'Master advanced CSS layout techniques including Grid, Flexbox, and responsive design.',
      questions: 18,
      timeLimit: 25,
      difficulty: 'Advanced',
      course: 'Web Design',
      category: 'CSS',
      attempts: 1,
      bestScore: 92,
      isLocked: false,
      prerequisites: ['CSS Basics'],
      estimatedTime: '20-25 min',
      tags: ['css', 'grid', 'flexbox', 'layout'],
      instructor: 'Dr. Sarah Johnson',
      lastUpdated: '2024-01-20'
    },
    {
      id: 4,
      title: 'Python Data Structures',
      description: 'Comprehensive quiz on Python lists, dictionaries, sets, and tuples.',
      questions: 20,
      timeLimit: 30,
      difficulty: 'Intermediate',
      course: 'Python Programming',
      category: 'Programming',
      attempts: 0,
      bestScore: null,
      isLocked: true,
      prerequisites: ['Python Basics'],
      estimatedTime: '25-30 min',
      tags: ['python', 'data-structures', 'lists'],
      instructor: 'Dr. Emily Rodriguez',
      lastUpdated: '2024-01-22'
    },
    {
      id: 5,
      title: 'Machine Learning Fundamentals',
      description: 'Test your understanding of basic ML concepts, algorithms, and applications.',
      questions: 25,
      timeLimit: 40,
      difficulty: 'Advanced',
      course: 'Machine Learning',
      category: 'AI/ML',
      attempts: 0,
      bestScore: null,
      isLocked: false,
      prerequisites: ['Statistics Basics', 'Python Data Structures'],
      estimatedTime: '35-40 min',
      tags: ['machine-learning', 'algorithms', 'ai'],
      instructor: 'Dr. Emily Rodriguez',
      lastUpdated: '2024-01-25'
    },
    {
      id: 6,
      title: 'Database Design & SQL',
      description: 'Evaluate your knowledge of database design principles and SQL queries.',
      questions: 16,
      timeLimit: 22,
      difficulty: 'Intermediate',
      course: 'Database Systems',
      category: 'Database',
      attempts: 3,
      bestScore: 78,
      isLocked: false,
      prerequisites: [],
      estimatedTime: '18-22 min',
      tags: ['sql', 'database', 'queries'],
      instructor: 'Prof. Michael Chen',
      lastUpdated: '2024-01-12'
    }
  ],
  recentResults: [
    {
      id: 1,
      quiz: 'React Components & Props',
      score: 85,
      percentage: 85,
      date: '2024-01-21T14:30:00Z',
      status: 'Passed',
      timeSpent: 12,
      correctAnswers: 10,
      totalQuestions: 12,
      difficulty: 'Intermediate',
      course: 'Frontend Development',
      canRetake: true,
      nextAttemptAvailable: '2024-01-22T14:30:00Z'
    },
    {
      id: 2,
      quiz: 'Advanced CSS Grid & Flexbox',
      score: 92,
      percentage: 92,
      date: '2024-01-19T10:15:00Z',
      status: 'Passed',
      timeSpent: 18,
      correctAnswers: 17,
      totalQuestions: 18,
      difficulty: 'Advanced',
      course: 'Web Design',
      canRetake: true,
      nextAttemptAvailable: '2024-01-20T10:15:00Z'
    },
    {
      id: 3,
      quiz: 'Database Design & SQL',
      score: 78,
      percentage: 78,
      date: '2024-01-17T16:45:00Z',
      status: 'Passed',
      timeSpent: 20,
      correctAnswers: 12,
      totalQuestions: 16,
      difficulty: 'Intermediate',
      course: 'Database Systems',
      canRetake: true,
      nextAttemptAvailable: '2024-01-18T16:45:00Z'
    },
    {
      id: 4,
      quiz: 'JavaScript Fundamentals',
      score: 95,
      percentage: 95,
      date: '2024-01-15T09:20:00Z',
      status: 'Passed',
      timeSpent: 15,
      correctAnswers: 14,
      totalQuestions: 15,
      difficulty: 'Beginner',
      course: 'Frontend Development',
      canRetake: false,
      nextAttemptAvailable: null
    },
    {
      id: 5,
      quiz: 'HTML & CSS Basics',
      score: 88,
      percentage: 88,
      date: '2024-01-12T11:30:00Z',
      status: 'Passed',
      timeSpent: 10,
      correctAnswers: 13,
      totalQuestions: 15,
      difficulty: 'Beginner',
      course: 'Web Development',
      canRetake: true,
      nextAttemptAvailable: '2024-01-13T11:30:00Z'
    }
  ],
  upcomingQuizzes: [
    {
      id: 7,
      title: 'Node.js & Express Fundamentals',
      dueDate: '2024-01-28T23:59:00Z',
      course: 'Backend Development',
      difficulty: 'Intermediate',
      isRequired: true,
      estimatedTime: '20-25 min'
    },
    {
      id: 8,
      title: 'Data Visualization with D3.js',
      dueDate: '2024-02-02T23:59:00Z',
      course: 'Data Science',
      difficulty: 'Advanced',
      isRequired: false,
      estimatedTime: '30-35 min'
    }
  ]
};

function QuizDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [quizData, setQuizData] = useState(mockQuizData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const data = await quizAPI.getDashboardData();
        setQuizData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError(handleAPIError(err));
        // Fallback to mock data if API fails
        setQuizData(mockQuizData);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Helper functions
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter quizzes
  const filteredQuizzes = quizData.availableQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || quiz.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'All' || quiz.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['All', ...new Set(quizData.availableQuizzes.map(quiz => quiz.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz dashboard...</p>
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
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Quiz Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your progress and test your knowledge</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/quiz/leaderboard"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Leaderboard
              </Link>
              <Link
                to="/courses/dashboard"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Courses
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
                { id: 'available', label: 'Available Quizzes', icon: '📝' },
                { id: 'results', label: 'My Results', icon: '📈' },
                { id: 'upcoming', label: 'Upcoming', icon: '⏰' }
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
                    <p className="text-blue-100 text-sm font-medium">Total Quizzes</p>
                    <p className="text-3xl font-bold">{quizData.stats.totalQuizzes}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{quizData.stats.completedQuizzes}</p>
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
                    <p className="text-yellow-100 text-sm font-medium">Average Score</p>
                    <p className="text-3xl font-bold">{quizData.stats.averageScore}%</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Current Streak</p>
                    <p className="text-3xl font-bold">{quizData.stats.streak}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Results */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Quiz Results</h3>
                    <button onClick={() => setActiveTab('results')} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {quizData.recentResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            result.percentage >= 90 ? 'bg-green-100 dark:bg-green-900/20' :
                            result.percentage >= 80 ? 'bg-blue-100 dark:bg-blue-900/20' :
                            result.percentage >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-red-100 dark:bg-red-900/20'
                          }`}>
                            <span className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                              {result.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{result.quiz}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.course}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
                            <span>{result.timeSpent} min</span>
                            <span>{getTimeAgo(result.date)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                            {result.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Performance Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rank</span>
                      <span className="font-semibold text-gray-800 dark:text-white">#{quizData.stats.rank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time Spent</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{quizData.stats.totalTimeSpent}h</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {Math.round((quizData.stats.completedQuizzes / quizData.stats.totalQuizzes) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(quizData.stats.completedQuizzes / quizData.stats.totalQuizzes) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h3>
                  <div className="space-y-2">
                    {quizData.stats.badges.map((badge, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 dark:text-yellow-400">🏆</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Quizzes Tab */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quiz Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <div className="p-6">
                    {/* Quiz Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.course}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        {quiz.isLocked && (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Quiz Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {quiz.questions} questions
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {quiz.timeLimit} min
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {quiz.instructor}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {quiz.attempts} attempts
                      </div>
                    </div>

                    {/* Best Score */}
                    {quiz.bestScore && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Best Score</span>
                          <span className={`font-medium ${getScoreColor(quiz.bestScore)}`}>{quiz.bestScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              quiz.bestScore >= 90 ? 'bg-green-500' :
                              quiz.bestScore >= 80 ? 'bg-blue-500' :
                              quiz.bestScore >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${quiz.bestScore}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {quiz.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="flex space-x-2">
                      <Link
                        to={quiz.isLocked ? '#' : `/quiz/${quiz._id || quiz.id}`}
                        className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                          quiz.isLocked
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        onClick={(e) => quiz.isLocked && e.preventDefault()}
                      >
                        {quiz.isLocked ? 'Locked' : quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                      </Link>
                      {quiz.attempts > 0 && (
                        <button
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                          title="View Results"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredQuizzes.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No quizzes found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quiz Results History</h3>
              <div className="space-y-4">
                {quizData.recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                        result.percentage >= 90 ? 'bg-green-100 dark:bg-green-900/20' :
                        result.percentage >= 80 ? 'bg-blue-100 dark:bg-blue-900/20' :
                        result.percentage >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        <span className={`text-xl font-bold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{result.quiz}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{result.course}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
                          <span>{result.timeSpent} minutes</span>
                          <span>{getTimeAgo(result.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                        {result.difficulty}
                      </span>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          View Details
                        </button>
                        {result.canRetake && (
                          <Link
                            to={`/quiz/${result.id}`}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Retake
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {quizData.upcomingQuizzes.length > 0 ? (
              quizData.upcomingQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{quiz.course}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span>{quiz.estimatedTime}</span>
                        {quiz.isRequired && (
                          <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        {new Date(quiz.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.ceil((new Date(quiz.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No upcoming quizzes</h3>
                <p className="text-gray-600 dark:text-gray-400">You're all caught up! Check back later for new quizzes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizDashboard;






