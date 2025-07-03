import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants/roles';

// Import all dashboard components
import ModernSuperAdminDashboard from '../../pages/admin/ModernSuperAdminDashboard';
import SuperModeratorDashboard from '../../pages/admin/SuperModeratorDashboard';
import InstitutionAdminDashboard from '../../pages/admin/InstitutionAdminDashboard';
import InstitutionModeratorDashboard from '../../pages/admin/InstitutionModeratorDashboard';
import LimitedAccessDashboard from './LimitedAccessDashboard';
import InstructorDashboard from '../../pages/dashboard/InstructorDashboard';
import Dashboard from '../../pages/dashboard/Dashboard'; // Student dashboard

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Check if user is super admin (stored separately)
  const superAdminToken = localStorage.getItem('superAdminToken');
  const superAdminUser = localStorage.getItem('superAdminUser');

  let isSuperAdmin = null;
  if (superAdminToken && superAdminUser) {
    try {
      isSuperAdmin = JSON.parse(superAdminUser);
    } catch (error) {
      console.error('Error parsing super admin user:', error);
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
    }
  }

  // If super admin/moderator is logged in, show appropriate dashboard
  if (isSuperAdmin && (isSuperAdmin.role === USER_ROLES.SUPER_ADMIN || isSuperAdmin.role === USER_ROLES.SUPER_MODERATOR)) {
    if (isSuperAdmin.role === USER_ROLES.SUPER_ADMIN) {
      return <ModernSuperAdminDashboard />;
    } else if (isSuperAdmin.role === USER_ROLES.SUPER_MODERATOR) {
      return <SuperModeratorDashboard />;
    }
  }

  // If no regular user is logged in AND no super admin is logged in, redirect to login
  if (!user && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your dashboard.
          </p>
          <div className="space-y-4">
            <a
              href="/login"
              className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Regular User Login
            </a>
            <a
              href="/super-admin-login"
              className="block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Super Admin Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If super admin/moderator is logged in but user is null, that's fine - continue with appropriate flow
  if (isSuperAdmin && !user) {
    if (isSuperAdmin.role === USER_ROLES.SUPER_ADMIN) {
      return <ModernSuperAdminDashboard />;
    } else if (isSuperAdmin.role === USER_ROLES.SUPER_MODERATOR) {
      return <SuperModeratorDashboard />;
    }
  }

  // Check if user needs verification
  const needsVerification = user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MODERATOR;
  const isApproved = user.approvalStatus === 'approved';

  // If user needs verification but isn't approved, show limited dashboard
  if (needsVerification && !isApproved) {
    return <LimitedAccessDashboard user={user} />;
  }

  // Route based on user role
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <InstitutionAdminDashboard />;

    case USER_ROLES.MODERATOR:
      return <InstitutionModeratorDashboard />;

    case USER_ROLES.INSTRUCTOR:
      return <InstructorDashboard />;

    case USER_ROLES.STUDENT:
    default:
      return <Dashboard />;
  }
};

export default RoleBasedDashboard;
