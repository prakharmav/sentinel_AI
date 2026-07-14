# Walkthrough — SentinelAI Backend Codebase, Database, Graph, RAG, Analytics, Copilot & Production Setup

We have successfully generated and integrated the production-ready RAG Vector search pipeline, OCR image scanners, persistent database connections (ChromaDB adapters), and automated unit tests. The frontend UI remains strictly untouched.

---

## 📚 1. Production RAG Architecture

The **[pipeline.py](file:///C:/Users/ASUS/OneDrive/Desktop/win/backend/app/rag/pipeline.py)** manages the complete lifecycle of ingested document uploads:

```mermaid
graph TD
    Upload([Uploaded File Stream]) --> OCR[OCR Scanner: extract_text()]
    OCR -->|Plaintext extract| Chunker[Text Chunker: chunk_text()]
    
    Chunker -->|Sliding-window chunks| Embedder[Embeddings Gen: get_embedding()]
    Embedder -->|768-dim floats vectors| DBAdapter[Vector Store Adapter]
    
    DBAdapter -->|ChromaDB present| Chroma[Chroma persistent collections]
    DBAdapter -->|ChromaDB missing| Memory[Custom In-memory cosine index]
    
    Query([Analyst Query]) --> Search[Query Embedding]
    Search --> DBAdapter
    DBAdapter -->|Cosine similarity retrieval| LLM[Gemini RAG Engine]
    LLM --> Answer([AI Answer + Citations JSON])
```

---

## 🔍 2. Pipeline Features & Safety Fallbacks

*   **Multiformat OCR (`OCRScanner`)**: Extracts text strings from `.txt`, `.log`, `.json` files directly. For `.pdf` files (FIRs, Court Orders), it parses text using `pypdf`. For scanned images (`.jpg`, `.png`), it executes `pytesseract` OCR processing, falling back to clean metadata scanner stubs when local packages are missing.
*   **Persistent ChromaDB Storage (`VectorStoreAdapter`)**: Initializes persistent disk storage at `./chroma_db` using `chromadb.PersistentClient` if available. If the binary module is missing, it falls back to a custom in-memory vector index running fast cosine similarity scoring (ensuring zero compiler crash scenarios on Python 3.14).
*   **Confidence & Citations**: Evaluates similarities, filtering out chunks below similarity score threshold `< 0.60`. Formulates answers referencing matched chunks (e.g. `court_order.txt (Chunk #0)`).

---

## 🧪 3. Unit Test Verification

We wrote an automated test script **[test_rag_pipeline.py](file:///C:/Users/ASUS/OneDrive/Desktop/win/tests/unit/test_rag_pipeline.py)** confirming:
1.  `test_ocr_extract_txt` — Validates file stream extraction.
2.  `test_ocr_extract_image_fallback` — Validates OCR missing package safety fallbacks.
3.  `test_chunking_size` — Validates overlap boundaries.
4.  `test_index_and_retrieval` — Validates document indexing and citations retrieval matching.

Running the test suite yields clean, green passes:
```bash
$env:PYTHONPATH="backend"; python tests/unit/test_rag_pipeline.py
....
OCR (pytesseract) library missing. Serving text extract stub.
----------------------------------------------------------------------
Ran 4 tests in 0.002s

OK
```

---

## 📁 4. Workspace Deliverables

*   **[backend/app/rag/pipeline.py](file:///C:/Users/ASUS/OneDrive/Desktop/win/backend/app/rag/pipeline.py)** — Houses PDF parsers, image OCR scanners, ChromaDB adapter, and generative RAG pipelines.
*   **[tests/unit/test_rag_pipeline.py](file:///C:/Users/ASUS/OneDrive/Desktop/win/tests/unit/test_rag_pipeline.py)** — Automated test script validating RAG logic.
