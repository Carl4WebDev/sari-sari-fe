const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthToken = () => localStorage.getItem("user_token");

export async function apiRequest(url, options = {}) {
  try {
    const token = getAuthToken();

    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // if (res.status === 401 || res.status === 403) {
    //   localStorage.removeItem("user_token");
    //   localStorage.removeItem("admin_token");
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("admin");
    //   window.location.href = "/";
    //   return;
    // }

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

    return {
      ok: true,
      data: body.data ?? body,
      message: body.message || null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Network error",
      code: "NETWORK_ERROR",
    };
  }
}
