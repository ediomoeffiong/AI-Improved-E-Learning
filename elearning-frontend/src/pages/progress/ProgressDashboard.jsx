import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';

// Enhanced mock data for progress overview with gamification
const progressOverview = {
  coursesCompleted: 3,
  coursesInProgress: 2,
  totalQuizzesTaken: 15,
  averageScore: 82,
  totalHoursSpent: 48,
  lastActivity: '2 hours ago',
  totalPoints: 2847,
  diamondsEarned: 45,
  currentStreak: 12,
  longestStreak: 18,
  perfectScores: 8,
  improvementRate: 15.3,
  studyEfficiency: 92,
  consistencyScore: 88,
  weeklyGoalCompletion: 95,
  monthlyProgress: 78,
  certificatesEarned: 3,
  skillsLearned: 24,
  totalAssignments: 28,
  assignmentsCompleted: 26
};

// Enhanced mock data for course progress with detailed analytics
const courseProgress = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    progress: 100,
    status: 'Completed',
    grade: 'A',
    lastAccessed: '2023-05-01',
    pointsEarned: 850,
    timeSpent: 45,
    difficulty: 'Beginner',
    instructor: 'Sarah Johnson',
    completionDate: '2023-05-01',
    certificateEarned: true,
    skillsGained: ['HTML', 'CSS', 'JavaScript Basics', 'Responsive Design'],
    nextMilestone: null,
    icon: '🌐',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Advanced JavaScript Concepts',
    progress: 75,
    status: 'In Progress',
    grade: 'B+',
    lastAccessed: '2023-05-15',
    pointsEarned: 720,
    timeSpent: 38,
    difficulty: 'Advanced',
    instructor: 'Michael Chen',
    completionDate: null,
    certificateEarned: false,
    skillsGained: ['Closures', 'Async/Await', 'ES6+', 'Design Patterns'],
    nextMilestone: 'Final Project',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Data Science Fundamentals',
    progress: 45,
    status: 'In Progress',
    grade: 'B',
    lastAccessed: '2023-05-14',
    pointsEarned: 450,
    timeSpent: 28,
    difficulty: 'Intermediate',
    instructor: 'Dr. Emily Rodriguez',
    completionDate: null,
    certificateEarned: false,
    skillsGained: ['Python', 'Pandas', 'Data Visualization'],
    nextMilestone: 'Machine Learning Module',
    icon: '📊',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    progress: 100,
    status: 'Completed',
    grade: 'A-',
    lastAccessed: '2023-04-20',
    pointsEarned: 780,
    timeSpent: 35,
    difficulty: 'Intermediate',
    instructor: 'Alex Thompson',
    completionDate: '2023-04-20',
    certificateEarned: true,
    skillsGained: ['Design Thinking', 'Prototyping', 'User Research', 'Figma'],
    nextMilestone: null,
    icon: '🎨',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    title: 'Mobile App Development',
    progress: 100,
    status: 'Completed',
    grade: 'A',
    lastAccessed: '2023-03-15',
    pointsEarned: 920,
    timeSpent: 52,
    difficulty: 'Advanced',
    instructor: 'David Kim',
    completionDate: '2023-03-15',
    certificateEarned: true,
    skillsGained: ['React Native', 'Flutter', 'Mobile UI', 'App Store Deployment'],
    nextMilestone: null,
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80'
  }
];

// Enhanced mock data for recent activities with gamification
const recentActivities = [
  {
    id: 1,
    type: 'quiz',
    title: 'JavaScript Fundamentals Quiz',
    course: 'Advanced JavaScript Concepts',
    date: '2023-05-15',
    time: '10:30 AM',
    result: '85%',
    pointsEarned: 30,
    streakContribution: true,
    icon: '🧠',
    difficulty: 'Advanced'
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Data Visualization Project',
    course: 'Data Science Fundamentals',
    date: '2023-05-14',
    time: '3:45 PM',
    result: 'Submitted',
    pointsEarned: 45,
    streakContribution: true,
    icon: '📊',
    difficulty: 'Advanced'
  },
  {
    id: 3,
    type: 'video',
    title: 'Closures and Lexical Scope',
    course: 'Advanced JavaScript Concepts',
    date: '2023-05-13',
    time: '2:15 PM',
    result: 'Completed',
    pointsEarned: 15,
    streakContribution: true,
    icon: '🎥',
    difficulty: 'Advanced'
  },
  {
    id: 4,
    type: 'reading',
    title: 'Introduction to Pandas',
    course: 'Data Science Fundamentals',
    date: '2023-05-12',
    time: '11:20 AM',
    result: 'Completed',
    pointsEarned: 10,
    streakContribution: true,
    icon: '📚',
    difficulty: 'Beginner'
  },
  {
    id: 5,
    type: 'achievement',
    title: 'Week Streak Master',
    course: 'General',
    date: '2023-05-11',
    time: '11:59 PM',
    result: 'Unlocked',
    pointsEarned: 100,
    streakContribution: false,
    icon: '🏆',
    difficulty: 'Special'
  }
];

// Analytics data for dashboard insights
const analyticsData = {
  weeklyProgress: [
    { day: 'Mon', hours: 2.5, points: 85 },
    { day: 'Tue', hours: 3.2, points: 120 },
    { day: 'Wed', hours: 1.8, points: 65 },
    { day: 'Thu', hours: 4.1, points: 150 },
    { day: 'Fri', hours: 2.9, points: 95 },
    { day: 'Sat', hours: 3.5, points: 125 },
    { day: 'Sun', hours: 2.2, points: 75 }
  ],
  skillProgress: [
    { skill: 'JavaScript', level: 85, improvement: '+15%' },
    { skill: 'Python', level: 72, improvement: '+8%' },
    { skill: 'HTML/CSS', level: 95, improvement: '+25%' },
    { skill: 'Data Analysis', level: 68, improvement: '+12%' },
    { skill: 'UI/UX Design', level: 88, improvement: '+18%' }
  ],
  upcomingDeadlines: [
    { id: 1, title: 'JavaScript Final Project', course: 'Advanced JavaScript Concepts', dueDate: '2023-05-20', priority: 'high' },
    { id: 2, title: 'Data Science Assignment', course: 'Data Science Fundamentals', dueDate: '2023-05-22', priority: 'medium' },
    { id: 3, title: 'Weekly Quiz', course: 'Advanced JavaScript Concepts', dueDate: '2023-05-18', priority: 'low' }
  ],
  achievements: [
    { id: 1, title: 'First Course Completed', icon: '🎓', unlocked: true, date: '2023-05-01' },
    { id: 2, title: 'Week Streak Master', icon: '🔥', unlocked: true, date: '2023-05-11' },
    { id: 3, title: 'Quiz Champion', icon: '🧠', unlocked: true, date: '2023-05-10' },
    { id: 4, title: 'Perfect Score', icon: '⭐', unlocked: false, progress: 75 }
  ]
};

function ProgressDashboard() {
  const { isAuthenticated, getUserName } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [activeView, setActiveView] = useState('overview');
  const [showInsights, setShowInsights] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const handleQuickAction = (action) => {
    if (isAuthenticated()) {
      addPoints(5, `Quick action: ${action}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Progress Dashboard</h1>
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
                ? `Welcome back, ${getUserName()}! Here's your learning progress overview`
                : 'Track your learning journey and achievements'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">🧠</span>
              {showInsights ? 'Hide' : 'Show'} AI Insights
            </button>
            <Link
              to="/progress/reports"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">📈</span>
              Detailed Reports
            </Link>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: '🎯 Overview', icon: '🎯' },
            { id: 'courses', label: '📚 Courses', icon: '📚' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'achievements', label: '🏆 Achievements', icon: '🏆' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* AI Insights Panel */}
        {showInsights && isAuthenticated() && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-indigo-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">AI Learning Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Study Pattern</div>
                    <div className="text-gray-700 dark:text-gray-300">Most productive on Thursdays</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">Recommendation</div>
                    <div className="text-gray-700 dark:text-gray-300">Focus on JavaScript practice</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Next Goal</div>
                    <div className="text-gray-700 dark:text-gray-300">Complete 2 more courses</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-orange-600 dark:text-orange-400 font-semibold">Efficiency</div>
                    <div className="text-gray-700 dark:text-gray-300">{progressOverview.studyEfficiency}% above average</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Progress Overview */}
      {(activeView === 'overview' || activeView === 'analytics') && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Progress Overview
          </h2>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Courses Completed</p>
                  <p className="text-4xl font-bold">{progressOverview.coursesCompleted}</p>
                  <p className="text-green-100 text-sm">🏆 {progressOverview.certificatesEarned} certificates</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">In Progress</p>
                  <p className="text-4xl font-bold">{progressOverview.coursesInProgress}</p>
                  <p className="text-blue-100 text-sm">📚 Active learning</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📖</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Average Score</p>
                  <p className="text-4xl font-bold">{progressOverview.averageScore}%</p>
                  <p className="text-purple-100 text-sm">🎯 Great performance</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Streak</p>
                  <p className="text-4xl font-bold">{progressOverview.currentStreak}</p>
                  <p className="text-orange-100 text-sm">🔥 days in a row</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🔥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progressOverview.totalQuizzesTaken}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{progressOverview.totalHoursSpent}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progressOverview.totalPoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progressOverview.perfectScores}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Perfect Scores</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progressOverview.skillsLearned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Skills Learned</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{progressOverview.studyEfficiency}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Course Progress */}
      {(activeView === 'overview' || activeView === 'courses') && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">📚</span>
              Course Progress
            </h2>
            <Link
              to="/courses/available"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">🔍</span>
              Browse Courses
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courseProgress.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {course.difficulty}
                        </span>
                        {course.certificateEarned && (
                          <span className="text-yellow-400 text-lg" title="Certificate Earned">🏆</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.grade}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">+{course.pointsEarned} pts</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        course.progress === 100 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                        course.progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{course.timeSpent}h</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Accessed</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{course.lastAccessed}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    course.status === 'Completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {course.status}
                  </span>
                  {course.nextMilestone && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Next:</div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{course.nextMilestone}</div>
                    </div>
                  )}
                </div>

                {course.skillsGained && course.skillsGained.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills Gained:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.skillsGained.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {course.skillsGained.length > 3 && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1">
                          +{course.skillsGained.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Enhanced Recent Activity */}
      {(activeView === 'overview') && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">⚡</span>
              Recent Activity
            </h2>
            <Link
              to="/progress/activity"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="mr-2">📊</span>
              View All Activity
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${
                      activity.type === 'quiz' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      activity.type === 'assignment' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      activity.type === 'video' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      activity.type === 'reading' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                      {activity.icon}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        activity.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
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

                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{activity.title}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{activity.course}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>📅 {activity.date}</span>
                  <span>⏰ {activity.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    activity.result === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    activity.result === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    activity.result === 'Unlocked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {activity.result}
                  </span>
                  {activity.streakContribution && (
                    <span className="text-orange-400 text-lg" title="Streak Contribution">🔥</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Learning Analytics
          </h2>

          {/* Weekly Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Weekly Study Pattern</h3>
            <div className="grid grid-cols-7 gap-4">
              {analyticsData.weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{day.hours}h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Study</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{day.points}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Skill Development</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.skillProgress.map((skill, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{skill.skill}</h4>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{skill.improvement}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Level: {skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {analyticsData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      deadline.priority === 'high' ? 'bg-red-500' :
                      deadline.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{deadline.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{deadline.course}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">{deadline.dueDate}</div>
                    <div className={`text-xs font-medium ${
                      deadline.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      deadline.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {deadline.priority.toUpperCase()} PRIORITY
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements View */}
      {activeView === 'achievements' && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🏆</span>
            Achievements & Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.achievements.map((achievement) => (
              <div key={achievement.id} className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600'
              }`}>
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${achievement.unlocked ? 'filter-none' : 'filter grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-800 dark:text-white'
                  }`}>
                    {achievement.title}
                  </h3>
                  {achievement.unlocked ? (
                    <div className="text-yellow-100 text-sm">
                      Unlocked on {achievement.date}
                    </div>
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Progress: {achievement.progress}%
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/progress/activity"
          onClick={() => handleQuickAction('View Activity')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                📊 Activity Logs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View detailed activity history</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/progress/reports"
          onClick={() => handleQuickAction('View Reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                📈 Performance Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/progress/recommendations"
          onClick={() => handleQuickAction('View Recommendations')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                🤖 AI Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalized suggestions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Dashboard Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-104 right-8 z-50">
          <button
            onClick={() => setActiveView(activeView === 'analytics' ? 'overview' : 'analytics')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Toggle Analytics View"
          >
            <span className="text-xl">📊</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
