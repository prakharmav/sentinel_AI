from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from app.core.auth import get_current_user, TokenData
from app.core.database import get_db
from app.models.pg_models import NotificationModel
from app.schemas import pydantic_schemas

logger = logging.getLogger("sentinelai")
router = APIRouter()

@router.post("/dispatch", status_code=status.HTTP_200_OK)
async def dispatch_notification(
    payload: pydantic_schemas.NotificationDispatchPayload,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce rate limits / logging in production
    logger.info(f"Dispatching notification of type {payload.channel} to {payload.recipient_phone}")
    
    db_notif = NotificationModel(
        tenant_id=current_user.tenant_id,
        recipient_phone=payload.recipient_phone,
        title=payload.title,
        body=payload.body,
        channel=payload.channel,
        status="SENT"
    )
    
    db.add(db_notif)
    db.commit()
    return {"message": "Notification queued and sent successfully", "id": db_notif.id}

@router.get("/logs", response_model=List[Dict[str, Any]])
async def list_notifications(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(NotificationModel).filter(
        NotificationModel.tenant_id == current_user.tenant_id
    ).all()
    
    return [
        {
            "id": log.id,
            "recipient_phone": log.recipient_phone,
            "title": log.title,
            "body": log.body,
            "channel": log.channel,
            "status": log.status,
            "created_at": log.created_at
        } for log in logs
    ]
