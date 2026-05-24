/* ============================================================
   service-worker.js — PWA offline caching
   ============================================================
   Strategy: Cache First
   - On install: pre-cache all app files
   - On fetch:   serve from cache; fall back to network
   - On activate: delete old caches
   ============================================================ */

const CACHE_NAME = 'calculator-app-v2';

// All files that make up the app shell
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/calculator.css',
  './css/converter.css',
  './css/history.css',
  './js/calculator.js',
  './js/converter.js',
  './js/history.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── Install: cache everything ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ── Activate: clean up old caches ─────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList
          .filter(key => key !== CACHE_NAME)  // only old caches
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())        // take control immediately
  );
});

// ── Fetch: cache first, network fallback ──────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;             // serve from cache
      }
      // Not in cache — fetch from network
      return fetch(event.request).then(networkResponse => {
        // Optionally cache new resources dynamically
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Network failed and nothing in cache — show nothing gracefully
      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    })
  );
});