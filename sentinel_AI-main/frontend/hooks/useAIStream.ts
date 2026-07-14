// ============================================================
// SentinelAI — useAIStream Hook
// Handles SSE streaming from GET /copilot/stream-summary/:crimeId
// using the Fetch ReadableStream API.
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";
import { copilotService } from "../lib/services/copilotService";

interface UseAIStreamReturn {
  content: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (crimeId: string) => void;
  stopStream: () => void;
  reset: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortedRef = useRef(false);

  const startStream = useCallback((crimeId: string) => {
    setContent("");
    setError(null);
    setIsStreaming(true);
    abortedRef.current = false;

    copilotService.streamCaseSummary(
      crimeId,
      (word) => {
        if (!abortedRef.current) {
          setContent((prev) => prev + word + " ");
        }
      },
      () => {
        if (!abortedRef.current) setIsStreaming(false);
      },
      (err) => {
        if (!abortedRef.current) {
          setError(err.message);
          setIsStreaming(false);
        }
      }
    );
  }, []);

  const stopStream = useCallback(() => {
    abortedRef.current = true;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abortedRef.current = true;
    setContent("");
    setIsStreaming(false);
    setError(null);
  }, []);

  return { content, isStreaming, error, startStream, stopStream, reset };
}
