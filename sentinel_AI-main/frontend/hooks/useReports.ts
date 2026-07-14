// ============================================================
// SentinelAI — useReports React Query Hooks
// Manages PDF report building mutations.
// ============================================================

"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { reportBuilderService } from "../lib/services/reportBuilderService";
import type { ReportBuildRequest, ReportDetailResponse } from "../lib/types";

/**
 * useBuildReport
 * Triggers PDF compiler mutation.
 */
export function useBuildReport(): UseMutationResult<
  ReportDetailResponse,
  Error,
  ReportBuildRequest
> {
  return useMutation({
    mutationFn: reportBuilderService.buildReport,
  });
}
