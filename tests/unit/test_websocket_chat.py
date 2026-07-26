import sys
from unittest.mock import MagicMock

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
from app.websocket.chat import estimate_tokens, is_rate_limited

class TestWebSocketChat(unittest.TestCase):
    def test_estimate_tokens(self):
        text = "This is a simple query message."
        tokens = estimate_tokens(text)
        self.assertEqual(tokens, 7) # 6 words * 1.3 = 7.8 -> int 7

    def test_is_rate_limited_ok(self):
        # Redis client mock returning normal count
        mock_redis = MagicMock()
        mock_redis.get.return_value = "2"
        self.assertFalse(is_rate_limited(mock_redis, "user_123", max_requests=5))

    def test_is_rate_limited_blocked(self):
        # Redis client mock returning limit count
        mock_redis = MagicMock()
        mock_redis.get.return_value = "6"
        self.assertTrue(is_rate_limited(mock_redis, "user_123", max_requests=5))

if __name__ == "__main__":
    unittest.main()
