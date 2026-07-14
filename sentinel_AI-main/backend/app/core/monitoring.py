# ============================================================
# SentinelAI — Production Prometheus Metrics & Monitoring
#
# Declares Prometheus metrics for API endpoints, database queries,
# and LangGraph agent execution performance.
# ============================================================

from __future__ import annotations

import time
from contextlib import contextmanager
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry

# Explicitly create a registry for clean isolation
metrics_registry = CollectorRegistry()

# ── 1. API Monitoring Metrics ──────────────────────────────────

http_requests_total = Counter(
    "sentinelai_http_requests_total",
    "Total count of HTTP requests processed by SentinelAI API",
    ["method", "endpoint", "status"],
    registry=metrics_registry,
)

http_request_latency_seconds = Histogram(
    "sentinelai_http_request_latency_seconds",
    "HTTP request latency histogram in seconds",
    ["method", "endpoint"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
    registry=metrics_registry,
)

# ── 2. LangGraph Agent Performance Metrics ───────────────────

agent_runs_total = Counter(
    "sentinelai_agent_runs_total",
    "Total count of LangGraph agent executions",
    ["agent_name", "status"],
    registry=metrics_registry,
)

agent_node_latency_seconds = Histogram(
    "sentinelai_agent_node_latency_seconds",
    "Execution latency of LangGraph agent specialist nodes in seconds",
    ["agent_name", "node_name"],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0),
    registry=metrics_registry,
)

agent_tokens_total = Counter(
    "sentinelai_agent_tokens_total",
    "Total LLM tokens consumed by LangGraph agents",
    ["agent_name", "token_type"],  # token_type: input, output, total
    registry=metrics_registry,
)

# ── 3. Database & Cache Monitoring Metrics ────────────────────

database_queries_total = Counter(
    "sentinelai_db_queries_total",
    "Total SQL/Cypher database queries executed",
    ["db_type", "operation", "status"],  # db_type: postgresql, neo4j, redis
    registry=metrics_registry,
)

database_query_latency_seconds = Histogram(
    "sentinelai_db_query_latency_seconds",
    "Database query execution latency in seconds",
    ["db_type", "operation"],
    buckets=(0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5),
    registry=metrics_registry,
)

# ── 4. System & WebSocket Metrics ─────────────────────────────

active_websocket_connections = Gauge(
    "sentinelai_active_websocket_connections",
    "Active live analyst WebSocket connections",
    ["channel"],
    registry=metrics_registry,
)

triggered_alerts_total = Counter(
    "sentinelai_triggered_alerts_total",
    "Total counts of alerts triggered by the Alert Engine",
    ["detector", "severity"],
    registry=metrics_registry,
)


# ── Context Managers & Utilities ──────────────────────────────

@contextmanager
def record_db_latency(db_type: str, operation: str):
    """Context manager to record database query latencies."""
    start_time = time.perf_counter()
    status_label = "success"
    try:
        yield
    except Exception:
        status_label = "failure"
        raise
    finally:
        elapsed = time.perf_counter() - start_time
        database_query_latency_seconds.labels(db_type=db_type, operation=operation).observe(elapsed)
        database_queries_total.labels(db_type=db_type, operation=operation, status=status_label).inc()


@contextmanager
def record_agent_latency(agent_name: str, node_name: str):
    """Context manager to record LangGraph node execution latencies."""
    start_time = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start_time
        agent_node_latency_seconds.labels(agent_name=agent_name, node_name=node_name).observe(elapsed)
