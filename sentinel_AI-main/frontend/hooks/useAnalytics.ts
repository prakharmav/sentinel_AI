// ============================================================
// SentinelAI — React Query Hooks: Analytics & Dashboard
// ============================================================

"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { analyticsService } from "../lib/services/analyticsService";
import { queryKeys } from "../lib/queryKeys";
import type {
  DashboardMetrics,
  CrimeTrend,
  CrimeHotspot,
  ThreatPathEntry,
} from "../lib/types";

/**
 * useDashboardMetrics
 * Fetches SOC KPIs. Stale after 2 min, refetches on focus.
 */
export function useDashboardMetrics(): UseQueryResult<DashboardMetrics> {
  return useQuery({
    queryKey: queryKeys.analytics.dashboardMetrics(),
    queryFn: analyticsService.getDashboardMetrics,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * useCrimeTrends
 * Monthly historical data for charts.
 */
export function useCrimeTrends(): UseQueryResult<CrimeTrend[]> {
  return useQuery({
    queryKey: queryKeys.analytics.crimeTrends(),
    queryFn: analyticsService.getCrimeTrends,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useCrimeHotspots
 * Geospatial hotspot data for map overlays.
 */
export function useCrimeHotspots(): UseQueryResult<CrimeHotspot[]> {
  return useQuery({
    queryKey: queryKeys.analytics.hotspots(),
    queryFn: analyticsService.getHotspots,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useThreatPaths
 * PAPE attack prediction for a given crime category.
 */
export function useThreatPaths(
  category = "UPI_FRAUD"
): UseQueryResult<ThreatPathEntry[]> {
  return useQuery({
    queryKey: queryKeys.analytics.threatPaths(category),
    queryFn: () => analyticsService.getThreatPaths(category),
    staleTime: 10 * 60 * 1000,
  });
}
