import { setCachedData, getCachedData, clearAllCache } from "../../../../shared/utils/offlineCache";
import { enqueue } from "../../../../shared/utils/offlineQueue";
import { handleDemoRequest } from "./demoStoreDatabase";

const API_BASE = import.meta.env.VITE_API_BASE;

// In-flight request deduplication — same GET URL shares one promise
const inflightRequests = new Map();

const getAuthToken = () => localStorage.getItem("user_token");
const isDemoMode = () => localStorage.getItem("is_demo_mode") === "true" || localStorage.getItem("is_free_local") === "true";

function buildDescription(method, url, body) {
  try {
    const data = typeof body === "string" ? JSON.parse(body) : body;
    if (url.includes("/borrowers") && method === "POST") {
      return `New borrower: ${data?.first_name || ""} ${data?.last_name || ""}`.trim();
    }
    if (url.includes("/loans") && method === "POST") {
      return `Loan ₱${data?.total_amount || data?.amount || ""}`;
    }
    if (url.includes("/payments") && method === "POST") {
      return `Payment ₱${data?.amount || ""}`;
    }
    if (url.includes("/products") && method === "POST") {
      return `New product: ${data?.product_name || ""}`;
    }
    return `${method} ${url}`;
  } catch {
    return `${method} ${url}`;
  }
}

export async function customFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // If in Demo Mode, delegate to demo store mock database (skip caching — data is local)
  if (isDemoMode()) {
    const result = handleDemoRequest(url, options);
    // Clear cache after writes so subsequent reads see fresh state
    if (method !== "GET") {
      clearAllCache();
    }
    return result;
  }

  const token = getAuthToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const isPlainObject = options.body && typeof options.body === "object" && !isFormData;
  const fetchOptions = {
    ...options,
    headers,
    body: isPlainObject ? JSON.stringify(options.body) : options.body,
    cache: "no-store",
  };

  const cacheKey = `${method}:${url}`;

  if (!navigator.onLine && method === "GET") {
    const cached = getCachedData(cacheKey);
    if (cached) return { ok: true, data: cached, _fromCache: true };
    return { ok: false, message: "Offline — no cached data available." };
  }

  if (!navigator.onLine && method !== "GET") {
    const item = enqueue({
      url,
      method,
      body: options.body,
      description: buildDescription(method, url, options.body),
    });

    return {
      ok: true,
      data: null,
      message: "Queued for sync when online.",
      _queued: true,
      queuedItem: item,
    };
  }

  if (method === "GET" && inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}${url}`, fetchOptions);

      const isAuthEndpoint = url.includes("/login") || url.includes("/register") || url.includes("/api/users/login") || url.includes("/api/users/register");

      if (response.status === 401 && !isAuthEndpoint) {
        if (isDemoMode()) {
          return handleDemoRequest(url, options);
        }
        localStorage.removeItem("user_token");
        localStorage.removeItem("user");
        localStorage.removeItem("is_demo_mode");
        localStorage.removeItem("is_free_local");
        window.location.href = "/";
        return { ok: false, message: "Unauthorized. Please log in again." };
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = json?.message || json?.error || `Request failed with status ${response.status}`;
        if (json?.details && typeof json.details === "object") {
          const detailValues = Object.values(json.details).filter(Boolean);
          if (detailValues.length > 0) {
            errorMsg = detailValues.join(". ");
          }
        }
        return {
          ok: false,
          status: response.status,
          message: errorMsg,
          details: json?.details,
        };
      }

      if (method === "GET" && json?.data) {
        setCachedData(cacheKey, json.data);
      }

      return { ok: true, data: json?.data ?? json, message: json?.message };
    } catch (err) {
      if (method === "GET") {
        const cached = getCachedData(cacheKey);
        if (cached) return { ok: true, data: cached, _fromCache: true };
      }

      // If network error occurred during an explicit auth action, surface clear network error
      if (url.includes("/users/login") || url.includes("/users/register")) {
        return {
          ok: false,
          message: "Unable to connect to server. Please check your internet connection or backend server.",
        };
      }

      // Fallback to mock store only in explicit demo mode
      if (isDemoMode()) {
        return handleDemoRequest(url, options);
      }
      return { ok: false, message: "Unable to connect to server. Please check your internet connection." };
    } finally {
      if (method === "GET") {
        inflightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inflightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export const apiRequest = customFetch;

export const httpClient = {
  get: (url, options) => customFetch(url, { ...options, method: "GET" }),
  post: (url, body, options) => customFetch(url, { ...options, method: "POST", body }),
  put: (url, body, options) => customFetch(url, { ...options, method: "PUT", body }),
  patch: (url, body, options) => customFetch(url, { ...options, method: "PATCH", body }),
  delete: (url, options) => customFetch(url, { ...options, method: "DELETE" }),
};

export default httpClient;
