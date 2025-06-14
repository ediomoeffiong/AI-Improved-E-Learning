import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  manualCacheRefresh,
  clearAllCaches,
  getCacheStatus,
  isOnline
} from '../../utils/pwa';

function Settings() {
  const { getUserName, getUserEmail } = useAuth();
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
    sessionTimeout: '30'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement settings save API call
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
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
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🛡️' },
    { id: 'cache', name: 'Cache & Storage', icon: '💾' }
  ];

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
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Reminders</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded about upcoming deadlines</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.courseReminders}
                    onChange={(e) => handleSettingChange('courseReminders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Digest</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly progress summary</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
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

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Progress</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display your learning progress publicly</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={(e) => handleSettingChange('showProgress', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Achievements</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display your badges and achievements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showAchievements}
                    onChange={(e) => handleSettingChange('showAchievements', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={(e) => handleSettingChange('autoplay', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Autoplay Videos</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically play next video</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

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
    </div>
  );
}

export default Settings;
