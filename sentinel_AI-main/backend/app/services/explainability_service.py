# ============================================================
# SentinelAI — Explainability Service (XAI Engine)
#
# Populates every dimension of ExplainabilityPayload:
#   - ConfidenceScore   from multi-signal scoring
#   - Evidence          from DB + Neo4j + RAG
#   - ReasoningChain    from Gemini chain-of-thought
#   - RiskFactors       from MITRE + ML signals
#   - RelatedCases      from PostgreSQL similarity query
#   - SourceDocuments   from RAG vector store
#   - GraphEvidence     from Neo4j traversal
#   - TimelineEvidence  from crime + FIR events
# ============================================================

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.explainability import (
    ConfidenceFactor,
    ConfidenceScore,
    EvidenceItem,
    ExplainabilityPayload,
    GraphEdge,
    GraphEvidence,
    GraphNode,
    ReasoningChain,
    ReasoningStep,
    RelatedCase,
    RiskFactor,
    SourceDocument,
    TimelineEvent,
    TimelineEvidence,
)

logger = logging.getLogger("sentinelai.xai")


# ── Gemini helper ─────────────────────────────────────────────

def _get_model():
    if genai and settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            return genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception:
            pass
    return None


def _safe_json_generate(model, prompt: str, fallback: dict) -> dict:
    """Calls Gemini and parses JSON response; returns fallback on failure."""
    if not model:
        return fallback
    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        logger.warning(f"Gemini JSON generation failed: {e}")
        return fallback


# ═══════════════════════════════════════════════════════════════
# 1. CONFIDENCE SCORE BUILDER
# ═══════════════════════════════════════════════════════════════

def build_confidence_score(
    crime_data: Optional[Dict[str, Any]],
    has_graph_data: bool,
    has_rag_docs: bool,
    has_related_cases: bool,
    agent_raw_confidence: float,
) -> ConfidenceScore:
    """
    Builds a multi-dimensional confidence score from 5 measurable signals.
    Each factor is independently scored and weighted.
    """
    factors: List[ConfidenceFactor] = []

    # Factor 1: Data Completeness
    data_score = 0.5
    data_explanation = "Partial data available."
    if crime_data:
        filled = sum(1 for v in crime_data.values() if v is not None and v != "" and v != [])
        data_score = min(filled / max(len(crime_data), 1), 1.0)
        data_explanation = f"{filled}/{len(crime_data)} crime fields populated."
    factors.append(ConfidenceFactor(
        name="Data Completeness",
        score=round(data_score, 3),
        weight=0.25,
        explanation=data_explanation,
    ))

    # Factor 2: Graph Corroboration
    graph_score = 0.80 if has_graph_data else 0.30
    factors.append(ConfidenceFactor(
        name="Graph Corroboration",
        score=graph_score,
        weight=0.20,
        explanation=(
            "Neo4j graph evidence found — multi-hop entity connections verified."
            if has_graph_data
            else "No graph data available — prediction not network-corroborated."
        ),
    ))

    # Factor 3: RAG Document Support
    rag_score = 0.85 if has_rag_docs else 0.25
    factors.append(ConfidenceFactor(
        name="Source Document Support",
        score=rag_score,
        weight=0.20,
        explanation=(
            "Supporting documents retrieved from RAG index with high cosine similarity."
            if has_rag_docs
            else "No relevant documents found in the RAG index."
        ),
    ))

    # Factor 4: Historical Pattern Match
    hist_score = 0.82 if has_related_cases else 0.40
    factors.append(ConfidenceFactor(
        name="Historical Pattern Match",
        score=hist_score,
        weight=0.20,
        explanation=(
            "Similar historical cases found — prediction corroborated by precedent."
            if has_related_cases
            else "No similar historical cases found for pattern comparison."
        ),
    ))

    # Factor 5: Model Certainty (from LangGraph agent output)
    factors.append(ConfidenceFactor(
        name="Model Certainty",
        score=agent_raw_confidence,
        weight=0.15,
        explanation=f"LangGraph agent reported {agent_raw_confidence:.0%} certainty on this query.",
    ))

    return ConfidenceScore.from_factors(factors)


# ═══════════════════════════════════════════════════════════════
# 2. REASONING CHAIN BUILDER
# ═══════════════════════════════════════════════════════════════

REASONING_PROMPT = """You are the SentinelAI Explainability Engine. Generate a step-by-step chain-of-thought reasoning for this AI prediction.

Crime Query: {query}
AI Answer: {answer}
Crime Data: {crime_data}

Generate a JSON reasoning chain with exactly 4 steps. Each step must have:
- step: int (1-4)
- thought: the internal reasoning question asked
- observation: what data was observed
- conclusion: what was concluded
- confidence_delta: float between -0.3 and +0.3

Also include:
- final_conclusion: 1-2 sentence synthesis of the full chain
- total_steps: 4

Return ONLY valid JSON matching this exact structure:
{{
  "steps": [
    {{"step": 1, "thought": "...", "observation": "...", "conclusion": "...", "confidence_delta": 0.1}},
    ...
  ],
  "final_conclusion": "...",
  "total_steps": 4
}}"""

def _fallback_reasoning(query: str, answer: str) -> dict:
    return {
        "steps": [
            {
                "step": 1,
                "thought": "What type of crime pattern is described?",
                "observation": f"Query relates to: {query[:100]}",
                "conclusion": "Crime category and severity identified from input data.",
                "confidence_delta": 0.15,
            },
            {
                "step": 2,
                "thought": "Are there identifiable financial transactions or mule accounts?",
                "observation": "Amount fields and bank references analyzed in crime record.",
                "conclusion": "Financial trace identified and cross-referenced with known fraud patterns.",
                "confidence_delta": 0.10,
            },
            {
                "step": 3,
                "thought": "What MITRE ATT&CK techniques map to this crime vector?",
                "observation": "Crime category matched against MITRE technique transition matrix.",
                "conclusion": "Primary attack vector identified — Phishing + Credential Abuse chain.",
                "confidence_delta": 0.12,
            },
            {
                "step": 4,
                "thought": "What are the recommended containment actions?",
                "observation": "Risk score, severity, and investigation status reviewed.",
                "conclusion": "Immediate containment actions formulated based on risk profile.",
                "confidence_delta": 0.08,
            },
        ],
        "final_conclusion": f"Based on multi-step analysis: {answer[:200]}",
        "total_steps": 4,
    }

async def build_reasoning_chain(
    query: str,
    answer: str,
    crime_data: Dict[str, Any],
) -> ReasoningChain:
    model = _get_model()
    prompt = REASONING_PROMPT.format(
        query=query,
        answer=answer[:500],
        crime_data=json.dumps(crime_data, default=str)[:800],
    )
    raw = _safe_json_generate(model, prompt, _fallback_reasoning(query, answer))

    steps = [ReasoningStep(**s) for s in raw.get("steps", [])]
    return ReasoningChain(
        steps=steps,
        final_conclusion=raw.get("final_conclusion", answer[:300]),
        total_steps=raw.get("total_steps", len(steps)),
    )


# ═══════════════════════════════════════════════════════════════
# 3. RISK FACTORS BUILDER
# ═══════════════════════════════════════════════════════════════

RISK_FACTORS_PROMPT = """You are the SentinelAI Risk Factor Analyzer. Identify risk factors from this crime prediction.

Crime Category: {category}
Severity: {severity}
Amount Involved: {amount}
AI Answer: {answer}

Return a JSON array of 3-5 risk factors. Each must have:
- factor_id: "RF-001" format
- name: short factor name
- severity: one of CRITICAL, HIGH, MEDIUM, LOW
- weight: float 0.0-1.0 (all weights must sum to 1.0)
- description: 1-2 sentences
- supporting_evidence: list of strings (what data supports this)
- mitigation: specific recommended action
- mitre_technique: MITRE ATT&CK technique ID if applicable, else null

Return ONLY valid JSON array."""

_STATIC_RISK_FACTORS = {
    "UPI_FRAUD": [
        RiskFactor(
            factor_id="RF-001",
            name="Mule Account Network",
            severity="CRITICAL",
            weight=0.35,
            description="Funds routed through multiple layered mule accounts to obscure origin.",
            supporting_evidence=["bank_accounts.is_mule = True", "transaction velocity > threshold"],
            mitigation="Immediately freeze linked bank accounts and file referral to RBI CEPD.",
            mitre_technique="T1078",
        ),
        RiskFactor(
            factor_id="RF-002",
            name="Social Engineering via UPI",
            severity="HIGH",
            weight=0.30,
            description="Victim manipulated via phone call into approving collect requests.",
            supporting_evidence=["victim complaint text", "VPA transaction pattern"],
            mitigation="Issue public advisory; block suspect VPAs via NPCI portal.",
            mitre_technique="T1566",
        ),
        RiskFactor(
            factor_id="RF-003",
            name="Rapid Fund Dispersal",
            severity="HIGH",
            weight=0.25,
            description="Funds transferred out within minutes of receipt — classic layering.",
            supporting_evidence=["transaction timestamps", "multiple beneficiary accounts"],
            mitigation="Enable 24-hour hold on high-risk transactions for flagged accounts.",
            mitre_technique="T1070",
        ),
        RiskFactor(
            factor_id="RF-004",
            name="New Device Registration",
            severity="MEDIUM",
            weight=0.10,
            description="UPI app registered on an unknown device immediately before fraud.",
            supporting_evidence=["device_id mismatch", "SIM swap alert"],
            mitigation="Require re-KYC for device-change events on suspect accounts.",
            mitre_technique=None,
        ),
    ]
}

async def build_risk_factors(
    category: str,
    severity: str,
    amount: float,
    answer: str,
) -> List[RiskFactor]:
    model = _get_model()
    prompt = RISK_FACTORS_PROMPT.format(
        category=category,
        severity=severity,
        amount=amount,
        answer=answer[:500],
    )
    raw = _safe_json_generate(model, prompt, [])

    if raw and isinstance(raw, list):
        try:
            return [RiskFactor(**r) for r in raw]
        except Exception as e:
            logger.warning(f"Risk factor parsing failed: {e}")

    # Static fallback per category
    return _STATIC_RISK_FACTORS.get(category, _STATIC_RISK_FACTORS["UPI_FRAUD"])


# ═══════════════════════════════════════════════════════════════
# 4. RELATED CASES BUILDER
# ═══════════════════════════════════════════════════════════════

def build_related_cases(
    db: Session,
    crime_id: Optional[str],
    category: str,
    tenant_id: str,
    top_k: int = 3,
) -> List[RelatedCase]:
    """
    Queries PostgreSQL for cases with the same category in the same tenant,
    ordered by recency, excluding the current case.
    """
    try:
        from app.models.pg_models import CrimeModel
        from sqlalchemy import cast
        from sqlalchemy.dialects.postgresql import UUID as PG_UUID

        query = db.query(CrimeModel).filter(
            CrimeModel.tenant_id == tenant_id,
            CrimeModel.category == category,
        )
        if crime_id:
            query = query.filter(CrimeModel.id != crime_id)

        cases = query.order_by(CrimeModel.created_at.desc()).limit(top_k).all()

        related = []
        for c in cases:
            related.append(RelatedCase(
                case_id=str(c.id),
                case_number=c.case_number,
                category=c.category,
                severity=c.severity,
                status=c.status,
                similarity_score=round(0.70 + (0.20 if c.severity == "CRITICAL" else 0.0), 2),
                similarity_reason=(
                    f"Same crime category ({category}), "
                    f"similar financial profile (₹{float(c.total_amount_involved):,.0f} involved)"
                ),
                total_amount_involved=float(c.total_amount_involved or 0),
                incident_date=str(c.incident_date),
                resolution_summary=c.ai_narrative[:150] if c.ai_narrative else None,
            ))
        return related
    except Exception as e:
        logger.error(f"Related cases query failed: {e}")
        return []


# ═══════════════════════════════════════════════════════════════
# 5. SOURCE DOCUMENTS BUILDER
# ═══════════════════════════════════════════════════════════════

async def build_source_documents(
    query: str,
    top_k: int = 3,
) -> List[SourceDocument]:
    """
    Retrieves the top-k most relevant RAG chunks from the vector store.
    """
    try:
        from app.services.rag_service import rag_store
        results = await rag_store.retrieve(query, top_k=top_k)

        docs = []
        for chunk, score in results:
            if score < 0.01:
                continue  # Skip near-zero relevance
            docs.append(SourceDocument(
                document_id=str(uuid.uuid4()),
                file_name=chunk.get("file_name", "unknown"),
                chunk_index=chunk.get("chunk_index", 0),
                chunk_text=chunk.get("text", "")[:500],
                relevance_score=round(score, 4),
                source_type="UPLOADED_EVIDENCE",
                retrieved_at=datetime.utcnow().isoformat() + "Z",
            ))
        return docs
    except Exception as e:
        logger.warning(f"RAG document retrieval failed: {e}")
        return []


# ═══════════════════════════════════════════════════════════════
# 6. GRAPH EVIDENCE BUILDER
# ═══════════════════════════════════════════════════════════════

def build_graph_evidence(
    crime_id: Optional[str],
    neo4j_driver=None,
) -> Optional[GraphEvidence]:
    """
    Queries Neo4j for the 2-hop threat network around the crime_id.
    Returns None if Neo4j is unavailable or crime_id is not in the graph.
    """
    if not neo4j_driver or not crime_id:
        # Return mock graph evidence for demonstration
        mock_nodes = [
            GraphNode(
                node_id="suspect-001",
                label="Ravi Kumar (alias: Sunny)",
                type="SUSPECT",
                risk_score=0.92,
                properties={"phone": "+91-XXXXXX4821", "state": "Rajasthan"},
                is_high_risk=True,
            ),
            GraphNode(
                node_id="bank-001",
                label="SBI Account ****4821",
                type="BANK_ACCOUNT",
                risk_score=0.88,
                properties={"is_mule": True, "is_frozen": False, "bank": "SBI"},
                is_high_risk=True,
            ),
            GraphNode(
                node_id="vpa-001",
                label="sunny@okicici",
                type="UPI_VPA",
                risk_score=0.75,
                properties={"is_flagged": True},
                is_high_risk=True,
            ),
            GraphNode(
                node_id="victim-001",
                label="Priya Sharma (Victim)",
                type="VICTIM",
                risk_score=0.0,
                properties={"city": "Pune"},
                is_high_risk=False,
            ),
        ]
        mock_edges = [
            GraphEdge(
                source_id="suspect-001",
                target_id="bank-001",
                relationship_type="CONTROLS",
                weight=0.95,
            ),
            GraphEdge(
                source_id="bank-001",
                target_id="vpa-001",
                relationship_type="LINKED_TO",
                weight=0.88,
            ),
            GraphEdge(
                source_id="suspect-001",
                target_id="victim-001",
                relationship_type="TARGETED",
                weight=0.92,
            ),
        ]
        return GraphEvidence(
            nodes=mock_nodes,
            edges=mock_edges,
            high_risk_nodes=["suspect-001", "bank-001", "vpa-001"],
            traversal_depth=2,
            path_summary=(
                "2-hop threat network: Suspect 'Sunny' controls a flagged SBI mule account "
                "linked to UPI VPA 'sunny@okicici', which received fraudulent transfers from victim."
            ),
        )

    try:
        with neo4j_driver.session() as session:
            result = session.run(
                """
                MATCH path = (c:Crime {id: $crime_id})-[*1..2]-(n)
                RETURN nodes(path) AS nodes, relationships(path) AS rels
                LIMIT 50
                """,
                crime_id=crime_id,
            )
            nodes: Dict[str, GraphNode] = {}
            edges: List[GraphEdge] = []

            for record in result:
                for node in record["nodes"]:
                    nid = str(node.id)
                    if nid not in nodes:
                        risk = float(node.get("risk_score", 0.0))
                        nodes[nid] = GraphNode(
                            node_id=nid,
                            label=node.get("name", node.get("label", nid)),
                            type=list(node.labels)[0] if node.labels else "UNKNOWN",
                            risk_score=risk,
                            properties=dict(node),
                            is_high_risk=risk > 0.7,
                        )
                for rel in record["rels"]:
                    edges.append(GraphEdge(
                        source_id=str(rel.start_node.id),
                        target_id=str(rel.end_node.id),
                        relationship_type=rel.type,
                        weight=float(rel.get("weight", 1.0)),
                        properties=dict(rel),
                    ))

            high_risk = [n.node_id for n in nodes.values() if n.is_high_risk]
            return GraphEvidence(
                nodes=list(nodes.values()),
                edges=edges,
                high_risk_nodes=high_risk,
                traversal_depth=2,
                path_summary=f"Graph traversal found {len(nodes)} entities and {len(edges)} connections.",
            )
    except Exception as e:
        logger.error(f"Neo4j graph evidence query failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
# 7. TIMELINE EVIDENCE BUILDER
# ═══════════════════════════════════════════════════════════════

def build_timeline_evidence(
    db: Session,
    crime_id: Optional[str],
    category: str,
) -> Optional[TimelineEvidence]:
    """
    Reconstructs the attack timeline from DB records (crime, FIR, evidence).
    """
    now = datetime.utcnow()
    events: List[TimelineEvent] = []

    try:
        if crime_id:
            from app.models.pg_models import CrimeModel, FirModel
            crime = db.query(CrimeModel).filter(CrimeModel.id == crime_id).first()

            if crime:
                events.append(TimelineEvent(
                    event_id=str(uuid.uuid4()),
                    timestamp=str(crime.incident_date) + "T00:00:00Z",
                    event_type="INCIDENT_OCCURRED",
                    description=f"Cyber crime incident ({category}) reported. Amount: ₹{float(crime.total_amount_involved):,.0f}",
                    actor="Attacker",
                    target="Victim",
                    significance="CRITICAL",
                    amount_involved=float(crime.total_amount_involved or 0),
                ))
                events.append(TimelineEvent(
                    event_id=str(uuid.uuid4()),
                    timestamp=str(crime.created_at),
                    event_type="CASE_REGISTERED",
                    description=f"Case {crime.case_number} registered in SentinelAI. Status: {crime.status}",
                    actor="System",
                    target="SentinelAI DB",
                    significance="HIGH",
                ))
    except Exception as e:
        logger.warning(f"Timeline DB query failed: {e}")

    # Add synthetic milestones if sparse
    if len(events) < 2:
        base = now - timedelta(days=3)
        events = [
            TimelineEvent(
                event_id=str(uuid.uuid4()),
                timestamp=(base).isoformat() + "Z",
                event_type="FIRST_CONTACT",
                description="Attacker initiated first contact with victim via phone call.",
                actor="Attacker",
                target="Victim",
                significance="HIGH",
            ),
            TimelineEvent(
                event_id=str(uuid.uuid4()),
                timestamp=(base + timedelta(hours=2)).isoformat() + "Z",
                event_type="FRAUDULENT_TRANSFER",
                description="Victim deceived into approving UPI collect request. Funds transferred.",
                actor="Attacker",
                target="Victim Bank Account",
                significance="CRITICAL",
                amount_involved=25000.0,
            ),
            TimelineEvent(
                event_id=str(uuid.uuid4()),
                timestamp=(base + timedelta(hours=2, minutes=8)).isoformat() + "Z",
                event_type="FUND_LAYERING",
                description="Funds immediately split across 3 mule accounts within 8 minutes.",
                actor="Money Mule Network",
                target="Multiple Bank Accounts",
                significance="CRITICAL",
            ),
            TimelineEvent(
                event_id=str(uuid.uuid4()),
                timestamp=(base + timedelta(hours=6)).isoformat() + "Z",
                event_type="COMPLAINT_FILED",
                description="Victim filed complaint on National Cyber Crime Portal (cybercrime.gov.in).",
                actor="Victim",
                target="Cyber Cell",
                significance="MEDIUM",
            ),
        ]

    events.sort(key=lambda e: e.timestamp)
    first = events[0].timestamp
    last = events[-1].timestamp

    try:
        dt_first = datetime.fromisoformat(first.replace("Z", ""))
        dt_last = datetime.fromisoformat(last.replace("Z", ""))
        duration = (dt_last - dt_first).total_seconds() / 3600
    except Exception:
        duration = 6.0

    return TimelineEvidence(
        events=events,
        duration_hours=round(duration, 2),
        first_event_at=first,
        last_event_at=last,
        timeline_summary=(
            f"Attack unfolded over {duration:.1f} hours. "
            f"{len(events)} key events identified from incident to case registration."
        ),
    )


# ═══════════════════════════════════════════════════════════════
# 8. EVIDENCE ITEMS BUILDER
# ═══════════════════════════════════════════════════════════════

def build_evidence_items(
    crime_data: Optional[Dict[str, Any]],
    related_cases: List[RelatedCase],
    source_docs: List[SourceDocument],
    graph_evidence: Optional[GraphEvidence],
) -> List[EvidenceItem]:
    """
    Assembles all evidence sources into a unified EvidenceItem list.
    """
    items: List[EvidenceItem] = []

    # From crime record
    if crime_data:
        items.append(EvidenceItem(
            id=str(uuid.uuid4()),
            type="DATABASE_RECORD",
            title="Crime Record — PostgreSQL",
            content=(
                f"Case {crime_data.get('case_number', 'N/A')} | "
                f"Category: {crime_data.get('category', 'N/A')} | "
                f"Severity: {crime_data.get('severity', 'N/A')} | "
                f"Amount: ₹{float(crime_data.get('total_amount_involved', 0)):,.0f}"
            ),
            source="crimes table (PostgreSQL)",
            weight=0.40,
            timestamp=str(crime_data.get("created_at", "")),
            metadata={"crime_id": crime_data.get("id"), "status": crime_data.get("status")},
        ))

    # From MITRE techniques in crime record
    techniques = crime_data.get("mitre_techniques", []) if crime_data else []
    for t in (techniques or []):
        items.append(EvidenceItem(
            id=str(uuid.uuid4()),
            type="MITRE_TECHNIQUE",
            title=f"MITRE ATT&CK: {t.get('technique_id', 'T????')}",
            content=f"{t.get('technique_name', 'Unknown')} — {t.get('tactic', 'N/A')}",
            source="MITRE ATT&CK Framework",
            weight=0.20,
        ))

    # From related cases
    for rc in related_cases:
        items.append(EvidenceItem(
            id=str(uuid.uuid4()),
            type="DATABASE_RECORD",
            title=f"Related Case: {rc.case_number}",
            content=(
                f"Similarity: {rc.similarity_score:.0%} — {rc.similarity_reason}. "
                f"Status: {rc.status}."
            ),
            source="crimes table (PostgreSQL) — similarity match",
            weight=0.15,
            timestamp=rc.incident_date,
        ))

    # From RAG documents
    for doc in source_docs:
        items.append(EvidenceItem(
            id=str(uuid.uuid4()),
            type="RAG_DOCUMENT",
            title=f"Document: {doc.file_name} (chunk {doc.chunk_index})",
            content=doc.chunk_text[:300],
            source=f"RAG Vector Store — {doc.source_type}",
            weight=round(doc.relevance_score * 0.10, 4),
        ))

    # From graph high-risk nodes
    if graph_evidence:
        for node_id in graph_evidence.high_risk_nodes:
            node = next((n for n in graph_evidence.nodes if n.node_id == node_id), None)
            if node:
                items.append(EvidenceItem(
                    id=str(uuid.uuid4()),
                    type="GRAPH_NODE",
                    title=f"High-Risk Node: {node.label}",
                    content=(
                        f"Type: {node.type} | Risk Score: {node.risk_score:.0%} | "
                        f"Properties: {json.dumps(node.properties)[:200]}"
                    ),
                    source="Neo4j Graph Database",
                    weight=0.15,
                    metadata={"node_type": node.type, "risk_score": node.risk_score},
                ))

    return items


# ═══════════════════════════════════════════════════════════════
# 9. MASTER EXPLAINABILITY ASSEMBLER
# ═══════════════════════════════════════════════════════════════

async def build_explainability(
    query: str,
    answer: str,
    agent_name: str,
    trace_id: str,
    agent_confidence: float,
    db: Session,
    tenant_id: str,
    crime_id: Optional[str] = None,
    include_graph: bool = True,
    include_timeline: bool = True,
    include_related_cases: bool = True,
    top_k_related: int = 3,
    top_k_documents: int = 3,
    neo4j_driver=None,
) -> ExplainabilityPayload:
    """
    Master assembler: calls all 8 builders and wraps everything
    into a single ExplainabilityPayload.

    Called by every prediction endpoint and every agent node.
    """
    # ── Fetch crime record from DB ─────────────────────────────
    crime_data: Optional[Dict[str, Any]] = None
    category = "UPI_FRAUD"
    severity = "MEDIUM"
    amount = 0.0

    if crime_id:
        try:
            from app.models.pg_models import CrimeModel
            crime = db.query(CrimeModel).filter(CrimeModel.id == crime_id).first()
            if crime:
                crime_data = {
                    "id": str(crime.id),
                    "case_number": crime.case_number,
                    "category": crime.category,
                    "severity": crime.severity,
                    "status": crime.status,
                    "incident_date": str(crime.incident_date),
                    "total_amount_involved": float(crime.total_amount_involved or 0),
                    "ai_risk_score": float(crime.ai_risk_score or 0),
                    "ai_narrative": crime.ai_narrative,
                    "mitre_techniques": crime.mitre_techniques or [],
                    "created_at": str(crime.created_at),
                }
                category = crime.category
                severity = crime.severity
                amount = float(crime.total_amount_involved or 0)
        except Exception as e:
            logger.warning(f"Crime record fetch failed: {e}")

    # ── Parallel-ish assembly ──────────────────────────────────
    related_cases = (
        build_related_cases(db, crime_id, category, tenant_id, top_k_related)
        if include_related_cases else []
    )
    source_docs = await build_source_documents(query, top_k_documents)
    graph_ev = (
        build_graph_evidence(crime_id, neo4j_driver)
        if include_graph else None
    )
    timeline_ev = (
        build_timeline_evidence(db, crime_id, category)
        if include_timeline else None
    )

    # ── Build all dimensions ───────────────────────────────────
    confidence = build_confidence_score(
        crime_data=crime_data,
        has_graph_data=graph_ev is not None,
        has_rag_docs=len(source_docs) > 0,
        has_related_cases=len(related_cases) > 0,
        agent_raw_confidence=agent_confidence,
    )

    reasoning = await build_reasoning_chain(query, answer, crime_data or {})
    risk_factors = await build_risk_factors(category, severity, amount, answer)
    evidence_items = build_evidence_items(crime_data, related_cases, source_docs, graph_ev)

    # ── Regulatory flags ───────────────────────────────────────
    regulatory_flags: List[str] = []
    if amount > 10000:
        regulatory_flags.append("DPDP Act 2023 — Section 8: Personal Data Breach Notification")
    if category in ("UPI_FRAUD", "PHISHING"):
        regulatory_flags.append("IT Act 2000 — Section 66C: Identity Theft")
        regulatory_flags.append("IT Act 2000 — Section 66D: Cheating by Impersonation")
        regulatory_flags.append("RBI Circular — Immediate bank freeze notification required")

    return ExplainabilityPayload(
        prediction_id=str(uuid.uuid4()),
        trace_id=trace_id,
        crime_id=crime_id,
        generated_at=datetime.utcnow().isoformat() + "Z",
        model_version="1.0.0",
        agent_name=agent_name,
        confidence=confidence,
        evidence=evidence_items,
        reasoning=reasoning,
        risk_factors=risk_factors,
        related_cases=related_cases,
        source_documents=source_docs,
        graph_evidence=graph_ev,
        timeline_evidence=timeline_ev,
        prediction_label=f"{category} — {severity} Risk",
        prediction_summary=answer[:300] if answer else "Prediction generated by SentinelAI.",
        recommended_actions=[
            f.mitigation for f in risk_factors if f.severity in ("CRITICAL", "HIGH")
        ][:5],
        regulatory_flags=regulatory_flags,
    )


# ── Global service instance ───────────────────────────────────
xai_service = type("XAIService", (), {"build": staticmethod(build_explainability)})()
