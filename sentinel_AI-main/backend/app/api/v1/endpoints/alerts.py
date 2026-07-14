# ============================================================
# SentinelAI — Alert Engine API Endpoints
#
# Wires:
#   - POST /alerts/sweep (Triggers manual detection sweep)
#   - GET /alerts/recent (Pulls recent alerts log)
#   - GET /alerts/queue (Shows currently queued priority alerts)
#   - POST /alerts/{id}/resolve (Marks alert as resolved)
# ============================================================

from __future__ import annotations

import logging
from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_db
from app.schemas.alerts import AlertPayload, AlertSummary
from app.services.alert_engine import alert_engine, alert_priority_queue

logger = logging.getLogger("sentinelai.alerts")
router = APIRouter()


# ── 1. Manual Sweep Trigger ───────────────────────────────────

@router.post("/sweep", response_model=Dict[str, Any])
async def trigger_alerts_sweep(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually triggers the detection sweep cycle across Neo4j and PostgreSQL.
    Fires alerts to all active WebSockets, Celery dispatch targets, and prioritizers.
    """
    logger.info(f"User {current_user.user_id} triggered manual alerts detection sweep.")
    count = await alert_engine.run_detection_sweep(db, str(current_user.tenant_id))
    return {
        "status": "SWEEP_COMPLETE",
        "alerts_triggered_count": count,
        "detail": f"Successfully completed threat scan. Triggered {count} alerts."
    }


# ── 2. Get Recent Alerts ──────────────────────────────────────

@router.get("/recent", response_model=List[AlertPayload])
async def get_recent_alerts(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the chronological list of recent alerts from the database.
    """
    from app.models.pg_models import NotificationModel
    
    # Query Postgres notifications log (representing dashboard alerts)
    notifs = db.query(NotificationModel).filter(
        NotificationModel.tenant_id == current_user.tenant_id
    ).order_by(NotificationModel.created_at.desc()).limit(20).all()
    
    payloads = []
    # Map notification models to AlertPayload objects
    for n in notifs:
        payloads.append(AlertPayload(
            alert_id=str(n.id),
            tenant_id=n.tenant_id,
            detector="CRIME_SPIKE" if "spike" in n.title.lower() else "NEW_FRAUD_RING",
            severity="CRITICAL" if "critical" in n.title.lower() else "HIGH",
            title=n.title,
            description=n.body,
            timestamp=n.created_at.isoformat() + "Z",
            is_read=(n.status == "READ"),
        ))
        
    return payloads


# ── 3. View Prioritized Queue ────────────────────────────────

@router.get("/queue", response_model=List[AlertPayload])
async def get_priority_queue_elements(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Inspects the currently queued alerts inside the priority queue scheduler.
    """
    temp_list = []
    # Since priority queue gets emptied on pop, we temporarily drain it and restore it
    while not alert_priority_queue.empty():
        item = alert_priority_queue.get_nowait()
        temp_list.append(item)
        
    payloads = []
    for item in temp_list:
        payloads.append(item.alert)
        # Restore item back to priority queue
        alert_priority_queue.put_nowait(item)
        
    return payloads


# ── 4. Resolve Alert ──────────────────────────────────────────

@router.post("/{alert_id}/resolve", response_model=Dict[str, Any])
async def resolve_active_alert(
    alert_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks the designated alert as resolved.
    """
    from app.models.pg_models import NotificationModel
    
    notif = db.query(NotificationModel).filter(
        NotificationModel.id == alert_id,
        NotificationModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert notification record not found."
        )
        
    notif.status = "RESOLVED"
    db.commit()
    
    return {
        "status": "RESOLVED",
        "alert_id": alert_id,
        "detail": "Alert marked as successfully resolved in database."
    }
