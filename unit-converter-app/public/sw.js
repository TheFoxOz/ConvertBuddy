const CACHE_NAME = 'convertbuddy-v11'; // Incremented to force new cache install
const DATA_CACHE = 'convertbuddy-data-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/privacy.html',
  '/manifest.json',
  '/scripts/ui.js',
  '/scripts/converter.js',
  '/scripts/currency.js',
  '/scripts/units.js',
  // Removed CDN links from this critical list. 
  // They will be cached dynamically via the 'fetch' handler, 
  // preventing install failure if the CDN is temporarily down.
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
  '/icons/Icon-maskable.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Use Promise.all for faster parallel caching
      await Promise.all(FILES_TO_CACHE.map(async file => {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn('Failed to cache:', file, err);
        }
      }));
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle currency API separately (Cache, then Network fallback)
  if (url.href.includes("open.er-api.com")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request));
      })
    );
    return;
  }
  
  // Cache-first for app shell assets, local files, and CDN assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Serve the offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
      );
    })
  );
});
