# ============================================================
# SentinelAI — Voice AI API Router Endpoints
#
# Wires:
#   - POST /voice/interact (Processes STT -> LangGraph -> TTS)
#   - POST /voice/synthesize (Direct TTS synthesis)
# ============================================================

from __future__ import annotations

import logging
import base64
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import StreamingResponse
import io

from app.core.auth import get_current_user, TokenData
from app.schemas.voice import VoiceInteractResponse
from app.services.voice_ai_service import voice_ai_service

logger = logging.getLogger("sentinelai.voice")
router = APIRouter()


# ── 1. Voice Interaction Pipeline ────────────────────────────

@router.post("/interact", response_model=VoiceInteractResponse)
async def voice_ai_interaction(
    audio_file: UploadFile = File(..., description="WAV/MP3 audio recording containing the spoken query"),
    language_hint: str = Form("en", description="Expected language: en | kn | hi"),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Unified Voice AI pipeline endpoint:
    Accepts raw spoken audio, performs noise reduction and transcribes it,
    runs the LangGraph specialist agent router, queries PostgreSQL/Neo4j,
    and returns the text answer alongside the base64-encoded synthesized speech audio stream.
    """
    logger.info(f"Received spoken audio from user {current_user.user_id} (Hint language: {language_hint})")
    
    # Read audio bytes
    try:
        audio_bytes = await audio_file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read audio file input stream: {e}"
        )
        
    try:
        response = await voice_ai_service.execute_voice_pipeline(
            audio_bytes=audio_bytes,
            user_id=str(current_user.user_id),
            tenant_id=str(current_user.tenant_id),
            language_hint=language_hint,
        )
        return response
    except Exception as e:
        logger.error(f"Voice interaction pipeline failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice AI transaction processor failed: {e}"
        )


# ── 2. Speech Synthesis (Text to Speech Stream) ──────────────

@router.post("/synthesize")
async def voice_speech_synthesis(
    text: str = Form(..., description="Text content to synthesize"),
    language: str = Form("en", description="Target language: en | kn | hi")
):
    """
    Converts any text into synthesized speech (MP3) and returns it as a streaming audio response.
    Supports English, Kannada, and Hindi.
    """
    logger.info(f"Voice synthesis triggered for language {language}: '{text[:50]}...'")
    try:
        audio_b64 = voice_ai_service.text_to_speech(text, language)
        if not audio_b64:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Speech synthesis engine returned empty stream."
            )
            
        audio_bytes = base64.b64decode(audio_b64)
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text-to-Speech stream synthesis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis engine failed: {e}"
        )
