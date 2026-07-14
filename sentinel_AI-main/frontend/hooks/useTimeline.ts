// ============================================================
// SentinelAI — useTimeline React Query Hook
// Manages timeline building mutations, cache invalidation,
// and download triggers.
// ============================================================

"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { timelineService } from "../lib/services/timelineService";
import type { TimelineBuildRequest, TimelineBuildResponse } from "../lib/types";

export function useTimelineBuilder(): UseMutationResult<
  TimelineBuildResponse,
  Error,
  TimelineBuildRequest
> {
  return useMutation({
    mutationFn: timelineService.buildTimeline,
  });
}
