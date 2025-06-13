import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasAnyRole } from '../../utils/roleUtils';

/**
 * RoleProtectedRoute component for protecting routes based on user roles
 * @param {React.ReactNode} children - The component to render if access is allowed
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {string} redirectTo - Where to redirect if access is denied
 * @param {React.ReactNode} fallback - Component to show if access is denied (instead of redirect)
 */
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/dashboard',
  fallback = null 
}) => {
  const { isAuthenticated, getUserRole, isLoading } = useAuth();
  const location = useLocation();
  const userRole = getUserRole();

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

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !hasAnyRole(userRole, allowedRoles)) {
    // Show fallback component if provided
    if (fallback) {
      return fallback;
    }
    
    // Otherwise redirect
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Access Denied component for role-based restrictions
 */
export const AccessDenied = ({ 
  title = "Access Denied", 
  message = "You don't have permission to access this page.",
  allowedRoles = [],
  userRole = null 
}) => {
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
        {allowedRoles.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Required roles:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allowedRoles.map(role => (
                <span 
                  key={role}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
            {userRole && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your role: <span className="font-medium">{userRole}</span>
              </p>
            )}
          </div>
        )}
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default RoleProtectedRoute;
