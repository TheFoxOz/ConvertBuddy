const CACHE = 'convertbuddy-v2'; // <--- BUMPED CACHE VERSION
 
// CRITICAL FIX: Ensure the paths match your deployment structure.
const FILES = [
    '/',
    '/index.html',
    '/privacy.html', // <--- ADDED PRIVACY PAGE
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/apple-touch-icon.png'
    // Note: External resources (like Tailwind and Google Fonts) are not cached here
    // as they are loaded from a CDN, but the core app will work offline.
];
 
self.addEventListener('install', e => {
    console.log('Service Worker: Installing...');
    // Skip waiting forces the new service worker to take control immediately
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('Service Worker: Caching App Shell');
            // Using addAll to cache all necessary files
            return cache.addAll(FILES).catch(err => {
                console.error('Service Worker: Failed to cache files', err);
                // We proceed even if some icons fail to load
            });
        })
    );
});
 
self.addEventListener('activate', e => {
    console.log('Service Worker: Activating and Cleaning Old Caches...');
    e.waitUntil(
        // Get all cache names
        caches.keys().then(cacheNames => {
            return Promise.all(
                // Filter out all cache names that are not the current CACHE version
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
 
self.addEventListener('fetch', e => {
    // Respond with cached asset first, then fallback to network
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
