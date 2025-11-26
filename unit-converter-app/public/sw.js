const CACHE = "convertbuddy-v10";
const DATA_CACHE = "convertbuddy-data-v1";

const FILES = [
    "/",
    "/index.html",
    "/privacy.html",
    "/manifest.json",

    "/scripts/ui.js",
    "/scripts/converter.js",
    "/scripts/currency.js",
    "/scripts/units.js",

    "/icons/Icon-192.png",
    "/icons/Icon-512.png",
    "/icons/Icon-maskable.png"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => (k !== CACHE && k !== DATA_CACHE ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);

    // Currency API
    if (url.href.includes("exchangerate-api.com")) {
        e.respondWith(
            caches.open(DATA_CACHE).then(cache =>
                fetch(e.request)
                    .then(res => {
                        if (res.ok) cache.put(e.request, res.clone());
                        return res;
                    })
                    .catch(() => cache.match(e.request))
            )
        );
        return;
    }

    // App shell
    e.respondWith(
        caches.match(e.request).then(cached =>
            cached ||
            fetch(e.request).catch(() =>
                e.request.mode === "navigate" ? caches.match("/index.html") : null
            )
        )
    );
});
