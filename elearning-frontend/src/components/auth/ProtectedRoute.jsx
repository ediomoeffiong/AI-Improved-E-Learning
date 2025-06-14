import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AlreadyLoggedIn from './AlreadyLoggedIn';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  allowedRoles = [],
  showCustomMessage = true,
  customTitle = null,
  customMessage = null
}) => {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();
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

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    // Show custom access denied message or redirect to login
    if (showCustomMessage) {
      return (
        <AccessDenied
          title={customTitle || "Authentication Required"}
          message={customMessage || "You need to sign in to access this page."}
          allowedRoles={allowedRoles}
        />
      );
    }
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required and user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated()) {
    // Show custom "already logged in" message or redirect to dashboard
    if (showCustomMessage) {
      return (
        <AlreadyLoggedIn
          title={customTitle || "You're Already Logged In"}
          message={customMessage || "You're already signed in to your account."}
        />
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access if roles are specified
  if (requireAuth && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(userRole);
    if (!hasRequiredRole) {
      if (showCustomMessage) {
        return (
          <AccessDenied
            title={customTitle || "Access Denied"}
            message={customMessage || "You don't have permission to access this page."}
            allowedRoles={allowedRoles}
          />
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
