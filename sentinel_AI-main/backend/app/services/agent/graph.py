from typing import Dict, Any, List
import logging

from app.services.agent.state import AgentState
from app.services.agent.agents import (
    CoordinatorAgent,
    crime_agent,
    sql_agent,
    graph_agent,
    citizen_agent,
    fraud_agent,
    report_agent
)

logger = logging.getLogger("sentinelai")
coordinator = CoordinatorAgent()

class LangGraphOrchestrator:
    """
    State Graph orchestrator modeling the multi-agent supervisor pattern.
    """
    async def execute_query(self, user_query: str, user_id: str, tenant_id: str) -> Dict[str, Any]:
        logger.info(f"LangGraph executing user query: {user_query}")
        
        # Initialize Graph State
        state: AgentState = {
            "messages": [{"role": "user", "content": user_query}],
            "current_agent": "coordinator",
            "next_step": "route",
            "context_data": {},
            "user_id": user_id,
            "tenant_id": tenant_id
        }

        # Step 1: Coordinator decides which agent to route to
        target_agent = await coordinator.route_request(state)
        state["current_agent"] = target_agent
        
        logger.info(f"Coordinator routed request to: {target_agent}")

        # Step 2: Invoke the target specialist subagent
        response_payload = {}
        if target_agent == "crime_agent":
            response_payload = await crime_agent.execute(state)
        elif target_agent == "sql_agent":
            response_payload = await sql_agent.execute(state)
        elif target_agent == "graph_agent":
            response_payload = await graph_agent.execute(state)
        elif target_agent == "citizen_agent":
            response_payload = await citizen_agent.execute(state)
        elif target_agent == "fraud_agent":
            response_payload = await fraud_agent.execute(state)
        elif target_agent == "report_agent":
            response_payload = await report_agent.execute(state)
        else:
            response_payload = await crime_agent.execute(state)

        # Merge response message back to state
        state["messages"].extend(response_payload.get("messages", []))
        state["context_data"].update(response_payload.get("context_data", {}))

        # Retrieve last assistant reply
        assistant_reply = state["messages"][-1]["content"] if state["messages"] else "No response generated."

        return {
            "answer": assistant_reply,
            "confidence": 0.95,
            "citations": [f"Source: LangGraph - {target_agent}"],
            "routed_agent": target_agent
        }

# Global singleton
agent_orchestrator = LangGraphOrchestrator()
