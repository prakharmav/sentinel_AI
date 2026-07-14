// ============================================================
// SentinelAI — Report Builder Service
// Wraps: POST /reports/build, GET /reports/pdf/:id
// ============================================================

import apiClient from "../apiClient";
import type { ReportBuildRequest, ReportDetailResponse } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const reportBuilderService = {
  /**
   * POST /reports/build
   * Automatically generates investigation report metadata.
   */
  async buildReport(payload: ReportBuildRequest): Promise<ReportDetailResponse> {
    const res = await apiClient.post<ReportDetailResponse>("/reports/build", payload);
    return res.data;
  },

  /**
   * GET /reports/pdf/:id
   * Exposes direct download link.
   */
  getReportPdfUrl(reportId: string): string {
    return `${BASE_URL}/api/v1/reports/pdf/${reportId}`;
  },
};
