import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AccessDenied = ({ 
  title = "Access Denied", 
  message = "You don't have permission to access this page.",
  allowedRoles = [],
  showUserInfo = true,
  showSuggestions = true 
}) => {
  const { getUserName, getUserRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userRole = getUserRole();

  // If user is not authenticated, show login prompt
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to sign in to access this page.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For authenticated users with insufficient permissions
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* User Info */}
        {showUserInfo && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Signed in as:
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {getUserName()}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 mt-2">
              {userRole}
            </span>
          </div>
        )}

        {/* Required Roles */}
        {allowedRoles.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Required roles:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allowedRoles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              You might be interested in:
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Link 
                to="/courses/available" 
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
              >
                Browse Courses
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/profile" 
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
              >
                View Profile
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/quiz/dashboard" 
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
              >
                Take Quizzes
              </Link>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help? Contact your administrator or{' '}
            <Link 
              to="/support" 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
            >
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
