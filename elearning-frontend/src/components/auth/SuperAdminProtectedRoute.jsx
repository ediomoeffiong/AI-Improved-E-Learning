import React from 'react';
import { Navigate } from 'react-router-dom';
import { USER_ROLES } from '../../constants/roles';

const SuperAdminProtectedRoute = ({ children }) => {
  // Check if super admin is logged in (stored separately from regular users)
  const superAdminToken = localStorage.getItem('appAdminToken');
  const superAdminUser = localStorage.getItem('appAdminUser');
  
  if (!superAdminToken || !superAdminUser) {
    // Redirect to super admin login if not authenticated
    return <Navigate to="/super-admin-login" replace />;
  }

  try {
    const user = JSON.parse(superAdminUser);
    
    // Check if user has super admin or super moderator role
    if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.SUPER_MODERATOR) {
      return <Navigate to="/super-admin-login" replace />;
    }

    // User is authenticated as super admin/moderator, render the protected component
    return children;
  } catch (error) {
    console.error('Error parsing super admin user data:', error);
    // Clear invalid data and redirect to login
    localStorage.removeItem('appAdminToken');
    localStorage.removeItem('appAdminUser');
    return <Navigate to="/super-admin-login" replace />;
  }
};

export default SuperAdminProtectedRoute;
