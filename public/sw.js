/* Professional Academy PWA Service Worker */
const isLocalEnv =
  typeof self !== "undefined" &&
  (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1");

if (isLocalEnv) {
  // In development / localhost, self-destruct and purge caches to avoid any stale bundle freezes
  self.addEventListener("install", () => {
    self.skipWaiting();
  });
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
        .then(() => self.clients.matchAll({ type: "window" }))
        .then((clients) => {
          clients.forEach((c) => c.navigate(c.url));
        })
    );
  });
} else {
  // Production PWA Service Worker
  const CACHE_VERSION = "pro-academy-v2";
  const STATIC_CACHE = `${CACHE_VERSION}-static`;
  const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

  const PRECACHE_URLS = ["/manifest.webmanifest"];

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => null)
    );
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
      ).then(() => self.clients.claim())
    );
  });

  self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // HTML page navigations: Network-first with cache fallback (never serve stale shell on nav)
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
      );
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(request).then((cached) => cached || Response.error()))
      );
      return;
    }

    // Static assets (images, fonts, CSS, chunks): cache with network revalidate
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok && url.origin === self.location.origin) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  });
}

// Push notifications always active
self.addEventListener("push", (event) => {
  let data = {
    title: "Professional Academy",
    body: "لديك إشعار جديد من منصة مستر حبيب الرحمن!",
    url: "/",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      dir: "rtl",
      lang: "ar",
      vibrate: [120, 60, 120],
      requireInteraction: false,
      tag: data.tag || "pro-academy-notification",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
