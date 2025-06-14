import React, { useState } from 'react';
import { GamifiedCalendar } from './index';

const CalendarDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: '🗓️',
      title: 'Smart Calendar Views',
      description: 'Month, week, and day views with intuitive navigation and event management.'
    },
    {
      icon: '🤖',
      title: 'AI Task Suggestions',
      description: 'Intelligent recommendations based on your learning patterns and performance.'
    },
    {
      icon: '🎮',
      title: 'Gamification',
      description: 'Earn points, maintain streaks, and unlock achievements for consistent learning.'
    },
    {
      icon: '📚',
      title: 'E-Learning Integration',
      description: 'Seamlessly integrates with courses, assignments, quizzes, and live sessions.'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works perfectly on desktop, tablet, and mobile devices with dark mode support.'
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Live progress tracking, instant notifications, and dynamic content updates.'
    }
  ];

  const eventTypes = [
    { type: 'quiz', icon: '📝', label: 'Quizzes', color: 'bg-red-500' },
    { type: 'assignment', icon: '📋', label: 'Assignments', color: 'bg-orange-500' },
    { type: 'live-session', icon: '🎥', label: 'Live Sessions', color: 'bg-blue-500' },
    { type: 'study-session', icon: '📚', label: 'Study Sessions', color: 'bg-green-500' },
    { type: 'review', icon: '🔍', label: 'Reviews', color: 'bg-purple-500' },
    { type: 'deadline', icon: '⏰', label: 'Deadlines', color: 'bg-yellow-500' }
  ];

  if (showDemo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Calendar Demo
          </h1>
          <button
            onClick={() => setShowDemo(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Overview
          </button>
        </div>
        <GamifiedCalendar />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          🚀 Smart Learning Calendar
        </h1>
        <p className="text-xl text-blue-100 mb-6">
          AI-powered scheduling with gamification to supercharge your learning journey
        </p>
        <button
          onClick={() => setShowDemo(true)}
          className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
        >
          Try the Calendar Demo
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Event Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">📅</span>
          Supported Event Types
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {eventTypes.map((type, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {type.label}
              </div>
              <div className={`w-full h-2 ${type.color} rounded-full mt-2`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">🤖</span>
          AI-Powered Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Smart Suggestions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI analyzes your learning patterns to suggest optimal study times and topics.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Performance Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Identifies knowledge gaps and recommends targeted practice sessions.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Adaptive Scheduling</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Automatically adjusts recommendations based on your progress and availability.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Goal Optimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Helps you achieve learning goals with personalized milestone tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">🎮</span>
          Gamification Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-semibold text-gray-800 dark:text-white">Points System</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Earn points for completing tasks</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-3xl mb-2">🔥</div>
            <div className="font-semibold text-gray-800 dark:text-white">Streak Tracking</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Maintain daily learning streaks</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-3xl mb-2">🎖️</div>
            <div className="font-semibold text-gray-800 dark:text-white">Achievements</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Unlock special milestones</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-3xl mb-2">📈</div>
            <div className="font-semibold text-gray-800 dark:text-white">Progress Tracking</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Visual progress indicators</div>
          </div>
        </div>
      </div>

      {/* Technical Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">⚙️</span>
          Technical Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Responsive Design</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Dark Mode Support</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Real-time Updates</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Event Management</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">AI Integration</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-green-500">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Gamification</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Ready to Experience the Future of Learning?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Try our smart calendar and see how AI and gamification can transform your learning journey.
        </p>
        <button
          onClick={() => setShowDemo(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Launch Calendar Demo 🚀
        </button>
      </div>
    </div>
  );
};

export default CalendarDemo;
