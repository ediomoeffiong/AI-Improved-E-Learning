// PWA utility functions

/**
 * Register service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            showUpdateNotification();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  console.log('Service Worker not supported');
  return null;
};

/**
 * Show update notification to user
 */
const showUpdateNotification = () => {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.id = 'pwa-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        🚀 Update Available
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        A new version of the app is available. Refresh to get the latest features.
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="window.location.reload()" style="
          background: white;
          color: #3b82f6;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        ">
          Refresh
        </button>
        <button onclick="this.closest('#pwa-update-notification').remove()" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">
          Later
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    const element = document.getElementById('pwa-update-notification');
    if (element) {
      element.remove();
    }
  }, 10000);
};

/**
 * Check if app can be installed
 */
export const canInstallPWA = () => {
  return window.deferredPrompt !== null;
};

/**
 * Show install prompt
 */
export const showInstallPrompt = async () => {
  if (!window.deferredPrompt) {
    return false;
  }
  
  try {
    // Show the install prompt
    window.deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await window.deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    window.deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

/**
 * Setup install prompt handling
 */
export const setupInstallPrompt = () => {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Store the event so it can be triggered later
    window.deferredPrompt = e;
    
    // Show custom install button
    showInstallButton();
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    
    // Hide install button
    hideInstallButton();
    
    // Clear the deferredPrompt
    window.deferredPrompt = null;
    
    // Show success message
    showInstallSuccessMessage();
  });
};

/**
 * Show install button
 */
const showInstallButton = () => {
  // Check if button already exists
  if (document.getElementById('pwa-install-button')) {
    return;
  }
  
  const installButton = document.createElement('div');
  installButton.id = 'pwa-install-button';
  installButton.innerHTML = `
    <button style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      📱 Install App
    </button>
  `;
  
  installButton.addEventListener('click', showInstallPrompt);
  document.body.appendChild(installButton);
};

/**
 * Hide install button
 */
const hideInstallButton = () => {
  const button = document.getElementById('pwa-install-button');
  if (button) {
    button.remove();
  }
};

/**
 * Show install success message
 */
const showInstallSuccessMessage = () => {
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
    ">
      ✅ App installed successfully!
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    message.remove();
  }, 3000);
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Show local notification
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    return;
  }
  
  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    ...options
  };
  
  return new Notification(title, defaultOptions);
};

/**
 * Check online status with additional verification
 */
export const isOnline = async () => {
  // Basic check first
  if (!navigator.onLine) {
    return false;
  }

  // In development, return navigator.onLine to allow testing offline mode
  if (import.meta.env.DEV) {
    return navigator.onLine;
  }

  // Additional verification by trying to fetch a small resource
  try {
    const response = await fetch('/manifest.json', {
      method: 'HEAD',
      cache: 'no-cache',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.log('Network verification failed:', error);
    return false;
  }
};

/**
 * Setup online/offline event listeners with cache management
 */
export const setupOnlineOfflineListeners = (onOnline, onOffline) => {
  let isCurrentlyOnline = navigator.onLine;
  let onlineCheckTimeout = null;

  const handleOnline = async () => {
    // Verify we're actually online
    const actuallyOnline = await isOnline();

    if (actuallyOnline && !isCurrentlyOnline) {
      console.log('App is back online - refreshing cache');
      isCurrentlyOnline = true;

      // Refresh cache when coming back online
      await refreshCacheOnOnline();

      if (onOnline) onOnline();
    }
  };

  const handleOffline = () => {
    if (isCurrentlyOnline) {
      console.log('App is offline');
      isCurrentlyOnline = false;

      if (onOffline) onOffline();
    }
  };

  // Periodic online check (every 30 seconds when offline)
  const scheduleOnlineCheck = () => {
    if (onlineCheckTimeout) {
      clearTimeout(onlineCheckTimeout);
    }

    if (!isCurrentlyOnline) {
      onlineCheckTimeout = setTimeout(async () => {
        const actuallyOnline = await isOnline();
        if (actuallyOnline) {
          handleOnline();
        } else {
          scheduleOnlineCheck();
        }
      }, 30000);
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', () => {
    handleOffline();
    scheduleOnlineCheck();
  });

  // Initial check
  handleOnline();
};

/**
 * Refresh cache when coming back online
 */
export const refreshCacheOnOnline = async () => {
  try {
    console.log('Starting cache refresh...');

    // Clear stale offline data (older than 1 hour)
    const keys = Object.keys(localStorage);
    const offlineKeys = keys.filter(key => key.startsWith('offline_'));
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    offlineKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (timestamp < oneHourAgo) {
            localStorage.removeItem(key);
            console.log(`Removed stale cache: ${key}`);
          }
        }
      } catch (error) {
        // Remove corrupted cache entries
        localStorage.removeItem(key);
      }
    });

    // Update service worker
    await refreshServiceWorker();

    // Store last refresh time
    localStorage.setItem('last_cache_refresh', Date.now().toString());

    // Trigger a page refresh for critical updates (optional)
    // Uncomment the next line if you want to force a page refresh
    // window.location.reload();

    console.log('Cache refresh completed');
    return true;
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return false;
  }
};

/**
 * Cache important data for offline use
 */
export const cacheOfflineData = async (data, key) => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Error caching offline data:', error);
    return false;
  }
};

/**
 * Get cached offline data
 */
export const getCachedOfflineData = (key, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const cached = localStorage.getItem(`offline_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Check if data is still fresh
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(`offline_${key}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting cached offline data:', error);
    return null;
  }
};

/**
 * Clear all cached offline data
 */
export const clearOfflineCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const offlineKeys = keys.filter(key => key.startsWith('offline_'));

    offlineKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${offlineKeys.length} offline cache entries`);
    return true;
  } catch (error) {
    console.error('Error clearing offline cache:', error);
    return false;
  }
};

/**
 * Clear service worker caches
 */
export const clearServiceWorkerCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
      await Promise.all(deletePromises);

      console.log(`Cleared ${cacheNames.length} service worker caches`);
      return true;
    } catch (error) {
      console.error('Error clearing service worker cache:', error);
      return false;
    }
  }
  return false;
};

/**
 * Clear all caches (localStorage + service worker)
 */
export const clearAllCaches = async () => {
  const results = await Promise.allSettled([
    clearOfflineCache(),
    clearServiceWorkerCache()
  ]);

  const success = results.every(result => result.status === 'fulfilled' && result.value);

  if (success) {
    console.log('All caches cleared successfully');
  } else {
    console.warn('Some caches could not be cleared');
  }

  return success;
};

/**
 * Force refresh of service worker
 */
export const refreshServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('Service worker updated');
        return true;
      }
    } catch (error) {
      console.error('Error refreshing service worker:', error);
    }
  }
  return false;
};

/**
 * Manual cache refresh - can be triggered by user
 */
export const manualCacheRefresh = async () => {
  try {
    console.log('Starting manual cache refresh...');

    // Check if we're online first
    const online = await isOnline();
    if (!online) {
      throw new Error('Cannot refresh cache while offline');
    }

    // Clear all caches
    await clearAllCaches();

    // Refresh service worker
    await refreshServiceWorker();

    // Import and refresh API data
    const { cacheAPI } = await import('../services/api.js');
    await cacheAPI.refreshCriticalData();

    console.log('Manual cache refresh completed');
    return true;
  } catch (error) {
    console.error('Manual cache refresh failed:', error);
    throw error;
  }
};

/**
 * Get cache status information
 */
export const getCacheStatus = async () => {
  try {
    const status = {
      isOnline: await isOnline(),
      serviceWorkerActive: false,
      cacheSize: 0,
      lastRefresh: null
    };

    // Check service worker status
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      status.serviceWorkerActive = !!registration?.active;
    }

    // Check cache size
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      status.cacheSize = cacheNames.length;
    }

    // Check localStorage cache
    const keys = Object.keys(localStorage);
    const offlineKeys = keys.filter(key => key.startsWith('offline_'));
    status.localCacheEntries = offlineKeys.length;

    // Get last refresh time
    const lastRefresh = localStorage.getItem('last_cache_refresh');
    if (lastRefresh) {
      status.lastRefresh = new Date(parseInt(lastRefresh));
    }

    return status;
  } catch (error) {
    console.error('Error getting cache status:', error);
    return null;
  }
};
