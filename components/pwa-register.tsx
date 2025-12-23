'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return;
    if (typeof navigator === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

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
    const handleControllerChange = () => {
      console.log('[PWA] New Service Worker activated');
      // Optionally show a notification to reload
      if (typeof window !== 'undefined') {
        if (confirm('Nova versão disponível! Deseja atualizar?')) {
          window.location.reload();
        }
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      console.log('[PWA] Back online');
      // Optionally show a notification
    };

    const handleOffline = () => {
      console.log('[PWA] Gone offline');
      // Optionally show a notification
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  return null;
}
