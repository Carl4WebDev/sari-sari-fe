const CACHE_NAME = "listahub-v4";
const SHELL_ASSETS = ["/", "/index.html", "/listahub_logo.png"];

// Install: precache app shell + all build chunks from Vite manifest
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(SHELL_ASSETS);

      try {
        const manifestRes = await fetch("/chunk-manifest.json");
        if (!manifestRes.ok) {
          console.warn("[SW] manifest fetch failed:", manifestRes.status);
          await salvageOldCache(cache);
          return;
        }

        // Verify it's actually JSON, not HTML from SPA fallback
        const ct = manifestRes.headers.get("content-type") || "";
        if (ct.includes("text/html")) {
          console.warn("[SW] manifest returned HTML — SPA redirect interfering");
          await salvageOldCache(cache);
          return;
        }

        await cache.put("/chunk-manifest.json", manifestRes.clone());
        const manifest = await manifestRes.json();
        const chunkPaths = [];

        for (const entry of Object.values(manifest)) {
          if (entry.file) chunkPaths.push("/" + entry.file);
          if (entry.css) entry.css.forEach((c) => chunkPaths.push("/" + c));
        }

        const unique = [...new Set(chunkPaths)];

        const results = await Promise.allSettled(
          unique.map((path) =>
            fetch(path).then((res) => {
              if (!res.ok) throw new Error(`${path}: ${res.status}`);

              // Verify we got actual JS/CSS, not HTML
              const resCt = res.headers.get("content-type") || "";
              if (resCt.includes("text/html")) {
                throw new Error(`${path} returned HTML`);
              }

              const url = new URL(path, self.location.origin);
              const ext = url.pathname.split(".").pop();
              let correctType = "";
              if (ext === "js") correctType = "application/javascript";
              else if (ext === "css") correctType = "text/css";

              if (correctType) {
                const headers = new Headers(res.headers);
                headers.set("Content-Type", correctType);
                const typedRes = new Response(res.body, {
                  status: res.status,
                  statusText: res.statusText,
                  headers,
                });
                return cache.put(path, typedRes);
              }
              return cache.put(path, res);
            })
          )
        );

        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          console.warn(`[SW] ${failed.length}/${unique.length} chunks failed to precache`);
          if (failed.length > unique.length / 2) {
            await salvageOldCache(cache);
          }
        }
      } catch (err) {
        console.warn("[SW] Manifest precache error:", err);
        await salvageOldCache(cache);
      }
    })
  );
  self.skipWaiting();
});

// Copy assets from previous cache version, skipping HTML responses
async function salvageOldCache(newCache) {
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key === CACHE_NAME || !key.startsWith("listahub-")) continue;
      const oldCache = await caches.open(key);
      const requests = await oldCache.keys();
      let salvaged = 0;
      for (const req of requests) {
        const response = await oldCache.match(req);
        if (response) {
          const ct = response.headers.get("content-type") || "";
          const url = new URL(req.url);
          const ext = url.pathname.split(".").pop();
          // Skip HTML responses cached for non-HTML files
          if (ct.includes("text/html") && !["html", ""].includes(ext)) continue;
          await newCache.put(req, response);
          salvaged++;
        }
      }
      console.log(`[SW] Salvaged ${salvaged} assets from ${key}`);
    }
  } catch (err) {
    console.warn("[SW] Salvage failed:", err);
  }
}

// Activate: clean old caches ONLY if new cache has content
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const hasShell = await cache.match("/index.html");
      if (!hasShell) return;
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

  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;
  if (!request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Serve cached, update in background
        fetch(request)
          .then((response) => {
            if (response.ok && request.url.startsWith(self.location.origin)) {
              // Don't cache HTML for non-navigation requests
              const ct = response.headers.get("content-type") || "";
              if (ct.includes("text/html") && request.mode !== "navigate") return;
              const clone = response.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const ct = response.headers.get("content-type") || "";
            if (ct.includes("text/html") && request.mode !== "navigate") {
              return response; // Don't cache HTML for non-navigation
            }
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return Response.error();
        });
    })
  );
});

// Push notifications
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
