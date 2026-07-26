# ============================================================
# SentinelAI — LangGraph Agent State
# Single source of truth for the graph execution context.
# Flows through every node in the StateGraph unchanged except
# for the fields that each node explicitly mutates.
# ============================================================

from typing import List, Dict, Any, Optional, TypedDict, Annotated
import operator


class AgentState(TypedDict, total=False):
    """
    Full execution state passed through every LangGraph node.

    Fields tagged with operator.add are append-only (LangGraph reduces them
    by calling add() across parallel branches, so they accumulate safely).
    All other fields are last-writer-wins across sequential nodes.
    """

    # ── Core conversation ─────────────────────────────────
    messages: Annotated[List[Dict[str, str]], operator.add]
    """Append-only chat turn list: [{"role": "user"|"assistant"|"system", "content": str}]"""

    # ── Routing ────────────────────────────────────────────
    current_agent: str
    """Name of the specialist agent currently executing."""

    next_step: str
    """Signal to LangGraph conditional edges: 'route' | agent name | 'synthesize' | 'end'"""

    routed_agents: Annotated[List[str], operator.add]
    """Accumulates names of all agents invoked in this request (for multi-agent tracing)."""

    # ── Context payload ────────────────────────────────────
    context_data: Dict[str, Any]
    """Structured data accumulated from tool/DB calls within nodes."""

    parallel_results: Annotated[List[Dict[str, Any]], operator.add]
    """Results from parallel fan-out agents, merged by the synthesis node."""

    # ── Output ─────────────────────────────────────────────
    answer: str
    """Final synthesised answer returned to the WebSocket caller."""

    citations: Annotated[List[str], operator.add]
    """Accumulated source citations from all agent nodes."""

    confidence: float
    """Overall confidence score (0.0–1.0) of the final answer."""

    # ── Auth / tenancy ─────────────────────────────────────
    user_id: str
    tenant_id: str

    # ── Memory ─────────────────────────────────────────────
    session_history: List[Dict[str, str]]
    """Redis-loaded prior conversation turns injected at graph entry."""

    # ── Tracing & observability ────────────────────────────
    trace_id: str
    """UUID tied to this single request, logged on every node entry/exit."""

    node_timings: Annotated[List[Dict[str, Any]], operator.add]
    """Per-node timing records: [{"node": str, "duration_ms": float}]"""

    token_usage: Annotated[List[Dict[str, int]], operator.add]
    """Per-Gemini-call token counts: [{"node": str, "input": int, "output": int}]"""

    # ── Error handling ─────────────────────────────────────
    error: Optional[str]
    """Set by any node on non-retryable failure; triggers the fallback edge."""

    retry_count: int
    """Tracks how many retries have been attempted for the current node."""
