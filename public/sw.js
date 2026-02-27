// Service Worker — Logística LFH
const CACHE_NAME = 'lfh-v1';

// Assets to cache on install (shell only — no API calls)
const SHELL_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Network-first strategy: always try network, fall back to cache
self.addEventListener('fetch', (event) => {
    // Skip Inertia/API XHR requests — always network
    const url = new URL(event.request.url);
    const isApiCall = event.request.headers.get('X-Inertia') || url.pathname.startsWith('/api/');

    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension') || isApiCall) {
        return; // Browser handles it normally
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful GET responses for static assets (same origin)
                if (response.ok && url.origin === location.origin && (
                    url.pathname.startsWith('/build/') ||
                    url.pathname.endsWith('.js') ||
                    url.pathname.endsWith('.css') ||
                    url.pathname.endsWith('.png') ||
                    url.pathname.endsWith('.ico')
                )) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    throw new Error('Network and cache failed');
                });
            })
    );
});
