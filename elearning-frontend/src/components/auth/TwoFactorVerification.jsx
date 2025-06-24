import React, { useState } from 'react';
import OtpInput from 'react-otp-input';

const TwoFactorVerification = ({
  tempToken,
  userInfo,
  onSuccess,
  onCancel,
  onError,
  apiEndpoint = '/api/auth/app-admin-verify-2fa' // Default to admin endpoint
}) => {
  const [otp, setOtp] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError('Please enter your verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          token: otp.trim(),
          isBackupCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data);
      } else {
        setError(data.message);
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        if (onError) {
          onError(data.message);
        }
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the verification code from your authenticator app
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userInfo?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{userInfo?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo?.email}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{userInfo?.role}</p>
              </div>
            </div>
          </div>

          {/* Toggle between TOTP and Backup Code */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => {
                setIsBackupCode(false);
                setOtp('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isBackupCode
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Authenticator App
            </button>
            <button
              onClick={() => {
                setIsBackupCode(true);
                setOtp('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isBackupCode
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Backup Code
            </button>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {isBackupCode ? 'Enter Backup Code' : 'Enter 6-Digit Code'}
            </label>
            
            {isBackupCode ? (
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white text-center font-mono text-lg"
                maxLength={8}
              />
            ) : (
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                separator={<span className="mx-1"></span>}
                inputStyle={{
                  width: '3rem',
                  height: '3rem',
                  margin: '0 0.25rem',
                  fontSize: '1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: 'white',
                  color: '#111827'
                }}
                focusStyle={{
                  border: '2px solid #dc2626',
                  boxShadow: '0 0 0 1px #dc2626'
                }}
                isInputNum={true}
                shouldAutoFocus={true}
                containerStyle="justify-center"
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
              {attemptsRemaining < 5 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {attemptsRemaining} attempts remaining
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isLoading || !otp.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify & Sign In'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isBackupCode 
                ? 'Use one of your saved backup codes if you cannot access your authenticator app'
                : 'Open your authenticator app and enter the 6-digit code'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
