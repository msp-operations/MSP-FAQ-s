// MSP FAQ service worker — offline support + auto-updating content.
// Strategy: stale-while-revalidate for everything (GET). The shell loads
// instantly from cache; content.json refreshes in the background so an edit
// you push shows up on the student's next visit without any re-download.

const CACHE = 'msp-faq-v23';
const CORE = ['./', 'index.html', 'content.json', 'manifest.webmanifest', 'icon.svg',
  'assets/msp-faq.png', 'assets/building.jpg',
  // vendored (no CDNs): fonts, search, and the on-demand PDF reader
  'assets/vendor/fonts.css', 'assets/vendor/minisearch.min.js',
  'assets/vendor/pdf.min.js', 'assets/vendor/pdf.worker.min.js',
  'assets/vendor/inter-400-latin.woff2', 'assets/vendor/inter-400-latin-ext.woff2',
  'assets/vendor/sourceserif4-400-latin.woff2', 'assets/vendor/sourceserif4-400-latin-ext.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const network = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
