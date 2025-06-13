// User role constants
export const USER_ROLES = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin'
};

// Role options for forms
export const ROLE_OPTIONS = [
  { value: USER_ROLES.STUDENT, label: 'Student', description: 'Learn from courses and track your progress' },
  { value: USER_ROLES.INSTRUCTOR, label: 'Instructor', description: 'Create and manage courses, teach students' },
  { value: USER_ROLES.ADMIN, label: 'Admin', description: 'Manage platform, users, and system settings' }
];

// Role colors for UI display
export const ROLE_COLORS = {
  [USER_ROLES.STUDENT]: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
  [USER_ROLES.INSTRUCTOR]: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
  [USER_ROLES.ADMIN]: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
};

// Role icons
export const ROLE_ICONS = {
  [USER_ROLES.STUDENT]: '🎓',
  [USER_ROLES.INSTRUCTOR]: '👨‍🏫',
  [USER_ROLES.ADMIN]: '⚙️'
};

// Default role
export const DEFAULT_ROLE = USER_ROLES.STUDENT;
