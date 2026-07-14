// ============================================================
// SentinelAI — WebSocket Managers
//
// 1. AlertsWebSocket — /ws/alerts
//    Multi-channel broadcast (alerts, dashboard, crime_updates).
//    Auto-reconnect with exponential back-off.
//
// 2. ChatWebSocket — /ws/chat/:session_id
//    Authenticated streaming chat with word-by-word delivery.
// ============================================================

import type { WSAlertIncoming, WSChatEvent } from "./types";

const WS_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
    /^http/,
    "ws"
  );

// ── 1. Alerts WebSocket ───────────────────────────────────────

type AlertsCallback = (msg: WSAlertIncoming) => void;

interface AlertsWSOptions {
  onMessage: AlertsCallback;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  channels?: string[]; // Channels to subscribe after connect
}

export class AlertsWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseDelayMs = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private options: AlertsWSOptions;

  constructor(options: AlertsWSOptions) {
    this.options = options;
    this.connect();
  }

  private connect() {
    if (this.isDestroyed) return;

    this.ws = new WebSocket(`${WS_BASE}/ws/alerts`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.options.onOpen?.();

      // Subscribe to requested channels
      const channels = this.options.channels ?? ["alerts"];
      for (const channel of channels) {
        this.send({ type: "subscribe", channel });
      }

      // Start heartbeat ping every 20 seconds
      this.pingInterval = setInterval(() => {
        this.send({ type: "ping" });
      }, 20_000);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WSAlertIncoming;
        this.options.onMessage(data);
      } catch {
        // Ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      this.clearPing();
      this.options.onClose?.();
      this.scheduleReconnect();
    };

    this.ws.onerror = (event: Event) => {
      this.options.onError?.(event);
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = this.baseDelayMs * 2 ** this.reconnectAttempts;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  private clearPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  subscribe(channel: string) {
    this.send({ type: "subscribe", channel });
  }

  destroy() {
    this.isDestroyed = true;
    this.clearPing();
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// ── 2. Chat WebSocket ─────────────────────────────────────────

type ChatCallback = (event: WSChatEvent) => void;

interface ChatWSOptions {
  sessionId: string;
  onEvent: ChatCallback;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseDelayMs = 800;
  private isDestroyed = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private options: ChatWSOptions;

  constructor(options: ChatWSOptions) {
    this.options = options;
    this.connect();
  }

  private getToken(): string {
    return typeof window !== "undefined"
      ? localStorage.getItem("access_token") ?? ""
      : "";
  }

  private connect() {
    if (this.isDestroyed) return;

    const token = this.getToken();
    const url = `${WS_BASE}/ws/chat/${this.options.sessionId}?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.options.onOpen?.();

      // Keepalive ping (backend ignores but keeps TCP alive)
      this.pingInterval = setInterval(() => {
        this.ws?.send(JSON.stringify({ type: "ping" }));
      }, 25_000);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WSChatEvent;
        this.options.onEvent(data);
      } catch {
        // Ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      this.clearPing();
      this.options.onClose?.();
      this.scheduleReconnect();
    };

    this.ws.onerror = (event: Event) => {
      this.options.onError?.(event);
    };
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = this.baseDelayMs * 2 ** this.reconnectAttempts;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  private clearPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send a chat prompt to the backend.
   */
  sendPrompt(prompt: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ prompt }));
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.clearPing();
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
