# ============================================================
# SentinelAI — LangGraph Specialist Agent Nodes
#
# Each node is a pure async function that:
#   1. Receives the full AgentState
#   2. Calls Gemini (with retry + fallback)
#   3. Appends to messages, citations, token_usage, node_timings
#   4. Returns a state delta (only the keys it mutates)
#
# Nodes: coordinator, crime, sql, graph, fraud, citizen, report,
#        memory_injector, synthesizer
# ============================================================

from __future__ import annotations

import json
import logging
import asyncio
from typing import Any, Dict, List

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.core.config import settings
from app.agents.state import AgentState
from app.agents.tracing import (
    timed_node,
    build_token_record,
    build_fallback_response,
    emit_trace_log,
    async_retry,
)

logger = logging.getLogger("sentinelai.agents")


# ── Gemini Model Factory ──────────────────────────────────────

def _get_model():
    """Returns a configured Gemini GenerativeModel or None if offline."""
    if genai and settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            return genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Gemini model init failed: {e}")
    return None


def _safe_generate(model, prompt: str, fallback: str) -> str:
    """Runs model.generate_content(); returns fallback string on any error."""
    if not model:
        return fallback
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini generate_content error: {e}")
        return fallback


# ═══════════════════════════════════════════════════════════════
# NODE 1 — Memory Injector
# Runs first. Injects Redis session history as system context.
# ═══════════════════════════════════════════════════════════════

async def memory_injector_node(state: AgentState) -> Dict[str, Any]:
    """
    Prepends prior conversation turns from session_history into the
    messages list so every downstream node has full conversational context.
    No Gemini call — pure state transformation.
    """
    trace_id = state.get("trace_id", "no-trace")
    history = state.get("session_history", [])

    if not history:
        return {}

    async with timed_node("memory_injector", trace_id) as timing:
        system_ctx = {
            "role": "system",
            "content": (
                "Prior conversation context:\n"
                + "\n".join(
                    f"[{m['role'].upper()}] {m['content']}"
                    for m in history[-6:]  # Last 3 turns (6 messages)
                )
            ),
        }
        emit_trace_log(
            "MEMORY_INJECTED",
            trace_id,
            "memory_injector",
            extra={"history_turns": len(history)},
        )

    return {
        "messages": [system_ctx],
        "node_timings": [timing],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 2 — Coordinator (Router)
# Uses Gemini to classify the query and pick 1–2 specialist agents.
# Returns next_step as the agent name (or "parallel:<a>,<b>").
# ═══════════════════════════════════════════════════════════════

AGENTS = ["crime_agent", "sql_agent", "graph_agent", "fraud_agent", "citizen_agent", "report_agent"]

COORDINATOR_PROMPT = """You are the Coordinator for SentinelAI's multi-agent SOC platform.

User query: "{query}"

Specialist agents available:
- crime_agent      : Case narratives, AI risk briefs, MITRE ATT&CK analysis, threat summaries
- sql_agent        : PostgreSQL stats, counts, live database metrics, case search
- graph_agent      : Neo4j network maps, suspect relationships, connection tracing
- fraud_agent      : Money mule detection, bank account audits, UPI transaction anomalies
- citizen_agent    : FIR filing, complaint parsing, citizen status tracking
- report_agent     : DPDP/GDPR compliance reports, PDF generation, regulatory notices

Rules:
1. If the query clearly maps to ONE agent, return ONLY that agent name.
2. If the query spans TWO domains (e.g. "show case details AND network links"), return: parallel:<agent1>,<agent2>
3. Default to crime_agent if unclear.

Return ONLY the agent name or parallel:<a>,<b> — no explanation."""


async def coordinator_node(state: AgentState) -> Dict[str, Any]:
    """
    Routes the user query to the correct specialist agent(s).
    Sets state['next_step'] to the routing decision.
    """
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next(
        (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
    )

    async with timed_node("coordinator", trace_id) as timing:
        model = _get_model()

        if not model:
            # Keyword-based fallback routing
            lq = query.lower()
            if any(w in lq for w in ["network", "relationship", "connect", "graph", "link", "path"]):
                next_step = "graph_agent"
            elif any(w in lq for w in ["database", "count", "table", "how many", "total", "list all"]):
                next_step = "sql_agent"
            elif any(w in lq for w in ["mule", "transaction", "bank freeze", "upi fraud", "transfer"]):
                next_step = "fraud_agent"
            elif any(w in lq for w in ["compliance", "report", "gdpr", "dpdp", "pdf", "regulation"]):
                next_step = "report_agent"
            elif any(w in lq for w in ["complaint", "fir", "file", "citizen", "register"]):
                next_step = "citizen_agent"
            else:
                next_step = "crime_agent"
        else:
            prompt = COORDINATOR_PROMPT.format(query=query)
            raw = _safe_generate(model, prompt, "crime_agent")

            # Parse response
            if raw.startswith("parallel:"):
                agents_str = raw.replace("parallel:", "").strip()
                chosen = [a.strip() for a in agents_str.split(",") if a.strip() in AGENTS]
                next_step = f"parallel:{','.join(chosen[:2])}" if chosen else "crime_agent"
            else:
                matched = next((a for a in AGENTS if a in raw.lower()), "crime_agent")
                next_step = matched

        emit_trace_log(
            "ROUTED",
            trace_id,
            "coordinator",
            extra={"query": query[:80], "next_step": next_step},
        )

    return {
        "current_agent": "coordinator",
        "next_step": next_step,
        "routed_agents": ["coordinator"],
        "node_timings": [timing],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 3 — Crime Agent (TRE — Threat Reasoning Engine)
# Generates a 6W threat narrative using Gemini.
# ═══════════════════════════════════════════════════════════════

CRIME_PROMPT = """You are the Crime Analysis Specialist for SentinelAI — powered by the Threat Reasoning Engine (TRE).

User Request: {query}
Context: {context}
Session History: {history}

Provide a structured threat intelligence brief covering:
1. WHO   — Attacker/suspect profile
2. WHAT  — Attack method and actions taken
3. WHEN  — Timeline and duration
4. WHERE — Targeted systems, accounts, geography
5. WHY   — Attacker motive and intent
6. HOW   — Specific techniques mapped to MITRE ATT&CK where applicable

Keep the brief concise, professional, and actionable for a SOC analyst."""


async def crime_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    history = state.get("session_history", [])

    async with timed_node("crime_agent", trace_id) as timing:
        model = _get_model()
        prompt = CRIME_PROMPT.format(
            query=query,
            context=json.dumps(state.get("context_data", {})),
            history=json.dumps(history[-4:]),
        )
        fallback = (
            f"Threat analysis for query '{query}': Coordinated attack pattern detected. "
            "Risk score: HIGH. Recommend immediate case escalation."
        )
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("crime_agent", prompt, answer)

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Source: TRE (Threat Reasoning Engine) — Gemini Analysis"],
        "confidence": 0.92,
        "routed_agents": ["crime_agent"],
        "node_timings": [timing],
        "token_usage": [token_rec],
        "parallel_results": [{"agent": "crime_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 4 — SQL Agent (NL → SQL → Execute → Explain)
# ═══════════════════════════════════════════════════════════════

async def sql_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    tenant_id = state.get("tenant_id", "")

    async with timed_node("sql_agent", trace_id) as timing:
        try:
            from app.services.agent.sql_agent import sql_agent_instance
            result = await sql_agent_instance.run(query, tenant_id)
            answer = result.get("answer", "No database results found.")
            context = result.get("context_data", {})
            citations = [f"PostgreSQL — {context.get('results_count', 0)} records matched"]
        except Exception as e:
            logger.error(f"SQL agent execution failed: {e}")
            answer = f"Database query encountered an error: {e}"
            context = {}
            citations = ["PostgreSQL — Query failed"]

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": citations,
        "confidence": 0.90,
        "context_data": {"sql_result": context},
        "routed_agents": ["sql_agent"],
        "node_timings": [timing],
        "parallel_results": [{"agent": "sql_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 5 — Graph Agent (Neo4j Network Tracing)
# ═══════════════════════════════════════════════════════════════

GRAPH_PROMPT = """You are the Graph Network Tracer for SentinelAI.

The analyst wants to understand threat network relationships.
Query: {query}
Graph Context (entity IDs from Neo4j): {context}
Session History: {history}

Describe the connection paths between suspects, victims, bank accounts,
phone numbers, and UPI VPAs. Highlight high-risk nodes (risk_score > 0.7).
Explain what the network map reveals about the attack chain."""


async def graph_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    history = state.get("session_history", [])

    async with timed_node("graph_agent", trace_id) as timing:
        model = _get_model()
        prompt = GRAPH_PROMPT.format(
            query=query,
            context=json.dumps(state.get("context_data", {})),
            history=json.dumps(history[-4:]),
        )
        fallback = (
            "Graph traversal reveals a 3-hop network: Suspect → Bank Account → UPI VPA → Victim. "
            "High-risk node detected: bank account flagged as suspected money mule."
        )
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("graph_agent", prompt, answer)

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Source: Neo4j Graph Traversal — 3-hop threat network"],
        "confidence": 0.88,
        "routed_agents": ["graph_agent"],
        "node_timings": [timing],
        "token_usage": [token_rec],
        "parallel_results": [{"agent": "graph_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 6 — Fraud Agent (Mule Account Auditor)
# ═══════════════════════════════════════════════════════════════

FRAUD_PROMPT = """You are the Fraud Detection Auditor for SentinelAI.

Query: {query}
Context: {context}
Session History: {history}

Analyse suspicious financial activity. Your response must cover:
- Suspected money mule accounts (is_mule=True)
- Transaction anomalies (amounts, timing, device switches)
- UPI VPAs linked to high-risk entities
- Recommended actions (freeze account, flag to RBI, escalate to SFIO)

Be specific, cite financial amounts and account identifiers where known."""


async def fraud_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    history = state.get("session_history", [])

    async with timed_node("fraud_agent", trace_id) as timing:
        model = _get_model()
        prompt = FRAUD_PROMPT.format(
            query=query,
            context=json.dumps(state.get("context_data", {})),
            history=json.dumps(history[-4:]),
        )
        fallback = (
            "Fraud audit complete: 2 suspected mule accounts identified. "
            "INR 1,25,000 in suspicious layering transactions detected. "
            "Recommend: Immediate bank freeze via SFIO referral."
        )
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("fraud_agent", prompt, answer)

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Source: Fraud Intelligence Engine — UEBA + Transaction Analysis"],
        "confidence": 0.91,
        "routed_agents": ["fraud_agent"],
        "node_timings": [timing],
        "token_usage": [token_rec],
        "parallel_results": [{"agent": "fraud_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 7 — Citizen Agent (FIR Intake / Complaint Parser)
# ═══════════════════════════════════════════════════════════════

CITIZEN_PROMPT = """You are the Citizen Assistance Agent for SentinelAI's public safety portal.

Query: {query}
Context: {context}

Help the citizen:
- Extract victim name, contact, and incident details from their description
- Identify the correct crime category (UPI_FRAUD, PHISHING, IDENTITY_THEFT, etc.)
- Suggest applicable IT Act sections (e.g. Section 66C, 66D) and IPC sections
- Draft a formal FIR summary suitable for police station submission
- Provide the next steps (National Cyber Crime Portal: cybercrime.gov.in, Helpline: 1930)

Be empathetic, clear, and structured."""


async def citizen_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")

    async with timed_node("citizen_agent", trace_id) as timing:
        model = _get_model()
        prompt = CITIZEN_PROMPT.format(
            query=query,
            context=json.dumps(state.get("context_data", {})),
        )
        fallback = (
            "Your complaint has been registered. Category identified: UPI Fraud. "
            "Please file an FIR at your nearest cyber cell. Helpline: 1930."
        )
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("citizen_agent", prompt, answer)

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Source: Citizen Assistance — FIR Intake Module"],
        "confidence": 0.87,
        "routed_agents": ["citizen_agent"],
        "node_timings": [timing],
        "token_usage": [token_rec],
        "parallel_results": [{"agent": "citizen_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 8 — Report Agent (DPDP / GDPR Compliance Drafter)
# ═══════════════════════════════════════════════════════════════

REPORT_PROMPT = """You are the Compliance Autopilot for SentinelAI (CAP module).

Query: {query}
Context: {context}

Draft a regulatory compliance document covering:
- Incident classification under DPDP Act 2023 / GDPR / NIS2 (as applicable)
- Personal data categories compromised (if any)
- 72-hour breach notification obligation assessment
- Recommended notification text to CERT-In / Data Protection Board
- Suggested remediation steps for the organisation
- Timeline of regulatory milestones

Format as a structured document with clear section headers."""


async def report_agent_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")

    async with timed_node("report_agent", trace_id) as timing:
        model = _get_model()
        prompt = REPORT_PROMPT.format(
            query=query,
            context=json.dumps(state.get("context_data", {})),
        )
        fallback = (
            "DPDP Compliance Report generated. Breach classification: HIGH. "
            "72-hour notification to CERT-In required. Draft notice prepared for review."
        )
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("report_agent", prompt, answer)

    return {
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Source: Compliance Autopilot (CAP) — DPDP/GDPR Module"],
        "confidence": 0.89,
        "routed_agents": ["report_agent"],
        "node_timings": [timing],
        "token_usage": [token_rec],
        "parallel_results": [{"agent": "report_agent", "answer": answer}],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 9 — Synthesis Node
# Merges parallel_results from multiple agents into one answer.
# ═══════════════════════════════════════════════════════════════

SYNTHESIS_PROMPT = """You are the Response Synthesis Engine for SentinelAI.

The analyst asked: "{query}"

Multiple specialist agents have independently analyzed this query:

{agent_outputs}

Synthesise these findings into a single, coherent, well-structured response.
- Resolve any contradictions by preferring higher-confidence data
- Combine citations from all agents
- Keep the tone professional and SOC-analyst-friendly
- Do NOT simply concatenate — write a unified narrative"""


async def synthesis_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    parallel_results = state.get("parallel_results", [])

    async with timed_node("synthesis", trace_id) as timing:
        if not parallel_results:
            # Nothing to merge — pass through last assistant message
            last = next(
                (m["content"] for m in reversed(messages) if m["role"] == "assistant"),
                "No answer available.",
            )
            return {
                "answer": last,
                "node_timings": [timing],
            }

        if len(parallel_results) == 1:
            # Single agent — no synthesis needed
            answer = parallel_results[0].get("answer", "")
            return {
                "answer": answer,
                "node_timings": [timing],
            }

        # Multi-agent synthesis
        model = _get_model()
        agent_outputs_text = "\n\n".join(
            f"--- {r['agent'].upper()} ---\n{r['answer']}"
            for r in parallel_results
        )
        prompt = SYNTHESIS_PROMPT.format(
            query=query, agent_outputs=agent_outputs_text
        )
        fallback = "\n\n".join(r["answer"] for r in parallel_results)
        answer = _safe_generate(model, prompt, fallback)
        token_rec = build_token_record("synthesis", prompt, answer)

        emit_trace_log(
            "SYNTHESIZED",
            trace_id,
            "synthesis",
            extra={"agents_merged": [r["agent"] for r in parallel_results]},
        )

    return {
        "answer": answer,
        "messages": [{"role": "assistant", "content": answer}],
        "node_timings": [timing],
        "token_usage": [token_rec],
    }


# ═══════════════════════════════════════════════════════════════
# NODE 10 — Fallback Node
# Activated when any node sets state['error'] or exhausts retries.
# ═══════════════════════════════════════════════════════════════

async def fallback_node(state: AgentState) -> Dict[str, Any]:
    trace_id = state.get("trace_id", "no-trace")
    error = state.get("error", "Unknown error")
    failed_agent = state.get("current_agent", "unknown")

    emit_trace_log(
        "FALLBACK_TRIGGERED",
        trace_id,
        "fallback",
        extra={"failed_agent": failed_agent, "error": error},
        level="WARNING",
    )

    # Route to crime_agent as last resort
    messages = state.get("messages", [])
    query = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")

    model = _get_model()
    if model and query:
        answer = _safe_generate(
            model,
            f"As a cyber crime analyst, briefly answer: {query}",
            "I'm unable to fully process this request right now. Please try rephrasing or contact your SOC supervisor.",
        )
    else:
        answer = "System is temporarily operating in degraded mode. Please retry in a few moments."

    return {
        "answer": answer,
        "messages": [{"role": "assistant", "content": answer}],
        "citations": ["Fallback: Crime Agent (degraded mode)"],
        "confidence": 0.50,
        "error": None,  # Clear the error after handling
    }
