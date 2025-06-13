import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GamificationStats from '../../components/gamification/GamificationStats';
import Leaderboard from '../../components/gamification/Leaderboard';
import Achievements from '../../components/gamification/Achievements';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const courseProgress = [
    { id: 1, name: 'Introduction to React', progress: 75, lastAccessed: '2 hours ago' },
    { id: 2, name: 'Advanced JavaScript', progress: 45, lastAccessed: '1 day ago' },
    { id: 3, name: 'Node.js Fundamentals', progress: 90, lastAccessed: '3 hours ago' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'React Workshop', date: 'Dec 15', time: '2:00 PM' },
    { id: 2, title: 'JavaScript Quiz', date: 'Dec 18', time: '10:00 AM' },
    { id: 3, title: 'Project Deadline', date: 'Dec 20', time: '11:59 PM' },
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: 'New Course Available',
      content: 'Check out our new Advanced React course!',
      date: 'Dec 10, 2024'
    },
    {
      id: 2,
      title: 'System Maintenance',
      content: 'Scheduled maintenance on Dec 15th from 2-4 AM.',
      date: 'Dec 8, 2024'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your learning journey.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gamification'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🏆 Achievements
          </button>
        </nav>
      </div>

      {/* Gamification Stats - Show on Overview Tab */}
      {activeTab === 'overview' && <GamificationStats />}

      {/* Quick Access Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/classroom/materials" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Course Materials</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Access your learning resources</p>
              </div>
            </div>
          </Link>

          <Link to="/quiz" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Take Quiz</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test your knowledge</p>
              </div>
            </div>
          </Link>

          <Link to="/classroom" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Virtual Classroom</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Join live sessions</p>
              </div>
            </div>
          </Link>

          <Link to="/progress/dashboard" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Progress Tracking</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your learning</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Dashboard Content */}
      {activeTab === 'gamification' ? (
        <div className="space-y-6">
          <GamificationStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard />
            <Achievements />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course Progress */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Course Progress</h2>
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{course.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last accessed: {course.lastAccessed}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/classroom/materials" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                View all courses →
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-gray-800 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.date} at {event.time}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                View calendar →
              </button>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Announcements</h2>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-gray-800 dark:text-white">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 my-1">{announcement.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
