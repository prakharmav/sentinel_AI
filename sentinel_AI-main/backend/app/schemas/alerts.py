# ============================================================
# SentinelAI — Alert Engine Schemas
#
# Schemas to support dynamic, multi-channel (WebSocket, Push,
# Email, Dashboard) prioritization alert triggers.
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── 1. Alert Payload ──────────────────────────────────────────

AlertSeverity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
AlertDetector = Literal[
    "NEW_FRAUD_RING",
    "REPEATED_PHONE",
    "REPEATED_UPI",
    "REPEATED_DEVICE",
    "HIGH_RISK_CITIZEN",
    "CRIME_SPIKE"
]


class AlertPayload(BaseModel):
    """
    Core alert structure pushed across all channels (WebSockets, DB, Queue).
    """
    alert_id: str = Field(default_factory=lambda: str(UUID(int=0)))
    tenant_id: UUID
    detector: AlertDetector
    severity: AlertSeverity
    title: str = Field(..., description="Short descriptive title of the alert")
    description: str = Field(..., description="Actionable plain-English alert narrative")
    entities: Dict[str, Any] = Field(
        default_factory=dict,
        description="Linked identifiers: phone, VPA, device_id, suspects, etc."
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )
    is_read: bool = False
    action_taken: Optional[str] = None


# ── 2. Priority Queue Wrapper ─────────────────────────────────

class PriorityQueueAlert(BaseModel):
    """
    Alert prioritized by severity for execution scheduling.
    Allows critical alerts to jump the queue.
    """
    priority: int = Field(
        ...,
        description="Priority index: 1 = CRITICAL, 2 = HIGH, 3 = MEDIUM, 4 = LOW"
    )
    alert: AlertPayload

    def __lt__(self, other: PriorityQueueAlert) -> bool:
        # Priority Queue sorts ascending, so 1 (CRITICAL) < 2 (HIGH)
        return self.priority < other.priority


# ── 3. Alert Summary ──────────────────────────────────────────

class AlertSummary(BaseModel):
    total_triggered: int
    critical_count: int
    unresolved_count: int
    recent_alerts: List[AlertPayload]
