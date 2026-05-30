const API_BASE = import.meta.env.VITE_API_BASE;

export const apiFormRequest = async (url, options = {}) => {
  const response = await fetch(API_BASE + url, {
    method: options.method || "POST",
    body: options.body, // FormData ONLY
    credentials: "include",
    headers: {
      // ❌ DO NOT SET Content-Type (browser sets boundary for FormData)
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      error: data?.message || "Request failed",
      status: response.status,
    };
  }

  return data;
};
