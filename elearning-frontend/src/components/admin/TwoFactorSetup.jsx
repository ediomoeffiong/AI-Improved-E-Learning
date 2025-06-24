import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import OtpInput from 'react-otp-input';

const TwoFactorSetup = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify
  const [qrCode, setQrCode] = useState('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const startSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('appAdminToken');
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setManualKey(data.manualEntryKey);
        setBackupCodes(data.backupCodes);

        // Generate QR code data URL
        try {
          const dataURL = await QRCode.toDataURL(data.qrCode);
          setQrCodeDataURL(dataURL);
        } catch (qrError) {
          console.error('QR Code generation error:', qrError);
          setError('Failed to generate QR code');
        }

        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('appAdminToken');
      const response = await fetch('/api/2fa/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: verificationCode.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setStep(3); // Show backup codes
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Enable Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your Super Admin account
          </p>
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What is 2FA?</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Two-Factor Authentication adds an extra layer of security by requiring a second form of verification 
                  in addition to your password. You'll need an authenticator app like Google Authenticator or Authy.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Before you begin:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Install an authenticator app on your phone (Google Authenticator, Authy, etc.)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Have your phone ready to scan a QR code
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Prepare to save backup codes in a secure location
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startSetup}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Setting up...' : 'Start Setup'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: QR Code and Verification */}
        {step === 2 && (
          <div>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Scan QR Code with your Authenticator App
                </h3>
                
                {qrCodeDataURL && (
                  <div className="bg-white p-4 rounded-lg inline-block border">
                    <img src={qrCodeDataURL} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Can't scan the QR code?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Enter this code manually in your authenticator app:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono">
                    {manualKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(manualKey)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Enter the 6-digit code from your authenticator app:
                </label>
                <div className="flex justify-center">
                  <OtpInput
                    value={verificationCode}
                    onChange={setVerificationCode}
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
                      border: '2px solid #2563eb',
                      boxShadow: '0 0 0 1px #2563eb'
                    }}
                    isInputNum={true}
                    shouldAutoFocus={true}
                    containerStyle="justify-center"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={verifySetup}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2FA Enabled Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Save these backup codes in a secure location
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important!</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      These backup codes can be used to access your account if you lose your phone. 
                      Each code can only be used once. Store them securely!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Backup Codes</h4>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">{code}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={completeSetup}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
