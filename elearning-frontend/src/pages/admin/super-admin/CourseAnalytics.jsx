import React, { useState, useEffect } from 'react';

const CourseAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData({
        totalEnrollments: 2456,
        completionRate: 68.5,
        avgRating: 4.3,
        totalRevenue: 45678,
        topCourses: [
          {
            id: 1,
            title: 'Introduction to React',
            enrollments: 456,
            completions: 342,
            rating: 4.8,
            revenue: 12340
          },
          {
            id: 2,
            title: 'Advanced JavaScript',
            enrollments: 389,
            completions: 267,
            rating: 4.6,
            revenue: 9870
          },
          {
            id: 3,
            title: 'Data Science Fundamentals',
            enrollments: 234,
            completions: 156,
            rating: 4.9,
            revenue: 8900
          }
        ],
        enrollmentTrend: [
          { month: 'Jan', enrollments: 234, completions: 189 },
          { month: 'Feb', enrollments: 267, completions: 201 },
          { month: 'Mar', enrollments: 298, completions: 234 },
          { month: 'Apr', enrollments: 345, completions: 278 },
          { month: 'May', enrollments: 389, completions: 312 },
          { month: 'Jun', enrollments: 423, completions: 356 }
        ],
        categoryPerformance: [
          { category: 'Programming', courses: 15, avgRating: 4.7, enrollments: 1234 },
          { category: 'Data Science', courses: 8, avgRating: 4.8, enrollments: 892 },
          { category: 'Design', courses: 12, avgRating: 4.5, enrollments: 567 },
          { category: 'Business', courses: 6, avgRating: 4.4, enrollments: 445 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [selectedCourse, timeRange]);

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
                📊 Course Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View detailed course performance metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Courses</option>
                <option value="1">Introduction to React</option>
                <option value="2">Advanced JavaScript</option>
                <option value="3">Data Science Fundamentals</option>
              </select>
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
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.totalEnrollments.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.completionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.avgRating}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${analyticsData.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrollment Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📈 Enrollment Trend
            </h2>
            <div className="space-y-4">
              {analyticsData.enrollmentTrend.map((month, index) => (
                <div key={month.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {month.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Enrollments</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {month.enrollments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(month.enrollments / 500) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Completions</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {month.completions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(month.completions / 400) * 100}%` }}
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
              {analyticsData.topCourses.map((course, index) => (
                <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ⭐ {course.rating} • ${course.revenue.toLocaleString()} revenue
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {course.enrollments}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Enrollments</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {course.completions}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📊 Category Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.categoryPerformance.map((category, index) => (
              <div key={category.category} className="text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.category}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {category.courses}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        ⭐ {category.avgRating}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {category.enrollments}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Enrollments</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
