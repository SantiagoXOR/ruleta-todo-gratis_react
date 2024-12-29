/* eslint-disable no-restricted-globals */

// Versión del cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `prize-notifications-${CACHE_VERSION}`;

// Archivos a cachear
const CACHE_FILES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('prize-notifications-'))
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Manejo de peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.id,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Ver premio'
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

  if (event.action === 'view' && event.notification.data?.prizeId) {
    const prizeUrl = `/prizes/${event.notification.data.prizeId}`;
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Si ya hay una ventana abierta, la enfocamos
        for (const client of clientList) {
          if (client.url.includes(prizeUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrimos una nueva
        if (clients.openWindow) {
          return clients.openWindow(prizeUrl);
        }
      })
    );
  }
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  // Podemos registrar estadísticas de cierre de notificaciones
  console.log('Notification closed', event.notification.tag);
}); 