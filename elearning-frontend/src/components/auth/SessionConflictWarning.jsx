import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  clearNormalUserSession, 
  clearSuperAdminSession, 
  getSessionTypeName,
  SESSION_TYPES 
} from '../../utils/sessionManager';
import ConfirmationModal from '../common/ConfirmationModal';
import MessageModal from '../common/MessageModal';

const SessionConflictWarning = ({ 
  conflictType, 
  conflictUser, 
  targetSessionType, 
  onLogoutComplete,
  className = ""
}) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setShowLogoutMessage(true);
  };

  const handleLogoutMessageClose = () => {
    setShowLogoutMessage(false);
    
    // Clear the appropriate session
    if (conflictType === SESSION_TYPES.NORMAL_USER) {
      clearNormalUserSession();
    } else {
      clearSuperAdminSession();
    }
    
    setIsLoggingOut(false);
    
    // Call the callback if provided
    if (onLogoutComplete) {
      onLogoutComplete();
    }
  };

  const getWarningIcon = () => {
    switch (conflictType) {
      case SESSION_TYPES.SUPER_ADMIN:
        return '👑';
      case SESSION_TYPES.SUPER_MODERATOR:
        return '🛡️';
      case SESSION_TYPES.NORMAL_USER:
        return '👤';
      default:
        return '⚠️';
    }
  };

  const getTargetIcon = () => {
    switch (targetSessionType) {
      case SESSION_TYPES.SUPER_ADMIN:
      case SESSION_TYPES.SUPER_MODERATOR:
        return '🔐';
      case SESSION_TYPES.NORMAL_USER:
        return '🎓';
      default:
        return '🔑';
    }
  };

  const getWarningMessage = () => {
    const conflictTypeName = getSessionTypeName(conflictType);
    const targetTypeName = targetSessionType === SESSION_TYPES.NORMAL_USER 
      ? 'Normal User' 
      : 'Super Admin/Moderator';

    return {
      title: `${conflictTypeName} Session Active`,
      message: `You are currently logged in as a ${conflictTypeName} (${conflictUser?.name || conflictUser?.email}). To access the ${targetTypeName} login, you must first log out of your current session.`,
      action: `Logout ${conflictTypeName}`
    };
  };

  const warningInfo = getWarningMessage();

  return (
    <>
      <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6 ${className}`}>
        <div className="flex items-start space-x-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
              {getWarningIcon()}
            </div>
          </div>

          {/* Warning Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-amber-800">
                {warningInfo.title}
              </h3>
              <span className="text-2xl">{getTargetIcon()}</span>
            </div>
            
            <p className="text-amber-700 mb-4 leading-relaxed">
              {warningInfo.message}
            </p>

            {/* User Info Card */}
            <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-4 border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {(conflictUser?.name || conflictUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {conflictUser?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {conflictUser?.email} • {getSessionTypeName(conflictType)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{isLoggingOut ? 'Logging out...' : warningInfo.action}</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message={`Are you sure you want to logout from your ${getSessionTypeName(conflictType)} session?`}
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />

      {/* Logout Success Message */}
      <MessageModal
        isOpen={showLogoutMessage}
        onClose={handleLogoutMessageClose}
        title="Logout Successful"
        message={`You have been successfully logged out from your ${getSessionTypeName(conflictType)} session. You can now proceed with the login.`}
        type="success"
        autoClose={true}
        autoCloseDelay={2000}
      />
    </>
  );
};

export default SessionConflictWarning;
