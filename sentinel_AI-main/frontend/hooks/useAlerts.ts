// ============================================================
// SentinelAI — useAlerts React Query Hooks
// Manages manual triggers, caching, queue state, and resolution.
// ============================================================

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { alertService } from "../lib/services/alertService";
import type { AlertPayload } from "../lib/types";

// Dynamic local query keys
const alertKeys = {
  recent: () => ["alerts", "recent"] as const,
  queue: () => ["alerts", "queue"] as const,
};

/**
 * useRecentAlerts
 */
export function useRecentAlerts(): UseQueryResult<AlertPayload[]> {
  return useQuery({
    queryKey: alertKeys.recent(),
    queryFn: alertService.getRecentAlerts,
    staleTime: 10 * 1000, // 10 seconds stale (live alerts dashboard)
  });
}

/**
 * useAlertQueue
 */
export function useAlertQueue(): UseQueryResult<AlertPayload[]> {
  return useQuery({
    queryKey: alertKeys.queue(),
    queryFn: alertService.getPriorityQueue,
    staleTime: 5 * 1000, // 5 seconds stale
  });
}

/**
 * useTriggerAlertSweep
 */
export function useTriggerAlertSweep(): UseMutationResult<
  { status: string; alerts_triggered_count: number },
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertService.triggerSweep,
    onSuccess: () => {
      // Invalidate query states
      queryClient.invalidateQueries({ queryKey: alertKeys.recent() });
      queryClient.invalidateQueries({ queryKey: alertKeys.queue() });
    },
  });
}

/**
 * useResolveAlert
 */
export function useResolveAlert(): UseMutationResult<
  { status: string; alert_id: string },
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertService.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.recent() });
      queryClient.invalidateQueries({ queryKey: alertKeys.queue() });
    },
  });
}
