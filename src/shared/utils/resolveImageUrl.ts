const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Resolves a relative image path to a full URL.
 * If the path is already absolute (starts with http), returns as-is.
 * Otherwise, prepends the API base URL.
 */
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}
