import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import AppTest from './AppTest'; // Version de test simple

// Unregister any existing Service Worker in development
if (import.meta.env.DEV) {
  navigator.serviceWorker?.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('🗑️ Service Worker unregistered in development mode');
    });
  });
  
  // Clear all caches
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

