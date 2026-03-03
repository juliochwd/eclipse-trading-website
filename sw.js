/**
 * Eclipse Delta Trading - Service Worker
 * Cache-first strategy for static assets, network-first for HTML pages
 */

const CACHE_NAME = 'eclipse-v1.0.0';
const STATIC_ASSETS = [
    '/eclipse-trading-website/',
    '/eclipse-trading-website/index.html',
    '/eclipse-trading-website/login.html',
    '/eclipse-trading-website/dashboard.html',
    '/eclipse-trading-website/trades.html',
    '/eclipse-trading-website/signals.html',
    '/eclipse-trading-website/analytics.html',
    '/eclipse-trading-website/settings.html',
    '/eclipse-trading-website/assets/css/main.css',
    '/eclipse-trading-website/assets/css/auth.css',
    '/eclipse-trading-website/assets/css/dashboard.css',
    '/eclipse-trading-website/assets/js/firebase-config.js',
    '/eclipse-trading-website/assets/js/app.js',
    '/eclipse-trading-website/assets/js/auth.js',
    '/eclipse-trading-website/assets/js/dashboard.js',
    '/eclipse-trading-website/assets/js/i18n.js',
    '/eclipse-trading-website/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Some assets failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(cacheNames
                .filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for static, network-first for HTML
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Don't cache Firebase/external requests
    if (!url.origin.includes('github.io') && !url.origin.includes('localhost')) {
        return;
    }

    if (request.mode === 'navigate') {
        // Network-first for HTML
        event.respondWith(
            fetch(request).catch(() => caches.match(request) || caches.match('/eclipse-trading-website/'))
        );
    } else {
        // Cache-first for assets
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }))
        );
    }
});
