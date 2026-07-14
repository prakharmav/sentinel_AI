// ============================================================
// SentinelAI — useAuth Hook
// Manages: login flow, MFA step, session validation, logout.
// Does NOT touch any UI — state only.
// ============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../lib/services/authService";
import type { AuthState } from "../lib/types";

function getInitialAuthState(): AuthState {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      role: null,
      userId: null,
      tenantId: null,
      permissions: [],
      isAuthenticated: false,
    };
  }
  const token = localStorage.getItem("access_token");
  const isValid = token ? authService.isSessionValid() : false;
  const user = isValid ? authService.getCurrentUser() : null;

  return {
    accessToken: isValid ? token : null,
    role: localStorage.getItem("user_role"),
    userId: user?.sub ?? null,
    tenantId: user?.tenant_id ?? null,
    permissions: user?.permissions ?? [],
    isAuthenticated: isValid,
  };
}

interface UseAuthReturn {
  // State
  auth: AuthState;
  loading: boolean;
  error: string | null;
  mfaPending: boolean;
  exchangeToken: string | null;

  // Actions
  login: (identifier: string, password: string, role?: string) => Promise<void>;
  verifyMfa: (mfaCode: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(getInitialAuthState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [exchangeToken, setExchangeToken] = useState<string | null>(null);

  // Listen for session-expired events dispatched by the Axios interceptor
  useEffect(() => {
    const handler = () => {
      setAuth({
        accessToken: null,
        role: null,
        userId: null,
        tenantId: null,
        permissions: [],
        isAuthenticated: false,
      });
      setError("Your session has expired. Please log in again.");
    };
    window.addEventListener("sentinel:session-expired", handler);
    return () => window.removeEventListener("sentinel:session-expired", handler);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, role = "police") => {
      setLoading(true);
      setError(null);
      try {
        const challenge = await authService.login(identifier, password, role);
        setExchangeToken(challenge.exchange_token);
        setMfaPending(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyMfa = useCallback(
    async (mfaCode: string) => {
      if (!exchangeToken) return;
      setLoading(true);
      setError(null);
      try {
        await authService.verifyMfa({ exchange_token: exchangeToken, mfa_code: mfaCode });

        const user = authService.getCurrentUser();
        setAuth({
          accessToken: localStorage.getItem("access_token"),
          role: user?.role ?? null,
          userId: user?.sub ?? null,
          tenantId: user?.tenant_id ?? null,
          permissions: user?.permissions ?? [],
          isAuthenticated: true,
        });
        setMfaPending(false);
        router.push("/dashboard");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "MFA verification failed");
      } finally {
        setLoading(false);
      }
    },
    [exchangeToken, router]
  );

  const logout = useCallback(() => {
    authService.logout();
    setAuth({
      accessToken: null,
      role: null,
      userId: null,
      tenantId: null,
      permissions: [],
      isAuthenticated: false,
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const hasPermission = useCallback(
    (permission: string) => auth.permissions.includes(permission),
    [auth.permissions]
  );

  return {
    auth,
    loading,
    error,
    mfaPending,
    exchangeToken,
    login,
    verifyMfa,
    logout,
    clearError,
    hasPermission,
  };
}
