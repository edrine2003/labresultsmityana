const CACHE_NAME = "lab-mityana-cache-v2"; // bump version when updating
const urlsToCache = [
  "/mobile-lab-mityana-ug/",
  "/mobile-lab-mityana-ug/index.html",
  "/mobile-lab-mityana-ug/manifest.json",
  "/mobile-lab-mityana-ug/icons/icon-192.png",
  "/mobile-lab-mityana-ug/icons/icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate new SW immediately
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
  self.clients.claim(); // take control of open pages
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // serve cached response if found, else fetch from network
      return response || fetch(event.request).catch(() => {
        // fallback for offline navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/mobile-lab-mityana-ug/index.html");
        }
      });
    })
  );
});
