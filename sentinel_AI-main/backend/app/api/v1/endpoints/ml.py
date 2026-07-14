# ============================================================
# SentinelAI — Machine Learning Predictions & Explainability
#
# Every prediction endpoint is fully explained.
# No black-box responses.
# ============================================================

from __future__ import annotations

import uuid
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, BackgroundTasks, status, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_db, get_redis, neo4j_driver
from app.services.ml_service import ml_service
from app.services.explainability_service import xai_service
from app.schemas.explainability import ExplainabilityPayload, ExplainPredictionRequest
from app.schemas.pydantic_schemas import (
    HotspotPredictionResponse,
    OffenderPredictionResponse,
    FraudPredictionResponse,
)

logger = logging.getLogger("sentinelai.predictions")
router = APIRouter()


# ── 1. Model Training Trigger ─────────────────────────────────

@router.post("/train", status_code=status.HTTP_202_ACCEPTED)
async def trigger_model_training(
    background_tasks: BackgroundTasks,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Asynchronously triggers neural model training pipeline as a background task.
    """
    background_tasks.add_task(ml_service.run_training_pipeline, str(current_user.tenant_id))
    return {
        "status": "TRAINING_QUEUED",
        "detail": "Model training pipeline successfully dispatched to the background.",
        "current_version": ml_service.current_version
    }


# ── 2. Geospatial Hotspot Prediction (Explainable) ───────────

@router.get("/predict/hotspot", response_model=HotspotPredictionResponse)
async def get_hotspot_prediction(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates geographical threat indices to forecast crime hotspots.
    Returns the prediction and the full Explainability Payload.
    """
    pred = ml_service.predict_crime_hotspots(lat, lng)
    
    # Compile reasoning text for hotspot
    query = f"Geospatial hotspot prediction for lat {lat}, lng {lng}."
    answer = (
        f"Geospatial model predicted a hotspot threat index of {pred['prediction_score']:.0%}. "
        f"Classification: {pred['threat_level']}."
    )
    
    explainability = await xai_service.build(
        query=query,
        answer=answer,
        agent_name="geospatial_hotspot_agent",
        trace_id=str(uuid.uuid4()),
        agent_confidence=0.88,
        db=db,
        tenant_id=str(current_user.tenant_id),
        crime_id=None,
        include_graph=False,
        include_timeline=False,
        include_related_cases=False,
        neo4j_driver=neo4j_driver,
    )
    
    return HotspotPredictionResponse(
        prediction_score=pred["prediction_score"],
        threat_level=pred["threat_level"],
        confidence_interval=pred["confidence_interval"],
        model_version=pred["model_version"],
        explainability=explainability,
    )


# ── 3. Repeat Offender Profile Prediction (Explainable) ──────

@router.get("/predict/offender", response_model=OffenderPredictionResponse)
async def get_offender_prediction(
    aadhaar_hash: str = Query(..., description="Aadhaar identifier hash"),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates recidivism rates to score repeat offender profiles.
    Returns the prediction and the full Explainability Payload.
    """
    pred = ml_service.predict_repeat_offender(aadhaar_hash)
    
    query = f"Recidivism profiling for suspect Aadhaar: {aadhaar_hash}."
    answer = (
        f"Neural recidivism model predicted a {pred['recidivism_probability']:.0%} probability "
        f"of re-offending. Associated historical cases: {pred['associated_cases_count']}."
    )
    
    explainability = await xai_service.build(
        query=query,
        answer=answer,
        agent_name="recidivism_prediction_agent",
        trace_id=str(uuid.uuid4()),
        agent_confidence=0.91,
        db=db,
        tenant_id=str(current_user.tenant_id),
        crime_id=None,
        include_graph=True,
        include_timeline=True,
        include_related_cases=True,
        neo4j_driver=neo4j_driver,
    )
    
    return OffenderPredictionResponse(
        recidivism_probability=pred["recidivism_probability"],
        risk_status=pred["risk_status"],
        associated_cases_count=pred["associated_cases_count"],
        model_version=pred["model_version"],
        explainability=explainability,
    )


# ── 4. Money Laundering / Fraud Prediction (Explainable) ─────

@router.get("/predict/fraud", response_model=FraudPredictionResponse)
async def get_fraud_prediction(
    amount: float = Query(..., description="Transaction amount"),
    new_device: bool = Query(False, description="Is transaction executing on new device"),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes transactional risk parameters to isolate suspicious bank mule accounts.
    Returns the prediction and the full Explainability Payload.
    """
    pred = ml_service.predict_fraud_probability(amount, new_device)
    
    query = f"Fraud probability check for transaction amount {amount} (New device: {new_device})."
    answer = (
        f"Transaction audit predicted a {pred['fraud_probability']:.0%} fraud probability. "
        f"Mule indicator status: {pred['mule_indicator']}. Action: {pred['action_recommendation']}."
    )
    
    explainability = await xai_service.build(
        query=query,
        answer=answer,
        agent_name="transaction_fraud_agent",
        trace_id=str(uuid.uuid4()),
        agent_confidence=0.94,
        db=db,
        tenant_id=str(current_user.tenant_id),
        crime_id=None,
        include_graph=True,
        include_timeline=True,
        include_related_cases=True,
        neo4j_driver=neo4j_driver,
    )
    
    return FraudPredictionResponse(
        fraud_probability=pred["fraud_probability"],
        mule_indicator=pred["mule_indicator"],
        action_recommendation=pred["action_recommendation"],
        model_version=pred["model_version"],
        explainability=explainability,
    )


# ── 5. General Prediction Explainability API ──────────────────

@router.post("/explain/prediction", response_model=ExplainabilityPayload)
async def explain_general_prediction(
    payload: ExplainPredictionRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exposes a general-purpose endpoint to request a complete explainability payload
    for any arbitrary query, case, or raw model prediction output.
    """
    answer = payload.raw_prediction or (
        f"AI completed analysis for: '{payload.query}' routing via {payload.agent_name}."
    )
    
    explainability = await xai_service.build(
        query=payload.query,
        answer=answer,
        agent_name=payload.agent_name,
        trace_id=str(uuid.uuid4()),
        agent_confidence=0.90,
        db=db,
        tenant_id=str(current_user.tenant_id),
        crime_id=payload.crime_id,
        include_graph=payload.include_graph,
        include_timeline=payload.include_timeline,
        include_related_cases=payload.include_related_cases,
        top_k_related=payload.top_k_related,
        top_k_documents=payload.top_k_documents,
        neo4j_driver=neo4j_driver,
    )
    
    return explainability
