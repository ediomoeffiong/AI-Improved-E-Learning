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
export const isOnline = () => {
  // In development, always return true to avoid issues
  if (import.meta.env.DEV) {
    return navigator.onLine;
  }

  // In production, just check navigator.onLine for now
  // We can add more sophisticated checks later if needed
  return navigator.onLine;
};

/**
 * Setup online/offline event listeners
 */
export const setupOnlineOfflineListeners = (onOnline, onOffline) => {
  window.addEventListener('online', () => {
    console.log('App is online');
    if (onOnline) onOnline();
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    if (onOffline) onOffline();
  });
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
