/* Offline support for publicly available content. Payments/API calls are never cached. */
const CACHE_VERSION = 'ptv-pwa-v1';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/', '/index.html', '/blog/', '/store.html', '/contact.html',
  '/styles.css', '/assets/install-app.js', '/assets/storefront.js',
  '/merchant/shopify-config.js', '/manifest.webmanifest',
  '/assets/app-icon-192.png', '/assets/app-icon-512.png', OFFLINE_URL
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_VERSION).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE_URL))));
    return;
  }
  if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_VERSION).then(cache => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }
  event.respondWith(fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_VERSION).then(cache => cache.put(request, response.clone()));
    return response;
  }).catch(() => caches.match(request)));
});
