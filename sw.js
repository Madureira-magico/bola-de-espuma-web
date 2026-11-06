/* Depois de instalado, o app abre sempre da cópia guardada no aparelho
   e não busca nada na internet. Para receber uma versão nova, troque o número
   em CACHE (ex.: v6) ao publicar os arquivos novos. */
var CACHE = 'bola-de-espuma-v8';
var ARQUIVOS = ['./', './index.html', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(ARQUIVOS.map(function (u) {
        return cache.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }
  if (new URL(req.url).origin !== self.location.origin) { return; }
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) { return hit; }
        if (req.mode === 'navigate') {
          return cache.match('./index.html').then(function (p) { return p || fetch(req); });
        }
        return fetch(req);
      });
    })
  );
});
