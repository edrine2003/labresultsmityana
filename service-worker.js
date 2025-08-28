const CACHE_NAME = "mlmityana-v1";
const ASSETS = [
  "/labresultsmityana/",
  "/labresultsmityana/index.html",
  "/labresultsmityana/manifest.json",
  "/labresultsmityana/icons/icon-192.png",
  "/labresultsmityana/icons/icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/labresultsmityana/index.html");
        }
      });
    })
  );
});
