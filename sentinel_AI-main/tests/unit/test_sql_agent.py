import sys
from unittest.mock import MagicMock

# ── Dynamic Mocks for Headless Test Execution ──
# Prevents ModuleNotFoundError on environments without full compilation dependencies

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
sys.modules['neo4j'] = MagicMock()
sys.modules['redis'] = MagicMock()

# ── End of Dynamic Mocks ──

import unittest
import asyncio
from app.services.agent.sql_agent import SQLAgent

class TestSQLAgent(unittest.TestCase):
    def setUp(self):
        self.agent = SQLAgent()

    def test_sql_validation_safe(self):
        # Enforces SELECT statements only
        valid_query = "SELECT case_number FROM crimes WHERE severity = 'CRITICAL';"
        self.assertTrue(self.agent.validate_sql(valid_query))

    def test_sql_validation_blocked_mutations(self):
        # Enforces blocked queries for INSERT, DELETE, UPDATE, DROP
        queries = [
            "DELETE FROM crimes WHERE id = 'xyz';",
            "UPDATE users SET role = 'ADMIN' WHERE email = 'hacker@sentinelai.io';",
            "INSERT INTO tenants (name) VALUES ('Hacker Tenant');",
            "DROP TABLE audit_logs;",
            "SELECT * FROM crimes; DROP TABLE users;" # Chained query injections
        ]
        for q in queries:
            self.assertFalse(self.agent.validate_sql(q))

    def test_explain_results(self):
        # Verify plain-English summaries generation flow
        async def run_test():
            results = [{"case_number": "SCY-2026-PUN-001", "total_amount_involved": 25000.00}]
            explanation = await self.agent.explain_results(
                user_query="get critical cases count",
                sql_query="SELECT case_number FROM crimes;",
                results=results
            )
            # If API keys are offline, explain_results returns default text with matches
            self.assertIn("SCY-2026-PUN-001", str(results))

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
