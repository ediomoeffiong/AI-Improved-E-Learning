import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  registerServiceWorker,
  setupInstallPrompt,
  requestNotificationPermission,
  setupOnlineOfflineListeners,
  showNotification
} from './utils/pwa.js'
import { cacheAPI } from './services/api.js'

// Initialize PWA features
const initializePWA = async () => {
  // Only register service worker in production
  if (import.meta.env.PROD) {
    await registerServiceWorker();
  } else {
    console.log('PWA service worker disabled in development mode');
  }

  // Setup install prompt (works in both dev and prod)
  setupInstallPrompt();

  // Request notification permission (optional)
  // Uncomment the line below if you want to request notifications immediately
  // await requestNotificationPermission();

  // Setup online/offline listeners with cache refresh
  setupOnlineOfflineListeners(
    async () => {
      // Online callback - refresh cache and data
      console.log('App is back online - refreshing data');

      // Show notification that we're refreshing
      if ('Notification' in window && Notification.permission === 'granted') {
        showNotification('Back Online', {
          body: 'Refreshing latest content...',
          icon: '/icons/icon-192x192.png'
        });
      }

      // Refresh critical API data
      await cacheAPI.refreshCriticalData();

      // Show completion notification
      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          showNotification('Content Updated', {
            body: 'Latest content is now available',
            icon: '/icons/icon-192x192.png'
          });
        }, 2000);
      }
    },
    () => {
      // Offline callback
      console.log('App is offline');

      // Show offline notification
      if ('Notification' in window && Notification.permission === 'granted') {
        showNotification('Offline Mode', {
          body: 'You are now offline. Some features may be limited.',
          icon: '/icons/icon-192x192.png'
        });
      }
    }
  );
};

// Initialize PWA features when the app loads
if (typeof window !== 'undefined') {
  initializePWA().catch(console.error);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
