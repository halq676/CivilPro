const CACHE_NAME = 'civilpro-v2';
const assets = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. Instalar y forzar activación inmediata
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Guardando archivos en caché...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // Obliga al SW nuevo a activarse ya
});

// 2. Limpiar cachés viejas (esto resuelve el problema de carga)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Toma el control de la página inmediatamente
});

// 3. Responder cuando no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, lo devuelve. Si no, intenta ir a internet.
      return response || fetch(event.request);
    }).catch(() => {
        // Si fallan ambos (ej: archivo no en caché y sin red), puedes devolver index.html
        return caches.match('index.html');
    })
  );
});