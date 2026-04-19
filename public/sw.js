// Minimal Service Worker required for PWA Installation
const CACHE_NAME = 'nyaybot-offline-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache basic UI skeleton to trigger installability criteria
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch to ensure local API still works while bypassing cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
