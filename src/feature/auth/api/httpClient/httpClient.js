import { setCachedData, getCachedData } from "../../../../shared/utils/offlineCache";
import { enqueue } from "../../../../shared/utils/offlineQueue";

const API_BASE = import.meta.env.VITE_API_BASE;
const FETCH_TIMEOUT_MS = 30000;

// In-flight request deduplication — same GET URL shares one promise
const inflightRequests = new Map();

const getAuthToken = () => localStorage.getItem("user_token");

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

export async function apiRequest(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // Deduplicate concurrent GET requests to the same URL
  if (method === "GET" && inflightRequests.has(url)) {
    return inflightRequests.get(url);
  }

  const promise = _doRequest(url, options, method);

  if (method === "GET") {
    inflightRequests.set(url, promise);
    promise.finally(() => inflightRequests.delete(url));
  }

  return promise;
}

async function _doRequest(url, options, method) {
  try {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;

    // Build headers — don't override signal if caller provided one
    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Use caller's signal or create a timeout signal
    let timeoutId;
    let signal = options.signal;
    if (!signal) {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      signal = controller.signal;
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        signal,
      });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    // Handle non-JSON responses (e.g., 502 HTML from Render)
    const contentType = res.headers.get("content-type") || "";
    let body;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      const text = await res.text();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          message: `Server error (${res.status})`,
          code: "NON_JSON_RESPONSE",
          details: null,
        };
      }
      // Successful non-JSON — return raw text
      return {
        ok: true,
        data: text,
        message: null,
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: body.message || "Request failed",
        code: body.code || "UNKNOWN_ERROR",
        details: body.details || null,
      };
    }

    const result = {
      ok: true,
      data: body.data ?? body,
      message: body.message || null,
    };

    // Auto-cache successful GET responses
    if (method === "GET") {
      setCachedData(url, result.data);
    }

    return result;
  } catch (err) {
    // Timeout — distinguish from network error
    if (err.name === "AbortError") {
      // Check if it was a caller-initiated abort (navigation) vs timeout
      // Caller-initiated aborts should not show error UI — just return silently
      if (options.signal?.aborted) {
        return { ok: false, status: 0, message: "Aborted", code: "ABORTED" };
      }
      return {
        ok: false,
        status: 0,
        message: "Request timed out. Server may be waking up — try again.",
        code: "TIMEOUT",
      };
    }

    // GET requests: try cache fallback
    if (method === "GET") {
      const cached = getCachedData(url);
      if (cached) {
        return {
          ok: true,
          data: cached.data,
          message: null,
          fromCache: true,
          isStale: cached.isStale,
          cachedAt: cached.cachedAt,
        };
      }
    }

    // Write requests: queue for later sync
    if (method !== "GET") {
      const description = buildDescription(method, url, options.body);
      const queuedItem = enqueue(
        url,
        method,
        options.body,
        description,
        options.dependsOn,
        options.dependencyField,
      );
      return {
        ok: true,
        data: null,
        message: "Saved locally. Will sync when online.",
        queued: true,
        queuedItem,
      };
    }

    return {
      ok: false,
      status: 0,
      message: "Network error",
      code: "NETWORK_ERROR",
    };
  }
}
