import { useState, useEffect } from 'react';
import { isOnline } from '../../utils/pwa';

const OfflineIndicator = () => {
  const [isOfflineState, setIsOfflineState] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPersistentIndicator, setShowPersistentIndicator] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  useEffect(() => {
    let checkInterval;
    let bannerTimeout;

    const checkOnlineStatus = async () => {
      try {
        const online = await isOnline();
        
        if (!online && !isOfflineState) {
          // Just went offline
          setIsOfflineState(true);
          setShowBanner(true);
          setShowPersistentIndicator(false);
          
          // Hide banner after 5 seconds and show persistent indicator
          bannerTimeout = setTimeout(() => {
            setShowBanner(false);
            setShowPersistentIndicator(true);
          }, 5000);
          
        } else if (online && isOfflineState) {
          // Just came back online
          setIsOfflineState(false);
          setShowBanner(false);
          setShowPersistentIndicator(false);
          
          if (bannerTimeout) {
            clearTimeout(bannerTimeout);
          }
        }
      } catch (error) {
        console.error('Error checking online status:', error);
      }
    };

    // Initial check
    checkOnlineStatus();

    // Set up periodic checking (every 5 seconds)
    checkInterval = setInterval(checkOnlineStatus, 5000);

    // Listen to browser online/offline events
    const handleOnline = () => {
      checkOnlineStatus();
    };

    const handleOffline = () => {
      checkOnlineStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (bannerTimeout) clearTimeout(bannerTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineState]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    setShowPersistentIndicator(true);
  };

  const handleRetryConnection = async () => {
    setIsCheckingConnection(true);
    
    try {
      // Wait a moment to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const online = await isOnline();
      if (online) {
        setIsOfflineState(false);
        setShowBanner(false);
        setShowPersistentIndicator(false);
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  return (
    <>
      {/* Full Banner - shows immediately when going offline */}
      {showBanner && isOfflineState && (
        <div className="fixed top-16 left-0 right-0 bg-orange-500 text-white shadow-lg z-40 animate-slide-down">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base">You're offline</div>
                  <div className="text-xs sm:text-sm opacity-90 mt-1">
                    Some features may be limited. Your progress will sync when you're back online.
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleRetryConnection}
                  disabled={isCheckingConnection}
                  className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  {isCheckingConnection ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Checking...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">Retry</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDismissBanner}
                  className="text-white/80 hover:text-white p-1 transition-colors duration-200"
                  aria-label="Dismiss offline notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Small Indicator - shows after banner is dismissed */}
      {showPersistentIndicator && isOfflineState && (
        <div className="fixed bottom-32 sm:bottom-4 left-4 bg-orange-500 text-white px-3 py-2 rounded-full text-sm font-medium z-40 shadow-lg animate-fade-in flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Offline</span>
          <button
            onClick={handleRetryConnection}
            disabled={isCheckingConnection}
            className="ml-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-2 py-1 rounded text-xs transition-colors duration-200"
          >
            {isCheckingConnection ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              '↻'
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
