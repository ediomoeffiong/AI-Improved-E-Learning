import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import {
  manualCacheRefresh,
  clearAllCaches,
  getCacheStatus,
  isOnline
} from '../../utils/pwa';
import { NIGERIAN_UNIVERSITIES, INSTITUTION_REQUEST_STATUS } from '../../constants/institutions';
import { USER_ROLES } from '../../constants/roles';
import { COUNTRY_CODES, formatPhoneNumber } from '../../constants/countryCodes';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import MessageModal from '../../components/common/MessageModal';
import TwoFactorSettings from '../../components/admin/TwoFactorSettings';

function Settings() {
  const { getUserName, getUserEmail, getUserPhoneNumber, user, login, getInstitutionData } = useAuth();
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    courseReminders: true,
    weeklyDigest: true,

    // Privacy Settings
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,

    // Learning Preferences
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    autoplay: false,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',

    // Institution Settings
    institutionFunctionsEnabled: false,
    phoneNumber: '',
    institutionName: '',
    studentId: '',
    department: '',
    academicYear: '',
    enrollmentDate: '',
    studentLevel: 'undergraduate'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [usernameData, setUsernameData] = useState({
    newUsername: '',
    isUpdating: false
  });

  const [phoneNumber, setPhoneNumber] = useState(getUserPhoneNumber() || '');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const [activeTab, setActiveTab] = useState('account');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isOfflineState, setIsOfflineState] = useState(false);
  const [isCheckingOnline, setIsCheckingOnline] = useState(true);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [isEditingInstitutionPhone, setIsEditingInstitutionPhone] = useState(false);

  // Message modal states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showRefreshConfirmation, setShowRefreshConfirmation] = useState(false);
  const [messageContent, setMessageContent] = useState({ title: '', message: '' });

  // Check online status
  useEffect(() => {
    let mounted = true;

    const checkOnlineStatus = async () => {
      try {
        const online = await isOnline();
        if (mounted) {
          setIsOfflineState(!online);
          setIsCheckingOnline(false);
        }
      } catch (error) {
        console.error('Error checking online status:', error);
        if (mounted) {
          setIsOfflineState(false); // Assume online if check fails
          setIsCheckingOnline(false);
        }
      }
    };

    // Initial check
    checkOnlineStatus();

    // Listen for online/offline events
    const handleOnline = async () => {
      if (mounted) {
        const online = await isOnline();
        setIsOfflineState(!online);
      }
    };

    const handleOffline = () => {
      if (mounted) {
        setIsOfflineState(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 10 seconds
    const interval = setInterval(() => {
      if (mounted) {
        checkOnlineStatus();
      }
    }, 10000);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Check offline status
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

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
      }

      // Auto-populate phone number from profile if not already set in institution settings
      const profilePhoneNumber = getUserPhoneNumber();
      if (profilePhoneNumber && !savedSettings?.phoneNumber) {
        setSettings(prev => ({
          ...prev,
          phoneNumber: profilePhoneNumber
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Keyboard navigation for tabs
  const handleKeyDown = (e, tabId) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    setActiveTab(tabs[newIndex].id);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInstitutionToggle = (enabled) => {
    if (enabled) {
      // Show modern confirmation modal
      setShowInstitutionModal(true);
    } else {
      handleSettingChange('institutionFunctionsEnabled', false);
    }
  };

  const handleInstitutionConfirm = () => {
    handleSettingChange('institutionFunctionsEnabled', true);
    setShowInstitutionModal(false);
  };

  const handleInstitutionCancel = () => {
    setShowInstitutionModal(false);
  };

  // Message modal handlers
  const handleSuccessMessageClose = () => {
    setShowSuccessMessage(false);
  };

  const handleErrorMessageClose = () => {
    setShowErrorMessage(false);
  };

  const handleValidationMessageClose = () => {
    setShowValidationMessage(false);
  };

  const handleRefreshConfirm = () => {
    setShowRefreshConfirmation(false);
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshConfirmation(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    try {
      // Validate institution settings if enabled
      if (settings.institutionFunctionsEnabled) {
        if (!settings.phoneNumber.trim()) {
          setMessageContent({
            title: 'Phone Number Required',
            message: 'Phone number is required when enabling institution functions.'
          });
          setShowValidationMessage(true);
          return;
        }
        if (!settings.institutionName.trim()) {
          setMessageContent({
            title: 'Institution Required',
            message: 'Institution selection is required when enabling institution functions.'
          });
          setShowValidationMessage(true);
          return;
        }
        if (!settings.studentId.trim()) {
          setMessageContent({
            title: 'Student ID Required',
            message: 'Student ID is required when enabling institution functions.'
          });
          setShowValidationMessage(true);
          return;
        }

        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(settings.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
          setMessageContent({
            title: 'Invalid Phone Number',
            message: 'Please enter a valid phone number.'
          });
          setShowValidationMessage(true);
          return;
        }
      }

      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // TODO: Implement settings save API call
      console.log('Saving settings:', settings);

      // Show success message
      setMessageContent({
        title: 'Settings Saved',
        message: 'Settings saved successfully!'
      });
      setShowSuccessMessage(true);

      // If institution functions were just enabled/disabled, suggest page refresh
      if (settings.institutionFunctionsEnabled) {
        setShowRefreshConfirmation(true);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessageContent({
        title: 'Error Saving Settings',
        message: 'Error saving settings. Please try again.'
      });
      setShowErrorMessage(true);
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // TODO: Implement password update API call
    console.log('Updating password');
    alert('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();

    if (!usernameData.newUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    if (usernameData.newUsername.length < 3 || usernameData.newUsername.length > 20) {
      alert('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameData.newUsername)) {
      alert('Username can only contain letters, numbers, and underscores');
      return;
    }

    setUsernameData(prev => ({ ...prev, isUpdating: true }));

    try {
      const response = await userAPI.updateUsername(usernameData.newUsername);

      // Update the user context with new username
      const updatedUser = { ...user, username: response.user.username };
      const token = localStorage.getItem('token');
      login(updatedUser, token);

      alert('Username updated successfully!');
      setUsernameData({ newUsername: '', isUpdating: false });
    } catch (error) {
      console.error('Username update error:', error);
      alert(error.message || 'Failed to update username. Please try again.');
      setUsernameData(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handlePhoneNumberUpdate = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 8) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsUpdatingPhone(true);

    try {
      const response = await userAPI.updatePhoneNumber(phoneNumber);

      // Update user data in localStorage and context
      const updatedUser = { ...user, phoneNumber: response.user.phoneNumber };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(updatedUser, localStorage.getItem('token'));

      alert('📱 Phone number updated successfully! Your contact information is now up to date.');
      setPhoneNumber(response.user.phoneNumber);
    } catch (error) {
      console.error('Error updating phone number:', error);
      alert(error.message || 'Error updating phone number. Please try again.');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  // Load cache status when cache tab is active
  useEffect(() => {
    if (activeTab === 'cache') {
      loadCacheStatus();
    }
  }, [activeTab]);

  const loadCacheStatus = async () => {
    try {
      const status = await getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Error loading cache status:', error);
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      await manualCacheRefresh();
      await loadCacheStatus();
      alert('Cache refreshed successfully!');
    } catch (error) {
      console.error('Cache refresh failed:', error);
      alert('Cache refresh failed. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will remove offline content and may slow down the app temporarily.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllCaches();
      await loadCacheStatus();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Cache clear failed:', error);
      alert('Cache clear failed. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🛡️' },
    { id: 'institution', name: 'Institution', icon: '🏫' },
    { id: 'cache', name: 'Cache & Storage', icon: '💾' }
  ];

  // Show loading spinner while checking online status
  if (isCheckingOnline) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show offline message if user is offline
  if (isOfflineState) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Offline Mode
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Settings are not available while offline. Please check your internet connection and try again.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Try Again
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Go Back
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Some features may be available in offline mode. Visit the dashboard to see what's accessible.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show offline message if user is offline
  if (isOffline) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Offline Mode
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Settings are not available while offline. Please check your internet connection and try again.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Try Again
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Go Back
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Some features may be available in offline mode. Visit the dashboard to see what's accessible.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto scrollbar-hide touch-scroll">
            <nav className="flex space-x-8 px-6 min-w-max mobile-tab-nav" role="tablist" aria-label="Settings navigation tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile scroll indicator and tab dots */}
          <div className="sm:hidden py-3 bg-gray-50 dark:bg-gray-700">
            {/* Tab indicator dots */}
            <div className="flex justify-center space-x-2 mb-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to ${tab.name} tab`}
                />
              ))}
            </div>

            {/* Scroll instruction */}
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Swipe tabs or tap dots • {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>

                {/* Current Account Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-blue-100 dark:border-gray-600">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Account Overview</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your learning identity at a glance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getUserName() || '🎭 Mystery Scholar'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium break-all">
                        {getUserEmail() || '📧 No email set'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username
                        </label>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user?.username ? `@${user.username}` : '🏷️ No username set'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getUserPhoneNumber() ? formatPhoneNumber(getUserPhoneNumber()) : '📱 No phone number set'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Account Role
                        </label>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          user?.role === 'Instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user?.role === 'Admin' ? '👑' : user?.role === 'Instructor' ? '🎓' : '📚'} {user?.role || 'Student'}
                        </span>
                      </div>
                    </div>

                    {/* Institution Info */}
                    {(() => {
                      const institutionData = getInstitutionData();
                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Institution
                            </label>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {institutionData?.institutionName ?
                              NIGERIAN_UNIVERSITIES.find(uni => uni.value === institutionData.institutionName)?.label || institutionData.institutionName
                              : '🏛️ No institution set'}
                          </p>
                          {institutionData?.studentId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ID: {institutionData.studentId}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Member since {new Date().getFullYear()}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Profile {getUserName() && getUserEmail() && getUserPhoneNumber() ? '100%' : '75%'} complete
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Username */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Update Username</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your username is used for login and identification. It must be unique and can contain letters, numbers, and underscores only.
                  </p>

                  <form onSubmit={handleUsernameUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400">@</span>
                        </div>
                        <input
                          type="text"
                          value={usernameData.newUsername}
                          onChange={(e) => setUsernameData(prev => ({ ...prev, newUsername: e.target.value }))}
                          placeholder="Enter new username"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          disabled={usernameData.isUpdating}
                          minLength={3}
                          maxLength={20}
                          pattern="^[a-zA-Z0-9_]+$"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        3-20 characters, letters, numbers, and underscores only
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={usernameData.isUpdating || !usernameData.newUsername.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center"
                      >
                        {usernameData.isUpdating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Username'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setUsernameData({ newUsername: '', isUpdating: false })}
                        disabled={usernameData.isUpdating}
                        className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                </div>

                {/* Contact Information & Profile Management */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white">Contact & Profile Enhancement</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete your profile for a better learning experience</p>
                    </div>
                  </div>

                  {/* Profile Completion Progress */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {(() => {
                          const fields = [getUserName(), getUserEmail(), getUserPhoneNumber(), user?.username];
                          const completed = fields.filter(Boolean).length;
                          const total = fields.length;
                          return `${Math.round((completed / total) * 100)}%`;
                        })()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(() => {
                            const fields = [getUserName(), getUserEmail(), getUserPhoneNumber(), user?.username];
                            const completed = fields.filter(Boolean).length;
                            const total = fields.length;
                            return Math.round((completed / total) * 100);
                          })()}%`
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { label: 'Name', value: getUserName(), icon: '👤' },
                        { label: 'Email', value: getUserEmail(), icon: '📧' },
                        { label: 'Phone', value: getUserPhoneNumber(), icon: '📱' },
                        { label: 'Username', value: user?.username, icon: '🏷️' }
                      ].map((field, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            field.value
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          <span className="mr-1">{field.icon}</span>
                          {field.label}
                          {field.value && <span className="ml-1">✓</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone Number Management */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Phone Number</h5>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {getUserPhoneNumber() ? 'Update your contact number' : 'Add your phone number for account security'}
                      </p>

                      <form onSubmit={handlePhoneNumberUpdate} className="space-y-4">
                        <PhoneNumberInput
                          value={phoneNumber}
                          onChange={setPhoneNumber}
                          disabled={isUpdatingPhone}
                          placeholder="Enter your phone number"
                          label=""
                          className="mb-4"
                        />

                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={isUpdatingPhone || !phoneNumber.trim()}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                          >
                            {isUpdatingPhone ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              getUserPhoneNumber() ? 'Update Phone' : 'Add Phone Number'
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPhoneNumber('')}
                            disabled={isUpdatingPhone}
                            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            Clear
                          </button>
                        </div>
                      </form>

                      {getUserPhoneNumber() && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-green-800 dark:text-green-200 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Current Phone Number
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                                {formatPhoneNumber(getUserPhoneNumber())}
                              </p>
                            </div>
                            <button
                              onClick={() => setPhoneNumber(getUserPhoneNumber())}
                              className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Institution Quick View */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Institution Status</h5>
                      </div>
                      {(() => {
                        const institutionData = getInstitutionData();
                        const hasInstitution = institutionData?.institutionName;

                        return (
                          <div className="space-y-3">
                            {hasInstitution ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {NIGERIAN_UNIVERSITIES.find(uni => uni.value === institutionData.institutionName)?.label || institutionData.institutionName}
                                </p>
                                {institutionData.studentId && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {institutionData.studentId}</p>
                                )}
                                {institutionData.department && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Dept: {institutionData.department}</p>
                                )}
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Institution functions enabled
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  🏛️ No institution set
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                  Enable institution functions to access classroom features and CBT assessments
                                </p>
                              </div>
                            )}
                            <button
                              onClick={() => setActiveTab('institution')}
                              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              {hasInstitution ? 'Manage Institution' : 'Setup Institution'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Profile Tips */}
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          💡 Profile Enhancement Tips
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          <li>• Complete your profile to unlock personalized learning recommendations</li>
                          <li>• Add your phone number for account recovery and security notifications</li>
                          <li>• Set up institution details to access classroom and assessment features</li>
                          <li>• A complete profile helps instructors and peers connect with you better</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  label="Email Notifications"
                  description="Receive notifications via email"
                  color="blue"
                  id="email-notifications"
                />

                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  label="Push Notifications"
                  description="Receive push notifications in browser"
                  color="blue"
                  id="push-notifications"
                />

                <ToggleSwitch
                  checked={settings.courseReminders}
                  onChange={(checked) => handleSettingChange('courseReminders', checked)}
                  label="Course Reminders"
                  description="Get reminded about upcoming deadlines"
                  color="blue"
                  id="course-reminders"
                />

                <ToggleSwitch
                  checked={settings.weeklyDigest}
                  onChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                  label="Weekly Digest"
                  description="Receive weekly progress summary"
                  color="blue"
                  id="weekly-digest"
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <ToggleSwitch
                  checked={settings.showProgress}
                  onChange={(checked) => handleSettingChange('showProgress', checked)}
                  label="Show Progress"
                  description="Display your learning progress publicly"
                  color="purple"
                  id="show-progress"
                />

                <ToggleSwitch
                  checked={settings.showAchievements}
                  onChange={(checked) => handleSettingChange('showAchievements', checked)}
                  label="Show Achievements"
                  description="Display your badges and achievements"
                  color="purple"
                  id="show-achievements"
                />
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">Greenwich Mean Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <ToggleSwitch
                  checked={settings.autoplay}
                  onChange={(checked) => handleSettingChange('autoplay', checked)}
                  label="Autoplay Videos"
                  description="Automatically play next video"
                  color="green"
                  id="autoplay-videos"
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Two-Factor Authentication */}
              <TwoFactorSettings />

              {/* Session Settings */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Change Password</h4>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Institution Tab */}
          {activeTab === 'institution' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Institution Functions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable institution-specific features like classroom management, CBT (Computer Based Testing), and academic tools. Phone number and institution details are required for verification.
              </p>

              {/* Enable Institution Functions Toggle */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 id="institution-toggle-label" className="text-md font-medium text-gray-900 dark:text-white">Enable Institution Functions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Unlock classroom features, CBT assessments, and academic management tools
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.institutionFunctionsEnabled}
                    onChange={handleInstitutionToggle}
                    color="blue"
                    size="md"
                    id="institution-toggle"
                  />
                </div>

                {settings.institutionFunctionsEnabled && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Institution functions enabled! Classroom and CBT features are now available.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Institution Details Form */}
              {settings.institutionFunctionsEnabled && (
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Institution Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Phone Number <span className="text-red-500">*</span>
                      </label>

                      {/* Show existing phone number or input field */}
                      {settings.phoneNumber && !isEditingInstitutionPhone ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                  Phone Number Verified
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                                  {settings.phoneNumber ? formatPhoneNumber(settings.phoneNumber) : 'No phone number'}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  {settings.phoneNumber === getUserPhoneNumber() ?
                                    '✓ Using phone number from your profile' :
                                    '✓ Custom phone number for institution'
                                  }
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditingInstitutionPhone(true)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline transition-colors duration-200"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <PhoneNumberInput
                            value={settings.phoneNumber}
                            onChange={(value) => handleSettingChange('phoneNumber', value)}
                            placeholder="Enter your phone number"
                            required={true}
                            label=""
                          />
                          {isEditingInstitutionPhone && (
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingInstitutionPhone(false);
                                  // Reset to profile phone number if available
                                  if (getUserPhoneNumber()) {
                                    handleSettingChange('phoneNumber', getUserPhoneNumber());
                                  }
                                }}
                                className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingInstitutionPhone(false)}
                                disabled={!settings.phoneNumber.trim()}
                                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded-md transition-colors duration-200"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Required for institution verification and emergency contact
                      </p>

                      {/* Show suggestion to use profile phone number if different */}
                      {getUserPhoneNumber() && settings.phoneNumber !== getUserPhoneNumber() && !isEditingInstitutionPhone && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Suggestion:</strong> Use your profile phone number ({getUserPhoneNumber() ? formatPhoneNumber(getUserPhoneNumber()) : 'N/A'}) for consistency?
                              </p>
                              <button
                                type="button"
                                onClick={() => handleSettingChange('phoneNumber', getUserPhoneNumber())}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline mt-1"
                              >
                                Use profile phone number
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Institution *
                      </label>
                      <select
                        value={settings.institutionName}
                        onChange={(e) => handleSettingChange('institutionName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">Select your institution</option>
                        {NIGERIAN_UNIVERSITIES.map((university) => (
                          <option key={university.value} value={university.value}>
                            {university.label}
                          </option>
                        ))}
                        <option value="other">Other (Request to add new institution)</option>
                      </select>
                      {settings.institutionName === 'other' && (
                        <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Request New Institution
                              </h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Your institution will need to be verified by our app administrators before it can be added to the system. Please contact support with your institution details.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student ID *
                      </label>
                      <input
                        type="text"
                        value={settings.studentId}
                        onChange={(e) => handleSettingChange('studentId', e.target.value)}
                        placeholder="e.g., STU2024001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department/Faculty
                      </label>
                      <input
                        type="text"
                        value={settings.department}
                        onChange={(e) => handleSettingChange('department', e.target.value)}
                        placeholder="e.g., Computer Science"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        value={settings.academicYear}
                        onChange={(e) => handleSettingChange('academicYear', e.target.value)}
                        placeholder="e.g., 2024/2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student Level
                      </label>
                      <select
                        value={settings.studentLevel}
                        onChange={(e) => handleSettingChange('studentLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="phd">PhD</option>
                        <option value="certificate">Certificate</option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enrollment Date
                      </label>
                      <input
                        type="date"
                        value={settings.enrollmentDate}
                        onChange={(e) => handleSettingChange('enrollmentDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4">Available Features</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Classroom Management</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">CBT Assessments</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Performance Analytics</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                          <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Academic Resources</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cache & Storage Tab */}
          {activeTab === 'cache' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cache & Storage Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Manage your app's cache and offline storage to ensure optimal performance and latest content.
                </p>

                {/* Cache Status */}
                {cacheStatus && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Cache Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Connection Status:</span>
                        <span className={`font-medium ${cacheStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {cacheStatus.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Service Worker:</span>
                        <span className={`font-medium ${cacheStatus.serviceWorkerActive ? 'text-green-600' : 'text-red-600'}`}>
                          {cacheStatus.serviceWorkerActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cache Entries:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {cacheStatus.cacheSize}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Offline Data:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {cacheStatus.localCacheEntries} items
                        </span>
                      </div>
                      {cacheStatus.lastRefresh && (
                        <div className="flex justify-between md:col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Last Refresh:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {cacheStatus.lastRefresh.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cache Actions */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleRefreshCache}
                      disabled={isRefreshing || !cacheStatus?.isOnline}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {isRefreshing ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refresh Cache</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleClearCache}
                      disabled={isClearing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {isClearing ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Clearing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Clear Cache</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>Refresh Cache:</strong> Updates cached content with the latest data from the server. Use this when you want to ensure you have the most recent content.</p>
                    <p><strong>Clear Cache:</strong> Removes all cached data and forces the app to download fresh content. This may temporarily slow down the app but ensures all content is up-to-date.</p>
                    {!cacheStatus?.isOnline && (
                      <p className="text-amber-600 dark:text-amber-400">
                        <strong>Note:</strong> You are currently offline. Cache refresh is not available until you reconnect to the internet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <button
              onClick={handleSaveSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institution Functions Confirmation Modal */}
      {showInstitutionModal && (
        <ConfirmationModal
          isOpen={showInstitutionModal}
          onClose={handleInstitutionCancel}
          onConfirm={handleInstitutionConfirm}
          title="Enable Institution Functions"
          confirmText="Enable"
          cancelText="Cancel"
          confirmButtonClass="bg-blue-600 hover:bg-blue-700 text-white"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconClass="text-blue-600 dark:text-blue-400"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Enabling institution functions will unlock powerful academic features including:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Required Information:
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Phone number (for verification)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Institution selection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Student ID
                </li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Features You'll Unlock:
              </h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Classroom management tools
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  CBT (Computer Based Testing) assessments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Academic performance analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Institution-specific resources
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              💡 You can fill in the required details after enabling this feature.
            </p>
          </div>
        </ConfirmationModal>
      )}

      {/* Success Message Modal */}
      <MessageModal
        isOpen={showSuccessMessage}
        onClose={handleSuccessMessageClose}
        title={messageContent.title}
        message={messageContent.message}
        buttonText="OK"
        buttonClass="bg-green-600 hover:bg-green-700 text-white"
        icon="✅"
        iconClass="text-green-600 dark:text-green-400"
      />

      {/* Error Message Modal */}
      <MessageModal
        isOpen={showErrorMessage}
        onClose={handleErrorMessageClose}
        title={messageContent.title}
        message={messageContent.message}
        buttonText="OK"
        buttonClass="bg-red-600 hover:bg-red-700 text-white"
        icon="❌"
        iconClass="text-red-600 dark:text-red-400"
      />

      {/* Validation Message Modal */}
      <MessageModal
        isOpen={showValidationMessage}
        onClose={handleValidationMessageClose}
        title={messageContent.title}
        message={messageContent.message}
        buttonText="OK"
        buttonClass="bg-orange-600 hover:bg-orange-700 text-white"
        icon="⚠️"
        iconClass="text-orange-600 dark:text-orange-400"
      />

      {/* Refresh Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRefreshConfirmation}
        onClose={handleRefreshCancel}
        onConfirm={handleRefreshConfirm}
        title="Refresh Page"
        message="Institution functions have been enabled! Would you like to refresh the page to see the new features?"
        confirmText="Refresh"
        cancelText="Later"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700 text-white"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
        iconClass="text-blue-600 dark:text-blue-400"
      />
    </div>
  );
}

export default Settings;
