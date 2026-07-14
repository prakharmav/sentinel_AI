# ============================================================
# SentinelAI — Voice AI Schemas
#
# Schemas to support voice transcription, translation, and
# synthesis in English, Kannada, and Hindi.
# ============================================================

from __future__ import annotations

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


# ── 1. Voice Interaction Input ───────────────────────────────

class VoiceInteractResponse(BaseModel):
    """
    Unified response representing the Voice AI interaction result.
    """
    language: Literal["en", "kn", "hi"] = Field(..., description="Detected language code")
    transcription: str = Field(..., description="Transcribed query text")
    stt_confidence: float = Field(..., ge=0.0, le=1.0, description="STT speech confidence score")
    
    # LangGraph pipeline responses
    routed_agent: str
    text_answer: str
    
    # Text to Speech outputs
    audio_base64: str = Field(..., description="Base64 encoded MP3 audio bytes of synthesized answer")
    audio_format: str = "mp3"
    
    # Observability
    noise_reduction_applied: bool = True
    processing_time_ms: float
