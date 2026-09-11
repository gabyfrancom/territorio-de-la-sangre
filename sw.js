// Service Worker — Tu sangre, tu territorio
const CACHE_NAME = 'sangre-territorio-v9';
const CORE_FILES = [
  './',
  './index.html',
  './app.js',
  './backup.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './vendor/styles.css',
  './vendor/react.js',
  './vendor/react-dom.js',
  './vendor/prop-types.js',
  './vendor/recharts.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        // Sin conexión y sin caché: si es una navegación, devolver la app
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return cached;
      });
    })
  );
});
