from typing import List, Dict, Any, TypedDict, Annotated
import operator

# State defined for LangGraph orchestrator
class AgentState(TypedDict):
    messages: Annotated[List[Dict[str, str]], operator.add]  # Appending chat history
    current_agent: str
    next_step: str
    context_data: Dict[str, Any]
    user_id: str
    tenant_id: str
