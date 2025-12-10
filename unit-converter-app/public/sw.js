// sw.js - FIXED: Don't cache HTML or XML pages to avoid issues with dynamic or sitemap content
const CACHE_NAME = 'convertbuddy-v14';
const DATA_CACHE = 'convertbuddy-data-v2';

const FILES_TO_CACHE = [
  '/manifest.json',
  '/style.css',
  '/scripts/ui.js',
  '/scripts/converter.js',
  '/scripts/currency.js',
  '/scripts/units.js',
  '/scripts/firebase.js',
  '/scripts/firestore.js',
  '/scripts/history.js',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
  '/icons/Icon-maskable.png'
];

// Install - Cache critical files (but NOT HTML or XML)
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return Promise.allSettled(
          FILES_TO_CACHE.map(file => 
            cache.add(file).catch(err => 
              console.warn('[SW] Failed to cache:', file, err)
            )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE) {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - Handle requests intelligently
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // --- AMENDMENT START ---
  // FIXED: Never cache HTML or XML pages - always fetch from network
  if (event.request.url.endsWith('.html') || event.request.url.endsWith('.xml') || event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }
  // --- AMENDMENT END ---

  // Handle Currency API (Network first, cache fallback)
  if (url.href.includes('exchangerate-api.com')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            console.log('[SW] Using cached currency data');
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle Firebase/Firestore (Network only, don't cache)
  if (url.href.includes('firebase') || url.href.includes('firestore')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle CDN resources (Tailwind, Font Awesome, etc.) - Cache with fallback
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(event.request));
      })
    );
    return;
  }

  // Handle app resources (Cache first for scripts, styles, icons)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
              });
            }
            return response;
          })
          .catch(error => {
            console.log('[SW] Fetch failed:', error);
            throw error;
          });
      })
  );
});
