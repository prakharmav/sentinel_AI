from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
import json
import logging
import asyncio
import uuid

from app.core.database import get_redis
from app.core.auth import get_current_user, TokenData
from app.agents.orchestrator import orchestrator

logger = logging.getLogger("sentinelai")
router = APIRouter()

# ── 1. Token Counting Utility ──
def estimate_tokens(text: str) -> int:
    """
    Heuristically estimates token size (Standard rule: ~1.3 tokens per word).
    """
    words = text.strip().split()
    if not words:
        return 0
    return int(len(words) * 1.3)

# ── 2. Redis Rate Limiting ──
def is_rate_limited(redis_client, user_id: str, max_requests: int = 5, window_seconds: int = 10) -> bool:
    """
    Implements a sliding window rate limiter in Redis to prevent API abuse.
    """
    if not redis_client:
        # Graceful fallback if Redis is offline
        return False
        
    key = f"rate_limit:chat:{user_id}"
    try:
        current = redis_client.get(key)
        if current and int(current) >= max_requests:
            return True
            
        # Increment request counter and set expiry
        pipeline = redis_client.pipeline()
        pipeline.incr(key)
        pipeline.expire(key, window_seconds)
        pipeline.execute()
        return False
    except Exception as e:
        logger.error(f"Rate limiting query failed: {e}")
        return False

# ── 3. WebSocket Chat Controller ──
@router.websocket("/ws/chat/{session_id}")
async def websocket_chat_session(
    websocket: WebSocket,
    session_id: uuid.UUID,
    token: str = Query(..., description="Authentication token payload")
):
    """
    Exposes WebSocket channel supporting session storage, rate limits, history, and word streaming.
    """
    # 1. Authenticate connection token
    try:
        current_user: TokenData = get_current_user(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("WebSocket chat connection rejected: Unauthorized token.")
        return

    redis_client = get_redis()
    await websocket.accept()
    logger.info(f"Authorized WebSocket chat connection established for user {current_user.user_id} in session {session_id}")

    session_key = f"chat:session:{str(session_id)}"
    
    # 2. Load conversation history from Redis memory
    history = []
    if redis_client:
        try:
            cached_history = redis_client.get(session_key)
            if cached_history:
                history = json.loads(cached_history)
        except Exception as e:
            logger.error(f"Failed to load chat history from Redis: {e}")

    try:
        while True:
            # 3. Receive incoming analyst prompt
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                prompt = payload.get("prompt", "")
            except Exception:
                prompt = data

            if not prompt.strip():
                continue

            # 4. Check Rate Limiter
            if is_rate_limited(redis_client, current_user.user_id):
                await websocket.send_json({
                    "event": "error",
                    "detail": "Rate limit exceeded. Please wait 10 seconds before writing again."
                })
                logger.warning(f"User {current_user.user_id} was rate limited.")
                continue

            # 5. Log prompt and count input tokens
            input_tokens = estimate_tokens(prompt)
            logger.info(f"Chat Prompt: '{prompt}' | Input Tokens: {input_tokens} | User: {current_user.user_id}")

            # Append user prompt to history
            history.append({"role": "user", "content": prompt, "tokens": input_tokens})

            # 6. Execute Multi-Agent logic
            # Send initial thinking status
            await websocket.send_json({"event": "status", "detail": "Orchestrating agent specialist..."})
            
            # Fetch answer
            res = await orchestrator.route_and_execute(
                query=prompt,
                user_id=current_user.user_id,
                tenant_id=current_user.tenant_id
            )
            
            answer = res["answer"]
            output_tokens = estimate_tokens(answer)

            # 7. Stream response word-by-word
            await websocket.send_json({"event": "stream_start"})
            words = answer.split(" ")
            for word in words:
                await websocket.send_json({
                    "event": "stream_chunk",
                    "chunk": word + " "
                })
                await asyncio.sleep(0.06)
                
            await websocket.send_json({
                "event": "stream_end",
                "citations": res.get("citations", []),
                "tokens_used": input_tokens + output_tokens
            })

            # Append response to memory history
            history.append({"role": "assistant", "content": answer, "tokens": output_tokens})

            # 8. Save session history back to Redis
            if redis_client:
                try:
                    # Cache session history for 2 hours
                    redis_client.setex(session_key, 7200, json.dumps(history))
                except Exception as e:
                    logger.error(f"Failed to cache session history: {e}")

    except WebSocketDisconnect:
        logger.info(f"WebSocket session {session_id} disconnected.")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
