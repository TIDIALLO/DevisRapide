// Service Worker pour le mode hors ligne
const CACHE_NAME = 'devisrapide-v1';
const RUNTIME_CACHE = 'devisrapide-runtime-v1';

// Fichiers à mettre en cache au moment de l'installation
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/devis',
  '/clients',
  '/catalogue',
  '/profil',
  '/icon.svg',
  '/manifest.json',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache : Network First avec fallback sur cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes (sauf Supabase)
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(request)
        .then((response) => {
          // Mettre en cache les réponses réussies
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, retourner depuis le cache
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si pas de cache, retourner une page offline
            if (request.mode === 'navigate') {
              return cache.match('/');
            }
            return new Response('Mode hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        });
    })
  );
});
