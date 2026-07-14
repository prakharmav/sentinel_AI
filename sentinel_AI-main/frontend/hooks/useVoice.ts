// ============================================================
// SentinelAI — useVoice React Query Hooks
// Manages audio uploads, speech synthesis mutations, and audio
// playback helper logic.
// ============================================================

"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { voiceService } from "../lib/services/voiceService";
import type { VoiceInteractResponse } from "../lib/types";

interface VoiceInteractPayload {
  audioBlob: Blob;
  languageHint?: string;
}

/**
 * useVoiceInteraction
 * Uploads audio recording, triggers LangGraph, and returns answer + audio.
 */
export function useVoiceInteraction(): UseMutationResult<
  VoiceInteractResponse,
  Error,
  VoiceInteractPayload
> {
  return useMutation({
    mutationFn: ({ audioBlob, languageHint = "en" }) =>
      voiceService.interact(audioBlob, languageHint),
  });
}

interface VoiceSynthesizePayload {
  text: string;
  language?: string;
}

/**
 * useVoiceSynthesis
 * Translates any text into synthesized audio blob.
 */
export function useVoiceSynthesis(): UseMutationResult<
  Blob,
  Error,
  VoiceSynthesizePayload
> {
  return useMutation({
    mutationFn: ({ text, language = "en" }) =>
      voiceService.synthesize(text, language),
  });
}
