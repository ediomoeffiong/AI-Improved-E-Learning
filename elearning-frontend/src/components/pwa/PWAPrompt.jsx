import { useState, useEffect } from 'react';
import { showInstallPrompt, canInstallPWA } from '../../utils/pwa.js';

const PWAPrompt = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Initialize global deferredPrompt
    if (!window.deferredPrompt) {
      window.deferredPrompt = null;
    }

    // Only show PWA features in production
    const isDev = import.meta.env.DEV;

    // Don't show PWA prompts in development
    if (isDev) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Also save to global for other components
      window.deferredPrompt = e;

      // Only show if user hasn't dismissed recently
      if (shouldShowInstallBanner()) {
        setShowInstallBanner(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    setDeferredPrompt(null);
    window.deferredPrompt = null;
    // Remember user dismissed the prompt (don't show again for 30 days)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show install banner if user dismissed it recently (within 30 days)
  const shouldShowInstallBanner = () => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return dismissedTime < thirtyDaysAgo;
    }
    return true;
  };

  return (
    <>
      {/* Install App Banner - positioned below header */}
      {showInstallBanner && shouldShowInstallBanner() && deferredPrompt && (
        <div className="fixed top-16 left-0 right-0 bg-blue-600 text-white p-3 z-40 shadow-lg animate-slide-down">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl">📱</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Install AI E-Learning</div>
                <div className="text-xs opacity-90">
                  Get the full app experience with offline access
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="text-white hover:text-gray-200 p-1.5 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAPrompt;
