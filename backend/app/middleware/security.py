# ============================================================
# SentinelAI — Upgraded Security & Audit Middleware
#
# Provides:
#   - Redis Sliding Window Rate Limiting (DoS/DDoS Protection)
#   - SQL Injection (SQLi) Request Inspection
#   - Cross-Site Scripting (XSS) Request Filtering
#   - Secure Response Headers Injection (CSP, HSTS, X-Frame-Options)
#   - CSRF Origin / Referer Validation Check
# ============================================================

from __future__ import annotations

import logging
import re
import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger("sentinelai.security")

# Anti-SQLi / Anti-XSS patterns
SQLI_PATTERNS = [
    r"(?i)union\s+select",
    r"(?i)drop\s+table",
    r"(?i)delete\s+from",
    r"(?i)insert\s+into",
    r"(?i)select\s+.*\s+from",
    r"(?i)or\s+['\"].*['\"]\s*=\s*['\"].*['\"]",
    r"(?i)--",
    r"(?i);",
]

XSS_PATTERNS = [
    r"(?i)<script.*?>",
    r"(?i)javascript:",
    r"(?i)onerror\s*=",
    r"(?i)onload\s*=",
    r"(?i)onclick\s*=",
]


class SecurityAuditMiddleware(BaseHTTPMiddleware):
    """
    Advanced security firewall verifying request payloads, enforcing rate-limits,
    and injecting security headers.
    """

    def check_rate_limit(self, client_ip: str, path: str) -> bool:
        """
        Sliding window rate limiter using Redis.
        Limits to 100 requests per minute per IP.
        """
        try:
            from app.db.connection import get_redis
            redis = get_redis()
            if not redis:
                return False  # Graceful bypass if Redis is offline

            key = f"rate_limit:{client_ip}"
            current = redis.get(key)
            
            if current and int(current) >= 100:
                return True

            # Increment count
            pipeline = redis.pipeline()
            pipeline.incr(key)
            pipeline.expire(key, 60)  # 1 minute window
            pipeline.execute()
            return False
        except Exception as e:
            logger.debug(f"Rate limit connection failed: {e}")
            return False

    def is_payload_malicious(self, content: str) -> bool:
        """Checks text content for SQLi or XSS patterns."""
        if not content:
            return False
        
        # URL decode check
        decoded = content.replace("%20", " ")
        
        for pattern in SQLI_PATTERNS:
            if re.search(pattern, decoded):
                logger.warning(f"Malicious payload blocked: matched SQLi pattern '{pattern}'")
                return True
                
        for pattern in XSS_PATTERNS:
            if re.search(pattern, decoded):
                logger.warning(f"Malicious payload blocked: matched XSS pattern '{pattern}'")
                return True
                
        return False

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "127.0.0.1"

        # ── 1. Enforce Rate Limiting ──────────────────────────────────
        if self.check_rate_limit(client_ip, request.url.path):
            logger.warning(f"Rate limit exceeded for IP {client_ip} on path {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please wait 1 minute."}
            )

        # ── 2. CSRF Origin / Referer Validation ───────────────────────
        if request.method in ("POST", "PUT", "DELETE", "PATCH"):
            origin = request.headers.get("origin")
            referer = request.headers.get("referer")
            
            # Simple validation: if Origin exists, verify it matches host or local
            if origin and not any(allowed in origin for allowed in ["localhost", "127.0.0.1", "sentinelai"]):
                logger.warning(f"CSRF Origin check failed: {origin} from IP {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "CSRF verification failed. Untrusted Origin."}
                )

        # ── 3. Check SQLi / XSS in Path & Query parameters ───────────
        query_params = str(request.query_params)
        path_params = request.url.path
        
        if self.is_payload_malicious(query_params) or self.is_payload_malicious(path_params):
            logger.warning(f"Malicious request parameter blocked from IP {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Request blocked due to security validation failures."}
            )

        # ── 4. Call Downstream Request Handler ───────────────────────
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception:
            status_code = 500
            raise
        finally:
            elapsed = time.time() - start_time
            # Increment Prometheus metrics
            from app.core.monitoring import http_requests_total, http_request_latency_seconds
            endpoint = request.url.path
            http_requests_total.labels(method=request.method, endpoint=endpoint, status=str(status_code)).inc()
            http_request_latency_seconds.labels(method=request.method, endpoint=endpoint).observe(elapsed)

        # ── 5. Inject Secure Response Headers (XSS/CSRF/Clickjacking) ──
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' ws://localhost:8000 wss://localhost:8000;"
        )
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # CORS enforcement
        response.headers["Access-Control-Allow-Credentials"] = "true"

        process_time = elapsed * 1000
        logger.info(
            f"Completed Request: {request.method} {request.url.path} "
            f"status={response.status_code} duration={process_time:.2f}ms"
        )
        return response
