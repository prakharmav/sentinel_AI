// ============================================================
// SentinelAI — useSync React Query Hooks
// Registers window online event listeners to automatically trigger
// sync, and exposes mutation actions for manual sync.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { syncService } from "../lib/services/syncService";
import { offlineQueue } from "../lib/services/offlineQueue";
import type { SyncResponse } from "../lib/types";

export function useOfflineSync(): {
  isOnline: boolean;
  offlineCount: number;
  syncMutation: UseMutationResult<SyncResponse | null, Error, void>;
  triggerSync: () => void;
} {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(offlineQueue.isOnline());
  const [offlineCount, setOfflineCount] = useState(offlineQueue.getQueue().length);

  const syncMutation = useMutation({
    mutationFn: syncService.synchronize,
    onSuccess: (data) => {
      if (data) {
        console.log(`[SYNC] Sync complete. Success: ${data.success_count}, Conflicts: ${data.conflict_count}`);
        // Invalidate active query lists to fetch updated server state
        queryClient.invalidateQueries();
      }
      setOfflineCount(offlineQueue.getQueue().length);
    },
  });

  const triggerSync = () => {
    if (offlineQueue.isOnline() && offlineQueue.getQueue().length > 0) {
      syncMutation.mutate();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when coming back online
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Update queue count periodically or on custom storage events
    const interval = setInterval(() => {
      setOfflineCount(offlineQueue.getQueue().length);
    }, 2000);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    offlineCount,
    syncMutation,
    triggerSync,
  };
}
