const CACHE_NAME = 'convertbuddy-v8';
const DATA_CACHE_NAME = 'convertbuddy-data-v1';

// Files to pre-cache (core app shell)
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/privacy.html',
  '/manifest.json',
  '/scripts/ui.js',
  '/scripts/converter.js',
  '/scripts/currency.js',
  '/scripts/units.js',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Install event: cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: cache-first for app shell, network-first for API calls
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Dynamic caching for currency API
  if (requestUrl.origin.includes('exchangerate-api.com')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache =>
        fetch(event.request)
          .then(response => {
            if (response.status === 200) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // Cache-first strategy for app shell
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          // fallback to index.html for navigation requests
          if (event.request.mode === 'navigate' || 
              (event.request.headers.get('accept')?.includes('text/html'))) {
            return caches.match('/index.html');
          }
        });
      })
    );
  }
});
