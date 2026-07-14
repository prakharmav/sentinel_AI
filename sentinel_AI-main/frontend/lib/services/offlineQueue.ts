// ============================================================
// SentinelAI — Offline Mutation Queue Manager
//
// Manages local queuing of mutations (crimes, evidence, alerts)
// in localStorage when connectivity is lost.
// ============================================================

import type { OfflineMutation } from "../types";

const OFFLINE_QUEUE_KEY = "sentinelai_offline_mutations";

export const offlineQueue = {
  /**
   * Retrieves the current list of offline mutations.
   */
  getQueue(): OfflineMutation[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Adds a new mutation to the offline queue.
   */
  enqueue(
    resourceType: OfflineMutation["resource_type"],
    resourceId: string,
    action: OfflineMutation["action"],
    payload: Record<string, any>
  ): void {
    if (typeof window === "undefined") return;
    
    const queue = this.getQueue();
    const newMutation: OfflineMutation = {
      mutation_id: crypto.randomUUID(),
      resource_type: resourceType,
      resource_id: resourceId,
      action: action,
      payload: payload,
      client_timestamp: new Date().toISOString(),
      client_version: 1,
    };
    
    queue.push(newMutation);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log(`[OFFLINE] Action '${action}' queued locally. Total queue size: ${queue.length}`);
  },

  /**
   * Clears mutations from the local queue.
   */
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  /**
   * Checks if the device is currently online.
   */
  isOnline(): boolean {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  },
};
