# ============================================================
# SentinelAI — Data Encryption Service
#
# Provides AES-256 Fernet symmetric encryption for sensitive
# database fields (Aadhaar, PAN, phone numbers).
# ============================================================

from __future__ import annotations

import base64
import logging
from typing import Optional
from cryptography.fernet import Fernet

from app.core.config import settings

logger = logging.getLogger("sentinelai.security")

# Enforce stable encryption key.
# Fallback to a derived key if SECRET_KEY is not a valid 32-byte urlsafe base64.
try:
    # Fernet key must be a 32-byte urlsafe base64-encoded string
    key_bytes = settings.SECRET_KEY.encode("utf-8")
    if len(key_bytes) < 32:
        # Pad or extend to 32 bytes
        key_bytes = key_bytes.ljust(32, b"0")[:32]
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    fernet = Fernet(fernet_key)
except Exception as e:
    logger.error(f"Fernet cryptographic init failed: {e}. Fallback to transient key.")
    fernet = Fernet(Fernet.generate_key())


def encrypt_data(plain_text: Optional[str]) -> Optional[str]:
    """Encrypts plain text string to Fernet cipher text."""
    if not plain_text:
        return None
    try:
        cipher_bytes = fernet.encrypt(plain_text.encode("utf-8"))
        return cipher_bytes.decode("utf-8")
    except Exception as e:
        logger.error(f"Data encryption failed: {e}")
        return None


def decrypt_data(cipher_text: Optional[str]) -> Optional[str]:
    """Decrypts Fernet cipher text back to plain text."""
    if not cipher_text:
        return None
    try:
        plain_bytes = fernet.decrypt(cipher_text.encode("utf-8"))
        return plain_bytes.decode("utf-8")
    except Exception as e:
        logger.error(f"Data decryption failed: {e}")
        return None
