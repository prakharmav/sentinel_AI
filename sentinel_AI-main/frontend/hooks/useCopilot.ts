// ============================================================
// SentinelAI — React Query Hooks: Copilot (AI Case Assistant)
// ============================================================

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { copilotService } from "../lib/services/copilotService";
import { reportsService } from "../lib/services/otherServices";
import { queryKeys } from "../lib/queryKeys";
import type {
  CopilotCaseSummary,
  CopilotTimelineEvent,
  CopilotEvidence,
  SuggestedInvestigationStep,
  ComplianceReportRequest,
  ComplianceReportResponse,
} from "../lib/types";

/**
 * useCaseSummary
 * AI-generated TRE narrative for a case.
 */
export function useCaseSummary(
  crimeId: string
): UseQueryResult<CopilotCaseSummary> {
  return useQuery({
    queryKey: queryKeys.copilot.caseSummary(crimeId),
    queryFn: () => copilotService.getCaseSummary(crimeId),
    enabled: Boolean(crimeId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useCaseTimeline
 * Chronological investigation milestone timeline.
 */
export function useCaseTimeline(
  crimeId: string
): UseQueryResult<CopilotTimelineEvent[]> {
  return useQuery({
    queryKey: queryKeys.copilot.timeline(crimeId),
    queryFn: () => copilotService.getCaseTimeline(crimeId),
    enabled: Boolean(crimeId),
  });
}

/**
 * useEvidenceSummary
 * Hashed evidence list with admissibility status.
 */
export function useEvidenceSummary(
  crimeId: string
): UseQueryResult<CopilotEvidence[]> {
  return useQuery({
    queryKey: queryKeys.copilot.evidence(crimeId),
    queryFn: () => copilotService.getEvidenceSummary(crimeId),
    enabled: Boolean(crimeId),
  });
}

/**
 * useSuggestedInvestigation
 * AI-recommended next investigation steps.
 */
export function useSuggestedInvestigation(
  crimeId: string
): UseQueryResult<SuggestedInvestigationStep[]> {
  return useQuery({
    queryKey: queryKeys.copilot.investigation(crimeId),
    queryFn: () => copilotService.getSuggestedInvestigation(crimeId),
    enabled: Boolean(crimeId),
  });
}

/**
 * useRiskAssessment
 * AI risk score with factor breakdown.
 */
export function useRiskAssessment(
  crimeId: string
): UseQueryResult<Record<string, unknown>> {
  return useQuery({
    queryKey: queryKeys.copilot.riskAssessment(crimeId),
    queryFn: () => copilotService.getRiskAssessment(crimeId),
    enabled: Boolean(crimeId),
  });
}

/**
 * useGenerateComplianceReport
 * Mutation to generate a DPDP report. Invalidates reports list on success.
 */
export function useGenerateComplianceReport() {
  const queryClient = useQueryClient();

  return useMutation<ComplianceReportResponse, Error, ComplianceReportRequest>({
    mutationFn: reportsService.generateComplianceReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.list() });
    },
  });
}
