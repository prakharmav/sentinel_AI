// ============================================================
// SentinelAI — Analytics Service
// Wraps: /analytics endpoints for dashboard KPIs, trends,
// hotspots, seasonality, district comparison, threat paths.
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type {
  DashboardMetrics,
  CrimeTrend,
  CrimeHotspot,
  ThreatPathEntry,
} from "../types";

export const analyticsService = {
  /**
   * GET /analytics/dashboard-metrics
   * Core SOC KPIs. Cached by Redis for 10 minutes.
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return withRetry(async () => {
      const res = await apiClient.get<DashboardMetrics>("/analytics/dashboard-metrics");
      return res.data;
    });
  },

  /**
   * GET /analytics/crime-trends
   * Monthly historical counts for charts.
   */
  async getCrimeTrends(): Promise<CrimeTrend[]> {
    return withRetry(async () => {
      const res = await apiClient.get<CrimeTrend[]>("/analytics/crime-trends");
      return res.data;
    });
  },

  /**
   * GET /analytics/hotspots
   * Geospatial hotspot coordinates with intensity.
   */
  async getHotspots(): Promise<CrimeHotspot[]> {
    return withRetry(async () => {
      const res = await apiClient.get<CrimeHotspot[]>("/analytics/hotspots");
      return res.data;
    });
  },

  /**
   * GET /analytics/seasonality
   * Seasonal crime spike analysis.
   */
  async getSeasonality(): Promise<Record<string, unknown>[]> {
    return withRetry(async () => {
      const res = await apiClient.get<Record<string, unknown>[]>("/analytics/seasonality");
      return res.data;
    });
  },

  /**
   * GET /analytics/districts-comparison
   * Per-district severity index comparison.
   */
  async getDistrictsComparison(): Promise<Record<string, unknown>[]> {
    return withRetry(async () => {
      const res = await apiClient.get<Record<string, unknown>[]>("/analytics/districts-comparison");
      return res.data;
    });
  },

  /**
   * GET /analytics/prediction/threat-path?category=UPI_FRAUD
   * PAPE Markov transition attack path predictions.
   */
  async getThreatPaths(category = "UPI_FRAUD"): Promise<ThreatPathEntry[]> {
    return withRetry(async () => {
      const res = await apiClient.get<ThreatPathEntry[]>("/analytics/prediction/threat-path", {
        params: { category },
      });
      return res.data;
    });
  },
};
