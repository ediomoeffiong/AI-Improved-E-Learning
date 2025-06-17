// User role constants
export const USER_ROLES = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  SUPER_ADMIN: 'Super Admin',
  SUPER_MODERATOR: 'Super Moderator'
};

// Admin types for institutions
export const ADMIN_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary'
};

// Role options for regular user registration
export const ROLE_OPTIONS = [
  { value: USER_ROLES.STUDENT, label: 'Student', description: 'Learn from courses and track your progress' },
  { value: USER_ROLES.INSTRUCTOR, label: 'Instructor', description: 'Create and manage courses, teach students' },
  { value: USER_ROLES.ADMIN, label: 'Institution Admin', description: 'Manage institution users and settings' },
  { value: USER_ROLES.MODERATOR, label: 'Institution Moderator', description: 'Limited admin capabilities for institutions' }
];

// App-level roles (separate login system)
export const APP_ROLE_OPTIONS = [
  { value: USER_ROLES.SUPER_ADMIN, label: 'Super Admin', description: 'Highest level - manage entire platform' },
  { value: USER_ROLES.SUPER_MODERATOR, label: 'Super Moderator', description: 'Platform moderation and oversight' }
];

// Role colors for UI display
export const ROLE_COLORS = {
  [USER_ROLES.STUDENT]: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
  [USER_ROLES.INSTRUCTOR]: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
  [USER_ROLES.ADMIN]: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
  [USER_ROLES.MODERATOR]: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  [USER_ROLES.SUPER_ADMIN]: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
  [USER_ROLES.SUPER_MODERATOR]: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
};

// Role icons
export const ROLE_ICONS = {
  [USER_ROLES.STUDENT]: '🎓',
  [USER_ROLES.INSTRUCTOR]: '👨‍🏫',
  [USER_ROLES.ADMIN]: '👑',
  [USER_ROLES.MODERATOR]: '🛡️',
  [USER_ROLES.SUPER_ADMIN]: '⚡',
  [USER_ROLES.SUPER_MODERATOR]: '🔧'
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 6,
  [USER_ROLES.SUPER_MODERATOR]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.MODERATOR]: 3,
  [USER_ROLES.INSTRUCTOR]: 2,
  [USER_ROLES.STUDENT]: 1
};

// Default role
export const DEFAULT_ROLE = USER_ROLES.STUDENT;
