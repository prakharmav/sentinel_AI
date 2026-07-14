// ============================================================
// SentinelAI — useAlertsWebSocket Hook
// Manages the /ws/alerts WebSocket connection lifecycle.
// Provides auto-reconnect, channel subscriptions, and
// a live alert feed from the React side.
// ============================================================

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertsWebSocket } from "../lib/websocket";
import type { WSAlertIncoming } from "../lib/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface UseAlertsWebSocketOptions {
  channels?: string[];
  enabled?: boolean;
}

interface UseAlertsWebSocketReturn {
  lastMessage: WSAlertIncoming | null;
  connectionStatus: ConnectionStatus;
  subscribe: (channel: string) => void;
  send: (payload: Record<string, unknown>) => void;
}

export function useAlertsWebSocket(
  options: UseAlertsWebSocketOptions = {}
): UseAlertsWebSocketReturn {
  const { channels = ["alerts"], enabled = true } = options;
  const [lastMessage, setLastMessage] = useState<WSAlertIncoming | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const wsRef = useRef<AlertsWebSocket | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const ws = new AlertsWebSocket({
      channels,
      onMessage: (msg) => setLastMessage(msg),
      onOpen: () => setConnectionStatus("connected"),
      onClose: () => setConnectionStatus("disconnected"),
      onError: () => setConnectionStatus("disconnected"),
    });

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const subscribe = useCallback((channel: string) => {
    wsRef.current?.subscribe(channel);
  }, []);

  const send = useCallback((payload: Record<string, unknown>) => {
    wsRef.current?.send(payload);
  }, []);

  return { lastMessage, connectionStatus, subscribe, send };
}
