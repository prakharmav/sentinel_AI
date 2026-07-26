from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from typing import Dict, Any, List
import logging

from app.core.auth import get_current_user, TokenData
from app.schemas import pydantic_schemas
from app.services.rag_service import rag_store
from app.services.ai_service import ai_service

logger = logging.getLogger("sentinelai")
router = APIRouter()

@router.post("/query", response_model=pydantic_schemas.ChatQueryResponse)
async def query_assistant(
    payload: pydantic_schemas.ChatQueryRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    RAG Search Endpoint.
    Searches indexed documents first, injects context to Gemini prompt, and returns citations.
    """
    # 1. Search vector database for query matches
    matches = await rag_store.retrieve(payload.query, top_k=2)
    
    context_chunks = []
    citations = []
    
    for chunk, score in matches:
        if score > 0.65: # Only include highly relevant context (confidence filter)
            context_chunks.append(chunk["text"])
            citations.append(f"{chunk['file_name']} (Chunk #{chunk['chunk_index']})")
            
    # 2. Combine query with local text context
    prompt = payload.query
    if context_chunks:
        context_str = "\n---\n".join(context_chunks)
        prompt = (
            f"Use the following local document context to answer the analyst query:\n"
            f"{context_str}\n"
            f"--- Query: {payload.query}"
        )

    # 3. Request Gemini RAG generation
    ai_response = await ai_service.query_rag_engine(prompt)
    
    # Calculate confidence based on maximum similarity score or defaults
    max_similarity = matches[0][1] if matches else 0.70
    confidence = float(round(max_similarity, 2))
    
    return pydantic_schemas.ChatQueryResponse(
        answer=ai_response.get("answer", "No answer could be formulated."),
        confidence=confidence,
        citations=citations if citations else ["General security knowledge base"]
    )

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_reference_document(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Accepts text or PDF documents, extracts raw text, chunks and indexes them into vector store.
    """
    if not file.filename.endswith((".txt", ".pdf", ".json", ".log")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload .txt, .pdf, or .log files."
        )
        
    try:
        content = ""
        file_bytes = await file.read()
        
        # 1. Parse content based on file type
        if file.filename.endswith(".pdf"):
            try:
                import pypdf
                import io
                pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                text_list = []
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        text_list.append(text)
                content = "\n".join(text_list)
            except ImportError:
                # PDF parser package missing fallback: read as string and parse text boundaries
                logger.warning("pypdf library missing. Parsing text streams directly.")
                content = file_bytes.decode("utf-8", errors="ignore")
        else:
            # Standard text files
            content = file_bytes.decode("utf-8")
            
        if not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content is empty or unparseable."
            )
            
        # 2. Split text and index vectors
        await rag_store.index_document(file.filename, content)
        
        return {
            "message": f"Document '{file.filename}' processed and indexed successfully.",
            "file_name": file.filename,
            "chunks": len(rag_store.documents.get(file.filename, []))
        }
        
    except Exception as e:
        logger.error(f"Failed to process uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )
