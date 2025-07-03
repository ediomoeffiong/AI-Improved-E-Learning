import React, { useState, useEffect } from 'react';

const ProgressOverview = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate loading progress data
    setTimeout(() => {
      setProgressData({
        totalUsers: 1247,
        activeUsers: 892,
        coursesCompleted: 3456,
        avgCompletionRate: 68.5,
        totalStudyTime: 15678, // hours
        topCourses: [
          { name: 'Introduction to React', completions: 234, rate: 78.5 },
          { name: 'Advanced JavaScript', completions: 189, rate: 72.3 },
          { name: 'Data Science Fundamentals', completions: 156, rate: 65.8 }
        ],
        recentActivity: [
          { user: 'John Doe', action: 'Completed', course: 'React Fundamentals', time: '2 hours ago' },
          { user: 'Jane Smith', action: 'Started', course: 'JavaScript ES6', time: '3 hours ago' },
          { user: 'Mike Johnson', action: 'Quiz Passed', course: 'Data Analysis', time: '5 hours ago' }
        ],
        weeklyProgress: [
          { day: 'Mon', completions: 45, enrollments: 67 },
          { day: 'Tue', completions: 52, enrollments: 73 },
          { day: 'Wed', completions: 38, enrollments: 59 },
          { day: 'Thu', completions: 61, enrollments: 82 },
          { day: 'Fri', completions: 48, enrollments: 71 },
          { day: 'Sat', completions: 34, enrollments: 45 },
          { day: 'Sun', completions: 29, enrollments: 38 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                📊 Progress Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Aggregate progress metrics across all users
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.coursesCompleted.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.avgCompletionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📊 Weekly Progress
            </h2>
            <div className="space-y-4">
              {progressData.weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Completions</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {day.completions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(day.completions / 70) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Enrollments</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {day.enrollments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.enrollments / 90) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🏆 Top Performing Courses
            </h2>
            <div className="space-y-4">
              {progressData.topCourses.map((course, index) => (
                <div key={course.name} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {course.completions} completions • {course.rate}% completion rate
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${course.rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🔄 Recent Activity
          </h2>
          <div className="space-y-4">
            {progressData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="font-semibold">{activity.user}</span> {activity.action.toLowerCase()} 
                    <span className="font-semibold"> {activity.course}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.action === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    activity.action === 'Started' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  }`}>
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {(progressData.totalStudyTime / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Total Study Hours
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(progressData.totalStudyTime / progressData.activeUsers)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Avg Hours per User
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {Math.round((progressData.activeUsers / progressData.totalUsers) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                User Engagement Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;
