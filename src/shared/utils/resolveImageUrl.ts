const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Resolves a relative image path to a full URL.
 * If the path is already absolute (starts with http), returns as-is.
 * Otherwise, prepends the API base URL.
 * Appends a cache-buster to prevent stale images after upload.
 */
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Cache-buster: use the path itself as the version key so the browser
  // fetches a fresh copy whenever the stored URL changes after an upload.
  return `${API_BASE}${path}?v=${encodeURIComponent(path)}`;
}
