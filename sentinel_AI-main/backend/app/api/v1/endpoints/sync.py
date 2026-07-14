# ============================================================
# SentinelAI — Offline Sync API Router Endpoints
#
# Wires:
#   - POST /sync (Processes batches of offline mutations)
# ============================================================

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, TokenData
from app.core.audit import log_security_event
from app.db.connection import get_db
from app.schemas.sync import SyncRequest, SyncResponse, SyncResultItem, OfflineMutation
from app.models.pg_models import CrimeModel, EvidenceModel, NotificationModel

logger = logging.getLogger("sentinelai.sync")
router = APIRouter()


# ── Conflict Resolution Helper ───────────────────────────────

def resolve_mutation_conflict(
    db: Session,
    mutation: OfflineMutation,
    db_updated_at: datetime,
) -> tuple[bool, str, str]:
    """
    Compares timestamps to resolve conflicting edits:
      - Returns (applied_change_bool, resolution_strategy, log_details)
    """
    # Parse client timestamp (ISO-8601 string)
    try:
        client_time = datetime.fromisoformat(mutation.client_timestamp.replace("Z", ""))
    except Exception:
        client_time = datetime.utcnow()

    # Strategy 1: Last-Write-Wins (Client is newer than Server)
    if client_time > db_updated_at:
        return True, "CLIENT_WINS", "Client transaction is newer. Applying modifications."
    
    # Strategy 2: Server Wins (Server has been modified in between)
    # Block changes to protect data integrity, prompt manual merge review
    return False, "SERVER_WINS", "Database has newer modifications. Client update discarded."


# ── 1. Batch Sync Processor ──────────────────────────────────

@router.post("/", response_model=SyncResponse)
async def synchronize_offline_mutations(
    payload: SyncRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Processes batch sync events from field devices.
    Resolves data collision conflicts using Timestamp-based Last-Write-Wins.
    """
    logger.info(f"Offline Sync triggered for device {payload.device_id}. Mutations count: {len(payload.mutations)}")
    
    results: List[SyncResultItem] = []
    success_count = 0
    conflict_count = 0
    
    for mut in payload.mutations:
        status_label = "SUCCESS"
        resolution = None
        detail = "Processed successfully."
        server_ver = 1
        
        try:
            # ── A. Sync CREATE_CRIME ──
            if mut.action == "CREATE_CRIME":
                # Check duplicate case_number
                case_nr = mut.payload.get("case_number", "")
                existing = db.query(CrimeModel).filter(CrimeModel.case_number == case_nr).first()
                
                if existing:
                    status_label = "CONFLICT"
                    conflict_count += 1
                    resolution = "SERVER_WINS"
                    detail = f"Case {case_nr} already registered in database."
                else:
                    new_crime = CrimeModel(
                        id=mut.resource_id,
                        tenant_id=current_user.tenant_id,
                        case_number=case_nr,
                        category=mut.payload.get("category", "CYBER_FRAUD"),
                        severity=mut.payload.get("severity", "MEDIUM"),
                        incident_date=datetime.strptime(mut.payload.get("incident_date", "2026-07-12"), "%Y-%m-%d").date(),
                        total_amount_involved=mut.payload.get("total_amount_involved", 0.0),
                    )
                    db.add(new_crime)
                    db.commit()
                    success_count += 1
                    log_security_event(
                        db, current_user.tenant_id, uuid.UUID(current_user.user_id),
                        "OFFLINE_CREATE", "crimes", new_crime.id
                    )

            # ── B. Sync UPDATE_CRIME ──
            elif mut.action == "UPDATE_CRIME":
                crime = db.query(CrimeModel).filter(CrimeModel.id == mut.resource_id).first()
                if not crime:
                    status_label = "ERROR"
                    detail = "Target crime case not found."
                else:
                    db_updated = crime.updated_at or crime.created_at
                    # Run conflict validation
                    applied, resolution, detail = resolve_mutation_conflict(db, mut, db_updated)
                    
                    if applied:
                        # Apply updates
                        if "status" in mut.payload:
                            crime.status = mut.payload["status"]
                        if "severity" in mut.payload:
                            crime.severity = mut.payload["severity"]
                        db.commit()
                        success_count += 1
                        log_security_event(
                            db, current_user.tenant_id, uuid.UUID(current_user.user_id),
                            "OFFLINE_UPDATE", "crimes", crime.id
                        )
                    else:
                        conflict_count += 1

            # ── C. Sync ADD_EVIDENCE ──
            elif mut.action == "ADD_EVIDENCE":
                existing_ev = db.query(EvidenceModel).filter(EvidenceModel.id == mut.resource_id).first()
                if existing_ev:
                    status_label = "SUCCESS"
                    detail = "Evidence already synced previously."
                    success_count += 1
                else:
                    new_ev = EvidenceModel(
                        id=mut.resource_id,
                        tenant_id=current_user.tenant_id,
                        crime_id=mut.payload.get("crime_id"),
                        title=mut.payload.get("title", "Offline Evidence"),
                        evidence_type=mut.payload.get("evidence_type", "DOCUMENT"),
                        description=mut.payload.get("description", ""),
                        content_hash=mut.payload.get("content_hash", "hash_placeholder"),
                        storage_path=mut.payload.get("storage_path", ""),
                    )
                    db.add(new_ev)
                    db.commit()
                    success_count += 1
                    log_security_event(
                        db, current_user.tenant_id, uuid.UUID(current_user.user_id),
                        "OFFLINE_ADD_EVIDENCE", "evidence", new_ev.id
                    )

            # ── D. Sync RESOLVE_ALERT ──
            elif mut.action == "RESOLVE_ALERT":
                notif = db.query(NotificationModel).filter(NotificationModel.id == mut.resource_id).first()
                if not notif:
                    status_label = "ERROR"
                    detail = "Alert notification target not found."
                else:
                    notif.status = "RESOLVED"
                    db.commit()
                    success_count += 1

        except Exception as e:
            db.rollback()
            status_label = "ERROR"
            detail = f"Database commit failed: {str(e)}"
            logger.error(f"Error syncing mutation {mut.mutation_id}: {e}")

        results.append(SyncResultItem(
            mutation_id=mut.mutation_id,
            status=status_label,
            resolution=resolution,
            server_version=server_ver,
            detail=detail,
        ))

    return SyncResponse(
        synced_at=datetime.utcnow().isoformat() + "Z",
        total_processed=len(payload.mutations),
        success_count=success_count,
        conflict_count=conflict_count,
        results=results,
    )
