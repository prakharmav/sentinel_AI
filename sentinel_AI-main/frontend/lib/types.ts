// ============================================================
// SentinelAI — TypeScript Interface Definitions
// Mirrors backend: app/schemas/pydantic_schemas.py + all endpoints
// ============================================================

// ── Auth ─────────────────────────────────────────────────────
export interface MfaChallengeResponse {
  exchange_token: string;
  challenge_type: "TOTP" | "FIDO2";
}

export interface VerifyMfaRequest {
  exchange_token: string;
  mfa_code: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

// Decoded JWT payload
export interface JWTPayload {
  sub: string;
  tenant_id: string;
  role: "CITIZEN" | "POLICE" | "INVESTIGATOR" | "ADMIN";
  permissions: string[];
  exp: number;
  iat: number;
}

// Local auth state (stored in-memory + localStorage)
export interface AuthState {
  accessToken: string | null;
  role: string | null;
  userId: string | null;
  tenantId: string | null;
  permissions: string[];
  isAuthenticated: boolean;
}

// ── Crime / Case ──────────────────────────────────────────────
export type CrimeCategory =
  | "UPI_FRAUD"
  | "PHISHING"
  | "RANSOMWARE"
  | "IDENTITY_THEFT"
  | "DATA_BREACH"
  | "HACKING";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type CrimeStatus =
  | "REPORTED"
  | "UNDER_INVESTIGATION"
  | "ESCALATED"
  | "CLOSED";

export interface MitreTechnique {
  technique_id: string;
  technique_name: string;
  tactic?: string;
}

export interface CrimeCreateRequest {
  case_number: string;
  category: CrimeCategory;
  severity: SeverityLevel;
  incident_date: string;
  total_amount_involved: number;
  police_station_id: string;
}

export interface CrimeResponse {
  id: string;
  case_number: string;
  category: CrimeCategory;
  severity: SeverityLevel;
  status: CrimeStatus;
  incident_date: string;
  total_amount_involved: number;
  ai_risk_score: number | null;
  ai_narrative: string | null;
  mitre_techniques: MitreTechnique[];
  created_at: string;
}

// ── FIR Parser ────────────────────────────────────────────────
export interface UnstructuredTextRequest {
  raw_text: string;
  language?: string;
}

export interface UnstructuredTextResponse {
  extracted_crime_category: string;
  extracted_entities: {
    victims: string[];
    suspects: string[];
    banking_references: string[];
  };
  suggested_legal_sections: string[];
}

// ── Fraud / VPA Check ────────────────────────────────────────
export interface VpaCheckResponse {
  vpa: string;
  risk_score: number;
  is_blacklisted: boolean;
  reason: string;
}

// ── Async Job ─────────────────────────────────────────────────
export interface AsyncJobResponse {
  job_id: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
}

// ── Attack Path Prediction ───────────────────────────────────
export interface AttackPrediction {
  technique_id: string;
  technique_name: string;
  probability: number;
  mitigation_strategy: string;
}

// ── Natural Language Chat (NLSI) ─────────────────────────────
export interface ChatQueryRequest {
  query: string;
}

export interface ChatQueryResponse {
  answer: string;
  confidence: number;
  citations: string[];
}

// ── Graph Network ─────────────────────────────────────────────
export interface NodeSchema {
  id: string;
  label: string;
  type: string;
  risk_score: number;
}

export interface EdgeSchema {
  source: string;
  target: string;
  type: string;
}

export interface GraphResponse {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
}

// ── Analytics ─────────────────────────────────────────────────
export interface DashboardMetrics {
  total_incidents: number;
  active_investigations: number;
  resolved_cases: number;
  average_ai_risk_score: number;
  amount_involved_total: number;
  amount_recovered_total: number;
  recovery_rate_percentage: number;
  mttd_minutes: number;
  mttr_hours: number;
}

export interface CrimeTrend {
  month: string;
  count: number;
  loss: number;
}

export interface CrimeHotspot {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  location: string;
  type: CrimeCategory;
}

export interface ThreatPathEntry {
  technique_id: string;
  technique_name: string;
  probability: number;
  mitigation: string;
}

// ── Copilot (AI Case Assistant) ──────────────────────────────
export interface CopilotCaseSummary {
  crime_id: string;
  case_number: string;
  category: CrimeCategory;
  severity: SeverityLevel;
  total_amount_involved: number;
  ai_risk_score: number;
  ai_narrative: string;
}

export interface CopilotTimelineEvent {
  id: string;
  event: string;
  description: string;
  timestamp: string;
  status: "COMPLETED" | "PENDING" | "IN_PROGRESS";
}

export interface CopilotEvidence {
  id: string;
  title: string;
  type: "SCREENSHOT" | "VIDEO" | "AUDIO" | "DOCUMENT";
  sha512_hash: string;
  storage_path: string;
  is_court_admissible: boolean;
  chain_of_custody_count: number;
}

export interface SuggestedInvestigationStep {
  step: number;
  action: string;
  details: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
}

export interface TranscriptionResult {
  transcription: string;
  confidence: number;
  annotated_entities: Array<{ entity: string; type: string }>;
}

// ── Reports / Compliance ─────────────────────────────────────
export interface ComplianceReportRequest {
  crime_id: string;
  regulation?: string;
}

export interface ComplianceReportResponse {
  report_id: string;
  regulation: string;
  file_url: string;
  generated_at: string;
}

export interface ReportListItem {
  id: string;
  crime_id: string;
  report_type: string;
  title: string;
  summary: string;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
}

// ── Notifications ─────────────────────────────────────────────
export interface NotificationDispatchPayload {
  recipient_phone: string;
  title: string;
  body: string;
  channel: "SMS" | "EMAIL" | "PUSH" | "WHATSAPP";
}

export interface NotificationLog {
  id: string;
  recipient_phone: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  created_at: string;
}

// ── Upload ────────────────────────────────────────────────────
export interface SecureUploadResponse {
  message: string;
  status: "SECURED";
  metadata: {
    file_name: string;
    content_type: string;
    size_bytes: number;
    sha256: string;
    storage_path: string;
    is_court_admissible: boolean;
    rag_indexed?: boolean;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ── WebSocket Message Types ───────────────────────────────────
export type WSAlertIncoming =
  | { channel: string; payload: Record<string, unknown> }
  | { type: "pong" }
  | { status: string }
  | { error: string };

export type WSChatEvent =
  | { event: "status"; detail: string }
  | { event: "stream_start" }
  | { event: "stream_chunk"; chunk: string }
  | { event: "stream_end"; citations: string[]; tokens_used: number }
  | { event: "error"; detail: string };

// ── Generic Pagination ────────────────────────────────────────
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// ── API Error (matches backend ErrorResponse) ─────────────────
export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id: string;
  timestamp: string;
}

export interface ApiErrorPayload {
  error: ApiErrorDetail;
  detail?: string; // FastAPI default error shape
}

export class SentinelApiError extends Error {
  status: number;
  code: string;
  requestId?: string;

  constructor(message: string, status: number, code = "UNKNOWN_ERROR", requestId?: string) {
    super(message);
    this.name = "SentinelApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

// ── Explainability (XAI) Interfaces ───────────────────────────

export interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface ConfidenceScore {
  overall: number;
  label: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN";
  factors: ConfidenceFactor[];
  calibration_note: string;
}

export type EvidenceType =
  | "DATABASE_RECORD"
  | "GRAPH_NODE"
  | "GRAPH_EDGE"
  | "RAG_DOCUMENT"
  | "ML_PREDICTION"
  | "TIMELINE_EVENT"
  | "MITRE_TECHNIQUE"
  | "FINANCIAL_RECORD"
  | "GEOSPATIAL";

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  content: string;
  source: string;
  weight: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ReasoningStep {
  step: number;
  thought: string;
  observation: string;
  conclusion: string;
  confidence_delta: number;
}

export interface ReasoningChain {
  steps: ReasoningStep[];
  final_conclusion: string;
  total_steps: number;
}

export interface RiskFactor {
  factor_id: string;
  name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  weight: number;
  description: string;
  supporting_evidence: string[];
  mitigation: string;
  mitre_technique?: string;
}

export interface RelatedCase {
  case_id: string;
  case_number: string;
  category: string;
  severity: string;
  status: string;
  similarity_score: number;
  similarity_reason: string;
  total_amount_involved: number;
  incident_date: string;
  resolution_summary?: string;
}

export interface SourceDocument {
  document_id: string;
  file_name: string;
  chunk_index: number;
  chunk_text: string;
  relevance_score: number;
  source_type: "UPLOADED_EVIDENCE" | "LEGAL_DATABASE" | "CASE_REPORT" | "POLICY_DOC";
  retrieved_at: string;
}

export interface XaiGraphNode {
  node_id: string;
  label: string;
  type: string;
  risk_score: number;
  properties?: Record<string, any>;
  is_high_risk: boolean;
}

export interface XaiGraphEdge {
  source_id: string;
  target_id: string;
  relationship_type: string;
  weight: number;
  properties?: Record<string, any>;
}

export interface GraphEvidence {
  nodes: XaiGraphNode[];
  edges: XaiGraphEdge[];
  high_risk_nodes: string[];
  traversal_depth: number;
  path_summary: string;
}

export interface XaiTimelineEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  description: string;
  actor?: string;
  target?: string;
  significance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  evidence_ref?: string;
  amount_involved?: number;
}

export interface TimelineEvidence {
  events: XaiTimelineEvent[];
  duration_hours: number;
  first_event_at: string;
  last_event_at: string;
  timeline_summary: string;
}

export interface ExplainabilityPayload {
  prediction_id: string;
  trace_id: string;
  crime_id?: string;
  generated_at: string;
  model_version: string;
  agent_name: string;
  confidence: ConfidenceScore;
  evidence: EvidenceItem[];
  reasoning: ReasoningChain;
  risk_factors: RiskFactor[];
  related_cases: RelatedCase[];
  source_documents: SourceDocument[];
  graph_evidence?: GraphEvidence;
  timeline_evidence?: TimelineEvidence;
  prediction_label: string;
  prediction_summary: string;
  recommended_actions: string[];
  regulatory_flags: string[];
}

export interface HotspotPredictionResponse {
  prediction_score: number;
  threat_level: string;
  confidence_interval: number[];
  model_version: string;
  explainability: ExplainabilityPayload;
}

export interface OffenderPredictionResponse {
  recidivism_probability: number;
  risk_status: string;
  associated_cases_count: number;
  model_version: string;
  explainability: ExplainabilityPayload;
}

export interface FraudPredictionResponse {
  fraud_probability: number;
  mule_indicator: string;
  action_recommendation: string;
  model_version: string;
  explainability: ExplainabilityPayload;
}

export interface CaseRiskAssessmentResponse {
  case_risk_score: number;
  severity_classification: string;
  recommended_containment_speed: string;
  model_version: string;
  explainability: ExplainabilityPayload;
}

// ── Voice AI Interfaces ───────────────────────────────────────

export interface VoiceInteractResponse {
  language: "en" | "kn" | "hi";
  transcription: string;
  stt_confidence: number;
  routed_agent: string;
  text_answer: string;
  audio_base64: string;
  audio_format: string;
  noise_reduction_applied: boolean;
  processing_time_ms: number;
}

// ── Report Builder Interfaces ─────────────────────────────────

export interface ReportBuildRequest {
  crime_id: string;
  format_type: "GOVERNMENT" | "COMMERCIAL" | "SIMPLIFIED";
  include_evidence?: boolean;
  include_timeline?: boolean;
  include_related_firs?: boolean;
  custom_signoff_name?: string;
}

export interface ReportDetailResponse {
  report_id: string;
  crime_id: string;
  case_number: string;
  generated_at: string;
  format_type: string;
  case_summary: string;
  evidence_count: number;
  timeline_event_count: number;
  risk_score: number;
  recommendation_count: number;
  pdf_download_url: string;
  qr_verification_url: string;
}

// ── Offline Sync Interfaces ───────────────────────────────────

export interface OfflineMutation {
  mutation_id: string;
  resource_type: "crimes" | "evidence" | "notifications";
  resource_id: string;
  action: "CREATE_CRIME" | "UPDATE_CRIME" | "ADD_EVIDENCE" | "RESOLVE_ALERT";
  payload: Record<string, any>;
  client_timestamp: string;
  client_version: number;
}

export interface SyncRequest {
  device_id: string;
  mutations: OfflineMutation[];
}

export interface SyncResultItem {
  mutation_id: string;
  status: "SUCCESS" | "CONFLICT" | "ERROR";
  resolution?: "CLIENT_WINS" | "SERVER_WINS" | "MERGED" | "MANUAL_HOLD";
  server_version: number;
  detail: string;
}

export interface SyncResponse {
  synced_at: string;
  total_processed: number;
  success_count: number;
  conflict_count: number;
  results: SyncResultItem[];
}




