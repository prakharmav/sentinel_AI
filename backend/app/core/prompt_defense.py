# ============================================================
# SentinelAI — Prompt Injection Protection (LLM Firewall)
#
# Detects and sanitizes adversarial instructions (ignore system
# instructions, jailbreak attempts, system override markers)
# to protect downstream Gemini nodes.
# ============================================================

from __future__ import annotations

import logging
import re
from typing import Tuple

logger = logging.getLogger("sentinelai.security")

# Jailbreak / Prompt Injection patterns
INJECTION_REGEXES = [
    r"(?i)ignore\s+(?:all\s+)?prior\s+instructions",
    r"(?i)system\s+override",
    r"(?i)you\s+are\s+no\s+longer\s+an?\s+AI",
    r"(?i)jailbreak",
    r"(?i)stop\s+following\s+rules",
    r"(?i)forget\s+what\s+you\s+were\s+told",
    r"(?i)switch\s+to\s+developer\s+mode",
    r"(?i)dan\s+mode",
    r"(?i)ignore\s+constraints",
]


def audit_ai_input(user_prompt: str) -> Tuple[bool, str]:
    """
    Scans raw user queries for prompt injection vectors.
    Returns: (is_blocked, sanitized_prompt_or_error_message).
    """
    if not user_prompt:
        return False, ""

    # Clean leading/trailing spaces
    cleaned = user_prompt.strip()

    for pattern in INJECTION_REGEXES:
        if re.search(pattern, cleaned):
            logger.warning(f"Blocked potential prompt injection vector matching: {pattern}")
            return True, "Potential prompt injection attempt blocked. Action logged."

    # XSS tag sanitisation in prompts
    cleaned_no_tags = re.sub(r"<[^>]*>", "", cleaned)
    
    return False, cleaned_no_tags
