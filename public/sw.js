const CACHE_NAME = "listahub-v4";
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
          // Cache the manifest itself for future use
          await cache.put("/chunk-manifest.json", manifestRes.clone());
          const manifest = await manifestRes.json();
          const chunkPaths = [];

          for (const entry of Object.values(manifest)) {
            if (entry.file) chunkPaths.push("/" + entry.file);
            if (entry.css) {
              entry.css.forEach((c) => chunkPaths.push("/" + c));
            }
          }

          // Deduplicate
          const unique = [...new Set(chunkPaths)];

          // Precache all chunks with explicit Content-Type headers
          const results = await Promise.allSettled(
            unique.map((path) =>
              fetch(path).then((res) => {
                if (res.ok) {
                  const url = new URL(path, self.location.origin);
                  const ext = url.pathname.split(".").pop();
                  let contentType = "";
                  if (ext === "js") contentType = "application/javascript";
                  else if (ext === "css") contentType = "text/css";
                  else if (ext === "html") contentType = "text/html";

                  if (contentType) {
                    const headers = new Headers(res.headers);
                    headers.set("Content-Type", contentType);
                    const typedRes = new Response(res.body, {
                      status: res.status,
                      statusText: res.statusText,
                      headers,
                    });
                    return cache.put(path, typedRes);
                  }
                  return cache.put(path, res);
                }
                throw new Error(`Failed to fetch ${path}: ${res.status}`);
              })
            )
          );

          const failed = results.filter((r) => r.status === "rejected");
          if (failed.length > 0) {
            console.warn(`[SW] ${failed.length}/${unique.length} chunks failed to precache`);
          }
        } else {
          console.warn("[SW] chunk-manifest.json fetch failed:", manifestRes.status);
          // Manifest fetch failed — try to copy chunks from old cache
          await salvageOldCache(cache);
        }
      } catch (err) {
        console.warn("[SW] Manifest precache error:", err);
        await salvageOldCache(cache);
      }
    })
  );
  self.skipWaiting();
});

// Copy assets from the previous cache version to the new one
// This prevents losing precached chunks when the SW updates while offline
async function salvageOldCache(newCache) {
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key === CACHE_NAME || !key.startsWith("listahub-")) continue;
      const oldCache = await caches.open(key);
      const requests = await oldCache.keys();
      for (const req of requests) {
        const response = await oldCache.match(req);
        if (response) {
          await newCache.put(req, response);
        }
      }
    }
  } catch {
    // Salvage failed — shell assets still available
  }
}

// Activate: clean old caches ONLY if new cache has content
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Verify new cache has at least the shell
      const hasShell = await cache.match("/index.html");
      if (!hasShell) {
        // New cache is empty — don't delete old caches
        return;
      }

      // New cache is good — safe to delete old ones
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate for cached, network-first for uncached
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
      if (cached) {
        // Return cached immediately, update in background (stale-while-revalidate)
        fetch(request)
          .then((response) => {
            if (response.ok && request.url.startsWith(self.location.origin)) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
          })
          .catch(() => {}); // Background update failed, that's fine
        return cached;
      }

      // Not in cache — try network
      return fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed and not in cache
          if (request.mode === "navigate") {
            // Navigation requests get the app shell
            return caches.match("/index.html");
          }
          // For JS/CSS module requests: return a real network error
          // This prevents the browser from seeing a text/html MIME response
          return Response.error();
        });
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
