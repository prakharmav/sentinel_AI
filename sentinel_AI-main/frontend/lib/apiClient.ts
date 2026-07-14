// ============================================================
// SentinelAI — Axios HTTP Client
// Configured with: base URL, auth interceptor, token refresh,
// retry logic, request deduplication, and error normalization.
// ============================================================

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { SentinelApiError } from "./types";

// ── Environment ────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Token Storage Helpers ─────────────────────────────────────
// Centralised so the refresh logic and all services access the same store.
export const tokenStore = {
  getAccessToken: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,

  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem("access_token", token);
  },

  getRefreshToken: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,

  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem("refresh_token", token);
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
    }
  },
};

// ── Create Axios Instance ─────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Refresh Token State ───────────────────────────────────────
// Prevents multiple concurrent refresh calls (token refresh race condition guard)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    throw new SentinelApiError("No refresh token available", 401, "NO_REFRESH_TOKEN");
  }

  // Call the refresh endpoint directly (not through apiClient to avoid interceptor loops)
  const response = await axios.post<{ access_token: string }>(
    `${BASE_URL}/api/v1/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const newToken = response.data.access_token;
  tokenStore.setAccessToken(newToken);
  return newToken;
}

// ── Request Interceptor — Attach Bearer Token ─────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach a unique request ID for distributed tracing
    config.headers["X-Request-ID"] = crypto.randomUUID();

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor — Handle 401 & Retry ─────────────────
apiClient.interceptors.response.use(
  // Pass-through successful responses
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── Handle 401 Unauthorized ───────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeToRefresh((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        notifyRefreshSubscribers(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear session and redirect to login
        refreshSubscribers = [];
        tokenStore.clear();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sentinel:session-expired"));
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Normalize API Errors ──────────────────────────────────
    const status = error.response?.status ?? 0;
    const data = error.response?.data as Record<string, unknown> | undefined;

    let message = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";
    let requestId: string | undefined;

    if (data) {
      // SentinelAI standard error envelope: { error: { code, message, request_id } }
      if (data.error && typeof data.error === "object") {
        const errorObj = data.error as Record<string, string>;
        message = errorObj.message ?? message;
        code = errorObj.code ?? code;
        requestId = errorObj.request_id;
      } else if (typeof data.detail === "string") {
        // FastAPI default validation/HTTPException shape
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic 422 validation errors
        message = (data.detail as Array<{ msg: string }>)
          .map((e) => e.msg)
          .join("; ");
        code = "VALIDATION_ERROR";
      }
    }

    if (!error.response) {
      // Network error
      message = "Network error — check your connection and try again";
      code = "NETWORK_ERROR";
    }

    return Promise.reject(new SentinelApiError(message, status, code, requestId));
  }
);

// ── Retry Helper ──────────────────────────────────────────────
// For idempotent GET requests only. Retries up to `maxRetries` times
// with exponential back-off on network or 5xx errors.
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 400
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const apiErr = err as SentinelApiError;
      // Do not retry on 4xx client errors (except network errors)
      if (apiErr.status && apiErr.status >= 400 && apiErr.status < 500) {
        throw err;
      }
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

export default apiClient;
