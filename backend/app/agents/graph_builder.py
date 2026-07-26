# ============================================================
# SentinelAI — LangGraph StateGraph Builder
#
# Wires all agent nodes into a compiled LangGraph graph with:
#   - Conditional routing from coordinator
#   - Parallel fan-out for multi-domain queries
#   - Memory injection at graph entry
#   - Synthesis node for merging parallel results
#   - Fallback edge on error state
#   - Per-node retry (via tracing.async_retry decorator)
# ============================================================

from __future__ import annotations

import logging
from typing import Any, Dict, Literal

from langgraph.graph import StateGraph, END

from app.agents.state import AgentState
from app.agents.nodes import (
    memory_injector_node,
    coordinator_node,
    crime_agent_node,
    sql_agent_node,
    graph_agent_node,
    fraud_agent_node,
    citizen_agent_node,
    report_agent_node,
    synthesis_node,
    fallback_node,
)

logger = logging.getLogger("sentinelai.agents")


# ── Conditional Edge: Coordinator → Specialist(s) ────────────

def route_from_coordinator(
    state: AgentState,
) -> str:
    """
    Reads state['next_step'] set by the coordinator node and returns
    the graph edge label to follow.

    LangGraph calls this after the coordinator node completes and uses
    the returned string to select the next node.

    Returns:
        "crime_agent" | "sql_agent" | "graph_agent" | "fraud_agent" |
        "citizen_agent" | "report_agent" | "parallel" | "fallback"
    """
    next_step = state.get("next_step", "crime_agent")
    error = state.get("error")

    if error:
        return "fallback"

    if next_step.startswith("parallel:"):
        # e.g. "parallel:crime_agent,graph_agent"
        return "parallel"

    # Validate it's a known agent
    valid = {
        "crime_agent", "sql_agent", "graph_agent",
        "fraud_agent", "citizen_agent", "report_agent",
    }
    return next_step if next_step in valid else "crime_agent"


# ── Parallel Fan-out Node ─────────────────────────────────────

async def parallel_dispatch_node(state: AgentState) -> Dict[str, Any]:
    """
    Extracts the two agents from next_step "parallel:<a>,<b>" and
    runs them concurrently via asyncio.gather().
    Results accumulate into parallel_results via the Annotated[list, add] reducer.
    """
    import asyncio

    next_step = state.get("next_step", "")
    parts = next_step.replace("parallel:", "").split(",")

    node_map = {
        "crime_agent": crime_agent_node,
        "sql_agent": sql_agent_node,
        "graph_agent": graph_agent_node,
        "fraud_agent": fraud_agent_node,
        "citizen_agent": citizen_agent_node,
        "report_agent": report_agent_node,
    }

    tasks = [node_map[p.strip()](state) for p in parts if p.strip() in node_map]

    if not tasks:
        return {}

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Merge all valid results into one delta
    merged: Dict[str, Any] = {
        "messages": [],
        "citations": [],
        "routed_agents": [],
        "node_timings": [],
        "token_usage": [],
        "parallel_results": [],
    }
    for r in results:
        if isinstance(r, Exception):
            logger.error(f"Parallel agent failed: {r}")
            continue
        for key in merged:
            if key in r:
                merged[key].extend(r[key])

    return merged


# ── Conditional Edge: After Specialist → Synthesize or End ───

def route_after_agent(state: AgentState) -> str:
    """
    After a single-agent node runs:
    - If error present → fallback
    - If parallel_results has >1 entry → synthesize
    - Otherwise → END
    """
    if state.get("error"):
        return "fallback"
    if len(state.get("parallel_results", [])) > 1:
        return "synthesize"
    return "end"


# ── Graph Assembly ────────────────────────────────────────────

def build_graph() -> Any:
    """
    Assembles and compiles the full SentinelAI LangGraph StateGraph.

    Graph topology:
        START
          │
          ▼
      memory_injector
          │
          ▼
       coordinator ──── conditional ──► crime_agent ──► synthesize ──► END
                                    ├─► sql_agent   ──► synthesize ──► END
                                    ├─► graph_agent ──► synthesize ──► END
                                    ├─► fraud_agent ──► synthesize ──► END
                                    ├─► citizen_agent ► synthesize ──► END
                                    ├─► report_agent ► synthesize ──► END
                                    ├─► parallel ──────────────────►  synthesize ──► END
                                    └─► fallback ──────────────────► END
    """
    graph = StateGraph(AgentState)

    # ── Add nodes ──────────────────────────────────────────────
    graph.add_node("memory_injector", memory_injector_node)
    graph.add_node("coordinator", coordinator_node)
    graph.add_node("crime_agent", crime_agent_node)
    graph.add_node("sql_agent", sql_agent_node)
    graph.add_node("graph_agent", graph_agent_node)
    graph.add_node("fraud_agent", fraud_agent_node)
    graph.add_node("citizen_agent", citizen_agent_node)
    graph.add_node("report_agent", report_agent_node)
    graph.add_node("parallel", parallel_dispatch_node)
    graph.add_node("synthesize", synthesis_node)
    graph.add_node("fallback", fallback_node)

    # ── Entry point ────────────────────────────────────────────
    graph.set_entry_point("memory_injector")

    # ── Edges: memory → coordinator ───────────────────────────
    graph.add_edge("memory_injector", "coordinator")

    # ── Conditional routing from coordinator ──────────────────
    graph.add_conditional_edges(
        "coordinator",
        route_from_coordinator,
        {
            "crime_agent":   "crime_agent",
            "sql_agent":     "sql_agent",
            "graph_agent":   "graph_agent",
            "fraud_agent":   "fraud_agent",
            "citizen_agent": "citizen_agent",
            "report_agent":  "report_agent",
            "parallel":      "parallel",
            "fallback":      "fallback",
        },
    )

    # ── Each specialist → synthesize or end ───────────────────
    for agent in ["crime_agent", "sql_agent", "graph_agent",
                  "fraud_agent", "citizen_agent", "report_agent"]:
        graph.add_conditional_edges(
            agent,
            route_after_agent,
            {"synthesize": "synthesize", "fallback": "fallback", "end": END},
        )

    # ── Parallel fan-out → synthesize ─────────────────────────
    graph.add_conditional_edges(
        "parallel",
        route_after_agent,
        {"synthesize": "synthesize", "fallback": "fallback", "end": END},
    )

    # ── Synthesize → END ──────────────────────────────────────
    graph.add_edge("synthesize", END)

    # ── Fallback → END ────────────────────────────────────────
    graph.add_edge("fallback", END)

    compiled = graph.compile()
    logger.info("SentinelAI LangGraph StateGraph compiled successfully.")
    return compiled


# ── Singleton Compiled Graph ──────────────────────────────────
# Built once at import time; reused across all requests.
sentinel_graph = build_graph()
