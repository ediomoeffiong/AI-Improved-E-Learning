import React, { useState, useEffect } from 'react';
import TwoFactorSetup from './TwoFactorSetup';

const TwoFactorSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableForm, setDisableForm] = useState({ password: '', token: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('appAdminToken');
      const response = await fetch('/api/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setError('Failed to fetch 2FA status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSuccess = () => {
    setShowSetup(false);
    setSuccess('2FA has been enabled successfully!');
    fetchStatus();
  };

  const handleDisable2FA = async () => {
    try {
      setError('');
      const token = localStorage.getItem('appAdminToken');
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(disableForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('2FA has been disabled successfully');
        setShowDisableConfirm(false);
        setDisableForm({ password: '', token: '' });
        fetchStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const generateNewBackupCodes = async () => {
    try {
      setError('');
      const token = localStorage.getItem('appAdminToken');
      const response = await fetch('/api/2fa/backup-codes/regenerate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New backup codes generated successfully');
        // You might want to show the new backup codes in a modal
        alert(`New backup codes:\n${data.backupCodes.join('\n')}\n\nSave these securely!`);
        fetchStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <TwoFactorSetup
        onSuccess={handleSetupSuccess}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status?.enabled 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }`}>
          {status?.enabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {!status?.enabled ? (
        /* 2FA Not Enabled */
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Why enable 2FA?</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Protects your account even if your password is compromised</li>
              <li>• Required for Super Admin and Super Moderator accounts</li>
              <li>• Uses industry-standard TOTP (Time-based One-Time Password)</li>
              <li>• Compatible with Google Authenticator, Authy, and other apps</li>
            </ul>
          </div>

          <button
            onClick={() => setShowSetup(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      ) : (
        /* 2FA Enabled */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enabled on {status.enabledAt ? new Date(status.enabledAt).toLocaleDateString() : 'Unknown'}
              </p>
              {status.lastVerifiedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last verified: {new Date(status.lastVerifiedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backup Codes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.backupCodesRemaining} unused codes remaining
              </p>
              {status.backupCodesRemaining <= 2 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Consider generating new backup codes
                </p>
              )}
            </div>
          </div>

          {status.isLocked && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Account Locked</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Too many failed attempts. Locked until {new Date(status.lockedUntil).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={generateNewBackupCodes}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Generate New Backup Codes
            </button>
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Disable Two-Factor Authentication
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will remove the extra security layer from your account. You'll need to confirm with your password and a 2FA code.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={disableForm.password}
                  onChange={(e) => setDisableForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  2FA Code (Optional)
                </label>
                <input
                  type="text"
                  value={disableForm.token}
                  onChange={(e) => setDisableForm(prev => ({ ...prev, token: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowDisableConfirm(false);
                  setDisableForm({ password: '', token: '' });
                  setError('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={!disableForm.password}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
