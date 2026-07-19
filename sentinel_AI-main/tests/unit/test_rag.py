import sys
from unittest.mock import MagicMock

# ── Dynamic Mocks for Headless Test Execution ──
# Prevents ModuleNotFoundError on environments without full compilation dependencies
try:
    import pydantic
    import pydantic_settings
except ImportError:
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
# ── End of Dynamic Mocks ──

import unittest
import asyncio
from app.services.rag_service import VectorStore

class TestRAGService(unittest.TestCase):
    def setUp(self):
        self.store = VectorStore()

    def test_text_chunking(self):
        # Enforces character chunking splits and overlaps
        text = "A" * 1500
        chunks = self.store.chunk_text(text, chunk_size=1000, overlap=200)
        
        self.assertEqual(len(chunks), 2)
        self.assertEqual(len(chunks[0]), 1000)
        self.assertEqual(len(chunks[1]), 700) # (1500 - 800)

    def test_cosine_similarity(self):
        # Enforces perfect match and orthogonal vectors checks
        v1 = [1.0, 0.0, 1.0]
        v2 = [1.0, 0.0, 1.0]
        v3 = [0.0, 1.0, 0.0]
        
        self.assertAlmostEqual(self.store.cosine_similarity(v1, v2), 1.0)
        self.assertAlmostEqual(self.store.cosine_similarity(v1, v3), 0.0)

    def test_indexing_and_retrieval(self):
        # Index document and query it
        async def run_test():
            file_name = "test_alert_brief.txt"
            content = "SentinelAI Threat Alert: suspicious bank account XXXX-1234 identified as money mule."
            await self.store.index_document(file_name, content)
            
            # Retrieve search match using identical text for mock vector identity verification
            matches = await self.store.retrieve(content, top_k=1)
            self.assertEqual(len(matches), 1)
            matched_chunk, score = matches[0]
            self.assertEqual(matched_chunk["file_name"], file_name)
            self.assertAlmostEqual(score, 1.0) # Cosine similarity of identical mock vectors = 1.0

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
