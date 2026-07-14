// ============================================================
// SentinelAI — useChatWebSocket Hook
// Manages the /ws/chat/:session_id WebSocket connection.
// Handles: message history, streaming chunks, status events,
// rate-limit errors, and connection state.
// ============================================================

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChatWebSocket } from "../lib/websocket";
import type { WSChatEvent } from "../lib/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  tokensUsed?: number;
  isStreaming?: boolean;
  timestamp: Date;
}

interface UseChatWebSocketOptions {
  sessionId?: string; // UUID — generates one if not provided
  enabled?: boolean;
}

interface UseChatWebSocketReturn {
  messages: ChatMessage[];
  connectionStatus: ConnectionStatus;
  isThinking: boolean;   // True while awaiting stream_start
  isStreaming: boolean;  // True while receiving stream_chunks
  send: (prompt: string) => void;
  clearHistory: () => void;
}

function generateId() {
  return crypto.randomUUID();
}

export function useChatWebSocket(
  options: UseChatWebSocketOptions = {}
): UseChatWebSocketReturn {
  const { enabled = true } = options;
  const sessionId = options.sessionId ?? generateId();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<ChatWebSocket | null>(null);
  // Track the ID of the currently-streaming assistant message
  const streamingMsgId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const ws = new ChatWebSocket({
      sessionId,
      onOpen: () => setConnectionStatus("connected"),
      onClose: () => setConnectionStatus("disconnected"),
      onError: () => setConnectionStatus("disconnected"),
      onEvent: (event: WSChatEvent) => {
        switch (event.event) {
          case "status":
            setIsThinking(true);
            break;

          case "stream_start": {
            setIsThinking(false);
            setIsStreaming(true);
            const id = generateId();
            streamingMsgId.current = id;
            setMessages((prev) => [
              ...prev,
              {
                id,
                role: "assistant",
                content: "",
                isStreaming: true,
                timestamp: new Date(),
              },
            ]);
            break;
          }

          case "stream_chunk":
            if (streamingMsgId.current) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMsgId.current
                    ? { ...msg, content: msg.content + event.chunk }
                    : msg
                )
              );
            }
            break;

          case "stream_end":
            setIsStreaming(false);
            if (streamingMsgId.current) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMsgId.current
                    ? {
                        ...msg,
                        isStreaming: false,
                        citations: event.citations,
                        tokensUsed: event.tokens_used,
                      }
                    : msg
                )
              );
              streamingMsgId.current = null;
            }
            break;

          case "error":
            setIsThinking(false);
            setIsStreaming(false);
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "system",
                content: `⚠ ${event.detail}`,
                timestamp: new Date(),
              },
            ]);
            streamingMsgId.current = null;
            break;
        }
      },
    });

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sessionId]);

  const send = useCallback((prompt: string) => {
    if (!prompt.trim() || !wsRef.current?.isConnected) return;

    // Append the user message immediately for optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      },
    ]);

    wsRef.current.sendPrompt(prompt);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    connectionStatus,
    isThinking,
    isStreaming,
    send,
    clearHistory,
  };
}
