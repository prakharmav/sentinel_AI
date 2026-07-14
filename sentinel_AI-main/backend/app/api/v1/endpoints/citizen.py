from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid

from app.core.auth import get_current_user, TokenData
from app.core.database import get_db
from app.models.pg_models import CrimeModel, FirModel
from app.schemas import pydantic_schemas
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/parse-fir", response_model=pydantic_schemas.UnstructuredTextResponse)
async def parse_complaint_text(
    payload: pydantic_schemas.UnstructuredTextRequest,
    current_user: TokenData = Depends(get_current_user)
):
    # Call Gemini model parsing service
    parsed_data = await ai_service.parse_unstructured_fir(payload.raw_text)
    
    return pydantic_schemas.UnstructuredTextResponse(
        extracted_crime_category=parsed_data.get("extracted_crime_category", "UPI_FRAUD"),
        extracted_entities=parsed_data.get("extracted_entities", {"victims": [], "suspects": [], "banking_references": []}),
        suggested_legal_sections=parsed_data.get("suggested_legal_sections", [])
    )

@router.get("/my-cases", response_model=List[pydantic_schemas.CrimeResponse])
async def list_citizen_cases(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # In production, query cases linked to complainant's citizen profile
    # For testing, returns all user crimes under the tenant
    crimes = db.query(CrimeModel).filter(
        CrimeModel.tenant_id == current_user.tenant_id
    ).all()
    return crimes
