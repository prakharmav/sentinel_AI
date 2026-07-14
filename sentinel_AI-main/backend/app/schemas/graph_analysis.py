# ============================================================
# SentinelAI — Advanced Graph Analysis Schemas
#
# Schemas to support graph analytics: Shortest Path, Most Connected,
# Community Detection, Fraud Rings, Money Flow, Phone call graph,
# Vehicle movement, and Location correlation.
# ============================================================

from __future__ import annotations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.pydantic_schemas import NodeSchema, EdgeSchema, GraphResponse


# ── 1. Most Connected Criminals ────────────────────────────────

class ConnectedCriminalNode(BaseModel):
    suspect_id: str
    name: str
    risk_score: float
    connection_count: int = Field(..., description="Degree of connectivity in the graph")
    direct_associates: List[str] = Field(default_factory=list, description="Names of direct suspect associates")


# ── 2. Community Detection ─────────────────────────────────────

class CommunitySchema(BaseModel):
    community_id: int
    member_count: int
    members: List[NodeSchema]
    risk_average: float
    primary_modus_operandi: Optional[str] = None


class CommunityDetectionResponse(BaseModel):
    total_communities: int
    communities: List[CommunitySchema]
    unassociated_nodes_count: int


# ── 3. Fraud Ring ──────────────────────────────────────────────

class FraudRingPath(BaseModel):
    ring_id: str
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    total_amount_cycled: float = 0.0
    risk_score: float = 0.0
    mitigation_action: str = Field(..., description="Action to disrupt this fraud cycle")


class FraudRingResponse(BaseModel):
    rings_detected_count: int
    rings: List[FraudRingPath]


# ── 4. Money Flow Analysis ─────────────────────────────────────

class MoneyFlowHop(BaseModel):
    source_account: str
    target_account: str
    amount: float
    timestamp: str
    hop_index: int


class MoneyFlowPath(BaseModel):
    path_id: str
    source_entity: str
    destination_entity: str
    total_amount: float
    hops: List[MoneyFlowHop]
    is_suspected_layering: bool = False


# ── 5. Phone Call Graph ────────────────────────────────────────

class CallLink(BaseModel):
    caller_number: str
    receiver_number: str
    call_duration_seconds: int
    call_timestamp: str
    is_burner_phone: bool = False


class PhoneCallGraphResponse(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    calls: List[CallLink]


# ── 6. Vehicle Movement Tracking ───────────────────────────────

class VehicleTrackPoint(BaseModel):
    timestamp: str
    location_address: str
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = None


class VehicleMovementResponse(BaseModel):
    vehicle_plate: str
    suspect_owner_name: str
    movement_history: List[VehicleTrackPoint]
    risk_score: float = 0.0


# ── 7. Location Correlation ────────────────────────────────────

class LocationCorrelationCluster(BaseModel):
    location_id: str
    address: str
    correlated_suspects: List[NodeSchema]
    overlap_duration_minutes: int
    overlap_timestamps: List[str]
    co_occurrence_count: int
