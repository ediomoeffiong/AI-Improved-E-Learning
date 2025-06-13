import { useState, useEffect } from 'react';
import { showInstallPrompt, canInstallPWA, isOnline } from '../../utils/pwa.js';

const PWAPrompt = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Only show PWA features in production or when explicitly testing
    const isDev = import.meta.env.DEV;

    // Check if PWA can be installed
    const checkInstallability = () => {
      if (!isDev && canInstallPWA()) {
        setShowInstallBanner(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = () => {
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallBanner(false);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      // Only show offline banner in production
      if (!isDev) {
        setShowOfflineBanner(true);
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkInstallability();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowInstallBanner(false);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    // Remember user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissOffline = () => {
    setShowOfflineBanner(false);
  };

  // Don't show install banner if user dismissed it recently (within 7 days)
  const shouldShowInstallBanner = () => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return dismissedTime < sevenDaysAgo;
    }
    return true;
  };

  return (
    <>
      {/* Install App Banner */}
      {showInstallBanner && shouldShowInstallBanner() && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📱</div>
              <div>
                <div className="font-semibold">Install AI E-Learning</div>
                <div className="text-sm opacity-90">
                  Get the full app experience with offline access
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="text-white hover:text-gray-200 p-2"
                aria-label="Dismiss install prompt"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white p-3 z-50 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl">📡</div>
              <div>
                <div className="font-semibold">You're offline</div>
                <div className="text-sm opacity-90">
                  Some features may be limited. Your progress will sync when you're back online.
                </div>
              </div>
            </div>
            <button
              onClick={handleDismissOffline}
              className="text-white hover:text-gray-200 p-2"
              aria-label="Dismiss offline notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator (small persistent indicator) */}
      {isOffline && !showOfflineBanner && (
        <div className="fixed bottom-4 left-4 bg-orange-600 text-white px-3 py-2 rounded-full text-sm font-medium z-40 shadow-lg">
          📡 Offline
        </div>
      )}
    </>
  );
};

export default PWAPrompt;
