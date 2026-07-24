// GitHub Pages（サブパス配信）用のservice worker。パスはすべてSW自身の位置からの相対で解決する
// キャッシュ優先＋裏で更新取得（stale-while-revalidate）：起動は常にキャッシュから即応答し、
// 新版はバックグラウンドで取り込んで次回起動時に反映する
const CACHE_NAME = 'nyamuru-pages-v2';
const APP_SHELL = ['./', './app.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  // ナビゲーションはURLに関わらずアプリシェル（'./'）で応答する
  const cacheKey = event.request.mode === 'navigate' ? './' : event.request;
  event.respondWith(caches.match(cacheKey).then((cached) => {
    const fetched = fetch(event.request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy)); }
      return response;
    });
    if (cached) { event.waitUntil(fetched.catch(() => {})); return cached; }
    return fetched.catch(() => (cacheKey === './' ? caches.match('./') : Response.error()));
  }));
});
