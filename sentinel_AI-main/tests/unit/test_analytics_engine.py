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
from app.analytics.engine import AnalyticsEngine

class TestAnalyticsEngine(unittest.TestCase):
    def setUp(self):
        # Create engine with mock redis
        self.mock_redis = MagicMock()
        self.engine = AnalyticsEngine(self.mock_redis)

    def test_cache_miss_queries(self):
        # Verify that if Redis has no data, engine calls DB
        self.mock_redis.get.return_value = None
        db_mock = MagicMock()
        # Force database exception to trigger fallback aggregation dataset
        db_mock.execute.side_effect = Exception("Database connection offline mock exception.")
        
        seasonality = self.engine.analyze_seasonality("tenant_123", db_mock)
        self.assertEqual(len(seasonality), 4) # Should return 4 seasonal buckets
        self.assertEqual(seasonality[0]["season"], "SUMMER")
        self.assertTrue(self.mock_redis.setex.called) # Should write results to cache

    def test_cache_hit_bypasses(self):
        # Verify that if Redis has data, engine skips DB
        self.mock_redis.get.return_value = '[{"season": "WINTER", "count": 100}]'
        db_mock = MagicMock()
        
        seasonality = self.engine.analyze_seasonality("tenant_123", db_mock)
        self.assertEqual(len(seasonality), 1)
        self.assertEqual(seasonality[0]["season"], "WINTER")
        self.assertFalse(db_mock.execute.called) # Database query should be bypassed

    def test_compare_districts(self):
        self.mock_redis.get.return_value = None
        db_mock = MagicMock()
        
        comparison = self.engine.compare_districts("tenant_123", db_mock)
        self.assertEqual(len(comparison), 4)
        self.assertEqual(comparison[0]["district"], "Pune Central")
        self.assertEqual(comparison[1]["district"], "Mumbai Suburban")

if __name__ == "__main__":
    unittest.main()
