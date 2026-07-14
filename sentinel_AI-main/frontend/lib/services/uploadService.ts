// ============================================================
// SentinelAI — Upload Service
// Wraps: POST /upload/secure-upload
// Features: progress tracking, SHA-256 preview, file validation.
// ============================================================

import apiClient from "../apiClient";
import type { SecureUploadResponse, UploadProgress } from "../types";

// Allowed file types matching backend ALLOWED_EXTENSIONS
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export const uploadService = {
  /**
   * Validates file client-side before uploading (matches backend checks).
   */
  validateFile(file: File): void {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new UploadValidationError(
        `Unsupported file type: ${file.type}. Allowed: PDF, PNG, JPG, MP3, WAV, MP4.`
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new UploadValidationError(
        `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 50 MB limit.`
      );
    }
  },

  /**
   * POST /upload/secure-upload
   * Uploads a file with progress tracking.
   * @param file - The File to upload
   * @param onProgress - Optional progress callback
   */
  async secureUpload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<SecureUploadResponse> {
    // Client-side validation
    uploadService.validateFile(file);

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<SecureUploadResponse>(
      "/upload/secure-upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              ),
            });
          }
        },
      }
    );

    return response.data;
  },

  /**
   * POST /chat/upload
   * Upload a reference document for RAG indexing via the chat endpoint.
   */
  async uploadRagDocument(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ message: string; file_name: string; chunks: number }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{
      message: string;
      file_name: string;
      chunks: number;
    }>("/chat/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            ),
          });
        }
      },
    });

    return response.data;
  },
};
