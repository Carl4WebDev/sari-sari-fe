import { setCachedData, getCachedData } from "../../../../shared/utils/offlineCache";
import { enqueue } from "../../../../shared/utils/offlineQueue";

const API_BASE = import.meta.env.VITE_API_BASE;

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
  try {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;
    const method = (options.method || "GET").toUpperCase();

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const body = await res.json();

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
  } catch {
    const method = (options.method || "GET").toUpperCase();

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
        options.dependsOn,       // queue item ID this depends on
        options.dependencyField, // field name to update (e.g., "borrower_id")
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
