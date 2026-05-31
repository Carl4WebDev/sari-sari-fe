const CACHE_PREFIX = "ssc_cache_";
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours

export function setCachedData(url, data, ttl = DEFAULT_TTL) {
  try {
    const entry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    localStorage.setItem(CACHE_PREFIX + url, JSON.stringify(entry));
  } catch {
    evictOldest();
    try {
      const entry = { data, timestamp: Date.now(), expiresAt: Date.now() + ttl };
      localStorage.setItem(CACHE_PREFIX + url, JSON.stringify(entry));
    } catch {
      // Give up silently
    }
  }
}

export function getCachedData(url) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + url);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    const isStale = Date.now() > entry.expiresAt;
    return { data: entry.data, isStale, cachedAt: entry.timestamp };
  } catch {
    return null;
  }
}

export function clearAllCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

function evictOldest() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        const entry = JSON.parse(raw);
        entries.push({ key, timestamp: entry.timestamp || 0 });
      } catch {
        entries.push({ key, timestamp: 0 });
      }
    }
  }
  entries.sort((a, b) => a.timestamp - b.timestamp);
  entries.slice(0, 5).forEach((e) => localStorage.removeItem(e.key));
}
