import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const InstitutionProtectedRoute = ({ children, redirectTo = '/settings' }) => {
  const { isAuthenticated, isLoading, hasInstitutionFunctions } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have institution functions enabled, show access denied
  if (!hasInstitutionFunctions()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Institution Functions Required
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This feature requires Institution Functions to be enabled. Please enable it in your settings to access classroom and CBT features.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Go to Settings
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              How to enable Institution Functions:
            </h3>
            <ol className="text-xs text-blue-700 dark:text-blue-300 text-left space-y-1">
              <li>1. Go to Settings → Institution tab</li>
              <li>2. Toggle "Enable Institution Functions"</li>
              <li>3. Fill in your institution details</li>
              <li>4. Save settings</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected component
  return children;
};

export default InstitutionProtectedRoute;
