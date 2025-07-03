import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { USER_ROLES, APP_ROLE_OPTIONS, ROLE_ICONS } from '../../constants/roles';
import { isOnline } from '../../utils/pwa';
import TwoFactorVerification from '../../components/auth/TwoFactorVerification';
import SessionConflictWarning from '../../components/auth/SessionConflictWarning';
import {
  checkSuperAdminLoginConflict,
  SESSION_TYPES
} from '../../utils/sessionManager';

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.SUPER_ADMIN
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [focusedField, setFocusedField] = useState(null);

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Session conflict states
  const [sessionConflict, setSessionConflict] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);

  // Check for session conflicts on component mount
  useEffect(() => {
    const conflict = checkSuperAdminLoginConflict();
    if (conflict.hasConflict) {
      setSessionConflict(conflict);
      setShowLoginForm(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isOffline) {
      setApiMessage('You are currently offline. Please check your internet connection and try again.');
      setApiSuccess(false);
      return;
    }

    setErrors({});
    setApiMessage(null);
    setApiSuccess(false);
    setIsLoading(true);

    try {
      const data = await authAPI.superAdminLogin({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (data.requires2FA) {
        // 2FA is required
        setRequires2FA(true);
        setTempToken(data.tempToken);
        setUserInfo(data.user);
        setApiMessage('Please enter your 2FA code to complete login.');
        setApiSuccess(true);
        setIsLoading(false);
        return;
      }

      // No 2FA required - complete login
      setApiMessage(`${data.user.role} login successful! Redirecting to dashboard...`);
      setApiSuccess(true);

      // Store super admin token
      localStorage.setItem('superAdminToken', data.token);
      localStorage.setItem('superAdminUser', JSON.stringify(data.user));

      // Redirect to dashboard (will show super admin dashboard due to role-based routing)
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Super Admin login error:', err);
      
      if (err.message.includes('Demo mode is enabled') || 
          err.message.includes('Backend service is not available') ||
          err.message.includes('Failed to fetch')) {
        
        setApiMessage('🚧 Demo Mode: Using offline credentials for demonstration purposes.');
        setApiSuccess(true);

        // Create mock super admin data
        const mockData = {
          token: 'mock-super-admin-token-' + Date.now(),
          user: {
            id: 'super-admin-demo',
            name: `Demo ${formData.role}`,
            email: formData.email,
            role: formData.role,
            avatar: 'https://via.placeholder.com/150',
            permissions: formData.role === 'Super Admin'
              ? ['manage_users', 'manage_institutions', 'manage_platform', 'view_analytics', 'approve_admins', 'create_secondary_admins']
              : ['manage_institutions', 'view_analytics', 'approve_admins', 'approve_moderators'],
            isSuperAdmin: formData.role === 'Super Admin'
          }
        };

        // Store mock data
        localStorage.setItem('superAdminToken', mockData.token);
        localStorage.setItem('superAdminUser', JSON.stringify(mockData.user));

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setApiMessage(err.message || 'Login failed. Please check your credentials and try again.');
        setApiSuccess(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = (data) => {
    setApiMessage(`${data.user.role} login successful! Redirecting to dashboard...`);
    setApiSuccess(true);

    // Store super admin token
    localStorage.setItem('superAdminToken', data.token);
    localStorage.setItem('superAdminUser', JSON.stringify(data.user));

    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handle2FACancel = () => {
    setRequires2FA(false);
    setTempToken('');
    setUserInfo(null);
    setApiMessage(null);
    setApiSuccess(false);
  };

  const handle2FAError = (error) => {
    setApiMessage(error);
    setApiSuccess(false);
  };

  // Handle session conflict resolution
  const handleSessionConflictResolved = () => {
    setSessionConflict(null);
    setShowLoginForm(true);
  };

  // Show 2FA verification if required
  if (requires2FA) {
    return (
      <TwoFactorVerification
        tempToken={tempToken}
        userInfo={userInfo}
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
        onError={handle2FAError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Secure access for platform administrators
          </p>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            <Link to="/login" className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 transition-colors">
              ← Back to regular login
            </Link>
          </p>
        </div>

        {/* Session Conflict Warning */}
        {sessionConflict && (
          <SessionConflictWarning
            conflictType={sessionConflict.conflictType}
            conflictUser={sessionConflict.conflictUser}
            onResolved={handleSessionConflictResolved}
          />
        )}

        {/* Main Form Card - Only show if no session conflict */}
        {showLoginForm && (
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Super Admin Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 dark:bg-gray-700 dark:text-white"
              >
                {APP_ROLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>}
            </div>

            {/* Email/Username Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full px-3 py-3 border ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 dark:bg-gray-700 dark:text-white`}
                  placeholder="Enter your email or username"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-red-500' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full px-3 py-3 border ${
                    errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 dark:bg-gray-700 dark:text-white`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-red-500' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            {/* API Message */}
            {apiMessage && (
              <div className={`p-4 rounded-lg ${
                apiSuccess
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex items-center">
                  {apiSuccess ? (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{apiMessage}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || isOffline}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-red-300 group-hover:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    Sign in to Super Admin Portal
                  </>
                )}
              </button>
            </div>

            {/* Offline Indicator */}
            {isOffline && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    You're currently offline. Super Admin login requires an internet connection.
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>
        )}

        {/* Security Notice - Only show if no session conflict */}
        {showLoginForm && (
        <div className="text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure Super Admin Access</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This portal is for authorized platform super administrators only. All access is logged and monitored.
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminLogin;
