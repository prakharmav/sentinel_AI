// ============================================================
// SentinelAI — Crime / Case Service
// Wraps: GET /crimes, POST /crimes, GET /crimes/:id
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type {
  CrimeCreateRequest,
  CrimeResponse,
  PaginationParams,
} from "../types";

export const crimeService = {
  /**
   * GET /crimes — List all crimes for the current tenant (paginated).
   */
  async listCrimes(params: PaginationParams = {}): Promise<CrimeResponse[]> {
    return withRetry(async () => {
      const response = await apiClient.get<CrimeResponse[]>("/crimes", {
        params: { skip: params.skip ?? 0, limit: params.limit ?? 100 },
      });
      return response.data;
    });
  },

  /**
   * POST /crimes — Register a new crime record.
   */
  async createCrime(payload: CrimeCreateRequest): Promise<CrimeResponse> {
    const response = await apiClient.post<CrimeResponse>("/crimes", payload);
    return response.data;
  },

  /**
   * GET /crimes/:id — Fetch a single crime by UUID.
   */
  async getCrime(id: string): Promise<CrimeResponse> {
    return withRetry(async () => {
      const response = await apiClient.get<CrimeResponse>(`/crimes/${id}`);
      return response.data;
    });
  },
};
