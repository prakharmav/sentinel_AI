// ============================================================
// SentinelAI — Authentication Service
// Handles: login (OAuth2 form), MFA verify, token refresh,
// JWT decode, session persistence, and logout.
// ============================================================

import apiClient, { tokenStore } from "../apiClient";
import type {
  MfaChallengeResponse,
  VerifyMfaRequest,
  TokenResponse,
  JWTPayload,
} from "../types";

// ── JWT Decode (no verification — server already verified) ─────
function decodeJwt(token: string): JWTPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

// ── Auth Service ──────────────────────────────────────────────
export const authService = {
  /**
   * Step 1 — POST /auth/login
   * Sends OAuth2 URL-encoded form. Backend returns an MFA exchange token.
   * role is passed as `scope` and used by the backend for RBAC seeding.
   */
  async login(
    identifier: string,
    password: string,
    role = "police"
  ): Promise<MfaChallengeResponse> {
    const formData = new URLSearchParams();
    formData.append("username", identifier);
    formData.append("password", password);
    formData.append("scope", role);

    const response = await apiClient.post<MfaChallengeResponse>(
      "/auth/login",
      formData.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data;
  },

  /**
   * Step 2 — POST /auth/mfa/verify
   * Verifies TOTP code and retrieves final JWT access token.
   * Persists tokens to localStorage after success.
   */
  async verifyMfa(payload: VerifyMfaRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
      "/auth/mfa/verify",
      payload
    );

    const { access_token } = response.data;
    tokenStore.setAccessToken(access_token);

    // Decode and cache role
    const decoded = decodeJwt(access_token);
    if (decoded && typeof window !== "undefined") {
      localStorage.setItem("user_role", decoded.role);
      localStorage.setItem("user_id", decoded.sub);
      localStorage.setItem("tenant_id", decoded.tenant_id);
    }

    return response.data;
  },

  /**
   * POST /auth/refresh
   * Manually refresh the access token (also called automatically by the interceptor).
   */
  async refresh(): Promise<TokenResponse> {
    const refreshToken = tokenStore.getRefreshToken();
    const response = await apiClient.post<TokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    tokenStore.setAccessToken(response.data.access_token);
    return response.data;
  },

  /**
   * Clear all session data and redirect to login.
   */
  logout(): void {
    tokenStore.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  /**
   * Check whether the current access token is still valid (not expired).
   */
  isSessionValid(): boolean {
    const token = tokenStore.getAccessToken();
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  },

  /**
   * Get current user info from the decoded JWT (no network call).
   */
  getCurrentUser(): JWTPayload | null {
    const token = tokenStore.getAccessToken();
    if (!token) return null;
    return decodeJwt(token);
  },

  /**
   * Returns true if the current user holds the specified permission string.
   */
  hasPermission(permission: string): boolean {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return user.permissions.includes(permission);
  },
};
