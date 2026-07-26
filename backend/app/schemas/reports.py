# ============================================================
# SentinelAI — Report Builder Schemas
#
# Schemas to support dynamic, professional, government-format
# investigation report generation.
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── 1. Report Build Request ───────────────────────────────────

class ReportBuildRequest(BaseModel):
    """
    Triggers dynamic, AI-compiled investigation report compilation.
    """
    crime_id: UUID = Field(..., description="ID of the crime case")
    format_type: str = Field("GOVERNMENT", description="Format standard: GOVERNMENT | COMMERCIAL | SIMPLIFIED")
    include_evidence: bool = True
    include_timeline: bool = True
    include_related_firs: bool = True
    custom_signoff_name: Optional[str] = Field(None, description="Investigating officer signoff override")


# ── 2. Report Build Response ──────────────────────────────────

class ReportDetailSchema(BaseModel):
    """Structured report metadata representing the compiled case file."""
    report_id: str
    crime_id: UUID
    case_number: str
    generated_at: str
    format_type: str
    
    # ── Report Content Summary Sections ──
    case_summary: str = Field(..., description="AI-compiled TRE case narrative")
    evidence_count: int
    timeline_event_count: int
    risk_score: float
    recommendation_count: int
    
    # ── Outputs ──
    pdf_download_url: str = Field(..., description="API endpoint to download the compiled PDF report")
    qr_verification_url: str = Field(..., description="URL embedded in QR stamp to verify report hash integrity")
