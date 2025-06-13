import { USER_ROLES } from '../constants/roles';

/**
 * Check if a user has a specific role
 * @param {string} userRole - The user's current role
 * @param {string} requiredRole - The required role
 * @returns {boolean} - Whether the user has the required role
 */
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

/**
 * Check if a user has any of the specified roles
 * @param {string} userRole - The user's current role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} - Whether the user has any of the allowed roles
 */
export const hasAnyRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Check if a user is a student
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user is a student
 */
export const isStudent = (userRole) => {
  return hasRole(userRole, USER_ROLES.STUDENT);
};

/**
 * Check if a user is an instructor
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user is an instructor
 */
export const isInstructor = (userRole) => {
  return hasRole(userRole, USER_ROLES.INSTRUCTOR);
};

/**
 * Check if a user is an admin
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user is an admin
 */
export const isAdmin = (userRole) => {
  return hasRole(userRole, USER_ROLES.ADMIN);
};

/**
 * Check if a user can manage courses (Instructor or Admin)
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user can manage courses
 */
export const canManageCourses = (userRole) => {
  return hasAnyRole(userRole, [USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]);
};

/**
 * Check if a user can manage users (Admin only)
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user can manage users
 */
export const canManageUsers = (userRole) => {
  return isAdmin(userRole);
};

/**
 * Check if a user can access admin features
 * @param {string} userRole - The user's current role
 * @returns {boolean} - Whether the user can access admin features
 */
export const canAccessAdmin = (userRole) => {
  return isAdmin(userRole);
};

/**
 * Get role-based dashboard route
 * @param {string} userRole - The user's current role
 * @returns {string} - The appropriate dashboard route for the role
 */
export const getRoleDashboard = (userRole) => {
  switch (userRole) {
    case USER_ROLES.ADMIN:
      return '/admin/dashboard';
    case USER_ROLES.INSTRUCTOR:
      return '/instructor/dashboard';
    case USER_ROLES.STUDENT:
    default:
      return '/dashboard';
  }
};
