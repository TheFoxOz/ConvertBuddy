// V7 - Corrected icon paths and added essential files
const CACHE_NAME = 'convertbuddy-v7';

// IMPORTANT FIX: Corrected icon filenames to match manifest
const FILES_TO_CACHE = [
'/',
'/index.html',
'/privacy.html',
'/manifest.json',
'/icons/icon-192x192.png',
'/icons/icon-512x512.png',
'/icons/apple-touch-icon.png' // Standard Apple touch icon added for completeness
];

self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log('Opened cache and cached essential files');
return cache.addAll(FILES_TO_CACHE);
})
);
});

self.addEventListener('fetch', (event) => {
// Only handle GET requests and exclude Google Analytics or external API calls if necessary
if (event.request.method !== 'GET') {
return;
}

event.respondWith(
    caches.match(event.request)
        .then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }
            
            // Fallback to network
            return fetch(event.request).catch(() => {
                // If network fails, and it's a navigation request, serve the main HTML page
                if (event.request.mode === 'navigate' || 
                    (event.request.headers.get('accept').includes('text/html'))) {
                    return caches.match('/index.html');
                }
            });
        })
);


});
