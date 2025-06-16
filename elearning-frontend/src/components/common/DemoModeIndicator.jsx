import { useState, useEffect } from 'react';

// Simple SVG icons to avoid external dependencies
const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const PowerIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
);

const DemoModeIndicator = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Check demo mode status
  const checkDemoMode = () => {
    const demoEnabled = localStorage.getItem('demoModeEnabled') === 'true';
    const token = localStorage.getItem('token');
    const hasDemo = token === 'demo-token' || token?.startsWith('mock-jwt-token');
    return demoEnabled || hasDemo;
  };

  useEffect(() => {
    // Initial check
    setIsDemoMode(checkDemoMode());

    const handleDemoModeChange = (event) => {
      setIsDemoMode(event.detail.enabled);
    };

    // Listen for demo mode changes
    window.addEventListener('demoModeChanged', handleDemoModeChange);

    // Periodic check for demo mode status
    const interval = setInterval(() => {
      setIsDemoMode(checkDemoMode());
    }, 1000);

    return () => {
      window.removeEventListener('demoModeChanged', handleDemoModeChange);
      clearInterval(interval);
    };
  }, []);

  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      window.disableDemoMode();
      // Clear demo tokens
      if (localStorage.getItem('token')?.includes('demo') || localStorage.getItem('token')?.includes('mock')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      window.location.reload();
    } else {
      window.enableDemoMode();
      window.location.reload();
    }
  };

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-20 left-4 z-40">
      <div
        className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Demo Mode
            </span>
            {showControls && (
              <button
                onClick={handleToggleDemoMode}
                className="ml-2 p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                title="Exit Demo Mode"
              >
                <PowerIcon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </button>
            )}
          </div>
          {showControls && (
            <div className="mt-2 pt-2 border-t border-amber-300 dark:border-amber-700">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                Using sample data. Click power button to exit.
              </p>
              <button
                onClick={handleToggleDemoMode}
                className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded transition-colors"
              >
                Exit Demo Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoModeIndicator;
