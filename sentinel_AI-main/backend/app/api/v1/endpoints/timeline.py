# ============================================================
# SentinelAI — AI Timeline Builder Router Endpoints
#
# Wires:
#   - POST /timeline/build (chronological, interactive, visual)
#   - GET /timeline/pdf/{timeline_id} (PDF report download)
# ============================================================

from __future__ import annotations

import logging
import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
import io

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_db, get_redis
from app.schemas.timeline import TimelineBuildRequest, TimelineBuildResponse
from app.services.timeline_builder_service import timeline_builder_service

logger = logging.getLogger("sentinelai.timeline")
router = APIRouter()


# ── 1. Build Multi-format Timeline ───────────────────────────

@router.post("/build", response_model=TimelineBuildResponse)
async def build_ai_timeline(
    payload: TimelineBuildRequest,
    current_user: TokenData = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Assembles a comprehensive, structured chronological, interactive,
    and swimlane visual timeline mapping connected crime details.
    """
    logger.info(f"AI Timeline builder invoked for user {current_user.user_id} and case {payload.crime_id}")
    try:
        response = await timeline_builder_service.build_timeline(
            db=db,
            req=payload,
            tenant_id=str(current_user.tenant_id),
        )
        return response
    except Exception as e:
        logger.error(f"Failed to build AI timeline: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to construct incident timeline tracks: {str(e)}"
        )


# ── 2. Download Formatted PDF Report ─────────────────────────

@router.get("/pdf/{timeline_id}")
async def download_timeline_pdf(
    timeline_id: UUID,
    redis_client = Depends(get_redis)
):
    """
    Streams a cleanly formatted PDF representing the chronological timeline report.
    Pulls data cached in Redis.
    """
    cache_key = f"timeline:{str(timeline_id)}"
    if not redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis cache unavailable to process PDF exports."
        )

    try:
        cached_raw = redis_client.get(cache_key)
        if not cached_raw:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident timeline record not found or expired from session cache."
            )

        payload_dict = json.loads(cached_raw)
        payload = TimelineBuildResponse(**payload_dict)
        
        # Generate PDF binary
        pdf_bytes = timeline_builder_service.generate_pdf_bytes(payload)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=timeline_report_{timeline_id}.pdf"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stream timeline PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Timeline PDF compilation failed: {e}"
        )
