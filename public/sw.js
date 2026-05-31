const CACHE_NAME = "listahub-v3";
const SHELL_ASSETS = ["/", "/index.html", "/listahub_logo.png"];

// Install: precache app shell + all build chunks from Vite manifest
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache shell assets
      await cache.addAll(SHELL_ASSETS);

      // Fetch Vite manifest to precache all JS/CSS chunks
      try {
        const manifestRes = await fetch("/chunk-manifest.json");
        if (manifestRes.ok) {
          const manifest = await manifestRes.json();
          const chunkPaths = [];

          for (const entry of Object.values(manifest)) {
            if (entry.file) chunkPaths.push("/" + entry.file);
            if (entry.css) {
              entry.css.forEach((c) => chunkPaths.push("/" + c));
            }
          }

          // Precache all chunks (ignore failures for individual files)
          await Promise.allSettled(
            chunkPaths.map((path) =>
              fetch(path).then((res) => {
                if (res.ok) return cache.put(path, res);
              })
            )
          );
        }
      } catch {
        // Manifest fetch failed — shell assets still cached
      }
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache all same-origin GET requests
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip API requests (handled by app-level localStorage cache)
  if (request.url.includes("/api/")) return;

  // Skip chrome-extension and other non-http
  if (!request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // Fetch in background to update cache (stale-while-revalidate)
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed — return cached or fallback
          return caches.match(request).then((fallback) => {
            if (fallback) return fallback;
            if (request.mode === "navigate") {
              return caches.match("/index.html");
            }
            return new Response("Offline", { status: 503 });
          });
        });

      // Return cached immediately if available, otherwise wait for fetch
      return cached || fetchPromise;
    })
  );
});

// Push notification handlers
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "LISTAHUB", {
      body: data.body || "You have a new reminder",
      icon: "/listahub_logo.png",
      badge: "/listahub_logo.png",
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/dashboard";
  // Validate: only allow relative paths, reject protocol-relative URLs (//evil.com)
  const url = (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) ? rawUrl : "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
