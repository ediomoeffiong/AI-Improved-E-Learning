import { useState, useEffect } from 'react';
import { isOnline, refreshCacheOnOnline } from '../../utils/pwa';

const CacheRefreshIndicator = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(navigator.onLine);

  useEffect(() => {
    let refreshTimeout;

    const handleOnline = async () => {
      const actuallyOnline = await isOnline();
      
      if (actuallyOnline && !isOnlineStatus) {
        setIsOnlineStatus(true);
        setIsRefreshing(true);
        setShowIndicator(true);
        
        try {
          await refreshCacheOnOnline();
          
          // Show success for a moment
          setTimeout(() => {
            setIsRefreshing(false);
            setTimeout(() => {
              setShowIndicator(false);
            }, 2000);
          }, 1000);
        } catch (error) {
          console.error('Cache refresh failed:', error);
          setIsRefreshing(false);
          setTimeout(() => {
            setShowIndicator(false);
          }, 3000);
        }
      }
    };

    const handleOffline = () => {
      setIsOnlineStatus(false);
      setIsRefreshing(false);
      setShowIndicator(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [isOnlineStatus]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-sm">
      <div className={`
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
        ${showIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}>
        <div className="flex items-center space-x-3">
          {isRefreshing ? (
            <>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Refreshing Content
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Getting latest updates...
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Content Updated
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Latest content is now available
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Progress bar for refresh */}
        {isRefreshing && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheRefreshIndicator;
