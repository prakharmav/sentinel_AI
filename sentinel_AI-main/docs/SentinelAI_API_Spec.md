# SentinelAI — Complete REST API Specification

> **Framework**: Python FastAPI / OpenAPI 3.1.0  
> **Design Role**: Staff API Architect, SentinelAI  
> **Date**: July 11, 2026  
> **Status**: Approved for Implementation

---

## 1. GLOBAL API SPECIFICATIONS

### 1.1 Standard HTTP Status Codes

| Status Code | Meaning | Use Case in SentinelAI |
|---|---|---|
| **200 OK** | Success | Standard read/update response |
| **201 Created** | Resource Created | Successful creation of FIR, Crime, Evidence, etc. |
| **202 Accepted** | Async Processing | Triggering AI threat analysis, generating long PDFs |
| **400 Bad Request** | Validation Failure | Invalid input types, malformed JSON, business rule violation |
| **401 Unauthorized** | Missing/Invalid Token | Expired JWT, invalid signature, step-up MFA required |
| **403 Forbidden** | RBAC Privilege Check | Accessing data belonging to another tenant or higher rank |
| **404 Not Found** | Resource Missing | Invalid Case ID, UUID not found in PostgreSQL/Neo4j |
| **422 Unprocessable** | Semantic Validation | Missing required Pydantic properties in payload |
| **429 Too Many Requests**| Rate Limit Exceeded | API key exceeding quota (monitored via Redis) |
| **500 Internal Error** | Server Crash | Database connection loss, downstream API timeout |

### 1.2 Global Headers

```http
# Request Headers
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <UUID>                     # Enforces PostgreSQL row-level security
X-Request-ID: <UUID>                    # Distributed tracing (Jaeger/OTel)
Accept-Language: hi, en                  # Multi-lingual localizations (Hindi/English)

# Response Headers
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1771630120
X-Trace-ID: <UUID>                      # Corresponds to X-Request-ID
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 1.3 Standard Error Schema

```json
{
  "error": {
    "code": "INSUFFICIENT_PRIVILEGES",
    "message": "Officer badge #1842 lacks permission to approve containment actions.",
    "request_id": "8f9a2b7c-4d3e-2f1a-0b9c-8d7e6f5a4b3c",
    "timestamp": "2026-07-11T23:10:00Z",
    "details": [
      {
        "field": "autonomy_approval",
        "issue": "Requires Rank: DSP or above. Current Rank: Sub-Inspector."
      }
    ],
    "recovery_link": "https://docs.sentinelai.io/api/errors#rbac"
  }
}
```

---

## 2. ENDPOINT MAPPINGS BY MODULE

### 2.1 Authentication & Zero Trust (`/api/v1/auth`)

*   `POST /login` — Authenticate user and return temporary exchange token.
*   `POST /mfa/verify` — Verify FIDO2 / TOTP challenge and return final JWT + Refresh Token.
*   `POST /refresh` — Refresh expired JWT using HTTP-only Secure Refresh Cookie.
*   `POST /logout` — Revoke session token and push JWT ID (`jti`) to Redis blacklist.
*   `POST /step-up` — Initiate step-up FIDO2 verification for high-risk autonomous actions.

### 2.2 Crime Management (`/api/v1/crimes`)

*   `GET /` — Paginated list of active crime incidents filtered by tenant, status, severity, and district.
*   `POST /` — Create a new crime record (P1 severity auto-triggers alert service).
*   `GET /{id}` — Fetch detailed crime profile, including links to victims, suspects, and locations.
*   `PATCH /{id}` — Update crime details (severity, status, lead officer).
*   `POST /{id}/cluster` — Manually associate a crime to a cluster ID (groups related gang patterns).
*   `GET /clusters/{cluster_id}` — Get timeline analysis of all linked crimes in a cluster.

### 2.3 FIR Management (`/api/v1/firs`)

*   `POST /` — Register a raw FIR (Accepts structured details or raw text parser).
*   `POST /parse-unstructured` — AI parser (Gemini): extracts victim, suspect, locations, and legal sections from hand-written complaints.
*   `GET /{id}` — Retrieve formal FIR details.
*   `POST /{id}/sync/cctns` — Push FIR structure directly to CCTNS nodes (REST/SOAP adapter).
*   `POST /{id}/sync/ncrp` — Sync complaint data to the national cybercrime portal.

### 2.4 Evidence Locker (`/api/v1/evidence`)

*   `POST /` — Register evidence metadata (type, custody logging, legal admissibility checks).
*   `POST /{id}/upload` — Upload raw binary file to object store (MinIO/S3), returns hash.
*   `GET /{id}/verify` — Verify hash integrity against PostgreSQL record (detects tampering).
*   `POST /{id}/seal` — Lock evidence file preventing modification (requires supervisor pin).
*   `GET /{id}/custody-log` — Returns full chain of custody log records.

### 2.5 Fraud Control (`/api/v1/fraud`)

*   `POST /transactions/scan` — Scan real-time bank/UPI transactions for anomaly scores.
*   `POST /vpa/check` — Fast risk scoring of UPI VPA (cross-references blacklists and age).
*   `POST /accounts/{id}/freeze` — Issue freeze order to receiving banking APIs (RBI compliance trigger).
*   `GET /accounts/mules` — Paginated list of AI-flagged money mule accounts.

### 2.6 Counterfeit & Deepfake Detection (`/api/v1/counterfeit`)

*   `POST /media/scan` — Upload video, audio, or image to scan for synthetic media signatures (returns deepfake score).
*   `GET /media/scan/{job_id}` — Check status of long-running video deepfake analysis job.
*   `POST /documents/scan` — Inspect invoice, identity cards, or NOC drafts for digital forgery signs.

### 2.7 Predictive Analytics (`/api/v1/prediction`)

*   `GET /attack-path/{crime_id}` — Fetch Markov-chain transition likelihoods for the next 3 attack steps.
*   `GET /hotspots` — Spatio-temporal regional forecasts of cybercrime trends (filtered by state/district).

### 2.8 Natural Language SOC Interface (`/api/v1/chat`)

*   `POST /query` — Run a RAG search via natural language. Returns cited text, database records, and visual charts.
*   `POST /feedback` — Analyst thumbs up/down on NL queries to fine-tune vector index mappings.

### 2.9 Voice Intelligence (`/api/v1/voice`)

*   `POST /transcribe` — Process incoming audio file (phone logs, citizen intake recordings), returns transcribed text with entity tags (suspect name, location, banking details).

### 2.10 Reports & Compliance (`/api/v1/reports`)

*   `POST /executive-summary` — Generates a plain-English board-ready summary of an active case.
*   `POST /compliance/{regulation}` — Draft GDPR Art. 33 or India DPDP Act breach notification PDF templates.

### 2.11 Notifications (`/api/v1/notifications`)

*   `POST /dispatch` — Trigger dispatch channels (SMS/Email/WhatsApp) to victims or field officers.
*   `GET /logs` — Retrieve tracking status of sent notifications.

### 2.12 Graph Network Explorer (`/api/v1/graph`)

*   `GET /network-graph/{crime_id}` — Return nodes and relationships structured for visualization engines (Sigma.js/Three.js).
*   `GET /shortest-path` — Find connection path between two entity nodes.

### 2.13 System Admin (`/api/v1/admin`)

*   `GET /audit-logs` — Fetch immutable cryptographic audit entries.
*   `PATCH /tenants/{id}/config` — Enforce global threat detection thresholds and autonomy flags.

---

## 3. PYDANTIC VALIDATION SCHEMAS (FASTAPI SKELETON)

```python
# validation_schemas.py

from pydantic import BaseModel, Field, EmailStr, HttpUrl, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

class TokenPayload(BaseModel):
    sub: UUID = Field(..., description="User ID mapping to user table")
    tenant_id: UUID = Field(..., description="Multitenancy identifier")
    role: str = Field(..., description="RBAC Role")
    exp: datetime
    jti: UUID

class LogPayload(BaseModel):
    email: EmailStr
    password: str

class VerifyMfaPayload(BaseModel):
    exchange_token: str
    mfa_code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]+$")

class CrimeCreateSchema(BaseModel):
    case_number: str = Field(..., min_length=5, max_length=50)
    category: str = Field(..., pattern=r"^(UPI_FRAUD|PHISHING|RANSOMWARE|IDENTITY_THEFT|DATA_BREACH|HACKING)$")
    severity: str = Field("MEDIUM", pattern=r"^(CRITICAL|HIGH|MEDIUM|LOW|INFO)$")
    incident_date: date
    total_amount_involved: float = Field(0.00, ge=0.0)
    currency: str = Field("INR", min_length=3, max_length=3)
    police_station_id: UUID

class UnstructuredTextPayload(BaseModel):
    raw_text: str = Field(..., min_length=50, max_length=50000, description="Hand-written complaint transcript or text file contents")
    language: str = Field("en", pattern=r"^(en|hi|ta|te|mr|bn)$")

class VpaRiskCheckPayload(BaseModel):
    vpa: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    app_name: Optional[str] = None

class MediaScanPayload(BaseModel):
    storage_path: str = Field(..., description="MinIO storage reference location")
    media_type: str = Field(..., pattern=r"^(IMAGE|VIDEO|AUDIO|DOCUMENT)$")

class ChatQueryPayload(BaseModel):
    query: str = Field(..., min_length=3, max_length=500, description="Natural language query")
    context_filters: Optional[Dict[str, Any]] = None

class ComplianceReportPayload(BaseModel):
    crime_id: UUID
    regulation: str = Field(..., pattern=r"^(GDPR|DPDP|NIS2)$")
    custom_notes: Optional[str] = None
```

---

## 4. SWAGGER / OPENAPI 3.1.0 SPECIFICATION

```yaml
# openapi.yaml
# Complete Swagger / OpenAPI 3.1.0 JSON-compatible spec.

openapi: "3.1.0"
info:
  title: SentinelAI Core Threat Engine API
  version: "1.0.0"
  description: "REST API specification for SentinelAI - The Reasoning-Native Threat Intelligence & Autonomous Response Platform."

servers:
  - url: "https://api.sentinelai.io/api/v1"
    description: "Production API Server"
  - url: "http://localhost:8000/api/v1"
    description: "Local Development Server"

paths:
  /auth/login:
    post:
      summary: "User authentication endpoint"
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginRequest"
      responses:
        "200":
          description: "MFA challenge issued"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MfaChallengeResponse"
        "400":
          description: "Malformed body"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: "Invalid credentials"

  /auth/mfa/verify:
    post:
      summary: "Verify MFA challenge and issue final access tokens"
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/VerifyMfaRequest"
      responses:
        "200":
          description: "Access tokens granted"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TokenResponse"
        "401":
          description: "Invalid or expired verification challenge"

  /crimes:
    get:
      summary: "Get a list of active crimes"
      tags:
        - Crimes
      security:
        - OAuth2Bearer: []
      parameters:
        - name: severity
          in: query
          required: false
          schema:
            type: string
            enum: [CRITICAL, HIGH, MEDIUM, LOW, INFO]
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [REPORTED, UNDER_INVESTIGATION, CLOSED]
      responses:
        "200":
          description: "List of crimes matching query parameters"
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/CrimeResponse"

    post:
      summary: "Create a new crime case record"
      tags:
        - Crimes
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CrimeCreateRequest"
      responses:
        "201":
          description: "Crime case registered successfully"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CrimeResponse"
        "403":
          description: "Unauthorized rank to perform registration"

  /firs/parse-unstructured:
    post:
      summary: "Parse unstructured handwritten complaints using Gemini LLM reasoning"
      tags:
        - FIRs
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UnstructuredTextRequest"
      responses:
        "200":
          description: "Successfully extracted entity mappings"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UnstructuredTextResponse"

  /evidence/{id}/upload:
    post:
      summary: "Upload raw binary file to evidence locker"
      tags:
        - Evidence
      security:
        - OAuth2Bearer: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        "200":
          description: "File uploaded successfully"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/FileUploadResponse"

  /fraud/vpa/check:
    post:
      summary: "Scans UPI VPA for fraud flags"
      tags:
        - Fraud Control
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/VpaCheckRequest"
      responses:
        "200":
          description: "VPA risk analysis results"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/VpaCheckResponse"

  /counterfeit/media/scan:
    post:
      summary: "Scans media formats for deepfake/synthetic signatures"
      tags:
        - Counterfeit & Deepfake
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MediaScanRequest"
      responses:
        "202":
          description: "Scanning job accepted for processing"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AsyncJobResponse"

  /prediction/attack-path/{crime_id}:
    get:
      summary: "Get Markov-chain attack path predictions"
      tags:
        - Predictions
      security:
        - OAuth2Bearer: []
      parameters:
        - name: crime_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: "Prediction outcomes list"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AttackPathPredictionResponse"

  /chat/query:
    post:
      summary: "Submit natural language query to RAG database engine"
      tags:
        - Natural Language SOC Interface
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ChatQueryRequest"
      responses:
        "200":
          description: "Response generated from database sources"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatQueryResponse"

  /voice/transcribe:
    post:
      summary: "Transcribes citizen intake call recordings with entity annotations"
      tags:
        - Voice Intelligence
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                audio_file:
                  type: string
                  format: binary
      responses:
        "200":
          description: "Transcription annotated"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/VoiceTranscriptionResponse"

  /reports/compliance/{regulation}:
    post:
      summary: "Generates regulatory breach report drafts"
      tags:
        - Reports & Compliance
      security:
        - OAuth2Bearer: []
      parameters:
        - name: regulation
          in: path
          required: true
          schema:
            type: string
            enum: [GDPR, DPDP, NIS2]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ComplianceReportRequest"
      responses:
        "201":
          description: "breach report draft created"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ComplianceReportResponse"

  /notifications/dispatch:
    post:
      summary: "Dispatch alerts to users or officers"
      tags:
        - Notifications
      security:
        - OAuth2Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/NotificationDispatchPayload"
      responses:
        "200":
          description: "Notifications dispatched"

  /graph/network-graph/{crime_id}:
    get:
      summary: "Fetch layout-ready Neo4j graph nodes and edges for rendering maps"
      tags:
        - Graph Network Explorer
      security:
        - OAuth2Bearer: []
      parameters:
        - name: crime_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: "Sigma.js/Three.js visual graph payloads"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GraphResponse"

  /admin/audit-logs:
    get:
      summary: "Read system audit logs"
      tags:
        - Admin
      security:
        - OAuth2Bearer: []
      responses:
        "200":
          description: "List of log events"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuditLogCollection"

components:
  securitySchemes:
    OAuth2Bearer:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    MfaChallengeResponse:
      type: object
      properties:
        exchange_token:
          type: string
        challenge_type:
          type: string
          enum: [TOTP, FIDO2_PASSKEY]

    VerifyMfaRequest:
      type: object
      required:
        - exchange_token
        - mfa_code
      properties:
        exchange_token:
          type: string
        mfa_code:
          type: string

    TokenResponse:
      type: object
      properties:
        access_token:
          type: string
        token_type:
          type: string
          example: Bearer
        expires_in:
          type: integer
          example: 3600

    CrimeCreateRequest:
      type: object
      required:
        - case_number
        - category
        - incident_date
        - police_station_id
      properties:
        case_number:
          type: string
        category:
          type: string
        severity:
          type: string
          default: MEDIUM
        incident_date:
          type: string
          format: date
        total_amount_involved:
          type: number
        police_station_id:
          type: string
          format: uuid

    CrimeResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        case_number:
          type: string
        category:
          type: string
        severity:
          type: string
        incident_date:
          type: string
          format: date
        total_amount_involved:
          type: number
        status:
          type: string
        created_at:
          type: string
          format: date-time

    UnstructuredTextRequest:
      type: object
      required:
        - raw_text
      properties:
        raw_text:
          type: string
        language:
          type: string
          default: en

    UnstructuredTextResponse:
      type: object
      properties:
        extracted_crime_category:
          type: string
        extracted_entities:
          type: object
          properties:
            victims:
              type: array
              items:
                type: string
            suspects:
              type: array
              items:
                type: string
            banking_references:
              type: array
              items:
                type: string
        suggested_legal_sections:
          type: array
          items:
            type: string

    FileUploadResponse:
      type: object
      properties:
        file_id:
          type: string
          format: uuid
        storage_path:
          type: string
        checksum_sha256:
          type: string

    VpaCheckRequest:
      type: object
      required:
        - vpa
      properties:
        vpa:
          type: string

    VpaCheckResponse:
      type: object
      properties:
        vpa:
          type: string
        risk_score:
          type: number
        is_blacklisted:
          type: boolean
        reason:
          type: string

    MediaScanRequest:
      type: object
      required:
        - storage_path
        - media_type
      properties:
        storage_path:
          type: string
        media_type:
          type: string

    AsyncJobResponse:
      type: object
      properties:
        job_id:
          type: string
          format: uuid
        status:
          type: string
          example: PROCESSING

    AttackPathPredictionResponse:
      type: object
      properties:
        crime_id:
          type: string
          format: uuid
        predictions:
          type: array
          items:
            type: object
            properties:
              technique_id:
                type: string
              technique_name:
                type: string
              probability:
                type: number
              mitigation_strategy:
                type: string

    ChatQueryRequest:
      type: object
      required:
        - query
      properties:
        query:
          type: string

    ChatQueryResponse:
      type: object
      properties:
        answer:
          type: string
        confidence:
          type: number
        citations:
          type: array
          items:
            type: string

    VoiceTranscriptionResponse:
      type: object
      properties:
        transcription:
          type: string
        annotated_entities:
          type: array
          items:
            type: object
            properties:
              entity:
                type: string
              type:
                type: string

    ComplianceReportRequest:
      type: object
      required:
        - crime_id
      properties:
        crime_id:
          type: string
          format: uuid
        custom_notes:
          type: string

    ComplianceReportResponse:
      type: object
      properties:
        report_id:
          type: string
          format: uuid
        regulation:
          type: string
        file_url:
          type: string
        generated_at:
          type: string
          format: date-time

    NotificationDispatchPayload:
      type: object
      required:
        - recipient_phone
        - title
        - body
        - channel
      properties:
        recipient_phone:
          type: string
        title:
          type: string
        body:
          type: string
        channel:
          type: string

    GraphResponse:
      type: object
      properties:
        nodes:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              label:
                type: string
              type:
                type: string
              risk_score:
                type: number
        edges:
          type: array
          items:
            type: object
            properties:
              source:
                type: string
              target:
                type: string
              type:
                type: string

    AuditLogCollection:
      type: object
      properties:
        logs:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                format: uuid
              actor_id:
                type: string
              action:
                type: string
              timestamp:
                type: string
                format: date-time

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            request_id:
              type: string
              format: uuid
            timestamp:
              type: string
              format: date-time
```
