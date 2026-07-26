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
from app.rag.pipeline import RAGPipeline

class TestRAGPipeline(unittest.TestCase):
    def setUp(self):
        self.pipeline = RAGPipeline()

    def test_ocr_extract_txt(self):
        content = b"Case details log file."
        extracted = self.pipeline.ocr.extract_text(content, "incident.txt")
        self.assertEqual(extracted, "Case details log file.")

    def test_ocr_extract_image_fallback(self):
        content = b"image_raw_bytes"
        extracted = self.pipeline.ocr.extract_text(content, "photo.jpg")
        self.assertIn("OCR Scan Check", extracted)

    def test_chunking_size(self):
        text = "C" * 2000
        chunks = self.pipeline.chunk_text(text, size=800, overlap=150)
        self.assertTrue(len(chunks) > 1)
        self.assertEqual(len(chunks[0]), 800)

    def test_index_and_retrieval(self):
        async def run_test():
            file_name = "court_order.txt"
            content = "The Pune Cyber Court orders suspect accounts frozen immediately."
            
            # Index document
            await self.pipeline.process_and_index(content.encode("utf-8"), file_name)
            
            # Query document
            res = await self.pipeline.retrieve_and_answer("orders suspect accounts frozen")
            self.assertIn("court_order.txt", res["citations"][0])
            self.assertTrue(res["confidence"] > 0.5)

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
