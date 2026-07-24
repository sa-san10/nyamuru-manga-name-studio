// GitHub Pages（サブパス配信）用のservice worker。パスはすべてSW自身の位置からの相対で解決する
const CACHE_NAME = 'nyamuru-pages-v1';
const APP_SHELL = ['./', './app.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const APP_HTML_URL = new URL('./app.html', self.location).href;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put('./', copy)); return response;
    }).catch(() => caches.match('./')));
    return;
  }
  // app.htmlはアプリ本体（単一HTML）なのでネットワーク優先で更新を取り込み、オフライン時のみキャッシュへ
  if (event.request.url === APP_HTML_URL) {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); }
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); }
    return response;
  })));
});
