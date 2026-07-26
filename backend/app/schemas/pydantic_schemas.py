from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class MfaChallengeResponse(BaseModel):
    exchange_token: str
    challenge_type: str = "TOTP"

class VerifyMfaRequest(BaseModel):
    exchange_token: str
    mfa_code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]+$")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600

# Crime Schemas
class CrimeCreateRequest(BaseModel):
    case_number: str = Field(..., min_length=5, max_length=50)
    category: str = Field(..., pattern=r"^(UPI_FRAUD|PHISHING|RANSOMWARE|IDENTITY_THEFT|DATA_BREACH|HACKING)$")
    severity: str = Field("MEDIUM", pattern=r"^(CRITICAL|HIGH|MEDIUM|LOW|INFO)$")
    incident_date: date
    total_amount_involved: float = Field(0.00, ge=0.0)
    police_station_id: UUID

class CrimeResponse(BaseModel):
    id: UUID
    case_number: str
    category: str
    severity: str
    status: str
    incident_date: date
    total_amount_involved: float
    ai_risk_score: Optional[float] = None
    ai_narrative: Optional[str] = None
    mitre_techniques: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# FIR Schemas
class UnstructuredTextRequest(BaseModel):
    raw_text: str = Field(..., min_length=50, max_length=50000)
    language: str = "en"

class UnstructuredTextResponse(BaseModel):
    extracted_crime_category: str
    extracted_entities: Dict[str, List[str]] = {"victims": [], "suspects": [], "banking_references": []}
    suggested_legal_sections: List[str] = []

# Fraud Control
class VpaCheckRequest(BaseModel):
    vpa: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")

class VpaCheckResponse(BaseModel):
    vpa: str
    risk_score: float
    is_blacklisted: bool
    reason: str

# Counterfeit / Deepfake
class MediaScanRequest(BaseModel):
    storage_path: str
    media_type: str = Field("VIDEO", pattern=r"^(IMAGE|VIDEO|AUDIO|DOCUMENT)$")

class AsyncJobResponse(BaseModel):
    job_id: UUID
    status: str = "PROCESSING"

# Prediction
from app.schemas.explainability import ExplainabilityPayload

class AttackPrediction(BaseModel):
    technique_id: str
    technique_name: str
    probability: float
    mitigation_strategy: str

class AttackPathPredictionResponse(BaseModel):
    crime_id: UUID
    predictions: List[AttackPrediction]

class HotspotPredictionResponse(BaseModel):
    prediction_score: float
    threat_level: str
    confidence_interval: List[float]
    model_version: str
    explainability: ExplainabilityPayload

class OffenderPredictionResponse(BaseModel):
    recidivism_probability: float
    risk_status: str
    associated_cases_count: int
    model_version: str
    explainability: ExplainabilityPayload

class FraudPredictionResponse(BaseModel):
    fraud_probability: float
    mule_indicator: str
    action_recommendation: str
    model_version: str
    explainability: ExplainabilityPayload

class CaseRiskAssessmentResponse(BaseModel):
    case_risk_score: float
    severity_classification: str
    recommended_containment_speed: str
    model_version: str
    explainability: ExplainabilityPayload

# Chat (NLSI)
class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)

class ChatQueryResponse(BaseModel):
    answer: str
    confidence: float
    citations: List[str] = []
    explainability: Optional[ExplainabilityPayload] = None

# Graph schemas
class NodeSchema(BaseModel):
    id: str
    label: str
    type: str
    risk_score: float = 0.0

class EdgeSchema(BaseModel):
    source: str
    target: str
    type: str

class GraphResponse(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]

# Generic Error Response
class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: UUID
    timestamp: datetime

class ErrorResponse(BaseModel):
    error: ErrorDetail

# Notification Schemas
class NotificationDispatchPayload(BaseModel):
    recipient_phone: str = Field(..., min_length=10, max_length=20)
    title: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1)
    channel: str = Field("SMS", pattern=r"^(SMS|EMAIL|PUSH)$")

