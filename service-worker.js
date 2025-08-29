const CACHE_NAME = "lab-mityana-cache-v1";
const urlsToCache = [
  "/mobile-lab-mityana-ug/",
  "/mobile-lab-mityana-ug/index.html",
  "/mobile-lab-mityana-ug/manifest.json",
  "/mobile-lab-mityana-ug/icons/icon-192.png",
  "/mobile-lab-mityana-ug/icons/icon-512.png",
  "/mobile-lab-mityana-ug/icons/maskable-icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  // Network-first for HTML (index + navigation requests)
  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Save latest version to cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request)) // fallback to cache if offline
    );
    return;
  }

  // Cache-first for everything else (icons, manifest, etc.)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
