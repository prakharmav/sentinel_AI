# ============================================================
# SentinelAI — AI Timeline Builder Schemas
#
# Schemas supporting the dynamic chronological, interactive,
# visual, and PDF timeline generation.
# ============================================================

from __future__ import annotations

from typing import List, Dict, Any, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


# ── 1. Input Schemas ──────────────────────────────────────────

class TimelineBuildRequest(BaseModel):
    """
    Input parameters to build a customized, AI-orchestrated timeline.
    Supports either crime_id lookup OR direct manual payload feed.
    """
    crime_id: Optional[UUID] = Field(
        None,
        description="ID of the crime case. If provided, pulls connected Postgres/Neo4j entities automatically."
    )
    evidence_ids: List[UUID] = Field(default_factory=list, description="Explicit evidence IDs to include.")
    phone_ids: List[UUID] = Field(default_factory=list, description="Explicit phone number record IDs.")
    location_ids: List[UUID] = Field(default_factory=list, description="Explicit location record IDs.")
    transaction_ids: List[UUID] = Field(default_factory=list, description="Explicit bank transaction record IDs.")
    
    # Optional override payloads for dry-runs / manual simulations
    custom_events: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Manual timeline event overrides: [{'timestamp': 'ISO-8601', 'title': '...', 'description': '...'}]"
    )


# ── 2. Output Schemas ─────────────────────────────────────────

class TimelineEventSchema(BaseModel):
    """A single chronological milestone event in the generated timeline."""
    event_id: str
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    title: str = Field(..., description="Short title of the event")
    description: str = Field(..., description="Detailed description of what occurred")
    event_type: Literal[
        "INCIDENT",
        "EVIDENCE_ADDED",
        "PHONE_CALL",
        "LOCATION_LOGIN",
        "TRANSACTION",
        "SYSTEM_ALERT",
        "OFFICER_ACTION",
        "COMPLIANCE_NOTICE"
    ]
    actor: str = Field(..., description="Actor who initiated this event, e.g. 'Suspect 1'")
    target: str = Field(..., description="System or account targeted, e.g. 'Victim SBI Account'")
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    amount_involved: Optional[float] = None
    evidence_reference_id: Optional[str] = None


class ChronologicalTimeline(BaseModel):
    """Full chronological sort of the incident logs."""
    total_events: int
    first_event_at: str
    last_event_at: str
    duration_hours: float
    events: List[TimelineEventSchema]


class InteractiveTimeline(BaseModel):
    """
    Wraps the timeline with filter parameters, search index tags,
    and metadata for interactive frontend grids and widgets.
    """
    timeline_id: str
    title: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    facets: Dict[str, List[str]] = Field(
        ...,
        description="Available filter parameters, e.g. {'event_type': [...], 'actor': [...], 'severity': [...]}"
    )
    search_tags: List[str] = Field(
        default_factory=list,
        description="Search indices matching entity identifiers (phone numbers, account numbers, names)"
    )


class SwimlaneTimelineNode(BaseModel):
    """A node element positioned on a specific swimlane track."""
    event_id: str
    title: str
    timestamp: str
    swimlane_id: str = Field(..., description="ID of the actor swimlane track (vertical layout swimlane)")
    x_pos: float = Field(..., description="Normalized horizontal grid coordinate (0.0 to 100.0)")
    y_pos: float = Field(..., description="Normalized vertical grid coordinate (0.0 to 100.0)")
    icon_type: str


class SwimlaneTrack(BaseModel):
    """A swimlane representing a single actor/system track."""
    id: str
    label: str
    color_hex: str


class VisualTimelineConnection(BaseModel):
    """A directional flow link connecting two timeline events visually."""
    source_id: str
    target_id: str
    relationship_label: str
    flow_speed: Literal["RAPID", "STANDARD", "DELAYED"] = "STANDARD"


class VisualTimeline(BaseModel):
    """
    Coordinates and structure supporting interactive SVG or Canvas rendering.
    Enforces clean, visually stunning timeline swimlanes.
    """
    swimlanes: List[SwimlaneTrack]
    nodes: List[SwimlaneTimelineNode]
    connections: List[VisualTimelineConnection]
    grid_rows: int = 100
    grid_cols: int = 100


class TimelineBuildResponse(BaseModel):
    """
    Master response envelope containing all 4 required formats.
    """
    timeline_id: str
    crime_id: Optional[UUID] = None
    generated_at: str
    chronological: ChronologicalTimeline
    interactive: InteractiveTimeline
    visual: VisualTimeline
    pdf_download_url: str = Field(..., description="API endpoint to download the formatted PDF report")
