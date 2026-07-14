from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.auth import get_current_user, TokenData
from app.core.database import get_db
from app.models import pg_models
from app.schemas import pydantic_schemas

router = APIRouter()

@router.get("/", response_model=List[pydantic_schemas.CrimeResponse])
async def list_crimes(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crimes = db.query(pg_models.CrimeModel).filter(
        pg_models.CrimeModel.tenant_id == current_user.tenant_id
    ).offset(skip).limit(limit).all()
    return crimes

@router.post("/", response_model=pydantic_schemas.CrimeResponse, status_code=status.HTTP_201_CREATED)
async def create_crime(
    payload: pydantic_schemas.CrimeCreateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crime_data = payload.model_dump()
    crime_data.update({
        "tenant_id": current_user.tenant_id,
        "status": "REPORTED",
        "ai_risk_score": 72.4,  # AI model mock default
        "ai_narrative": "Coordinated attack chain targeting entity endpoints."
    })
    
    db_crime = pg_models.CrimeModel(**crime_data)
    db.add(db_crime)
    db.commit()
    db.refresh(db_crime)
    return db_crime

@router.get("/{id}", response_model=pydantic_schemas.CrimeResponse)
async def get_crime(
    id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crime = db.query(pg_models.CrimeModel).filter(
        pg_models.CrimeModel.id == id,
        pg_models.CrimeModel.tenant_id == current_user.tenant_id
    ).first()
    
    if not crime:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crime record not found"
        )
    return crime
