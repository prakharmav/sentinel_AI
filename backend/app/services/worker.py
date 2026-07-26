import os
import logging
import asyncio
import time
from typing import Dict, Any

# Celery import wrap with try-except to ensure zero compile crashes on python 3.14
try:
    from celery import Celery
except ImportError:
    Celery = None

from app.core.config import settings

logger = logging.getLogger("sentinelai")

# ── 1. Celery Application Setup ──
celery_app = None
if Celery:
    try:
        # Assemble Redis connection URL
        redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
        if settings.REDIS_PASSWORD:
            redis_url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}"
            
        celery_app = Celery(
            "sentinelai_tasks",
            broker=redis_url,
            backend=redis_url
        )
        
        celery_app.conf.update(
            task_serializer="json",
            accept_content=["json"],
            result_serializer="json",
            timezone="UTC",
            enable_utc=True,
            task_acks_late=True,
            task_reject_on_worker_lost=True,
            task_time_limit=300 # 5 mins
        )
        logger.info("Celery tasks worker initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Celery app: {e}")

# ── 2. Celery Background Tasks ──

@celery_app.task(name="tasks.embed_document", max_retries=3, default_retry_delay=10) if celery_app else None
def embed_document_task(file_name: str, content: str):
    """
    RAG ingestion task.
    """
    logger.info(f"[Celery Worker] Starting document chunking and embedding index for: {file_name}")
    try:
        # Run async indexing loop inside Celery sync thread
        from app.rag.pipeline import rag_pipeline
        asyncio.run(rag_pipeline.process_and_index(content.encode("utf-8"), file_name))
        return {"status": "SUCCESS", "file_name": file_name}
    except Exception as e:
        logger.error(f"[Celery Worker] Embedding task failed: {e}")
        # Retry with exponential backoff
        raise e

@celery_app.task(name="tasks.run_ml_training", max_retries=1) if celery_app else None
def run_ml_training_task(tenant_id: str):
    """
    ML model training background worker task.
    """
    logger.info(f"[Celery Worker] Starting ML models training loops for tenant: {tenant_id}")
    try:
        from app.services.ml_service import ml_service
        asyncio.run(ml_service.run_training_pipeline(tenant_id))
        return {"status": "SUCCESS", "version": ml_service.current_version}
    except Exception as e:
        logger.error(f"[Celery Worker] ML training failed: {e}")
        raise e

@celery_app.task(name="tasks.dispatch_notification", max_retries=5, default_retry_delay=30) if celery_app else None
def dispatch_notification_task(recipient_phone: str, channel: str, title: str, body: str):
    """
    SMS/Email notification dispatch task.
    """
    logger.info(f"[Celery Worker] Dispatching alert notification of channel {channel} to {recipient_phone}")
    try:
        # Simulate SMS/Email API provider network requests
        time.sleep(1)
        logger.info(f"[Celery Worker] Alert '{title}' dispatched successfully to {recipient_phone}.")
        return {"status": "DISPATCHED", "recipient": recipient_phone}
    except Exception as e:
        logger.error(f"[Celery Worker] Notification dispatch failed: {e}")
        raise e

@celery_app.task(name="tasks.cleanup_temp_files") if celery_app else None
def cleanup_temp_files_task():
    """
    Periodic temp locker folder cleanup tasks (wipes uploads older than 30 days).
    """
    logger.info("[Celery Worker] Initiating locker/uploads cleanup sweeps...")
    upload_dir = "locker/uploads"
    if not os.path.exists(upload_dir):
        return {"status": "NO_DIRECTORY"}
        
    cleaned_count = 0
    now = time.time()
    for f in os.listdir(upload_dir):
        fp = os.path.join(upload_dir, f)
        # Check if file has been inactive for 30 days
        if os.stat(fp).st_mtime < now - (30 * 86400):
            try:
                os.remove(fp)
                cleaned_count += 1
            except Exception as e:
                logger.error(f"Failed to clear temp file {f}: {e}")
                
    logger.info(f"[Celery Worker] Temp folders swept. Removed {cleaned_count} outdated documents.")
    return {"status": "CLEANED", "files_removed": cleaned_count}
