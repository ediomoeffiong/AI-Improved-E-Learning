import React, { useState, useEffect } from 'react';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import MessageModal from '../../components/common/MessageModal';
import TwoFactorSettings from '../../components/admin/TwoFactorSettings';

function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '60',
    requirePasswordChange: false,
    loginNotifications: true,
    
    // Platform Settings
    maintenanceMode: false,
    debugMode: false,
    systemAlerts: true,
    emailReports: true,
    
    // Notification Settings
    userRegistrationAlerts: true,
    institutionRequestAlerts: true,
    systemErrorAlerts: true,
    dailyReports: true,
    weeklyReports: true,
    
    // Privacy Settings
    auditLogging: true,
    dataRetention: '365',
    anonymizeData: false,
    
    // Advanced Settings
    apiRateLimit: '1000',
    maxFileSize: '50',
    backupFrequency: 'daily',
    logLevel: 'info'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('security');
  
  // Message modal states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [messageContent, setMessageContent] = useState({ title: '', message: '' });
  const [pendingAction, setPendingAction] = useState(null);

  // Get current super admin user
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('appAdminUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('superAdminSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSettingChange = (key, value) => {
    // Check if this is a critical setting that needs confirmation
    const criticalSettings = ['maintenanceMode', 'debugMode', 'auditLogging'];
    
    if (criticalSettings.includes(key) && value !== settings[key]) {
      setPendingAction({ key, value });
      setMessageContent({
        title: 'Confirm Setting Change',
        message: `Are you sure you want to ${value ? 'enable' : 'disable'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}? This may affect platform operations.`
      });
      setShowConfirmationModal(true);
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      setSettings(prev => ({
        ...prev,
        [pendingAction.key]: pendingAction.value
      }));
      setPendingAction(null);
    }
    setShowConfirmationModal(false);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setShowConfirmationModal(false);
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
      // Save settings to localStorage
      localStorage.setItem('superAdminSettings', JSON.stringify(settings));

      // TODO: Implement settings save API call for Super Admin
      console.log('Saving Super Admin settings:', settings);

      // Show success message
      setMessageContent({
        title: 'Settings Saved',
        message: 'Super Admin settings saved successfully!'
      });
      setShowSuccessMessage(true);
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
      setMessageContent({
        title: 'Password Mismatch',
        message: 'New passwords do not match!'
      });
      setShowErrorMessage(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessageContent({
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long.'
      });
      setShowErrorMessage(true);
      return;
    }

    // TODO: Implement password update API call
    console.log('Updating Super Admin password');
    
    setMessageContent({
      title: 'Password Updated',
      message: 'Password updated successfully!'
    });
    setShowSuccessMessage(true);
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const tabs = [
    { id: 'security', name: 'Security', icon: '🛡️' },
    { id: 'platform', name: 'Platform', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy & Data', icon: '🔒' },
    { id: 'advanced', name: 'Advanced', icon: '🔧' },
    { id: '2fa', name: '2FA Settings', icon: '🔐' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="text-4xl mr-3">{ROLE_ICONS[currentUser?.role]}</span>
          Super Admin Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure platform-wide settings and security preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.twoFactorAuth}
                      onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Login Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified of login attempts
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.loginNotifications}
                      onChange={(checked) => handleSettingChange('loginNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Require Password Change
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Force password change on next login
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.requirePasswordChange}
                      onChange={(checked) => handleSettingChange('requirePasswordChange', checked)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Change Password</h4>
                <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Platform Tab */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maintenance Mode
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Put the platform in maintenance mode
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.maintenanceMode}
                      onChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Debug Mode
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enable detailed logging and debugging
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.debugMode}
                      onChange={(checked) => handleSettingChange('debugMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        System Alerts
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive system health alerts
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.systemAlerts}
                      onChange={(checked) => handleSettingChange('systemAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Reports
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Send automated email reports
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.emailReports}
                      onChange={(checked) => handleSettingChange('emailReports', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Rate Limit (requests/hour)
                    </label>
                    <select
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="500">500</option>
                      <option value="1000">1,000</option>
                      <option value="2000">2,000</option>
                      <option value="5000">5,000</option>
                      <option value="10000">10,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max File Size (MB)
                    </label>
                    <select
                      value={settings.maxFileSize}
                      onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="10">10 MB</option>
                      <option value="25">25 MB</option>
                      <option value="50">50 MB</option>
                      <option value="100">100 MB</option>
                      <option value="250">250 MB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Backup Frequency
                    </label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        User Registration Alerts
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified when new users register
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.userRegistrationAlerts}
                      onChange={(checked) => handleSettingChange('userRegistrationAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Institution Request Alerts
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified of institution verification requests
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.institutionRequestAlerts}
                      onChange={(checked) => handleSettingChange('institutionRequestAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        System Error Alerts
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified of critical system errors
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.systemErrorAlerts}
                      onChange={(checked) => handleSettingChange('systemErrorAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Daily Reports
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive daily platform activity reports
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.dailyReports}
                      onChange={(checked) => handleSettingChange('dailyReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weekly Reports
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive weekly platform summary reports
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.weeklyReports}
                      onChange={(checked) => handleSettingChange('weeklyReports', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Data Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Audit Logging
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Log all administrative actions
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.auditLogging}
                      onChange={(checked) => handleSettingChange('auditLogging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Anonymize Data
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Anonymize user data in reports
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.anonymizeData}
                      onChange={(checked) => handleSettingChange('anonymizeData', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data Retention (days)
                    </label>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="1095">3 years</option>
                      <option value="-1">Indefinite</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h3>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>These settings can significantly impact platform performance and security. Change with caution.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Log Level
                  </label>
                  <select
                    value={settings.logLevel}
                    onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                    <option value="trace">Trace</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2FA Settings Tab */}
          {activeTab === '2fa' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <TwoFactorSettings />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        title={messageContent.title}
        message={messageContent.message}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <MessageModal
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        title={messageContent.title}
        message={messageContent.message}
        type="success"
      />

      <MessageModal
        isOpen={showErrorMessage}
        onClose={() => setShowErrorMessage(false)}
        title={messageContent.title}
        message={messageContent.message}
        type="error"
      />
    </div>
  );
}

export default SuperAdminSettings;
