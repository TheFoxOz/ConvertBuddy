const CACHE_NAME = 'convertbuddy-v9';
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
  // External CDN assets used by index.html (optional but good for offline)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/tailwindcss@3.3.3/dist/tailwind.min.css',
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
  
  // Cache-first for app shell assets and local files
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
