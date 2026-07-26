import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("sentinelai")

class TelemetryMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Enforce or generate unique request tracing ID (Trace-ID)
        trace_id = request.headers.get("X-Request-ID")
        if not trace_id:
            trace_id = str(uuid.uuid4())
            
        # Attach to request state for use in routing logs
        request.state.trace_id = trace_id
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Request-ID"] = trace_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        
        logger.info(
            f"HTTP {request.method} {request.url.path} "
            f"Status: {response.status_code} "
            f"Latency: {process_time:.4f}s "
            f"Trace: {trace_id}"
        )
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client=None, requests_per_minute: int = 300):
        super().__init__(app)
        self.redis = redis_client
        self.limit = requests_per_minute

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.redis:
            return await call_next(request)
            
        # Identify requester via client host IP or tenant token
        client_ip = request.client.host if request.client else "unknown"
        redis_key = f"rate_limit:{client_ip}"
        
        try:
            current_requests = self.redis.get(redis_key)
            if current_requests and int(current_requests) >= self.limit:
                logger.warning(f"Rate limit hit for client {client_ip}.")
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": f"Too many requests. Limit is {self.limit} per minute.",
                            "request_id": getattr(request.state, "trace_id", str(uuid.uuid4())),
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                        }
                    },
                    headers={
                        "Retry-After": "60"
                    }
                )
            
            # Increment request counter
            pipe = self.redis.pipeline()
            pipe.incr(redis_key)
            pipe.expire(redis_key, 60)
            pipe.execute()
            
        except Exception as redis_err:
            # Fallback gracefully if Redis has transient connection failures
            logger.error(f"Redis rate limiting middleware error: {redis_err}")
            
        return await call_next(request)
