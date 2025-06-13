import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  registerServiceWorker,
  setupInstallPrompt,
  requestNotificationPermission,
  setupOnlineOfflineListeners
} from './utils/pwa.js'

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

  // Setup online/offline listeners
  setupOnlineOfflineListeners(
    () => {
      // Online callback
      console.log('App is back online');
      // You can show a toast notification here
    },
    () => {
      // Offline callback
      console.log('App is offline');
      // You can show an offline indicator here
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
