/**
 * Unified Logout System
 * Handles logout for both normal users and super admin/moderator sessions
 */

import { 
  getCurrentSessionType, 
  clearNormalUserSession, 
  clearSuperAdminSession,
  SESSION_TYPES 
} from './sessionManager';

/**
 * Perform unified logout based on current session type
 * @param {Function} normalUserLogout - Normal user logout function from AuthContext
 * @param {Function} navigate - React Router navigate function
 * @param {Function} scrollToTop - Scroll to top function (optional)
 * @returns {Object} { success: boolean, sessionType: string, redirectPath: string }
 */
export const performUnifiedLogout = (normalUserLogout, navigate, scrollToTop = null) => {
  try {
    const currentSessionType = getCurrentSessionType();
    
    if (!currentSessionType) {
      // No active session
      return {
        success: false,
        sessionType: null,
        redirectPath: '/',
        message: 'No active session found'
      };
    }

    let redirectPath = '/';
    
    switch (currentSessionType) {
      case SESSION_TYPES.SUPER_ADMIN:
      case SESSION_TYPES.SUPER_MODERATOR:
        // Clear super admin session
        clearSuperAdminSession();
        redirectPath = '/super-admin-login';
        break;
        
      case SESSION_TYPES.NORMAL_USER:
        // Clear normal user session using AuthContext logout
        if (normalUserLogout) {
          normalUserLogout();
        } else {
          // Fallback to manual clearing
          clearNormalUserSession();
        }
        redirectPath = '/';
        break;
        
      default:
        // Unknown session type, clear all sessions
        clearNormalUserSession();
        clearSuperAdminSession();
        redirectPath = '/';
    }

    // Navigate to appropriate page
    if (navigate) {
      navigate(redirectPath);
    }

    // Scroll to top if function provided
    if (scrollToTop) {
      setTimeout(() => {
        scrollToTop({
          behavior: 'smooth',
          delay: 100
        });
      }, 100);
    }

    return {
      success: true,
      sessionType: currentSessionType,
      redirectPath,
      message: 'Logout successful'
    };

  } catch (error) {
    console.error('Error during unified logout:', error);
    
    // Fallback: clear all sessions
    clearNormalUserSession();
    clearSuperAdminSession();
    
    if (navigate) {
      navigate('/');
    }

    return {
      success: false,
      sessionType: null,
      redirectPath: '/',
      message: 'Logout completed with errors'
    };
  }
};

/**
 * Get logout confirmation message based on session type
 * @returns {Object} { title: string, message: string, confirmText: string }
 */
export const getLogoutConfirmationMessage = () => {
  const currentSessionType = getCurrentSessionType();
  
  switch (currentSessionType) {
    case SESSION_TYPES.SUPER_ADMIN:
      return {
        title: 'Confirm Super Admin Logout',
        message: 'Are you sure you want to logout from your Super Admin session?',
        confirmText: 'Yes, Logout'
      };
      
    case SESSION_TYPES.SUPER_MODERATOR:
      return {
        title: 'Confirm Super Moderator Logout',
        message: 'Are you sure you want to logout from your Super Moderator session?',
        confirmText: 'Yes, Logout'
      };
      
    case SESSION_TYPES.NORMAL_USER:
      return {
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout from your account?',
        confirmText: 'Yes, Logout'
      };
      
    default:
      return {
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout?',
        confirmText: 'Yes, Logout'
      };
  }
};

/**
 * Get logout success message based on session type
 * @param {string} sessionType - The session type that was logged out
 * @returns {Object} { title: string, message: string }
 */
export const getLogoutSuccessMessage = (sessionType) => {
  switch (sessionType) {
    case SESSION_TYPES.SUPER_ADMIN:
      return {
        title: 'Super Admin Logout Successful',
        message: 'You have been successfully logged out from your Super Admin session.'
      };
      
    case SESSION_TYPES.SUPER_MODERATOR:
      return {
        title: 'Super Moderator Logout Successful',
        message: 'You have been successfully logged out from your Super Moderator session.'
      };
      
    case SESSION_TYPES.NORMAL_USER:
      return {
        title: 'Logout Successful',
        message: 'You have been successfully logged out from your account.'
      };
      
    default:
      return {
        title: 'Logout Successful',
        message: 'You have been successfully logged out.'
      };
  }
};

/**
 * Check if logout is allowed (e.g., not offline for certain session types)
 * @param {boolean} isOffline - Whether the app is offline
 * @returns {Object} { allowed: boolean, reason: string }
 */
export const isLogoutAllowed = (isOffline = false) => {
  if (isOffline) {
    return {
      allowed: false,
      reason: 'Logout is not available while offline'
    };
  }
  
  return {
    allowed: true,
    reason: null
  };
};
