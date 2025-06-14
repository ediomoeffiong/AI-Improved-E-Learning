import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GamificationStats from '../../components/gamification/GamificationStats';
import Leaderboard from '../../components/gamification/Leaderboard';
import Achievements from '../../components/gamification/Achievements';
import GamifiedCalendar from '../../components/calendar/GamifiedCalendar';

// Mock data for dashboard
const courseProgress = [
  { id: 1, name: 'Introduction to React', progress: 75, lastAccessed: '2023-05-15' },
  { id: 2, name: 'Advanced JavaScript', progress: 45, lastAccessed: '2023-05-10' },
  { id: 3, name: 'UI/UX Design Principles', progress: 90, lastAccessed: '2023-05-12' },
];

const upcomingEvents = [
  { id: 1, title: 'React Hooks Workshop', date: '2023-05-20', time: '10:00 AM' },
  { id: 2, title: 'JavaScript Quiz', date: '2023-05-22', time: '2:00 PM' },
  { id: 3, title: 'Group Project Meeting', date: '2023-05-25', time: '3:30 PM' },
];

const recentAnnouncements = [
  { id: 1, title: 'New Course Available', content: 'Check out our new course on React Native!', date: '2023-05-14' },
  { id: 2, title: 'Platform Maintenance', content: 'The platform will be down for maintenance on May 21st from 2-4 AM.', date: '2023-05-13' },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start Learning
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
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
              My Courses
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
      </div>

      {/* Gamification Stats - Show on Overview Tab */}
      {activeTab === 'overview' && <GamificationStats />}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/courses/available" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 transition-all duration-200 hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Browse Courses</h3>
              <p className="text-blue-100 text-sm">Discover new learning opportunities</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">Enhanced ✨</span>
          </div>
        </Link>

        <Link to="/courses/my-courses" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 transition-all duration-200 hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">My Courses</h3>
              <p className="text-purple-100 text-sm">Track your learning progress</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">New 🎉</span>
          </div>
        </Link>

        <Link to="/courses/dashboard" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 transition-all duration-200 hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Course Dashboard</h3>
              <p className="text-green-100 text-sm">Manage your learning</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Learning Stats</h3>
              <p className="text-orange-100 text-sm">3 courses in progress</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">75%</span>
            <span className="text-orange-100 text-sm ml-1">avg progress</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'gamification' ? (
        <>
          {/* Gamification Tab Content */}
          <div className="space-y-6">
            <GamificationStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard />
              <Achievements />
            </div>
          </div>
        </>
      ) : activeTab === 'calendar' ? (
        <>
          {/* Calendar Tab Content */}
          <GamifiedCalendar />
        </>
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