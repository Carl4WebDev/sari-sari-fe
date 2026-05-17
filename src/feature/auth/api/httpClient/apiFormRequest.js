const API_BASE = import.meta.env.VITE_API_BASE;

export const apiFormRequest = async (url, options = {}) => {
  const token = localStorage.getItem("user_token");

  const response = await fetch(API_BASE + url, {
    method: options.method || "POST",
    body: options.body, // FormData ONLY
    headers: {
      Authorization: `Bearer ${token}`, // ✅ KEEP AUTH
      // ❌ DO NOT SET Content-Type
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
