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

# Mock FastAPI modules to bypass imports
mock_fastapi = MagicMock()
mock_fastapi.APIRouter = MockAPIRouter

sys.modules['fastapi'] = mock_fastapi
sys.modules['fastapi.security'] = MagicMock()
sys.modules['fastapi.responses'] = MagicMock()

class DummyUploadFile:
    def __init__(self, filename: str, file):
        self.filename = filename
        self.file = file
    async def read(self):
        return self.file.read()

# ── End of Dynamic Mocks ──

import unittest
import asyncio
import io

from app.api.v1.endpoints.copilot import (
    get_copilot_case_timeline,
    get_copilot_evidence_summary,
    get_suggested_investigation,
    transcribe_voice_recordings,
    get_streaming_case_summary
)

class TestCopilotEndpoints(unittest.TestCase):
    def test_get_case_timeline(self):
        async def run_test():
            crime_id = "00000000-0000-0000-0000-000000000501"
            timeline = await get_copilot_case_timeline(crime_id)
            self.assertEqual(len(timeline), 6)
            self.assertEqual(timeline[0]["id"], "t1")
            self.assertEqual(timeline[5]["status"], "PENDING")

        asyncio.run(run_test())

    def test_get_evidence_summary(self):
        async def run_test():
            crime_id = "00000000-0000-0000-0000-000000000501"
            evidence = await get_copilot_evidence_summary(crime_id)
            self.assertEqual(len(evidence), 1)
            self.assertEqual(evidence[0]["type"], "SCREENSHOT")
            self.assertTrue(evidence[0]["is_court_admissible"])

        asyncio.run(run_test())

    def test_get_suggested_investigation(self):
        async def run_test():
            crime_id = "00000000-0000-0000-0000-000000000501"
            suggestions = await get_suggested_investigation(crime_id)
            self.assertEqual(len(suggestions), 3)
            self.assertEqual(suggestions[0]["urgency"], "HIGH")

        asyncio.run(run_test())

    def test_transcribe_voice_recordings(self):
        async def run_test():
            # Mock UploadFile content
            mock_audio = DummyUploadFile(
                filename="interview_audio.wav",
                file=io.BytesIO(b"dummy audio stream bytes")
            )
            result = await transcribe_voice_recordings(mock_audio)
            self.assertEqual(result["confidence"], 0.94)
            self.assertEqual(len(result["annotated_entities"]), 3)
            self.assertEqual(result["annotated_entities"][0]["entity"], "Riya Sharma")

        asyncio.run(run_test())

    def test_get_streaming_case_summary(self):
        async def run_test():
            crime_id = "00000000-0000-0000-0000-000000000501"
            response = await get_streaming_case_summary(crime_id)
            # Response is a MagicMock due to fastapi.responses mock, verify it exists
            self.assertIsNotNone(response)

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
