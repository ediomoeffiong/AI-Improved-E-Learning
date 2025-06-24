import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { ROLE_ICONS } from '../../constants/roles';
import { isOnline } from '../../utils/pwa';
import TwoFactorVerification from '../../components/auth/TwoFactorVerification';
import SessionConflictWarning from '../../components/auth/SessionConflictWarning';
import {
  checkNormalUserLoginConflict,
  SESSION_TYPES
} from '../../utils/sessionManager';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state or URL query parameter
  const urlParams = new URLSearchParams(location.search);
  const redirectParam = urlParams.get('redirect');
  const from = location.state?.from?.pathname || redirectParam || '/dashboard';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [apiMessage, setApiMessage] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Session conflict states
  const [sessionConflict, setSessionConflict] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);

  // Check for session conflicts on component mount
  useEffect(() => {
    const conflict = checkNormalUserLoginConflict();
    if (conflict.hasConflict) {
      setSessionConflict(conflict);
      setShowLoginForm(false);
    }
  }, []);

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      const online = await isOnline();
      setIsOffline(!online);
    };

    // Initial check
    checkOnlineStatus();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check
    const interval = setInterval(checkOnlineStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Auto-fill demo credentials
  const fillDemoCredentials = (role) => {
    const credentials = {
      Student: { email: 'demo@example.com', password: 'password' },
      Instructor: { email: 'instructor@example.com', password: 'password' },
      Admin: { email: 'admin@example.com', password: 'password' }
    };

    setFormData(prev => ({
      ...prev,
      email: credentials[role].email,
      password: credentials[role].password
    }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required';
    } else {
      const input = formData.email.trim();
      const isEmail = input.includes('@');
      const isUsername = /^[a-zA-Z0-9_]+$/.test(input);

      if (isEmail) {
        // Validate as email
        if (!/\S+@\S+\.\S+/.test(input)) {
          newErrors.email = 'Please enter a valid email address';
        }
      } else if (!isUsername) {
        // Validate as username
        newErrors.email = 'Username can only contain letters, numbers, and underscores';
      } else if (input.length < 3) {
        newErrors.email = 'Username must be at least 3 characters';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if offline
    if (isOffline) {
      setApiMessage('❌ Login is disabled while offline. Please check your internet connection.');
      setApiSuccess(false);
      return;
    }

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setApiMessage(null);
    setApiSuccess(false);
    setIsLoading(true);

    try {
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        setTempToken(data.tempToken);
        setUserInfo(data.user);
        setApiMessage('Password verified. Please complete 2FA verification.');
        setApiSuccess(true);
        return;
      }

      // No 2FA required - complete login
      setApiMessage('Login successful! Redirecting...');
      setApiSuccess(true);

      // Use AuthContext to handle login
      login(data.user, data.token);

      // Redirect to intended destination or dashboard after a short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);

      // Handle different types of errors
      if (err.message.includes('Backend service is not available') || err.message.includes('Demo mode is enabled')) {
        // Check if user has manually enabled demo mode
        if (window.isDemoModeEnabled && window.isDemoModeEnabled()) {
          setApiMessage('🎭 Demo mode activated - Welcome to the preview experience!');
          setApiSuccess(true);

          // For demo mode, create a mock user
          const mockUser = {
            id: 'demo-user',
            name: formData.email.split('@')[0] || 'Demo User',
            email: formData.email,
            role: 'Student'
          };
          const mockToken = 'demo-token';

          login(mockUser, mockToken);

          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        } else {
          // Don't automatically enter demo mode - let the user choose via the popup
          setApiMessage('❌ Login failed due to server unavailability. Please try again or use demo mode.');
          setApiSuccess(false);
        }
      } else {
        setApiMessage(err.message || 'Login failed');
        setApiSuccess(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = (data) => {
    setApiMessage('Login successful! Redirecting...');
    setApiSuccess(true);

    // Use AuthContext to handle login
    login(data.user, data.token);

    // Redirect to intended destination or dashboard
    setTimeout(() => {
      navigate(from, { replace: true });
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
        apiEndpoint="/api/auth/verify-2fa"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue your learning journey
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
              Create one here
            </Link>
          </p>
        </div>

        {/* Session Conflict Warning */}
        {sessionConflict && (
          <SessionConflictWarning
            conflictType={sessionConflict.conflictType}
            conflictUser={sessionConflict.conflictUser}
            targetSessionType={SESSION_TYPES.NORMAL_USER}
            onLogoutComplete={handleSessionConflictResolved}
          />
        )}
        {/* Main Form Card - Only show if no session conflict */}
        {showLoginForm && (
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="text"
                  autoComplete="username email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${focusedField === 'email' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                  placeholder="Enter your email or username"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${focusedField === 'password' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:bg-gray-700"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me for 30 days
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || isOffline}
                className={`group relative flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isOffline
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isOffline ? (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12" />
                    </svg>
                    Login Disabled (Offline)
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in to your account
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* API Message */}
          {apiMessage && (
            <div className={`mt-4 p-4 rounded-xl border ${
              apiSuccess
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center">
                {apiSuccess ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        </div>
        )}

        {/* Demo Credentials - Only show if no session conflict */}
        {showLoginForm && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🚀 Try Demo Accounts
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click any role below to auto-fill credentials
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { role: 'Student', email: 'demo@example.com', username: 'demo', description: 'Access student features' },
              { role: 'Instructor', email: 'instructor@example.com', username: 'instructor', description: 'Manage courses and students' },
              { role: 'Admin', email: 'admin@example.com', username: 'admin', description: 'Full system access' }
            ].map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => !isOffline && fillDemoCredentials(demo.role)}
                disabled={isOffline}
                className={`flex items-center p-3 rounded-xl border transition-all duration-200 group ${
                  isOffline
                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-lg mr-3">
                  {ROLE_ICONS[demo.role]}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {demo.role}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {demo.description}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {demo.email} or @{demo.username}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
              💡 All demo accounts use password: <span className="font-mono font-semibold">password</span>
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default Login;