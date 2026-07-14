// ============================================================
// SentinelAI — Copilot (AI Case Assistant) Service
// Wraps: /copilot endpoints for AI-generated narratives,
// timeline, evidence, investigation steps, SSE streaming,
// PDF generation, risk assessment, and voice transcription.
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type {
  CopilotCaseSummary,
  CopilotTimelineEvent,
  CopilotEvidence,
  SuggestedInvestigationStep,
  TranscriptionResult,
} from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const copilotService = {
  /**
   * GET /copilot/case-summary/:crime_id
   * AI-generated case narrative via Gemini TRE.
   */
  async getCaseSummary(crimeId: string): Promise<CopilotCaseSummary> {
    return withRetry(async () => {
      const res = await apiClient.get<CopilotCaseSummary>(
        `/copilot/case-summary/${crimeId}`
      );
      return res.data;
    });
  },

  /**
   * GET /copilot/timeline/:crime_id
   * Chronological investigation milestone timeline.
   */
  async getCaseTimeline(crimeId: string): Promise<CopilotTimelineEvent[]> {
    return withRetry(async () => {
      const res = await apiClient.get<CopilotTimelineEvent[]>(
        `/copilot/timeline/${crimeId}`
      );
      return res.data;
    });
  },

  /**
   * GET /copilot/evidence-summary/:crime_id
   * Hashed evidence with admissibility status.
   */
  async getEvidenceSummary(crimeId: string): Promise<CopilotEvidence[]> {
    return withRetry(async () => {
      const res = await apiClient.get<CopilotEvidence[]>(
        `/copilot/evidence-summary/${crimeId}`
      );
      return res.data;
    });
  },

  /**
   * GET /copilot/suggested-investigation/:crime_id
   * AI-recommended next investigation steps.
   */
  async getSuggestedInvestigation(crimeId: string): Promise<SuggestedInvestigationStep[]> {
    return withRetry(async () => {
      const res = await apiClient.get<SuggestedInvestigationStep[]>(
        `/copilot/suggested-investigation/${crimeId}`
      );
      return res.data;
    });
  },

  /**
   * GET /copilot/risk-assessment/:crime_id
   * AI risk score with factor breakdown.
   */
  async getRiskAssessment(crimeId: string): Promise<Record<string, unknown>> {
    return withRetry(async () => {
      const res = await apiClient.get<Record<string, unknown>>(
        `/copilot/risk-assessment/${crimeId}`
      );
      return res.data;
    });
  },

  /**
   * GET /copilot/generate-pdf/:crime_id
   * Trigger PDF download of DPDP compliance report.
   * Returns the full URL for programmatic download.
   */
  getPdfDownloadUrl(crimeId: string): string {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
    // Return a pre-constructed URL; trigger via anchor tag or window.open
    return `${BASE_URL}/api/v1/copilot/generate-pdf/${crimeId}?token=${token}`;
  },

  /**
   * GET /copilot/stream-summary/:crime_id — SSE Streaming
   * Returns a ReadableStream of the AI-generated narrative word-by-word.
   * The caller must handle the EventSource/stream directly.
   */
  async streamCaseSummary(
    crimeId: string,
    onChunk: (word: string) => void,
    onDone: () => void,
    onError?: (err: Error) => void
  ): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/copilot/stream-summary/${crimeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value);
        // SSE format: "data: <word> \n\n"
        const lines = raw.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const word = line.slice(6).trim();
            if (word) onChunk(word);
          }
        }
      }

      onDone();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  },

  /**
   * POST /copilot/transcribe-voice
   * Transcribes uploaded audio file and extracts entities.
   */
  async transcribeVoice(audioFile: File): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append("audio_file", audioFile);

    const res = await apiClient.post<TranscriptionResult>(
      "/copilot/transcribe-voice",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },
};
