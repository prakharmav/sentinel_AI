try:
    import google.generativeai as genai
except ImportError:
    genai = None
import json
import logging
from typing import Dict, Any, List

from app.core.config import settings

logger = logging.getLogger("sentinelai")

class BaseSubAgent:
    def __init__(self, name: str, prompt_template: str):
        self.name = name
        self.prompt_template = prompt_template
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes subagent reasoning loop.
        """
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""
        
        if not self.model:
            # Fallback mock responses
            return {
                "messages": [{"role": "assistant", "content": f"[{self.name}] Mock response matching analyst context."}],
                "context_data": {"source": self.name}
            }

        prompt = self.prompt_template.format(
            query=last_message,
            context=json.dumps(state.get("context_data", {}))
        )
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "messages": [{"role": "assistant", "content": response.text}],
                "context_data": {f"{self.name}_raw_insight": response.text}
            }
        except Exception as e:
            logger.error(f"Agent {self.name} execution failed: {e}")
            return {"messages": [{"role": "assistant", "content": f"Error running {self.name}: {e}"}]}

# ── 1. Coordinator Agent (Supervisor/Router) ──
class CoordinatorAgent:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    async def route_request(self, state: Dict[str, Any]) -> str:
        """
        Analyzes the user's prompt and routes it to the correct specialist subagent.
        """
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""

        if not self.model:
            # Basic routing heuristic if model is offline
            lm = last_message.lower()
            if "database" in lm or "count" in lm or "table" in lm:
                return "sql_agent"
            elif "network" in lm or "relationship" in lm or "connect" in lm:
                return "graph_agent"
            elif "mule" in lm or "transaction" in lm or "bank" in lm:
                return "fraud_agent"
            elif "compliance" in lm or "report" in lm or "pdf" in lm:
                return "report_agent"
            elif "file" in lm or "complaint" in lm or "fir" in lm:
                return "citizen_agent"
            return "crime_agent"

        prompt = f"""
        You are the Coordinator Agent for SentinelAI. Your task is to route the user's query to the most appropriate specialist agent.
        
        User Query:
        "{last_message}"
        
        Specialist Agents:
        1. "crime_agent": For general investigation overview, risk scores, case details, or security summaries.
        2. "sql_agent": For direct relational database metrics, counts, and search across cases.
        3. "graph_agent": For network relationships, tracking associated entities (phones, suspects, bank links).
        4. "citizen_agent": For filing complaints, parsing FIR details, or checking citizen tracking status.
        5. "fraud_agent": For auditing money mule trails, bank freezes, and transaction anomalies.
        6. "report_agent": For compliance reports drafts (GDPR, DPDP) and downloading PDFs.
        
        Return ONLY the selected agent name from the list above. Example: "graph_agent".
        """
        try:
            response = self.model.generate_content(prompt)
            target = response.text.strip().lower()
            # Clean response text from quotes or markdown
            for agent in ["crime_agent", "sql_agent", "graph_agent", "citizen_agent", "fraud_agent", "report_agent"]:
                if agent in target:
                    return agent
            return "crime_agent"
        except Exception:
            return "crime_agent"

# ── 2. Crime Agent ──
crime_prompt = """
You are the Crime Agent for SentinelAI. Review user request and supply a brief, case-focused narrative summary.
Query: {query}
Context: {context}
"""
crime_agent = BaseSubAgent("CrimeAgent", crime_prompt)

# ── 3. SQL Agent ──
class SQLAgentWrapper:
    async def execute(self, state: dict):
        from app.services.agent.sql_agent import sql_agent_instance
        user_query = state["messages"][-1]["content"] if state["messages"] else ""
        tenant_id = state.get("tenant_id")
        
        result = await sql_agent_instance.run(user_query, tenant_id)
        
        return {
            "messages": [{"role": "assistant", "content": result["answer"]}],
            "context_data": result["context_data"]
        }

sql_agent = SQLAgentWrapper()

# ── 4. Graph Agent ──
graph_prompt = """
You are the Graph Agent. Traverse the threat network relationships and trace connections.
Query: {query}
Context: {context}
"""
graph_agent = BaseSubAgent("GraphAgent", graph_prompt)

# ── 5. Citizen Agent ──
citizen_prompt = """
You are the Citizen Agent. Draft FIR filings or parse complaint details.
Query: {query}
Context: {context}
"""
citizen_agent = BaseSubAgent("CitizenAgent", citizen_prompt)

# ── 6. Fraud Agent ──
fraud_prompt = """
You are the Fraud Agent. Audit suspicious transactions and identify money mule accounts.
Query: {query}
Context: {context}
"""
fraud_agent = BaseSubAgent("FraudAgent", fraud_prompt)

# ── 7. Report Agent ──
report_prompt = """
You are the Report Agent. Assist in drafting compliance reports and organizing regulatory notices.
Query: {query}
Context: {context}
"""
report_agent = BaseSubAgent("ReportAgent", report_prompt)
