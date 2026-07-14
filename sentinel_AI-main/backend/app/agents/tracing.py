# ============================================================
# SentinelAI — Agent Tracing & Observability
# Provides: per-request trace_id, per-node timing, token
# counting, structured JSON logging, and an OpenTelemetry-
# compatible span helper.
# ============================================================

import uuid
import time
import logging
import json
from functools import wraps
from typing import Any, Callable, Dict, Optional
from contextlib import asynccontextmanager

logger = logging.getLogger("sentinelai.agents")


# ── 1. Trace ID Factory ───────────────────────────────────────

def new_trace_id() -> str:
    """Generate a new UUID4 trace identifier for a request."""
    return str(uuid.uuid4())


# ── 2. Structured JSON Log Emitter ───────────────────────────

def emit_trace_log(
    event: str,
    trace_id: str,
    node: str,
    extra: Optional[Dict[str, Any]] = None,
    level: str = "INFO",
):
    """
    Emits a structured JSON log line compatible with OpenTelemetry collectors
    and any log aggregator (Loki, Datadog, CloudWatch, etc.).
    """
    record = {
        "event": event,
        "trace_id": trace_id,
        "node": node,
        "timestamp": time.time(),
        **(extra or {}),
    }
    log_fn = getattr(logger, level.lower(), logger.info)
    log_fn(json.dumps(record))


# ── 3. Node Timer Context Manager ────────────────────────────

@asynccontextmanager
async def timed_node(node_name: str, trace_id: str):
    """
    Async context manager that measures wall-clock execution time of a
    LangGraph node and emits structured entry/exit log events.

    Usage:
        async with timed_node("crime_agent", state["trace_id"]) as timing:
            result = await do_work()
        duration_ms = timing["duration_ms"]
    """
    timing: Dict[str, Any] = {"node": node_name, "duration_ms": 0.0}
    emit_trace_log("NODE_ENTER", trace_id, node_name)
    start = time.perf_counter()
    try:
        yield timing
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        timing["duration_ms"] = round(elapsed_ms, 2)
        emit_trace_log(
            "NODE_EXIT",
            trace_id,
            node_name,
            extra={"duration_ms": timing["duration_ms"]},
        )


# ── 4. Token Counter ──────────────────────────────────────────

def count_tokens(text: str) -> int:
    """
    Heuristic token estimator (~1.3 tokens/word, consistent with GPT-family).
    Used when the Gemini API does not return exact token counts.
    """
    if not text:
        return 0
    return int(len(text.strip().split()) * 1.3)


def build_token_record(node: str, prompt: str, response: str) -> Dict[str, int]:
    """Return a token usage dict for appending to state['token_usage']."""
    return {
        "node": node,
        "input": count_tokens(prompt),
        "output": count_tokens(response),
        "total": count_tokens(prompt) + count_tokens(response),
    }


# ── 5. Retry Decorator (async) ────────────────────────────────

def async_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    exceptions: tuple = (Exception,),
):
    """
    Decorator for async node functions. Retries on transient errors with
    exponential back-off. On final failure raises the last exception so the
    LangGraph error edge can route to the fallback node.
    """
    import asyncio

    def decorator(fn: Callable):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            last_exc: Optional[Exception] = None
            delay = base_delay
            for attempt in range(max_retries):
                try:
                    return await fn(*args, **kwargs)
                except exceptions as exc:
                    last_exc = exc
                    logger.warning(
                        f"[{fn.__name__}] attempt {attempt + 1}/{max_retries} failed: {exc}"
                    )
                    if attempt < max_retries - 1:
                        await asyncio.sleep(delay)
                        delay *= 2
            raise last_exc  # type: ignore[misc]

        return wrapper

    return decorator


# ── 6. Fallback Response Builder ──────────────────────────────

def build_fallback_response(node_name: str, error: Exception) -> Dict[str, Any]:
    """
    Produces a safe, structured fallback response when a node exhausts all
    retries. Prevents None propagation that would break downstream nodes.
    """
    return {
        "messages": [
            {
                "role": "assistant",
                "content": (
                    f"⚠ The {node_name} agent encountered an issue and could not "
                    f"complete your request. Our team has been notified. "
                    f"Error reference: {type(error).__name__}"
                ),
            }
        ],
        "citations": [f"Fallback: {node_name}"],
        "confidence": 0.0,
        "error": str(error),
    }
