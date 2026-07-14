/**
 * SentinelAI API Client
 * Typed fetch wrapper that:
 * - Reads NEXT_PUBLIC_API_URL for base URL
 * - Attaches JWT token from auth store automatically
 * - Handles 401 → clears session, redirects to /login
 * - Returns typed responses with error handling
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('sentinelai-auth')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

async function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sentinelai-auth')
    window.location.href = '/login'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers: extraHeaders, ...rest } = options

  // Build URL with optional query params
  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.set(key, String(val))
    })
  }

  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url.toString(), {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    await handleUnauthorized()
    throw new ApiError(401, 'Unauthorized — session expired')
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: response.statusText }
    }
    const message =
      (errorData as { detail?: string })?.detail ?? `HTTP ${response.status}`
    throw new ApiError(response.status, message, errorData)
  }

  // Handle 204 No Content
  if (response.status === 204) return null as T

  return response.json() as Promise<T>
}

// ── HTTP Method Helpers ──────────────────────────────────────────

export const apiClient = {
  get: <T>(endpoint: string, params?: RequestOptions['params']) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}

// ── Auth Endpoints ───────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'officer' | 'analyst' | 'citizen'
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password }),

  logout: () =>
    apiClient.post<void>('/api/v1/auth/logout'),

  me: () =>
    apiClient.get<LoginResponse['user']>('/api/v1/auth/me'),
}

// ── Dashboard Endpoints ──────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    apiClient.get<unknown>('/api/v1/dashboard/stats'),

  getAlerts: (limit = 10) =>
    apiClient.get<unknown>('/api/v1/alerts', { limit }),
}

// ── Health Check ─────────────────────────────────────────────────

export const systemApi = {
  health: () =>
    apiClient.get<{ status: string; services: Record<string, string> }>('/health'),
}
