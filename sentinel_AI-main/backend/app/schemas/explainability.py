# ============================================================
# SentinelAI — Explainability (XAI) Pydantic Schemas
#
# Every AI prediction must carry a full ExplainabilityPayload.
# No black-box outputs allowed. Every field is mandatory.
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── 1. Confidence Score ────────────────────────────────────────

class ConfidenceFactor(BaseModel):
    """A single named dimension contributing to the overall confidence."""
    name: str = Field(..., description="Factor name, e.g. 'Data Completeness'")
    score: float = Field(..., ge=0.0, le=1.0, description="0.0 = no confidence, 1.0 = certain")
    weight: float = Field(..., ge=0.0, le=1.0, description="Relative weight of this factor")
    explanation: str = Field(..., description="Plain-English explanation of the score")


class ConfidenceScore(BaseModel):
    """
    Multi-dimensional confidence breakdown.
    Prevents single-number black-box scores.
    """
    overall: float = Field(..., ge=0.0, le=1.0, description="Weighted composite of all factors")
    label: Literal["VERY_HIGH", "HIGH", "MEDIUM", "LOW", "UNCERTAIN"]
    factors: List[ConfidenceFactor]
    calibration_note: str = Field(
        ...,
        description="Plain-English note on what could improve or reduce confidence"
    )

    @classmethod
    def from_factors(cls, factors: List[ConfidenceFactor]) -> "ConfidenceScore":
        if not factors:
            return cls(
                overall=0.5,
                label="UNCERTAIN",
                factors=[],
                calibration_note="Insufficient data to calibrate confidence."
            )
        weighted = sum(f.score * f.weight for f in factors)
        total_weight = sum(f.weight for f in factors)
        overall = round(weighted / total_weight if total_weight else 0.5, 4)
        label_map = [
            (0.90, "VERY_HIGH"),
            (0.75, "HIGH"),
            (0.55, "MEDIUM"),
            (0.35, "LOW"),
        ]
        label = next((l for threshold, l in label_map if overall >= threshold), "UNCERTAIN")
        return cls(
            overall=overall,
            label=label,  # type: ignore[arg-type]
            factors=factors,
            calibration_note=(
                "Confidence is high based on multi-source corroboration."
                if overall >= 0.75
                else "Limited data sources reduce confidence — add more evidence to improve."
            ),
        )


# ── 2. Evidence Item ───────────────────────────────────────────

EvidenceType = Literal[
    "DATABASE_RECORD",
    "GRAPH_NODE",
    "GRAPH_EDGE",
    "RAG_DOCUMENT",
    "ML_PREDICTION",
    "TIMELINE_EVENT",
    "MITRE_TECHNIQUE",
    "FINANCIAL_RECORD",
    "GEOSPATIAL",
]


class EvidenceItem(BaseModel):
    """A single piece of supporting evidence for a prediction."""
    id: str
    type: EvidenceType
    title: str
    content: str = Field(..., description="Human-readable description of the evidence")
    source: str = Field(..., description="Origin: table name, Neo4j label, document name, etc.")
    weight: float = Field(..., ge=0.0, le=1.0, description="Contribution weight to the prediction")
    timestamp: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── 3. Reasoning Chain ────────────────────────────────────────

class ReasoningStep(BaseModel):
    """
    A single step in the AI's chain-of-thought reasoning.
    Exposes the 'why' behind each inference.
    """
    step: int
    thought: str = Field(..., description="Internal reasoning step")
    observation: str = Field(..., description="What data/evidence was observed at this step")
    conclusion: str = Field(..., description="What the AI concluded from this step")
    confidence_delta: float = Field(
        ...,
        description="How much this step increased (+) or decreased (-) confidence"
    )


class ReasoningChain(BaseModel):
    """Ordered chain of reasoning steps producing the final answer."""
    steps: List[ReasoningStep]
    final_conclusion: str
    total_steps: int


# ── 4. Risk Factors ───────────────────────────────────────────

RiskSeverity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


class RiskFactor(BaseModel):
    """A single risk signal identified during prediction."""
    factor_id: str
    name: str
    severity: RiskSeverity
    weight: float = Field(..., ge=0.0, le=1.0, description="Contribution to overall risk score")
    description: str
    supporting_evidence: List[str] = Field(
        default_factory=list,
        description="IDs of EvidenceItems supporting this risk factor"
    )
    mitigation: str = Field(..., description="Recommended action to mitigate this factor")
    mitre_technique: Optional[str] = Field(
        None,
        description="MITRE ATT&CK technique ID (e.g. T1566)"
    )


# ── 5. Related Cases ──────────────────────────────────────────

class RelatedCase(BaseModel):
    """A historically similar case used for pattern comparison."""
    case_id: str
    case_number: str
    category: str
    severity: str
    status: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    similarity_reason: str = Field(
        ...,
        description="Why this case is considered similar (shared MO, location, category, etc.)"
    )
    total_amount_involved: float
    incident_date: str
    resolution_summary: Optional[str] = None


# ── 6. Source Documents (RAG Citations) ───────────────────────

class SourceDocument(BaseModel):
    """A RAG-retrieved document chunk that informed the prediction."""
    document_id: str
    file_name: str
    chunk_index: int
    chunk_text: str = Field(..., description="Exact text excerpt from the source document")
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    source_type: Literal["UPLOADED_EVIDENCE", "LEGAL_DATABASE", "CASE_REPORT", "POLICY_DOC"]
    retrieved_at: str


# ── 7. Graph Evidence ─────────────────────────────────────────

class GraphNode(BaseModel):
    """A Neo4j node in the evidence graph."""
    node_id: str
    label: str
    type: str
    risk_score: float = Field(0.0, ge=0.0, le=1.0)
    properties: Dict[str, Any] = Field(default_factory=dict)
    is_high_risk: bool = False


class GraphEdge(BaseModel):
    """A relationship between two Neo4j nodes."""
    source_id: str
    target_id: str
    relationship_type: str
    weight: float = Field(1.0, ge=0.0)
    properties: Dict[str, Any] = Field(default_factory=dict)


class GraphEvidence(BaseModel):
    """Neo4j sub-graph extracted as evidence for the prediction."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    high_risk_nodes: List[str] = Field(
        default_factory=list,
        description="Node IDs with risk_score > 0.7"
    )
    traversal_depth: int = Field(..., description="Number of hops from the origin node")
    path_summary: str = Field(..., description="Plain-English description of the graph path")


# ── 8. Timeline Evidence ──────────────────────────────────────

EventSignificance = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


class TimelineEvent(BaseModel):
    """A chronological event contributing to the prediction timeline."""
    event_id: str
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    event_type: str
    description: str
    actor: Optional[str] = Field(None, description="Who/what triggered this event")
    target: Optional[str] = Field(None, description="System/account/entity affected")
    significance: EventSignificance
    evidence_ref: Optional[str] = Field(
        None,
        description="ID of a linked EvidenceItem"
    )
    amount_involved: Optional[float] = None


class TimelineEvidence(BaseModel):
    """Chronological reconstruction of the attack/incident timeline."""
    events: List[TimelineEvent]
    duration_hours: float
    first_event_at: str
    last_event_at: str
    timeline_summary: str


# ── 9. Master Explainability Payload ─────────────────────────

class ExplainabilityPayload(BaseModel):
    """
    The complete, non-negotiable explainability envelope attached to
    every SentinelAI AI prediction. No black-box outputs allowed.

    Must be returned by every prediction endpoint and every agent node.
    """
    prediction_id: str = Field(..., description="UUID of this specific prediction")
    trace_id: str = Field(..., description="Request trace ID from the LangGraph run")
    crime_id: Optional[str] = Field(None, description="Crime case this prediction belongs to")
    generated_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )
    model_version: str = Field("1.0.0", description="ML model version used")
    agent_name: str = Field(..., description="Which LangGraph agent produced this prediction")

    # ── The 8 mandatory explainability dimensions ──
    confidence: ConfidenceScore
    evidence: List[EvidenceItem]
    reasoning: ReasoningChain
    risk_factors: List[RiskFactor]
    related_cases: List[RelatedCase]
    source_documents: List[SourceDocument]
    graph_evidence: Optional[GraphEvidence] = None
    timeline_evidence: Optional[TimelineEvidence] = None

    # ── Summary fields ──
    prediction_label: str = Field(..., description="Human-readable prediction outcome")
    prediction_summary: str = Field(..., description="1-2 sentence plain-English summary")
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Ordered list of recommended next actions"
    )
    regulatory_flags: List[str] = Field(
        default_factory=list,
        description="Applicable regulations triggered (DPDP, GDPR, IT Act sections)"
    )


# ── 10. Explainability Request Schema ────────────────────────

class ExplainPredictionRequest(BaseModel):
    """Request body for POST /explain/prediction"""
    crime_id: Optional[str] = None
    agent_name: str = "crime_agent"
    query: str = Field(..., min_length=3)
    raw_prediction: Optional[str] = None
    include_graph: bool = True
    include_timeline: bool = True
    include_related_cases: bool = True
    top_k_related: int = Field(3, ge=1, le=10)
    top_k_documents: int = Field(3, ge=1, le=10)
