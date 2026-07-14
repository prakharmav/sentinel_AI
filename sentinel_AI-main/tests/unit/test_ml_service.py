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
import asyncio
from app.services.ml_service import ml_service

class TestMLService(unittest.TestCase):
    def test_predict_crime_hotspots(self):
        res = ml_service.predict_crime_hotspots(18.5204, 73.8567)
        self.assertIn("threat_level", res)
        self.assertTrue(0.0 <= res["prediction_score"] <= 1.0)

    def test_predict_repeat_offender(self):
        res = ml_service.predict_repeat_offender("aadhaar_hash_sample_value_123")
        self.assertIn("recidivism_probability", res)
        self.assertIn("risk_status", res)

    def test_predict_fraud_probability_suspect(self):
        # Enforces high transaction and new device mule checks
        res = ml_service.predict_fraud_probability(25000.00, True)
        self.assertEqual(res["mule_indicator"], "SUSPECTED_MULE")
        self.assertEqual(res["action_recommendation"], "SUSPEND_BANK_LINK")

    def test_training_pipeline_versioning(self):
        # Enforces model parameter files updates and versions count incrementing
        async def run_test():
            init_version = ml_service.current_version
            await ml_service.run_training_pipeline("tenant_123")
            new_version = ml_service.current_version
            
            # Assert that version string changed (incremented)
            self.assertNotEqual(init_version, new_version)

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
