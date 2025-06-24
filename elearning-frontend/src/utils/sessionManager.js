/**
 * Session Management Utilities
 * Handles conflicts between super admin/moderator and normal user sessions
 */

// Session type constants
export const SESSION_TYPES = {
  NORMAL_USER: 'normal_user',
  SUPER_ADMIN: 'super_admin',
  SUPER_MODERATOR: 'super_moderator'
};

// Storage keys
export const STORAGE_KEYS = {
  NORMAL_USER: {
    TOKEN: 'token',
    USER: 'user'
  },
  SUPER_ADMIN: {
    TOKEN: 'appAdminToken',
    USER: 'appAdminUser'
  }
};

/**
 * Check if a normal user session exists
 * @returns {boolean}
 */
export const hasNormalUserSession = () => {
  const token = localStorage.getItem(STORAGE_KEYS.NORMAL_USER.TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.NORMAL_USER.USER);
  
  if (!token || !user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!(token && userData);
  } catch (error) {
    console.error('Error parsing normal user data:', error);
    return false;
  }
};

/**
 * Check if a super admin/moderator session exists
 * @returns {boolean}
 */
export const hasSuperAdminSession = () => {
  const token = localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN.TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN.USER);
  
  if (!token || !user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!(token && userData && ['Super Admin', 'Super Moderator'].includes(userData.role));
  } catch (error) {
    console.error('Error parsing super admin user data:', error);
    return false;
  }
};

/**
 * Get the current session type
 * @returns {string|null} SESSION_TYPES value or null if no session
 */
export const getCurrentSessionType = () => {
  if (hasSuperAdminSession()) {
    try {
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN.USER));
      return userData.role === 'Super Admin' ? SESSION_TYPES.SUPER_ADMIN : SESSION_TYPES.SUPER_MODERATOR;
    } catch (error) {
      return null;
    }
  }
  
  if (hasNormalUserSession()) {
    return SESSION_TYPES.NORMAL_USER;
  }
  
  return null;
};

/**
 * Get current session user data
 * @returns {object|null}
 */
export const getCurrentSessionUser = () => {
  if (hasSuperAdminSession()) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN.USER));
    } catch (error) {
      return null;
    }
  }
  
  if (hasNormalUserSession()) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NORMAL_USER.USER));
    } catch (error) {
      return null;
    }
  }
  
  return null;
};

/**
 * Clear normal user session
 */
export const clearNormalUserSession = () => {
  localStorage.removeItem(STORAGE_KEYS.NORMAL_USER.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.NORMAL_USER.USER);
};

/**
 * Clear super admin session
 */
export const clearSuperAdminSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN.USER);
};

/**
 * Clear all sessions
 */
export const clearAllSessions = () => {
  clearNormalUserSession();
  clearSuperAdminSession();
};

/**
 * Check if there's a session conflict for normal user login
 * @returns {object} { hasConflict: boolean, conflictType: string|null, conflictUser: object|null }
 */
export const checkNormalUserLoginConflict = () => {
  if (hasSuperAdminSession()) {
    const user = getCurrentSessionUser();
    return {
      hasConflict: true,
      conflictType: user?.role === 'Super Admin' ? SESSION_TYPES.SUPER_ADMIN : SESSION_TYPES.SUPER_MODERATOR,
      conflictUser: user
    };
  }
  
  return { hasConflict: false, conflictType: null, conflictUser: null };
};

/**
 * Check if there's a session conflict for super admin login
 * @returns {object} { hasConflict: boolean, conflictType: string|null, conflictUser: object|null }
 */
export const checkSuperAdminLoginConflict = () => {
  if (hasNormalUserSession()) {
    const user = getCurrentSessionUser();
    return {
      hasConflict: true,
      conflictType: SESSION_TYPES.NORMAL_USER,
      conflictUser: user
    };
  }
  
  return { hasConflict: false, conflictType: null, conflictUser: null };
};

/**
 * Get user-friendly session type name
 * @param {string} sessionType 
 * @returns {string}
 */
export const getSessionTypeName = (sessionType) => {
  switch (sessionType) {
    case SESSION_TYPES.SUPER_ADMIN:
      return 'Super Admin';
    case SESSION_TYPES.SUPER_MODERATOR:
      return 'Super Moderator';
    case SESSION_TYPES.NORMAL_USER:
      return 'Normal User';
    default:
      return 'Unknown';
  }
};

/**
 * Get appropriate logout redirect path for session type
 * @param {string} sessionType 
 * @returns {string}
 */
export const getLogoutRedirectPath = (sessionType) => {
  switch (sessionType) {
    case SESSION_TYPES.SUPER_ADMIN:
    case SESSION_TYPES.SUPER_MODERATOR:
      return '/super-admin-login';
    case SESSION_TYPES.NORMAL_USER:
      return '/login';
    default:
      return '/';
  }
};
