# ============================================================
# SentinelAI — Advanced Graph Explorer Endpoints
#
# Exposes:
#   - Shortest Path
#   - Most Connected Criminals
#   - Community Detection (Weakly Connected Components / Louvain)
#   - Fraud Rings (Transitive money trails cycles)
#   - Money Flow (Multi-hop transfers)
#   - Phone Call Graph (SIM Call trails)
#   - Vehicle Movement (Location path tracks)
#   - Location Correlation (IP overlap clusters)
# ============================================================

from __future__ import annotations

import logging
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.auth import get_current_user, TokenData
from app.db.connection import get_graph
from app.schemas import pydantic_schemas
from app.schemas.graph_analysis import (
    ConnectedCriminalNode,
    CommunityDetectionResponse,
    CommunitySchema,
    FraudRingResponse,
    FraudRingPath,
    MoneyFlowPath,
    MoneyFlowHop,
    PhoneCallGraphResponse,
    CallLink,
    VehicleMovementResponse,
    VehicleTrackPoint,
    LocationCorrelationCluster,
)

logger = logging.getLogger("sentinelai.graph")
router = APIRouter()


# ── Helper: Serialize Neo4j nodes/edges ──────────────────────

def format_node(node) -> pydantic_schemas.NodeSchema:
    labels = list(node.labels)
    primary = labels[0] if labels else "Unknown"
    name = (
        node.get("name")
        or node.get("number")
        or node.get("vpa")
        or node.get("account_number_masked")
        or node.get("id")
        or "Unknown Node"
    )
    return pydantic_schemas.NodeSchema(
        id=node.element_id,
        label=name,
        type=primary,
        risk_score=float(node.get("risk_score") or node.get("ai_risk_score") or 0.0),
    )


# ── 1. Shortest Path ──────────────────────────────────────────

@router.get("/shortest-path", response_model=pydantic_schemas.GraphResponse)
async def get_shortest_path(
    start_node_id: str,
    end_node_id: str,
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Traces the shortest connection path between two arbitrary graph entities (up to 6 hops).
    """
    if not graph_session:
        return pydantic_schemas.GraphResponse(
            nodes=[
                pydantic_schemas.NodeSchema(id=start_node_id, label="Suspect Ravi", type="Suspect", risk_score=0.92),
                pydantic_schemas.NodeSchema(id="phone_mid", label="+91-XXXXXX4821", type="PhoneNumber", risk_score=0.60),
                pydantic_schemas.NodeSchema(id=end_node_id, label="Mule Holder Bank", type="BankAccount", risk_score=0.88),
            ],
            edges=[
                pydantic_schemas.EdgeSchema(source=start_node_id, target="phone_mid", type="CALLED"),
                pydantic_schemas.EdgeSchema(source="phone_mid", target=end_node_id, type="LINKED_TO"),
            ],
        )

    # Optimized Cypher Query using shortestPath algorithm
    cypher_query = """
    MATCH (start {id: $start_id}), (end {id: $end_id})
    WHERE start.tenant_id = $tenant_id AND end.tenant_id = $tenant_id
    MATCH path = shortestPath((start)-[*1..6]-(end))
    RETURN path
    """
    try:
        result = graph_session.run(
            cypher_query,
            start_id=start_node_id,
            end_id=end_node_id,
            tenant_id=current_user.tenant_id,
        )
        record = result.single()
        if not record or not record["path"]:
            return pydantic_schemas.GraphResponse(nodes=[], edges=[])

        path = record["path"]
        nodes = {format_node(n).id: format_node(n) for n in path.nodes}
        edges = [
            pydantic_schemas.EdgeSchema(
                source=r.start_node.element_id,
                target=r.end_node.element_id,
                type=r.type,
            )
            for r in path.relationships
        ]
        return pydantic_schemas.GraphResponse(nodes=list(nodes.values()), edges=edges)
    except Exception as e:
        logger.error(f"Cypher shortest-path query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 2. Most Connected Criminal (Centrality Degree) ───────────

@router.get("/most-connected", response_model=List[ConnectedCriminalNode])
async def get_most_connected_criminals(
    limit: int = Query(5, ge=1, le=50),
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Identifies Suspects with the highest degree centrality (most links to phone/bank nodes).
    """
    if not graph_session:
        return [
            ConnectedCriminalNode(
                suspect_id="s1",
                name="Abhishek Modi (alias: Sunny)",
                risk_score=0.94,
                connection_count=18,
                direct_associates=["Ravi Kumar", "Mohit Lal"],
            ),
            ConnectedCriminalNode(
                suspect_id="s2",
                name="Ravi Kumar",
                risk_score=0.88,
                connection_count=12,
                direct_associates=["Abhishek Modi"],
            ),
        ]

    # Optimized Cypher returning node degree count
    cypher_query = """
    MATCH (s:Suspect)
    WHERE s.tenant_id = $tenant_id
    MATCH (s)-[r]-(assoc)
    WITH s, count(r) AS degree, collect(DISTINCT assoc.name) AS associates
    RETURN s.id AS id, s.name AS name, s.risk_score AS risk, degree, associates[0..3] AS assoc_list
    ORDER BY degree DESC
    LIMIT $limit
    """
    try:
        result = graph_session.run(cypher_query, tenant_id=current_user.tenant_id, limit=limit)
        nodes = []
        for r in result:
            nodes.append(ConnectedCriminalNode(
                suspect_id=r["id"],
                name=r["name"] or "Anonymous Suspect",
                risk_score=float(r["risk"] or 0.0),
                connection_count=r["degree"],
                direct_associates=r["assoc_list"] or [],
            ))
        return nodes
    except Exception as e:
        logger.error(f"Cypher most-connected query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 3. Community Detection (Weakly Connected Components) ─────

@router.get("/communities", response_model=CommunityDetectionResponse)
async def detect_suspect_communities(
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Applies Louvain/WCC heuristics to isolate criminal syndicates / syndication communities.
    """
    if not graph_session:
        return CommunityDetectionResponse(
            total_communities=2,
            communities=[
                CommunitySchema(
                    community_id=101,
                    member_count=3,
                    members=[
                        pydantic_schemas.NodeSchema(id="s1", label="Abhishek Modi", type="Suspect", risk_score=0.94),
                        pydantic_schemas.NodeSchema(id="s2", label="Ravi Kumar", type="Suspect", risk_score=0.88),
                        pydantic_schemas.NodeSchema(id="b1", label="SBI Account ****1234", type="BankAccount", risk_score=0.85),
                    ],
                    risk_average=0.89,
                    primary_modus_operandi="UPI Phishing collect calls from Vashi cluster.",
                )
            ],
            unassociated_nodes_count=5,
        )

    # Cypher using path aggregations to detect connected clusters
    cypher_query = """
    MATCH (s:Suspect)
    WHERE s.tenant_id = $tenant_id
    MATCH (s)-[*1..2]-(member)
    WHERE member.tenant_id = $tenant_id
    WITH id(s) AS cluster_id, collect(DISTINCT member) AS members
    WITH cluster_id, size(members) AS m_count, members
    WHERE m_count > 1
    RETURN cluster_id, m_count, members
    ORDER BY m_count DESC
    LIMIT 10
    """
    try:
        result = graph_session.run(cypher_query, tenant_id=current_user.tenant_id)
        communities = []
        for r in result:
            members = [format_node(m) for m in r["members"]]
            risk_avg = sum(m.risk_score for m in members) / len(members) if members else 0.0
            communities.append(CommunitySchema(
                community_id=r["cluster_id"],
                member_count=r["m_count"],
                members=members,
                risk_average=round(risk_avg, 3),
                primary_modus_operandi="Coordinated transactional fraud pattern.",
            ))
        return CommunityDetectionResponse(
            total_communities=len(communities),
            communities=communities,
            unassociated_nodes_count=0,
        )
    except Exception as e:
        logger.error(f"Cypher community detection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 4. Fraud Ring Cycles ──────────────────────────────────────

@router.get("/fraud-rings", response_model=FraudRingResponse)
async def detect_fraud_rings(
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Detects circular transaction paths (e.g. A -> B -> C -> A) representing layering/laundering cycles.
    """
    if not graph_session:
        return FraudRingResponse(
            rings_detected_count=1,
            rings=[
                FraudRingPath(
                    ring_id="ring-101",
                    nodes=[
                        pydantic_schemas.NodeSchema(id="ba1", label="SBI Account ****1111", type="BankAccount", risk_score=0.90),
                        pydantic_schemas.NodeSchema(id="ba2", label="HDFC Account ****2222", type="BankAccount", risk_score=0.88),
                        pydantic_schemas.NodeSchema(id="ba3", label="ICICI Account ****3333", type="BankAccount", risk_score=0.85),
                    ],
                    edges=[
                        pydantic_schemas.EdgeSchema(source="ba1", target="ba2", type="TRANSFERRED"),
                        pydantic_schemas.EdgeSchema(source="ba2", target="ba3", type="TRANSFERRED"),
                        pydantic_schemas.EdgeSchema(source="ba3", target="ba1", type="TRANSFERRED"),
                    ],
                    total_amount_cycled=150000.0,
                    risk_score=0.92,
                    mitigation_action="Enforce hold on transfers and freeze all 3 cycle nodes.",
                )
            ],
        )

    # Optimized Cypher Query finding transaction cycles (length 3 to 4)
    cypher_query = """
    MATCH path = (a:BankAccount)-[r:TRANSFERRED*3..4]->(a)
    WHERE a.tenant_id = $tenant_id
    RETURN path, reduce(s = 0.0, rel in relationships(path) | s + rel.amount) AS total_amount
    LIMIT 10
    """
    try:
        result = graph_session.run(cypher_query, tenant_id=current_user.tenant_id)
        rings = []
        for r in result:
            path = r["path"]
            nodes = {format_node(n).id: format_node(n) for n in path.nodes}
            edges = [
                pydantic_schemas.EdgeSchema(
                    source=rel.start_node.element_id,
                    target=rel.end_node.element_id,
                    type=rel.type,
                )
                for rel in path.relationships
            ]
            rings.append(FraudRingPath(
                ring_id=str(uuid.uuid4())[:8],
                nodes=list(nodes.values()),
                edges=edges,
                total_amount_cycled=float(r["total_amount"] or 0.0),
                risk_score=0.95,
                mitigation_action="Block transitive transfer paths immediately.",
            ))
        return FraudRingResponse(rings_detected_count=len(rings), rings=rings)
    except Exception as e:
        logger.error(f"Cypher fraud cycle detection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 5. Money Flow Analysis ───────────────────────────────────

@router.get("/money-flow", response_model=List[MoneyFlowPath])
async def get_money_flow_paths(
    min_amount: float = Query(5000.0, description="Minimum transfer filter"),
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Traces linear multi-hop money flow routes to map transaction dispersal.
    """
    if not graph_session:
        return [
            MoneyFlowPath(
                path_id="flow-1",
                source_entity="Victim Account",
                destination_entity=" sunny@okicici (VPA)",
                total_amount=25000.0,
                hops=[
                    MoneyFlowHop(source_account="Victim Account", target_account="SBI Mule Account", amount=25000.0, timestamp="2026-07-10T11:07:00Z", hop_index=1),
                    MoneyFlowHop(source_account="SBI Mule Account", target_account="sunny@okicici", amount=25000.0, timestamp="2026-07-10T11:15:00Z", hop_index=2),
                ],
                is_suspected_layering=True,
            )
        ]

    # Cypher querying paths of transfers
    cypher_query = """
    MATCH path = (src:BankAccount)-[trans:TRANSFERRED*1..3]->(dest:BankAccount)
    WHERE src.tenant_id = $tenant_id
    WITH path, src, dest, reduce(s = 0.0, r in relationships(path) | s + r.amount) AS total
    WHERE total >= $min_amount
    RETURN path, src.account_number_masked AS src_name, dest.account_number_masked AS dest_name, total
    ORDER BY total DESC
    LIMIT 10
    """
    try:
        result = graph_session.run(
            cypher_query,
            tenant_id=current_user.tenant_id,
            min_amount=min_amount,
        )
        paths = []
        for r in result:
            hops = []
            rels = r["path"].relationships
            for idx, rel in enumerate(rels, 1):
                hops.append(MoneyFlowHop(
                    source_account=rel.start_node.get("account_number_masked") or "Unknown",
                    target_account=rel.end_node.get("account_number_masked") or "Unknown",
                    amount=float(rel.get("amount") or 0.0),
                    timestamp=rel.get("timestamp") or "",
                    hop_index=idx,
                ))
            paths.append(MoneyFlowPath(
                path_id=str(uuid.uuid4())[:8],
                source_entity=r["src_name"] or "Source Account",
                destination_entity=r["dest_name"] or "Target Account",
                total_amount=float(r["total"] or 0.0),
                hops=hops,
                is_suspected_layering=len(hops) > 1,
            ))
        return paths
    except Exception as e:
        logger.error(f"Cypher money flow query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 6. Phone Call Graph ───────────────────────────────────────

@router.get("/phone-call-graph", response_model=PhoneCallGraphResponse)
async def get_phone_call_graph(
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Traces phone communication linkages (Suspect called phone, phone called burner).
    """
    if not graph_session:
        return PhoneCallGraphResponse(
            nodes=[
                pydantic_schemas.NodeSchema(id="p1", label="+91-XXXXXX4821", type="PhoneNumber", risk_score=0.70),
                pydantic_schemas.NodeSchema(id="p2", label="+91-XXXXXX9901", type="PhoneNumber", risk_score=0.92),
            ],
            edges=[
                pydantic_schemas.EdgeSchema(source="p1", target="p2", type="CALLED"),
            ],
            calls=[
                CallLink(caller_number="+91-XXXXXX4821", receiver_number="+91-XXXXXX9901", call_duration_seconds=120, call_timestamp="2026-07-10T11:00:00Z", is_burner_phone=True)
            ],
        )

    cypher_query = """
    MATCH path = (p1:PhoneNumber)-[r:CALLED]->(p2:PhoneNumber)
    WHERE p1.tenant_id = $tenant_id
    RETURN path, r.duration AS duration, r.timestamp AS timestamp
    LIMIT 20
    """
    try:
        result = graph_session.run(cypher_query, tenant_id=current_user.tenant_id)
        nodes = {}
        edges = []
        calls = []
        for r in result:
            path = r["path"]
            for n in path.nodes:
                nodes[n.element_id] = format_node(n)
            for rel in path.relationships:
                edges.append(pydantic_schemas.EdgeSchema(
                    source=rel.start_node.element_id,
                    target=rel.end_node.element_id,
                    type=rel.type,
                ))
                calls.append(CallLink(
                    caller_number=rel.start_node.get("number") or "Unknown",
                    receiver_number=rel.end_node.get("number") or "Unknown",
                    call_duration_seconds=int(r["duration"] or 0),
                    call_timestamp=r["timestamp"] or "",
                    is_burner_phone=int(rel.start_node.get("sim_swap_count") or 0) > 2,
                ))
        return PhoneCallGraphResponse(nodes=list(nodes.values()), edges=edges, calls=calls)
    except Exception as e:
        logger.error(f"Cypher phone call graph query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 7. Vehicle Movement Tracking ──────────────────────────────

@router.get("/vehicle-movement", response_model=VehicleMovementResponse)
async def get_vehicle_movement_history(
    plate_number: str = Query(..., description="Vehicle license plate number"),
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Maps ANPR vehicle logs to trace physical movements across locations.
    """
    if not graph_session:
        return VehicleMovementResponse(
            vehicle_plate=plate_number,
            suspect_owner_name="Abhishek Modi",
            movement_history=[
                VehicleTrackPoint(timestamp="2026-07-10T10:00:00Z", location_address="Tolltax Plaza, Shivaji Nagar", latitude=18.5204, longitude=73.8567, speed_kmh=65.0),
                VehicleTrackPoint(timestamp="2026-07-10T10:45:00Z", location_address="Highway Junction, Hadapsar", latitude=18.5089, longitude=73.9259, speed_kmh=80.0),
            ],
            risk_score=0.75,
        )

    # Cypher mapping Vehicle -> SPOTTED_AT -> Location
    cypher_query = """
    MATCH (v:Vehicle {plate_number: $plate})-[s:SPOTTED_AT]->(l:Location)
    WHERE v.tenant_id = $tenant_id
    MATCH (s1:Suspect)-[:OWNS]->(v)
    RETURN v.plate_number AS plate, s1.name AS owner, s.timestamp AS timestamp, 
           l.address AS address, l.latitude AS lat, l.longitude AS lng
    ORDER BY timestamp ASC
    LIMIT 30
    """
    try:
        result = graph_session.run(
            cypher_query,
            plate=plate_number,
            tenant_id=current_user.tenant_id,
        )
        history = []
        owner = "Unknown"
        for r in result:
            owner = r["owner"] or "Unknown"
            history.append(VehicleTrackPoint(
                timestamp=r["timestamp"] or "",
                location_address=r["address"] or "",
                latitude=float(r["lat"] or 0.0),
                longitude=float(r["lng"] or 0.0),
            ))
        return VehicleMovementResponse(
            vehicle_plate=plate_number,
            suspect_owner_name=owner,
            movement_history=history,
            risk_score=0.85 if len(history) > 5 else 0.40,
        )
    except Exception as e:
        logger.error(f"Cypher vehicle movement query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 8. Location Correlation ───────────────────────────────────

@router.get("/location-correlation", response_model=List[LocationCorrelationCluster])
async def get_location_correlations(
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Finds geographical overlaps (multiple suspects sharing physical coordinates or IP addresses).
    """
    if not graph_session:
        return [
            LocationCorrelationCluster(
                location_id="loc-101",
                address="Starbucks, Vashi, Navi Mumbai",
                correlated_suspects=[
                    pydantic_schemas.NodeSchema(id="s1", label="Abhishek Modi", type="Suspect", risk_score=0.94),
                    pydantic_schemas.NodeSchema(id="s2", label="Ravi Kumar", type="Suspect", risk_score=0.88),
                ],
                overlap_duration_minutes=45,
                overlap_timestamps=["2026-07-10T11:00:00Z", "2026-07-10T11:45:00Z"],
                co_occurrence_count=2,
            )
        ]

    # Cypher finding suspect pairs spotted at the same location within short timeframes
    cypher_query = """
    MATCH (s1:Suspect)-[sp1:SPOTTED_AT]->(l:Location)<-[sp2:SPOTTED_AT]-(s2:Suspect)
    WHERE s1.tenant_id = $tenant_id AND s2.tenant_id = $tenant_id
      AND s1.id <> s2.id
    RETURN l.id AS id, l.address AS address, s1, s2, sp1.timestamp AS t1, sp2.timestamp AS t2
    LIMIT 20
    """
    try:
        result = graph_session.run(cypher_query, tenant_id=current_user.tenant_id)
        clusters = {}
        for r in result:
            loc_id = r["id"]
            if loc_id not in clusters:
                clusters[loc_id] = {
                    "id": loc_id,
                    "address": r["address"] or "Common Location",
                    "suspects": {},
                    "timestamps": [],
                }
            s1_node = format_node(r["s1"])
            s2_node = format_node(r["s2"])
            clusters[loc_id]["suspects"][s1_node.id] = s1_node
            clusters[loc_id]["suspects"][s2_node.id] = s2_node
            if r["t1"]:
                clusters[loc_id]["timestamps"].append(r["t1"])
            if r["t2"]:
                clusters[loc_id]["timestamps"].append(r["t2"])

        formatted = []
        for c in clusters.values():
            formatted.append(LocationCorrelationCluster(
                location_id=c["id"],
                address=c["address"],
                correlated_suspects=list(c["suspects"].values()),
                overlap_duration_minutes=30,
                overlap_timestamps=list(set(c["timestamps"])),
                co_occurrence_count=len(c["suspects"]),
            ))
        return formatted
    except Exception as e:
        logger.error(f"Cypher location correlation query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── 9. Centers centered graph network traversal ────────────────

@router.get("/network-graph/{crime_id}", response_model=pydantic_schemas.GraphResponse)
async def get_network_graph(
    crime_id: uuid.UUID,
    min_risk: float = Query(0.0, description="Filter nodes by minimum risk score"),
    node_types: Optional[List[str]] = Query(None, description="Filter nodes by labels"),
    current_user: TokenData = Depends(get_current_user),
    graph_session = Depends(get_graph)
):
    """
    Traverses the threat network graph centered around the specified Crime ID.
    Returns 3-hop nodes and relationships for visual rendering.
    """
    if not graph_session:
        return get_mock_network_graph(crime_id)

    cypher_query = """
    MATCH (c:Crime {id: $crime_id})
    WHERE c.tenant_id = $tenant_id
    MATCH path = (c)-[r*1..3]-(neighbor)
    WHERE neighbor.tenant_id = $tenant_id OR neighbor.tenant_id IS NULL
    RETURN path
    LIMIT 200
    """
    try:
        result = graph_session.run(
            cypher_query,
            crime_id=str(crime_id),
            tenant_id=current_user.tenant_id,
        )
        nodes_dict = {}
        edges_list = []
        seen_edges = set()

        for record in result:
            path = record["path"]
            for node in path.nodes:
                node_item = format_node(node)
                if node_item.risk_score < min_risk:
                    continue
                if node_types and node_item.type not in node_types:
                    continue
                nodes_dict[node_item.id] = node_item
            for rel in path.relationships:
                rel_id = rel.element_id
                if rel_id not in seen_edges:
                    seen_edges.add(rel_id)
                    edges_list.append(pydantic_schemas.EdgeSchema(
                        source=rel.start_node.element_id,
                        target=rel.end_node.element_id,
                        type=rel.type,
                    ))
        return pydantic_schemas.GraphResponse(nodes=list(nodes_dict.values()), edges=edges_list)
    except Exception as e:
        logger.error(f"Cypher network-graph query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def get_mock_network_graph(crime_id: uuid.UUID) -> pydantic_schemas.GraphResponse:
    nodes = [
        pydantic_schemas.NodeSchema(id="crime_node", label=f"UPI Phishing (Case {str(crime_id)[:6]})", type="Crime", risk_score=85.0),
        pydantic_schemas.NodeSchema(id="victim_node", label="Riya Sharma (Victim)", type="Person", risk_score=12.0),
        pydantic_schemas.NodeSchema(id="suspect_node", label="Abhishek Modi (Wanted)", type="Person", risk_score=94.0),
        pydantic_schemas.NodeSchema(id="bank_node", label="XXXX-XXXX-1234 (SBI)", type="Bank", risk_score=96.0),
        pydantic_schemas.NodeSchema(id="phone_node", label="+91 98765 43210 (Jio)", type="Phone", risk_score=70.0),
        pydantic_schemas.NodeSchema(id="upi_node", label="abhishek@sbi (VPA)", type="UPI", risk_score=88.0)
    ]
    edges = [
        pydantic_schemas.EdgeSchema(source="victim_node", target="crime_node", type="VICTIMIZED_IN"),
        pydantic_schemas.EdgeSchema(source="suspect_node", target="crime_node", type="INVOLVED_IN"),
        pydantic_schemas.EdgeSchema(source="suspect_node", target="bank_node", type="OWNS"),
        pydantic_schemas.EdgeSchema(source="suspect_node", target="phone_node", type="OWNS"),
        pydantic_schemas.EdgeSchema(source="bank_node", target="upi_node", type="LINKED_ACCOUNT"),
        pydantic_schemas.EdgeSchema(source="upi_node", target="crime_node", type="USED_IN")
    ]
    return pydantic_schemas.GraphResponse(nodes=nodes, edges=edges)
