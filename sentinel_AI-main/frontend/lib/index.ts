// ============================================================
// SentinelAI — Integration Layer: Index / Barrel Export
// Import from this single entry point in page components.
// ============================================================

// Types
export * from "./types";

// HTTP Client
export { default as apiClient, tokenStore, withRetry } from "./apiClient";

// React Query
export { QueryProvider, getQueryClient } from "./queryProvider";
export { queryKeys } from "./queryKeys";

// Services
export { authService } from "./services/authService";
export { crimeService } from "./services/crimeService";
export { analyticsService } from "./services/analyticsService";
export { graphService } from "./services/graphService";
export { copilotService } from "./services/copilotService";
export { uploadService, UploadValidationError } from "./services/uploadService";
export {
  reportsService,
  notificationService,
  citizenService,
} from "./services/otherServices";
export { timelineService } from "./services/timelineService";
export { alertService } from "./services/alertService";
export { voiceService } from "./services/voiceService";
export { reportBuilderService } from "./services/reportBuilderService";
export { offlineQueue } from "./services/offlineQueue";
export { syncService } from "./services/syncService";

// WebSocket Managers
export { AlertsWebSocket, ChatWebSocket } from "./websocket";
