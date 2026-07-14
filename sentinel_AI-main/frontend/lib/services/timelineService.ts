// ============================================================
// SentinelAI — AI Timeline Builder Service
// Wraps: POST /timeline/build, GET /timeline/pdf/:id
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type { TimelineBuildRequest, TimelineBuildResponse } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const timelineService = {
  /**
   * POST /timeline/build
   * Builds chronological, interactive, and visual timelines.
   */
  async buildTimeline(payload: TimelineBuildRequest): Promise<TimelineBuildResponse> {
    const response = await apiClient.post<TimelineBuildResponse>("/timeline/build", payload);
    return response.data;
  },

  /**
   * GET /timeline/pdf/:id
   * Returns the direct PDF download URL.
   */
  getTimelinePdfUrl(timelineId: string): string {
    return `${BASE_URL}/api/v1/timeline/pdf/${timelineId}`;
  },
};
