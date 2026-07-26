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
from app.api.v1.endpoints.upload import is_malicious, calculate_sha256
from app.websocket.alerts import ConnectionManager

class TestSecureUploadAndWebSocket(unittest.TestCase):
    def test_calculate_sha256(self):
        data = b"hash_test_bytes"
        hash_val = calculate_sha256(data)
        self.assertEqual(len(hash_val), 64) # SHA-256 hex string outputs 64 characters

    def test_is_malicious_blocked(self):
        # Enforces block on EICAR test string
        eicar = b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
        self.assertTrue(is_malicious(eicar))
        
        # Enforces block on shell script executions
        shell_script = b"#!/bin/bash\nrm -rf /"
        self.assertTrue(is_malicious(shell_script))

    def test_is_malicious_safe(self):
        safe_data = b"Case summary log text. Normal narrative report parameters."
        self.assertFalse(is_malicious(safe_data))

    def test_websocket_channel_subscriptions(self):
        # Validates subscription manager channel groupings
        manager = ConnectionManager()
        self.assertEqual(len(manager.active_channels["alerts"]), 0)
        self.assertEqual(len(manager.active_connections) if hasattr(manager, 'active_connections') else 0, 0)
        
        mock_ws = MagicMock()
        mock_ws.accept = AsyncMock()
        
        async def run_ws():
            await manager.connect(mock_ws)
            self.assertEqual(len(manager.active_channels["alerts"]), 1)
            
            # Subscribe to dashboard channel
            await manager.subscribe_channel(mock_ws, "dashboard")
            self.assertEqual(len(manager.active_channels["dashboard"]), 1)
            
            manager.disconnect(mock_ws)
            self.assertEqual(len(manager.active_channels["alerts"]), 0)

        asyncio.run(run_ws())

if __name__ == "__main__":
    unittest.main()
