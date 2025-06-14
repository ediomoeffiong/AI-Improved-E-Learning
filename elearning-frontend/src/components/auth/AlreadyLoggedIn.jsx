import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AlreadyLoggedIn = ({ 
  title = "You're Already Logged In", 
  message = "You're already signed in to your account.",
  showUserInfo = true 
}) => {
  const { getUserName, getUserEmail, getUserRole } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          {showUserInfo && (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">
                  {getUserName()?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome back, {getUserName() || 'User'}!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getUserEmail()}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mt-2">
                {getUserRole()}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/courses/my-courses"
                className="flex justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                My Courses
              </Link>
              <Link
                to="/profile"
                className="flex justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              If you want to access a different account, please{' '}
              <Link 
                to="/logout" 
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
              >
                sign out first
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quick access:{' '}
            <Link to="/courses/available" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
              Browse Courses
            </Link>
            {' • '}
            <Link to="/quiz/dashboard" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
              Quizzes
            </Link>
            {' • '}
            <Link to="/progress/dashboard" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
              Progress
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlreadyLoggedIn;
