const CACHE_NAME = 'convertbuddy-v7';

// List of files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/privacy.html',
  '/manifest.json',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
  '/icons/apple-touch-icon.png' // optional
];

// Install event - caching files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and cached essential files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Fetch event - serve cached files first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit
      if (response) return response;

      // Fetch from network
      return fetch(event.request).catch(() => {
        // If navigation request fails, fallback to index.html
        if (event.request.mode === 'navigate' || 
            (event.request.headers.get('accept')?.includes('text/html'))) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
