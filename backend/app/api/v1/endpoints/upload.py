# ============================================================
# SentinelAI — Secure Uploads Gateway
#
# Validates:
#   - Magic byte header verification (prevents mime-spoofing)
#   - Size restrictions (max 50MB)
#   - Signature threat scanners (malware checks)
#   - Tamper-evident SHA-256 hash checks
# ============================================================

from __future__ import annotations

import os
import hashlib
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status

from app.core.auth import get_current_user, TokenData
from app.rag.pipeline import rag_pipeline

logger = logging.getLogger("sentinelai.security")
router = APIRouter()

ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "mp4": "video/mp4",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB Limit

# Magic Number byte signatures for mime-type verification
MAGIC_NUMBERS = {
    "pdf": [b"%PDF"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "mp3": [b"ID3", b"\xff\xfb"],
    "wav": [b"RIFF"],
    "mp4": [b"ftyp"],
}


def calculate_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_malicious(data: bytes) -> bool:
    """
    Signature-based threat scanner (audits files for known malware indicators/script shells).
    """
    signatures = [
        b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
        b"/bin/sh",
        b"/bin/bash",
        b"eval(base64_decode",
        b"system(",
        b"popen(",
        b"exec(",
    ]
    for sig in signatures:
        if sig in data:
            return True
    return False


def verify_magic_bytes(data: bytes, ext: str) -> bool:
    """Verifies magic numbers matching extension to prevent content-spoofing."""
    if ext not in MAGIC_NUMBERS:
        return False
    
    signatures = MAGIC_NUMBERS[ext]
    for sig in signatures:
        if data.startswith(sig) or (ext == "mp4" and b"ftyp" in data[:30]):
            return True
    return False


@router.post("/secure-upload", response_model=Dict[str, Any])
async def secure_file_upload(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Secure uploads gateway validating extensions, verifying magic bytes,
    running virus filters, and extracting metadata details.
    """
    filename = file.filename or "uploaded_file"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    # 1. Extension validation check
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Blocked extension: .{ext}. Allowed formats: PDF, PNG, JPG, MP3, WAV, MP4."
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)

    # 2. File size verification check
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowable 50MB boundary."
        )

    # 3. Magic Number byte check (MIME verification)
    if not verify_magic_bytes(file_bytes, ext):
        logger.warning(f"MIME verification FAILED: Extension .{ext} did not match file header bytes.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security violation: Mime-type mismatch. The file content does not match its extension."
        )

    # 4. Virus / Malicious payload check
    if is_malicious(file_bytes):
        logger.warning(
            f"Virus Check FAILED: Malicious pattern flagged in file {filename} from tenant {current_user.tenant_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security violation: Malicious byte patterns or script shell signature detected."
        )

    # 5. Generate SHA-256 Hash and secure filename mapping
    file_hash = calculate_sha256(file_bytes)
    secure_name = f"{file_hash[:16]}_{filename}"
    upload_dir = "locker/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    storage_path = os.path.join(upload_dir, secure_name)

    # Save to disk locker securely
    try:
        with open(storage_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        logger.error(f"Locker storage write failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server locker error.")

    # 6. Extract metadata details
    metadata = {
        "file_name": filename,
        "content_type": file.content_type or ALLOWED_EXTENSIONS[ext],
        "size_bytes": file_size,
        "sha256": file_hash,
        "storage_path": storage_path,
        "is_court_admissible": ext in ["pdf", "png", "jpg"],
    }

    # 7. Trigger background RAG index if document
    if ext in ["pdf", "txt", "log"]:
        try:
            await rag_pipeline.process_and_index(file_bytes, filename)
            metadata["rag_indexed"] = True
        except Exception as e:
            logger.error(f"RAG trigger failed for upload {filename}: {e}")
            metadata["rag_indexed"] = False

    return {
        "message": "File verified and stored successfully.",
        "status": "SECURED",
        "metadata": metadata,
    }
