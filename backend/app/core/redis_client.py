# ============================================================
# SentinelAI — Redis Client Helper
# Provides a lazy-initialized, singleton Redis connection.
# Falls back gracefully if Redis is unreachable.
# ============================================================

import logging
from typing import Optional

import redis as redis_lib

from app.core.config import settings

logger = logging.getLogger("sentinelai")

_redis_client: Optional[redis_lib.Redis] = None


def get_redis_client() -> redis_lib.Redis:
    """
    Returns the global Redis client, initialising it on first call.
    Raises ConnectionError if Redis is unreachable so callers can
    catch it and degrade gracefully.
    """
    global _redis_client
    if _redis_client is None:
        url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
        if settings.REDIS_PASSWORD:
            url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}"
        _redis_client = redis_lib.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
    return _redis_client


def redis_ping() -> bool:
    """Returns True if Redis is reachable."""
    try:
        return get_redis_client().ping()
    except Exception:
        return False
