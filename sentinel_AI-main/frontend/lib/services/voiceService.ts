// ============================================================
// SentinelAI — Voice AI Service
// Wraps: POST /voice/interact, POST /voice/synthesize
// ============================================================

import apiClient from "../apiClient";
import type { VoiceInteractResponse } from "../types";

export const voiceService = {
  /**
   * POST /voice/interact
   * Sends audio blob (MP3/WAV) to perform STT -> LangGraph -> TTS pipeline.
   */
  async interact(audioBlob: Blob, languageHint = "en"): Promise<VoiceInteractResponse> {
    const formData = new FormData();
    // Wrap blob in an UploadFile form payload
    formData.append("audio_file", audioBlob, "query.wav");
    formData.append("language_hint", languageHint);

    const res = await apiClient.post<VoiceInteractResponse>("/voice/interact", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * POST /voice/synthesize
   * Converts text content to synthesized speech audio stream.
   * Returns a raw binary Blob containing the MP3.
   */
  async synthesize(text: string, language = "en"): Promise<Blob> {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("language", language);

    const res = await apiClient.post<Blob>("/voice/synthesize", formData, {
      responseType: "blob",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
