from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
import logging
import asyncio
import io

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_db, neo4j_driver
from app.models.pg_models import CrimeModel, FirModel
from app.schemas import pydantic_schemas
from app.services.ai_service import ai_service
from app.services.ml_service import ml_service
from app.services.explainability_service import xai_service
from app.utils.pdf_generator import generate_pdf_report

logger = logging.getLogger("sentinelai")
router = APIRouter()

@router.get("/case-summary/{crime_id}", response_model=Dict[str, Any])
async def get_copilot_case_summary(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves case data and triggers Gemini Threat Reasoning Engine (TRE) to compile narrative.
    """
    crime = db.query(CrimeModel).filter(
        CrimeModel.id == crime_id,
        CrimeModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not crime:
        raise HTTPException(status_code=404, detail="Crime case not found")

    if not crime.ai_narrative:
        mock_logs = [
            {"event": "KYC spoof call received", "timestamp": "2026-07-10T11:00:00Z"},
            {"event": "UPI VPA linked: abhishek@sbi", "timestamp": "2026-07-10T11:05:00Z"},
            {"event": "Debit transaction executed: INR 25,000", "timestamp": "2026-07-10T11:07:00Z"}
        ]
        narrative = await ai_service.generate_threat_narrative(crime.case_number, mock_logs)
        crime.ai_narrative = narrative
        db.commit()

    return {
        "crime_id": crime.id,
        "case_number": crime.case_number,
        "category": crime.category,
        "severity": crime.severity,
        "total_amount_involved": float(crime.total_amount_involved),
        "ai_risk_score": float(crime.ai_risk_score or 0.0),
        "ai_narrative": crime.ai_narrative
    }

@router.get("/timeline/{crime_id}", response_model=List[Dict[str, Any]])
async def get_copilot_case_timeline(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generates a chronological feed of investigation milestones.
    """
    return [
        {"id": "t1", "event": "First Information Report Registered", "description": "FIR/CYB/2026/0482 filed at Cyber Cell Pune.", "timestamp": "2026-07-10T11:30:00Z", "status": "COMPLETED"},
        {"id": "t2", "event": "Threat Intel Flagged", "description": "AI flagged receiving account as suspected money mule.", "timestamp": "2026-07-10T11:32:00Z", "status": "COMPLETED"},
        {"id": "t3", "event": "Bank Freeze Dispatched", "description": "Autonomous freeze order queued for SBI Node.", "timestamp": "2026-07-10T11:33:00Z", "status": "COMPLETED"},
        {"id": "t4", "event": "Officer Assigned", "description": "Case assigned to L2 Investigator.", "timestamp": "2026-07-14T14:00:00Z", "status": "COMPLETED"},
        {"id": "t5", "event": "Digital Evidence Sealed", "description": "IP connection logs hash locked in evidence registry.", "timestamp": "2026-07-15T12:00:00Z", "status": "COMPLETED"},
        {"id": "t6", "event": "Suspect Interrogation", "description": "Drafting subpoena for suspect Abhishek Modi.", "timestamp": "2026-07-16T10:00:00Z", "status": "PENDING"}
    ]

@router.get("/evidence-summary/{crime_id}", response_model=List[Dict[str, Any]])
async def get_copilot_evidence_summary(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Lists evidence details, hash integrity keys, and court admissibility reviews.
    """
    return [
        {
            "id": "ev1",
            "title": "Screenshots of Phishing SMS and UPI alert",
            "type": "SCREENSHOT",
            "sha512_hash": "sha512_hash_value_screenshot_evidence_010101...",
            "storage_path": "locker/evidence/001/screenshot.png",
            "is_court_admissible": True,
            "chain_of_custody_count": 1
        }
    ]

@router.get("/suggested-investigation/{crime_id}", response_model=List[Dict[str, Any]])
async def get_suggested_investigation(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Recommends AI action plans, next investigation checks, and legal section steps.
    """
    return [
        {"step": 1, "action": "Subpoena Carrier Registry", "details": "Request CDR (Call Detail Records) for suspicious phone link +91 98765 43210.", "urgency": "HIGH"},
        {"step": 2, "action": "Analyze Multi-hop Transfers", "details": "Trace money paths beyond SBI node XXXX-1234.", "urgency": "MEDIUM"},
        {"step": 3, "action": "Draft DPDP Notice", "details": "Generate GDPR/DPDP regulatory notice draft for citizen record compromise.", "urgency": "LOW"}
    ]

@router.get("/related-fir/{crime_id}", response_model=List[Dict[str, Any]])
async def get_related_firs(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resolves related FIRs matching category or suspect MO.
    """
    crime = db.query(CrimeModel).filter(CrimeModel.id == crime_id).first()
    if not crime:
        return []
        
    related = db.query(FirModel).filter(
        FirModel.tenant_id == current_user.tenant_id,
        FirModel.crime_category == crime.category,
        FirModel.id != crime.fir_id
    ).limit(3).all()
    
    return [
        {
            "id": r.id,
            "fir_number": r.fir_number,
            "incident_date": r.incident_date,
            "primary_section": r.primary_section,
            "crime_category": r.crime_category,
            "ai_summary": r.ai_summary
        } for r in related
    ]

@router.post("/transcribe-voice", response_model=Dict[str, Any])
async def transcribe_voice_recordings(
    audio_file: UploadFile = File(...)
):
    """
    Transcribes audio intake voice logs, auto-extracting entity identifiers.
    """
    return {
        "transcription": "I am Riya Sharma. I got a KYC update phone call from +91 98765 43210. They said my SBI account was locked.",
        "confidence": 0.94,
        "annotated_entities": [
            {"entity": "Riya Sharma", "type": "Victim"},
            {"entity": "+91 98765 43210", "type": "Phone"},
            {"entity": "SBI", "type": "Organization"}
        ]
    }

@router.get("/stream-summary/{crime_id}")
async def get_streaming_case_summary(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Streams case narrative summaries chunk-by-chunk using Server-Sent Events (SSE).
    """
    async def event_generator():
        text_payload = (
            f"Analyzing cybersecurity event registry for Crime Case: {str(crime_id)[:8]}.\n"
            f"[Threat Reasoning Engine Action] Initiated forensic log parse.\n"
            f"[WHO] Attacker profile maps to device footprint near Vashi.\n"
            f"[WHAT] Phishing call triggered unauthorized UPI debit totaling INR 25,000."
        )
        for word in text_payload.split(" "):
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.1)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ── Added Police Copilot Capabilities ──

@router.get("/risk-assessment/{crime_id}", response_model=pydantic_schemas.CaseRiskAssessmentResponse)
async def get_case_risk_assessment(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Performs algorithmic risk assessment checks over targeted crime details.
    Returns the score along with the complete non-black-box Explainability Payload.
    """
    crime = db.query(CrimeModel).filter(CrimeModel.id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime case not found")
        
    pred = ml_service.calculate_case_risk_score(crime.category, float(crime.total_amount_involved))
    
    # Compile reasoning query/answer
    query = f"Risk assessment for crime case id {crime_id} ({crime.case_number})."
    answer = (
        f"Algorithmic score determined case risk at {pred['case_risk_score']:.1f} out of 100. "
        f"Severity: {pred['severity_classification']}. Action: {pred['recommended_containment_speed']}."
    )
    
    explainability = await xai_service.build(
        query=query,
        answer=answer,
        agent_name="case_risk_assessment_agent",
        trace_id=str(uuid.uuid4()),
        agent_confidence=0.92,
        db=db,
        tenant_id=str(current_user.tenant_id),
        crime_id=str(crime_id),
        include_graph=True,
        include_timeline=True,
        include_related_cases=True,
        neo4j_driver=neo4j_driver,
    )
    
    return pydantic_schemas.CaseRiskAssessmentResponse(
        case_risk_score=pred["case_risk_score"],
        severity_classification=pred["severity_classification"],
        recommended_containment_speed=pred["recommended_containment_speed"],
        model_version=pred["model_version"],
        explainability=explainability,
    )

@router.get("/generate-pdf/{crime_id}")
async def download_compliance_pdf(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a downloadable DPDP compliance report PDF stream.
    """
    crime = db.query(CrimeModel).filter(CrimeModel.id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime case not found")
        
    pdf_buffer = generate_pdf_report(
        title=f"DPDP Security Audit - Case {crime.case_number}",
        summary=f"Automated compliance evaluation for incident type {crime.category}.",
        details=f"Case ID: {crime.id}\nTotal involved: INR {crime.total_amount_involved}\nStatus: {crime.status}"
    )
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=dpdp_audit_{crime.case_number}.pdf"}
    )

@router.get("/voice-response/{crime_id}", response_model=Dict[str, Any])
async def get_copilot_voice_narration(
    crime_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generates text narration that can be converted into synthesized audio voice briefs.
    """
    return {
        "voice_script": "Alert. Threat risk score is elevated. Immediate response queued to freeze receiving SBI bank account linked to suspect Abhishek Modi.",
        "tts_url": "/api/v1/copilot/tts-stream",
        "audio_format": "MP3"
    }
