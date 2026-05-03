/**
 * Central API client — all requests go through here.
 * Automatically attaches Access Token, handles 401 refresh flow.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * Makes an authenticated API request.
 * On 401, attempts a silent token refresh. Queues concurrent requests during refresh.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const makeRequest = async (token) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return response;
  };

  let response = await makeRequest(getAccessToken());

  // Handle 401 — attempt silent token refresh
  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => makeRequest(newToken));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) throw new Error("Refresh failed");

      const data = await refreshResponse.json();
      saveTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);

      response = await makeRequest(data.accessToken);
    } catch (err) {
      processQueue(err);
      clearTokens();
      window.location.href = "/login";
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  // Parse response
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}
