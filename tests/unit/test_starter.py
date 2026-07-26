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

# Mock APIRouter to preserve original function descriptors when decorated
class MockAPIRouter:
    def __init__(self, *args, **kwargs):
        pass
    def get(self, *args, **kwargs):
        return lambda f: f
    def post(self, *args, **kwargs):
        return lambda f: f
    def put(self, *args, **kwargs):
        return lambda f: f
    def delete(self, *args, **kwargs):
        return lambda f: f
    def websocket(self, *args, **kwargs):
        return lambda f: f

# Mock FastAPI modules to bypass imports
mock_fastapi = MagicMock()
mock_fastapi.APIRouter = MockAPIRouter
mock_fastapi.FastAPI = MagicMock()

sys.modules['fastapi'] = mock_fastapi
sys.modules['fastapi.security'] = MagicMock()
sys.modules['fastapi.responses'] = MagicMock()
sys.modules['fastapi.middleware.cors'] = MagicMock()
sys.modules['starlette.middleware.base'] = MagicMock()

# ── End of Dynamic Mocks ──

import unittest
import asyncio

from app.utils.pdf_generator import calculate_sha512, generate_pdf_report
from app.middleware.security import SecurityAuditMiddleware
from app.websocket.alerts import ConnectionManager

class TestStarterProject(unittest.TestCase):
    def test_calculate_sha512(self):
        data = b"integrity_sealing_data"
        hash_val = calculate_sha512(data)
        self.assertEqual(len(hash_val), 128) # SHA-512 outputs 128 character hex string

    def test_generate_pdf_report(self):
        buf = generate_pdf_report("Compliance Notice", "Summary Text", "Details Block")
        content = buf.read().decode("utf-8")
        self.assertIn("SENTINELAI REGULATORY COMPLIANCE DRAFT", content)
        self.assertIn("Compliance Notice", content)

    def test_websocket_manager(self):
        manager = ConnectionManager()
        self.assertEqual(len(manager.all_connections), 0)
        
        mock_ws = MagicMock()
        mock_ws.accept = AsyncMock() # Correctly resolves coroutine await calls
        
        async def run_ws():
            await manager.connect(mock_ws)
            self.assertEqual(len(manager.all_connections), 1)
            manager.disconnect(mock_ws)
            self.assertEqual(len(manager.all_connections), 0)

        asyncio.run(run_ws())

if __name__ == "__main__":
    unittest.main()
