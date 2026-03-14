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

// 3. ESTRATEGIA: PRIORIZAR CACHÉ (Cache First)
// Esto garantiza que la app cargue aunque pasen días sin internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el archivo está en caché, lo entregamos de inmediato
      if (response) {
        return response;
      }

      // Si no está en caché, intentamos traerlo de internet
      return fetch(event.request).then(networkResponse => {
        // Opcional: Podrías guardar archivos nuevos aquí, 
        // pero por ahora solo los devolvemos
        return networkResponse;
      }).catch(() => {
        // FALLBACK: Si falla internet y no está en caché, 
        // enviamos el index.html para que la app no se quede en blanco
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('index.html');
        }
      });
    })
  );
});