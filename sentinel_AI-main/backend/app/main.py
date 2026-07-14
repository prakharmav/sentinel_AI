from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging
import time

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.connection import get_db, get_redis, get_graph
from app.middleware.security import SecurityAuditMiddleware
from app.websocket.alerts import router as websocket_router

# ── 1. Logging Setup ──
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger("sentinelai")
logger.info("Starting SentinelAI threat intelligence backend application...")

# ── 2. App Initialization ──
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SentinelAI — Threat Detection & Autonomous Response Platform Backend Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── 3. CORS Configuration ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 4. Custom Middleware Mounting ──
app.add_middleware(SecurityAuditMiddleware)

# ── 5. Health Check Endpoint ──
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Diagnostics"])
async def health_check(
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    graph = Depends(get_graph)
):
    """
    Core health diagnosis verifying database pool mappings, Redis cache networks, and Neo4j graphs connectivity.
    """
    db_status = "UP"
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Postgres health check failed: {e}")
        db_status = "DOWN"

    redis_status = "UP" if redis is not None else "DOWN"
    graph_status = "UP" if graph is not None else "DOWN"

    return {
        "status": "healthy" if (db_status == "UP" and redis_status == "UP") else "degraded",
        "timestamp": time.time(),
        "services": {
            "postgres_db": db_status,
            "redis_cache": redis_status,
            "neo4j_graph": graph_status
        }
    }

# ── 6. Routing Assemblies ──
# Rest APIs
app.include_router(api_router, prefix="/api/v1")
# Websockets Alerts Broadcast
app.include_router(websocket_router)
# Websockets Chat Controller
from app.websocket.chat import router as websocket_chat_router
app.include_router(websocket_chat_router)

# ── 7. Startup Actions (Migrations) ──
@app.on_event("startup")
async def startup_migrations():
    from app.db.connection import neo4j_driver
    from app.db.neo4j_migrations import run_neo4j_migrations
    logger.info("Initializing startup database migrations...")
    if neo4j_driver:
        run_neo4j_migrations(neo4j_driver)

# ── 8. Prometheus Metrics Endpoint ──
from fastapi import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from app.core.monitoring import metrics_registry

@app.get("/metrics", tags=["System Diagnostics"])
def prometheus_metrics():
    """
    Exposes system and agent latency telemetry metrics to Prometheus scraper engines.
    """
    return Response(content=generate_latest(metrics_registry), media_type=CONTENT_TYPE_LATEST)


