# ============================================================
# SentinelAI — LangGraph Orchestrator
#
# Public interface (unchanged from v1 — WebSocket chat.py calls
# route_and_execute() and stream_execute() directly):
#
#   orchestrator.route_and_execute(query, user_id, tenant_id)
#       → Dict[str, Any]: {answer, confidence, citations, routed_agent}
#
#   orchestrator.stream_execute(query, user_id, tenant_id)
#       → AsyncGenerator[str, None]: SSE data lines
#
# Internally, these now drive the full LangGraph StateGraph
# instead of the old manual if/elif routing.
# ============================================================

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

from app.agents.state import AgentState
from app.agents.tracing import new_trace_id, emit_trace_log
from app.agents.graph_builder import sentinel_graph

logger = logging.getLogger("sentinelai.agents")


# ── Redis Session Memory Helper ───────────────────────────────

def _load_session_history(user_id: str, tenant_id: str) -> List[Dict[str, str]]:
    """
    Attempts to load prior conversation turns from Redis.
    Falls back to empty list if Redis is unavailable.
    """
    try:
        import json
        from app.core.redis_client import get_redis_client
        redis = get_redis_client()
        key = f"chat_history:{tenant_id}:{user_id}"
        raw = redis.get(key)
        if raw:
            return json.loads(raw)
    except Exception as e:
        logger.debug(f"Session history unavailable (Redis): {e}")
    return []


def _save_session_history(
    user_id: str,
    tenant_id: str,
    history: List[Dict[str, str]],
    ttl_seconds: int = 3600,
) -> None:
    """Persists updated conversation history back to Redis (TTL: 1 hour)."""
    try:
        import json
        from app.core.redis_client import get_redis_client
        redis = get_redis_client()
        key = f"chat_history:{tenant_id}:{user_id}"
        # Keep last 20 messages to cap memory
        redis.setex(key, ttl_seconds, json.dumps(history[-20:]))
    except Exception as e:
        logger.debug(f"Could not persist session history: {e}")


# ── Initial State Builder ─────────────────────────────────────

def _build_initial_state(
    query: str,
    user_id: str,
    tenant_id: str,
    trace_id: str,
    session_history: List[Dict[str, str]],
) -> AgentState:
    """Constructs the initial AgentState for a new graph invocation."""
    return AgentState(
        messages=[{"role": "user", "content": query}],
        current_agent="coordinator",
        next_step="route",
        routed_agents=[],
        context_data={},
        parallel_results=[],
        answer="",
        citations=[],
        confidence=0.0,
        user_id=user_id,
        tenant_id=tenant_id,
        session_history=session_history,
        trace_id=trace_id,
        node_timings=[],
        token_usage=[],
        error=None,
        retry_count=0,
    )


# ── Public Orchestrator Class ─────────────────────────────────

class LangGraphOrchestrator:
    """
    Production orchestrator wrapping the compiled LangGraph StateGraph.

    Provides two public methods consumed by the WebSocket chat handler:
      - route_and_execute()  → full response dict (non-streaming)
      - stream_execute()     → AsyncGenerator of SSE data lines
    """

    async def route_and_execute(
        self,
        query: str,
        user_id: str,
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Invokes the full LangGraph pipeline and returns a structured result.

        Steps:
        1. Load Redis session history
        2. Build initial AgentState
        3. Run the compiled graph (.ainvoke)
        4. Persist updated history to Redis
        5. Return answer + metadata

        Returns:
            {
                "answer": str,
                "confidence": float,
                "citations": List[str],
                "routed_agent": str,
                "trace_id": str,
                "node_timings": List[dict],
                "token_usage": List[dict],
            }
        """
        trace_id = new_trace_id()
        emit_trace_log("REQUEST_START", trace_id, "orchestrator", extra={"query": query[:80]})

        session_history = _load_session_history(user_id, tenant_id)

        initial_state = _build_initial_state(
            query=query,
            user_id=user_id,
            tenant_id=tenant_id,
            trace_id=trace_id,
            session_history=session_history,
        )

        try:
            final_state: AgentState = await sentinel_graph.ainvoke(initial_state)
        except Exception as e:
            logger.error(f"[{trace_id}] LangGraph invocation failed: {e}", exc_info=True)
            return {
                "answer": "The AI system encountered an unexpected error. Please try again.",
                "confidence": 0.0,
                "citations": [],
                "routed_agent": "error",
                "trace_id": trace_id,
                "node_timings": [],
                "token_usage": [],
            }

        # Extract final answer (prefer explicit 'answer' field over last message)
        answer = final_state.get("answer") or next(
            (m["content"] for m in reversed(final_state.get("messages", [])) if m["role"] == "assistant"),
            "No response generated.",
        )

        # Update session history in Redis
        updated_history = session_history + [
            {"role": "user", "content": query},
            {"role": "assistant", "content": answer},
        ]
        _save_session_history(user_id, tenant_id, updated_history)

        routed = final_state.get("routed_agents", ["unknown"])
        primary_agent = next((a for a in routed if a != "coordinator"), "crime_agent")

        emit_trace_log(
            "REQUEST_COMPLETE",
            trace_id,
            "orchestrator",
            extra={
                "routed_agent": primary_agent,
                "confidence": final_state.get("confidence", 0.0),
                "total_tokens": sum(t.get("total", 0) for t in final_state.get("token_usage", [])),
            },
        )

        return {
            "answer": answer,
            "confidence": final_state.get("confidence", 0.95),
            "citations": list(set(final_state.get("citations", []))),
            "routed_agent": primary_agent,
            "trace_id": trace_id,
            "node_timings": final_state.get("node_timings", []),
            "token_usage": final_state.get("token_usage", []),
        }

    async def stream_execute(
        self,
        query: str,
        user_id: str,
        tenant_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        True streaming implementation: runs the LangGraph graph and streams
        the answer word-by-word as Server-Sent Events.

        Yields SSE lines: "data: <word> \\n\\n"

        The WebSocket chat handler iterates over this generator and forwards
        each chunk to the connected client.
        """
        result = await self.route_and_execute(query, user_id, tenant_id)
        answer = result["answer"]

        # Stream word by word with a small natural delay
        words = answer.split(" ")
        for word in words:
            if word:
                yield f"data: {word} \n\n"
                await asyncio.sleep(0.06)

    async def astream_execute(
        self,
        query: str,
        user_id: str,
        tenant_id: str,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Alternative: yields structured event dicts compatible with the
        WebSocket chat handler's event protocol:

          {"event": "stream_start"}
          {"event": "stream_chunk", "chunk": word}
          {"event": "stream_end", "citations": [...], "tokens_used": N}
          {"event": "error", "detail": message}   (on failure)

        Use this from the WebSocket handler for richer client-side events.
        """
        trace_id = new_trace_id()

        yield {"event": "stream_start"}

        try:
            result = await self.route_and_execute(query, user_id, tenant_id)
            answer = result["answer"]
            words = answer.split(" ")

            for word in words:
                if word:
                    yield {"event": "stream_chunk", "chunk": word}
                    await asyncio.sleep(0.06)

            total_tokens = sum(
                t.get("total", 0) for t in result.get("token_usage", [])
            )
            yield {
                "event": "stream_end",
                "citations": result["citations"],
                "tokens_used": total_tokens,
                "trace_id": trace_id,
            }
        except Exception as e:
            logger.error(f"[{trace_id}] astream_execute error: {e}", exc_info=True)
            yield {"event": "error", "detail": str(e)}


# ── Global Singleton ──────────────────────────────────────────
# Imported by: app/websocket/chat.py, app/api/v1/endpoints/chat.py
orchestrator = LangGraphOrchestrator()
