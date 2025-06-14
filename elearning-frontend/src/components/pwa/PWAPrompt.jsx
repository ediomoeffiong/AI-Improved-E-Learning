import { useState, useEffect } from 'react';
import { showInstallPrompt, canInstallPWA } from '../../utils/pwa.js';

const PWAPrompt = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);

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

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check
    checkInstallability();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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


    </>
  );
};

export default PWAPrompt;
