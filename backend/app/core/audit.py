# ============================================================
# SentinelAI — Security Audit Logger
#
# Generates tamper-proof audit trails for security-critical
# actions (login, role escalation, alerts resolution, file download).
# ============================================================

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.models.pg_models import AuditLogModel

logger = logging.getLogger("sentinelai.security")


def log_security_event(
    db: Session,
    tenant_id: UUID,
    actor_id: Optional[UUID],
    action: str,
    resource_type: str,
    resource_id: UUID,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Inserts a row into the audit_logs table.
    Enforces a clean security log trail.
    """
    try:
        log_entry = AuditLogModel(
            tenant_id=tenant_id,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
        )
        db.add(log_entry)
        db.commit()
        logger.info(f"[AUDIT] Action '{action}' committed by actor {actor_id} on {resource_type}/{resource_id}.")
    except Exception as e:
        logger.error(f"Audit log commit failed: {e}")
        # Make sure database transaction does not leak
        db.rollback()
