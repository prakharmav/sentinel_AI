# ============================================================
# SentinelAI — Official Reports & PDF Builder Endpoints
#
# Exposes:
#   - POST /reports/build (Compiles official police PDFs)
#   - GET /reports/pdf/{report_id} (Downloads compiled ReportLab PDF)
# ============================================================

from __future__ import annotations

import logging
import uuid
from uuid import UUID
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_db, get_redis
from app.models.pg_models import ReportModel
from app.schemas.reports import ReportBuildRequest, ReportDetailSchema
from app.services.report_builder_service import report_builder_service

logger = logging.getLogger("sentinelai.reports")
router = APIRouter()


# ── 1. List Available Reports ────────────────────────────────

@router.get("/", response_model=List[Dict[str, Any]])
async def list_reports(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(ReportModel).filter(
        ReportModel.tenant_id == current_user.tenant_id
    ).all()
    
    return [
        {
            "id": r.id,
            "crime_id": r.crime_id,
            "report_type": r.report_type,
            "title": r.title,
            "summary": r.summary,
            "is_submitted": r.is_submitted,
            "submitted_at": r.submitted_at,
            "created_at": r.created_at
        } for r in reports
    ]


# ── 2. Build Official PDF Report ─────────────────────────────

@router.post("/build", response_model=ReportDetailSchema)
async def build_official_pdf_report(
    payload: ReportBuildRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Orchestrates compilation of a complete, professional, government-standard
    police report using ReportLab vector layouts, charts, and verification blocks.
    """
    logger.info(f"Report build requested for crime case {payload.crime_id}")
    try:
        report = await report_builder_service.compile_report(
            db=db,
            req=payload,
            tenant_id=str(current_user.tenant_id),
        )
        return report
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Failed to generate report PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report compiler engine execution failed: {e}"
        )


# ── 3. Stream / Download PDF Report ──────────────────────────

@router.get("/pdf/{report_id}")
async def download_compiled_pdf_report(
    report_id: UUID,
    redis_client = Depends(get_redis)
):
    """
    Streams the binary PDF data compiled via ReportLab.
    Cached dynamically inside Redis.
    """
    cache_key = f"report:pdf:{str(report_id)}"
    
    if not redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Session cache store offline. Could not download PDF."
        )

    try:
        pdf_data = redis_client.get(cache_key)
        if not pdf_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target report PDF has expired or is not cached. Re-run POST /build first."
            )
            
        # Return PDF stream
        # gTTS and ReportLab binaries are encoded cleanly
        # Decode as bytes if loaded as raw string from Redis
        if isinstance(pdf_data, str):
            pdf_data = pdf_data.encode("latin-1")
            
        return StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=investigation_report_{report_id}.pdf"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report download streaming failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stream report download: {e}"
        )
