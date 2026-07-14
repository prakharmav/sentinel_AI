// ============================================================
// SentinelAI — useFileUpload Hook
// Manages: client validation, progress state, upload mutation,
// and drag-and-drop file handling.
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";
import {
  uploadService,
  UploadValidationError,
} from "../lib/services/uploadService";
import type { SecureUploadResponse, UploadProgress } from "../lib/types";

export type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

interface UseFileUploadOptions {
  endpoint?: "secure" | "rag"; // Which upload endpoint to use
  onSuccess?: (result: SecureUploadResponse) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  status: UploadStatus;
  progress: UploadProgress | null;
  error: string | null;
  result: SecureUploadResponse | null;
  upload: (file: File) => Promise<void>;
  reset: () => void;
  // Drag-and-drop helpers
  isDragOver: boolean;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const { endpoint = "secure", onSuccess, onError } = options;

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SecureUploadResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setStatus("validating");
      setError(null);
      setProgress(null);
      setResult(null);

      // Client-side validation
      try {
        uploadService.validateFile(file);
      } catch (err) {
        const msg =
          err instanceof UploadValidationError
            ? err.message
            : "File validation failed";
        setError(msg);
        setStatus("error");
        onError?.(new Error(msg));
        return;
      }

      setStatus("uploading");

      try {
        let uploadResult: SecureUploadResponse;

        if (endpoint === "rag") {
          const ragResult = await uploadService.uploadRagDocument(
            file,
            setProgress
          );
          // Normalize rag result to SecureUploadResponse shape
          uploadResult = {
            message: ragResult.message,
            status: "SECURED",
            metadata: {
              file_name: ragResult.file_name,
              content_type: file.type,
              size_bytes: file.size,
              sha256: "",
              storage_path: "",
              is_court_admissible: false,
              rag_indexed: true,
            },
          };
        } else {
          uploadResult = await uploadService.secureUpload(file, setProgress);
        }

        setResult(uploadResult);
        setStatus("success");
        onSuccess?.(uploadResult);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        setStatus("error");
        onError?.(new Error(msg));
      }
    },
    [endpoint, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(null);
    setError(null);
    setResult(null);
  }, []);

  // Drag-and-drop handlers
  const dragHandlers = {
    onDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []),
    onDragLeave: useCallback(() => setIsDragOver(false), []),
    onDrop: useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
      },
      [upload]
    ),
  };

  return {
    status,
    progress,
    error,
    result,
    upload,
    reset,
    isDragOver,
    dragHandlers,
  };
}
