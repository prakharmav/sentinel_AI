// ============================================================
// SentinelAI — Reports & Notifications Services
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type {
  ComplianceReportRequest,
  ComplianceReportResponse,
  ReportListItem,
  NotificationDispatchPayload,
  NotificationLog,
} from "../types";

// ── Reports Service ────────────────────────────────────────────
export const reportsService = {
  /**
   * GET /reports/
   * List all reports for the current tenant.
   */
  async listReports(): Promise<ReportListItem[]> {
    return withRetry(async () => {
      const res = await apiClient.get<ReportListItem[]>("/reports");
      return res.data;
    });
  },

  /**
   * POST /reports/compliance
   * Generate a DPDP / compliance report for a crime case.
   */
  async generateComplianceReport(
    payload: ComplianceReportRequest
  ): Promise<ComplianceReportResponse> {
    const res = await apiClient.post<ComplianceReportResponse>(
      "/reports/compliance",
      payload
    );
    return res.data;
  },

  /**
   * GET /reports/download/:id
   * Returns download info (file_path). Use the URL to trigger download.
   */
  async getReportDownloadInfo(
    id: string
  ): Promise<{ message: string; file_path: string }> {
    const res = await apiClient.get<{ message: string; file_path: string }>(
      `/reports/download/${id}`
    );
    return res.data;
  },
};

// ── Notifications Service ──────────────────────────────────────
export const notificationService = {
  /**
   * POST /notifications/dispatch
   * Send a notification via SMS/Email/Push/WhatsApp.
   */
  async dispatch(
    payload: NotificationDispatchPayload
  ): Promise<{ message: string; id: string }> {
    const res = await apiClient.post<{ message: string; id: string }>(
      "/notifications/dispatch",
      payload
    );
    return res.data;
  },

  /**
   * GET /notifications/logs
   * Retrieve notification dispatch history.
   */
  async getLogs(): Promise<NotificationLog[]> {
    return withRetry(async () => {
      const res = await apiClient.get<NotificationLog[]>("/notifications/logs");
      return res.data;
    });
  },
};

// ── Citizen Service ────────────────────────────────────────────
import type { UnstructuredTextRequest, UnstructuredTextResponse, CrimeResponse } from "../types";

export const citizenService = {
  /**
   * POST /citizen/parse-fir
   * AI parser for hand-written FIR text. Extracts entities and legal sections.
   */
  async parseFirText(
    payload: UnstructuredTextRequest
  ): Promise<UnstructuredTextResponse> {
    const res = await apiClient.post<UnstructuredTextResponse>(
      "/citizen/parse-fir",
      payload
    );
    return res.data;
  },

  /**
   * GET /citizen/my-cases
   * Get all cases associated with the logged-in citizen.
   */
  async getMyCases(): Promise<CrimeResponse[]> {
    return withRetry(async () => {
      const res = await apiClient.get<CrimeResponse[]>("/citizen/my-cases");
      return res.data;
    });
  },
};
