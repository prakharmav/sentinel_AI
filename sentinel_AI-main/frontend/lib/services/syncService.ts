// ============================================================
// SentinelAI — Sync Service
// Wraps: POST /sync (Pushes offline queue to backend)
// ============================================================

import apiClient from "../apiClient";
import { offlineQueue } from "./offlineQueue";
import type { SyncRequest, SyncResponse } from "../types";

export const syncService = {
  /**
   * POST /sync
   * Pushes all locally queued mutations to the backend.
   */
  async synchronize(): Promise<SyncResponse | null> {
    const mutations = offlineQueue.getQueue();
    if (mutations.length === 0) {
      return null;
    }

    const payload: SyncRequest = {
      device_id: typeof window !== "undefined" ? navigator.userAgent : "field-device",
      mutations: mutations,
    };

    const res = await apiClient.post<SyncResponse>("/sync", payload);
    
    // Clear queue upon successful synchronisation sync
    if (res.data.success_count + res.data.conflict_count === mutations.length) {
      offlineQueue.clear();
    }
    
    return res.data;
  },
};
