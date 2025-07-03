import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { ROLE_OPTIONS, DEFAULT_ROLE, ROLE_ICONS } from '../../constants/roles';
import { isOnline } from '../../utils/pwa';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import SessionConflictWarning from '../../components/auth/SessionConflictWarning';
import {
  checkNormalUserLoginConflict,
  SESSION_TYPES
} from '../../utils/sessionManager';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: DEFAULT_ROLE,
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  // Session conflict states
  const [sessionConflict, setSessionConflict] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);

  // Check for session conflicts on component mount
  useEffect(() => {
    const conflict = checkNormalUserLoginConflict();
    if (conflict.hasConflict) {
      setSessionConflict(conflict);
      setShowRegistrationForm(false);
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

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Very Weak', color: 'text-red-600' };
      case 2: return { text: 'Weak', color: 'text-orange-600' };
      case 3: return { text: 'Fair', color: 'text-yellow-600' };
      case 4: return { text: 'Good', color: 'text-blue-600' };
      case 5: return { text: 'Strong', color: 'text-green-600' };
      default: return { text: '', color: '' };
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.username.trim()) {
      if (formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (formData.username.trim().length > 20) {
        newErrors.username = 'Username must be no more than 20 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[^\d+]/g, '');
      if (cleanPhone.length < 8 || !cleanPhone.startsWith('+')) {
        newErrors.phoneNumber = 'Please enter a valid phone number with country code';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak. Use a mix of letters, numbers, and symbols';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    if (!formData.role) {
      newErrors.role = 'Please select an account type';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if offline
    if (isOffline) {
      setApiMessage('❌ Registration is disabled while offline. Please check your internet connection.');
      setApiSuccess(false);
      return;
    }

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setApiMessage(null);
      return;
    }

    setErrors({});
    setApiMessage(null);
    setApiSuccess(false);
    setIsLoading(true);

    // Combine firstName and lastName into name
    const payload = {
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      username: formData.username.trim() || undefined, // Only include if provided
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim() || undefined, // Only include if provided
      password: formData.password,
      role: formData.role,
    };

    try {
      const data = await authAPI.register(payload);

      // Different messages based on role
      let successMessage = '';
      let redirectDelay = 2000;

      if (payload.role === 'admin') {
        successMessage = 'Registration successful! Your admin request has been submitted for App Admin approval. You can login with limited access while awaiting verification.';
        redirectDelay = 4000; // Longer delay for admin message
      } else if (payload.role === 'moderator') {
        successMessage = 'Registration successful! Your moderator request has been submitted for Institution Admin approval. You can login with limited access while awaiting verification.';
        redirectDelay = 4000; // Longer delay for moderator message
      } else {
        successMessage = 'Registration successful! Redirecting to login...';
      }

      setApiMessage(successMessage);
      setApiSuccess(true);

      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, redirectDelay);
    } catch (err) {
      console.error('Registration error:', err);

      // Handle different types of errors
      if (err.message.includes('Backend service is not available') || err.message.includes('Demo mode is enabled')) {
        // Don't automatically enter demo mode - let the user choose via the popup
        setApiMessage('❌ Registration failed due to server unavailability. Please try again or use demo mode.');
        setApiSuccess(false);
      } else {
        setApiMessage(err.message || 'Registration failed');
        setApiSuccess(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session conflict resolution
  const handleSessionConflictResolved = () => {
    setSessionConflict(null);
    setShowRegistrationForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Modern Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join thousands of learners worldwide 🌟
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Already have an account?</span>
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Session Conflict Warning */}
          {sessionConflict && (
            <div className="mb-6">
              <SessionConflictWarning
                conflictType={sessionConflict.conflictType}
                conflictUser={sessionConflict.conflictUser}
                targetSessionType={SESSION_TYPES.NORMAL_USER}
                onLogoutComplete={handleSessionConflictResolved}
              />
            </div>
          )}

          {/* Main Form Card - Only show if no session conflict */}
          {showRegistrationForm && (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
              {/* Subtle decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-indigo-900/10 pointer-events-none"></div>

              <div className="relative z-10">

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Offline Warning */}
                  {isOffline && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          You're currently offline. Registration will be available when you're back online.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* API Message */}
                  {apiMessage && (
                    <div className={`rounded-xl p-4 mb-6 ${
                      apiSuccess
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-3 ${
                          apiSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={apiSuccess ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        <p className={`text-sm ${
                          apiSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {apiMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === 'firstName' ? 'text-blue-500' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                            errors.firstName
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                          }`}
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isOffline}
                        />
                      </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-shake">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === 'lastName' ? 'text-blue-500' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                            errors.lastName
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                          }`}
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isOffline}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                          errors.email
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                        }`}
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isOffline}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'username' ? 'text-blue-500' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                          errors.username
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                        }`}
                        placeholder="johndoe123"
                        value={formData.username}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isOffline}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                    {errors.username && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <PhoneNumberInput
                      value={formData.phoneNumber}
                      onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      required={false}
                      error={errors.phoneNumber}
                      disabled={isOffline}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Optional - Recommended for account security
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        className={`block w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 appearance-none ${
                          errors.role
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                        }`}
                        value={formData.role}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('role')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isOffline}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {ROLE_ICONS[option.value]} {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className={`w-5 h-5 transition-colors duration-200 ${
                          focusedField === 'role' ? 'text-blue-500' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {ROLE_OPTIONS.find(option => option.value === formData.role)?.description}
                    </p>
                    {errors.role && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.role}
                      </p>
                    )}
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                            errors.password
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                          }`}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isOffline}
                        />
                      </div>

                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  passwordStrength <= 1 ? 'bg-red-500 w-1/5' :
                                  passwordStrength === 2 ? 'bg-orange-500 w-2/5' :
                                  passwordStrength === 3 ? 'bg-yellow-500 w-3/5' :
                                  passwordStrength === 4 ? 'bg-blue-500 w-4/5' :
                                  'bg-green-500 w-full'
                                }`}
                              />
                            </div>
                            <span className={`text-xs font-medium ${getPasswordStrengthText(passwordStrength).color}`}>
                              {getPasswordStrengthText(passwordStrength).text}
                            </span>
                          </div>
                        </div>
                      )}

                      {errors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 ${
                            errors.confirmPassword
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-700'
                          }`}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isOffline}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            id="agreeTerms"
                            name="agreeTerms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 dark:border-gray-600 dark:bg-gray-700"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            disabled={isOffline}
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="agreeTerms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
                            I agree to the{' '}
                            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors underline">
                              Privacy Policy
                            </Link>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                        </div>
                      </div>
                      {errors.agreeTerms && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.agreeTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isLoading || isOffline}
                      className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        isOffline
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isOffline ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12" />
                          </svg>
                          Registration Disabled (Offline)
                        </>
                      ) : isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Create Account
                        </>
                      )}
                    </button>

                    {/* Additional Info */}
                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Join thousands of learners worldwide 🌍
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;