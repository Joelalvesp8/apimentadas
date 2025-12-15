'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New Service Worker activated');
        // Optionally show a notification to reload
        if (confirm('Nova versão disponível! Deseja atualizar?')) {
          window.location.reload();
        }
      });

      // Handle online/offline status
      window.addEventListener('online', () => {
        console.log('[PWA] Back online');
        // Optionally show a notification
      });

      window.addEventListener('offline', () => {
        console.log('[PWA] Gone offline');
        // Optionally show a notification
      });
    }
  }, []);

  return null;
}
