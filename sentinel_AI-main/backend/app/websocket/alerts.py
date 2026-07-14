from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
import logging
import json

logger = logging.getLogger("sentinelai")
router = APIRouter()

class ConnectionManager:
    """
    Manages active socket subscribers, channels pools, and ping/pong keepalives.
    """
    def __init__(self):
        # Maps active connections to channels
        self.active_channels: Dict[str, Set[WebSocket]] = {
            "alerts": set(),
            "dashboard": set(),
            "crime_updates": set()
        }
        self.all_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.all_connections.append(websocket)
        # Default subscribe to alerts channel
        self.active_channels["alerts"].add(websocket)
        logger.info(f"WebSocket analyst connected. Active pool: {len(self.all_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
        # Remove from all channel sets
        for channel in self.active_channels.values():
            channel.discard(websocket)
        logger.info(f"WebSocket analyst disconnected. Active pool: {len(self.all_connections)}")

    async def subscribe_channel(self, websocket: WebSocket, channel_name: str):
        if channel_name in self.active_channels:
            self.active_channels[channel_name].add(websocket)
            logger.info(f"Socket client subscribed to channel: {channel_name}")
        else:
            await websocket.send_json({"error": f"Invalid channel: {channel_name}"})

    async def broadcast_to_channel(self, channel_name: str, payload: dict):
        """
        Pushes updates to channel subscribers (e.g. Dashboard metrics updates, Crime Alerts).
        """
        if channel_name not in self.active_channels:
            return
            
        subscribers = self.active_channels[channel_name]
        logger.info(f"Broadcasting message to {len(subscribers)} clients on channel {channel_name}")
        
        for ws in list(subscribers):
            try:
                await ws.send_json({
                    "channel": channel_name,
                    "payload": payload
                })
            except Exception as e:
                logger.error(f"Failed to push message to socket client: {e}")
                self.disconnect(ws)

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Heartbeats handle and subscription messages parser
            message_text = await websocket.receive_text()
            try:
                payload = json.loads(message_text)
                msg_type = payload.get("type")
                
                # 1. Heartbeat Keepalive Ping
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    
                # 2. Dynamic Channel Subscription
                elif msg_type == "subscribe":
                    channel = payload.get("channel", "alerts")
                    await manager.subscribe_channel(websocket, channel)
                    await websocket.send_json({"status": f"SUBSCRIBED_TO_{channel.upper()}"})
                    
            except Exception:
                # Loopback generic echo
                await websocket.send_json({"echo": message_text})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
