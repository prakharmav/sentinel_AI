import os
import math
import logging
from typing import List, Dict, Any, Tuple
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.core.config import settings

logger = logging.getLogger("sentinelai")

class VectorStore:
    def __init__(self):
        # In-memory document storage mapping document ID to chunk lists
        self.documents: Dict[str, List[Dict[str, Any]]] = {}
        # Flat list of chunks for search traversals: [{"text": str, "vector": list, "file": str, "index": int}]
        self.chunks_pool: List[Dict[str, Any]] = []

    def cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        """
        Calculates cosine similarity between two float vectors.
        """
        dot_product = sum(a * b for a, b in zip(v1, v2))
        magnitude_v1 = math.sqrt(sum(a * a for a in v1))
        magnitude_v2 = math.sqrt(sum(b * b for b in v2))
        
        if magnitude_v1 == 0 or magnitude_v2 == 0:
            return 0.0
        return dot_product / (magnitude_v1 * magnitude_v2)

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Splits raw text into sliding window chunks to preserve context boundaries.
        """
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunks.append(text[start:end])
            start += chunk_size - overlap
            
        return chunks

    async def get_embedding(self, text: str) -> List[float]:
        """
        Generates text embedding using Gemini API embeddings engine.
        """
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document"
                )
                return result["embedding"]
            except Exception as e:
                logger.error(f"Gemini embedding API call failed: {e}")
        
        # Fallback to simple deterministically hashed dummy vector (768 dims) if offline
        # Enforces zero runtime crashes for local deployments
        dummy_vector = [0.0] * 768
        for i, char in enumerate(text[:768]):
            dummy_vector[i % 768] = float(ord(char)) / 255.0
        return dummy_vector

    async def index_document(self, file_name: str, content: str):
        """
        Splits, embeds, and indexes document text into the vector pool.
        """
        logger.info(f"Indexing RAG document: {file_name}")
        chunks = self.chunk_text(content)
        
        doc_chunks = []
        for i, chunk in enumerate(chunks):
            vector = await self.get_embedding(chunk)
            chunk_data = {
                "text": chunk,
                "vector": vector,
                "file_name": file_name,
                "chunk_index": i
            }
            doc_chunks.append(chunk_data)
            self.chunks_pool.append(chunk_data)
            
        self.documents[file_name] = doc_chunks
        logger.info(f"Document {file_name} indexed with {len(chunks)} chunks.")

    async def retrieve(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """
        Searches index for top_k most similar chunks, returning vectors and similarity scores.
        """
        query_vector = await self.get_embedding(query)
        scored_chunks = []
        
        for chunk in self.chunks_pool:
            score = self.cosine_similarity(query_vector, chunk["vector"])
            scored_chunks.append((chunk, score))
            
        # Sort by similarity score descending
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        return scored_chunks[:top_k]

# Global singleton
rag_store = VectorStore()
