/* eslint-disable no-restricted-globals */

// Versión del cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `pintemas-cache-${CACHE_VERSION}`;

// Recursos para cachear
const CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHED_RESOURCES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('pintemas-cache-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Manejo de peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Ver detalles'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data) {
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Buscar si ya hay una ventana abierta con la URL
        for (let client of windowClients) {
          if (client.url === urlToOpen) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Aquí iría la lógica para sincronizar notificaciones pendientes
      Promise.resolve()
    );
  }
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 