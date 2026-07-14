// ============================================================
// SentinelAI — Alert Engine Service
// Wraps: POST /alerts/sweep, GET /alerts/recent, GET /alerts/queue,
//        POST /alerts/:id/resolve
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type { AlertPayload } from "../types";

export const alertService = {
  /**
   * POST /alerts/sweep
   * Triggers a manual alert sweep.
   */
  async triggerSweep(): Promise<{ status: string; alerts_triggered_count: number }> {
    const res = await apiClient.post<{ status: string; alerts_triggered_count: number }>(
      "/alerts/sweep"
    );
    return res.data;
  },

  /**
   * GET /alerts/recent
   * Fetches recent alert logs.
   */
  async getRecentAlerts(): Promise<AlertPayload[]> {
    return withRetry(async () => {
      const res = await apiClient.get<AlertPayload[]>("/alerts/recent");
      return res.data;
    });
  },

  /**
   * GET /alerts/queue
   * Fetches priority queued alerts.
   */
  async getPriorityQueue(): Promise<AlertPayload[]> {
    return withRetry(async () => {
      const res = await apiClient.get<AlertPayload[]>("/alerts/queue");
      return res.data;
    });
  },

  /**
   * POST /alerts/:id/resolve
   * Resolves a triggered alert.
   */
  async resolveAlert(id: string): Promise<{ status: string; alert_id: string }> {
    const res = await apiClient.post<{ status: string; alert_id: string }>(
      `/alerts/${id}/resolve`
    );
    return res.data;
  },
};
