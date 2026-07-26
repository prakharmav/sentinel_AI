import sys
from unittest.mock import MagicMock, AsyncMock

# ── Dynamic Mocks for Headless Test Execution ──
class MockSettingsConfigDict(dict):
    def __init__(self, *args, **kwargs):
        super().__init__()

class MockBaseSettings:
    def __init__(self, *args, **kwargs):
        pass

mock_pydantic_settings = MagicMock()
mock_pydantic_settings.BaseSettings = MockBaseSettings
mock_pydantic_settings.SettingsConfigDict = MockSettingsConfigDict

sys.modules['pydantic'] = MagicMock()
sys.modules['pydantic_settings'] = mock_pydantic_settings
sys.modules['sqlalchemy'] = MagicMock()
sys.modules['sqlalchemy.orm'] = MagicMock()
sys.modules['sqlalchemy.dialects'] = MagicMock()
sys.modules['sqlalchemy.dialects.postgresql'] = MagicMock()
sys.modules['sqlalchemy.sql'] = MagicMock()
sys.modules['neo4j'] = MagicMock()
sys.modules['redis'] = MagicMock()
sys.modules['jwt'] = MagicMock()
sys.modules['jwt.exceptions'] = MagicMock()
sys.modules['passlib'] = MagicMock()
sys.modules['passlib.context'] = MagicMock()
sys.modules['google'] = MagicMock()
sys.modules['google.generativeai'] = MagicMock()

# Mock FastAPI modules to bypass imports
sys.modules['fastapi'] = MagicMock()
sys.modules['fastapi.security'] = MagicMock()
sys.modules['fastapi.responses'] = MagicMock()

# ── End of Dynamic Mocks ──

import unittest
import asyncio
import uuid

from app.repositories.graph_repo import GraphRepository
from app.agents.orchestrator import orchestrator

class TestProductionSetup(unittest.TestCase):
    def test_graph_pagerank_centrality(self):
        # Validates GDS PageRank centrality algorithm fallbacks
        repo = GraphRepository(None) # Session offline
        centrality = repo.run_pagerank_centrality("tenant_123")
        self.assertEqual(len(centrality), 2)
        self.assertEqual(centrality[0]["node_id"], "suspect_node")

    def test_graph_louvain_communities(self):
        # Validates GDS Louvain communities detection fallbacks
        repo = GraphRepository(None) # Session offline
        communities = repo.run_louvain_communities("tenant_123")
        self.assertEqual(len(communities), 3)
        self.assertEqual(communities[0]["community_group"], 1)

    def test_orchestrator_routing_crime(self):
        # Enforces model-isolated coordinator routing and execution defaults
        async def run_test():
            res = await orchestrator.route_and_execute(
                query="describe critical cases",
                user_id="user_123",
                tenant_id="tenant_123"
            )
            self.assertEqual(res["routed_agent"], "crime_agent")
            self.assertIn("Offline mock response", res["answer"])

        asyncio.run(run_test())

    def test_orchestrator_routing_sql(self):
        # Enforces query heuristics routing to SQL
        async def run_test():
            res = await orchestrator.route_and_execute(
                query="counts in database crimes table",
                user_id="user_123",
                tenant_id="tenant_123"
            )
            self.assertEqual(res["routed_agent"], "sql_agent")

        asyncio.run(run_test())

    def test_orchestrator_streaming_sse(self):
        # Enforces streaming Server-Sent Events token generators
        async def run_test():
            chunks = []
            async for chunk in orchestrator.stream_execute(
                query="counts inside databases",
                user_id="user_123",
                tenant_id="tenant_123"
            ):
                chunks.append(chunk)
                if len(chunks) >= 3:
                    break
            self.assertTrue(len(chunks) > 0)
            self.assertTrue(chunks[0].startswith("data: "))

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
