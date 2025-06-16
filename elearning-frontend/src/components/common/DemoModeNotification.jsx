import { useState, useEffect } from 'react';

// Simple SVG icons to avoid external dependencies
const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const BackendErrorNotification = () => {
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBackendError = (event) => {
      const { error: errorMessage, canUseDemoMode } = event.detail;
      setError({ message: errorMessage, canUseDemoMode });
      setIsVisible(true);
    };

    window.addEventListener('backendError', handleBackendError);

    return () => {
      window.removeEventListener('backendError', handleBackendError);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setError(null), 300);
  };

  const handleTryAgain = () => {
    setIsVisible(false);
    setTimeout(() => {
      setError(null);
      window.location.reload();
    }, 300);
  };

  const handleUseDemoMode = () => {
    window.enableDemoMode();
    setIsVisible(false);
    setTimeout(() => {
      setError(null);
      window.location.reload();
    }, 300);
  };

  if (!error) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleClose} />

      {/* Error Modal */}
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connection Failed
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Unable to connect to the server. This could be due to:
          </p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
            <li>• Server maintenance</li>
            <li>• Network connectivity issues</li>
            <li>• Local development server not running</li>
          </ul>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs text-red-700 dark:text-red-300 font-mono">
              Error: {error.message}
            </p>
          </div>
        </div>

        {/* Demo Mode Option */}
        {error.canUseDemoMode && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Try Demo Mode Instead?</p>
                  <p className="text-xs">
                    Explore all features with sample data while the server is unavailable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 px-6 pb-6">
          <button
            onClick={handleTryAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          {error.canUseDemoMode && (
            <button
              onClick={handleUseDemoMode}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Use Demo Mode
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendErrorNotification;
