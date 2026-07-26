# ============================================================
# SentinelAI — Offline Sync Schemas
#
# Schemas to support offline queue synchronization, conflict
# resolution strategies, and transaction validation.
# ============================================================

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── 1. Queued Offline Mutation ────────────────────────────────

MutationType = Literal["CREATE_CRIME", "UPDATE_CRIME", "ADD_EVIDENCE", "RESOLVE_ALERT"]


class OfflineMutation(BaseModel):
    """
    A single transaction queued on the client device while offline.
    """
    mutation_id: UUID = Field(..., description="Unique client transaction ID")
    resource_type: Literal["crimes", "evidence", "notifications"]
    resource_id: UUID
    action: MutationType
    payload: Dict[str, Any] = Field(..., description="Action parameters and values")
    client_timestamp: str = Field(..., description="ISO 8601 timestamp of client action")
    client_version: int = Field(1, description="Optimistic locking version counter")


# ── 2. Sync Request & Response ────────────────────────────────

class SyncRequest(BaseModel):
    """
    Batch payload containing all queued client mutations to sync.
    """
    device_id: str
    mutations: List[OfflineMutation]


ConflictResolutionStrategy = Literal["CLIENT_WINS", "SERVER_WINS", "MERGED", "MANUAL_HOLD"]


class SyncResultItem(BaseModel):
    """Result of processing a single offline transaction."""
    mutation_id: UUID
    status: Literal["SUCCESS", "CONFLICT", "ERROR"]
    resolution: Optional[ConflictResolutionStrategy] = None
    server_version: int
    detail: str


class SyncResponse(BaseModel):
    """Summary of batch synchronization execution."""
    synced_at: str
    total_processed: int
    success_count: int
    conflict_count: int
    results: List[SyncResultItem]
