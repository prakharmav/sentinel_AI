from fastapi import APIRouter
from app.api.v1.endpoints import auth, crimes, graph, chat, analytics, reports, citizen, notifications, copilot, ml, upload, timeline, alerts, voice, sync

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(crimes.router, prefix="/crimes", tags=["Crimes"])
api_router.include_router(graph.router, prefix="/graph", tags=["Graph Network Explorer"])
api_router.include_router(chat.router, prefix="/chat", tags=["Natural Language SOC Interface"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(citizen.router, prefix="/citizen", tags=["Citizen App"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Copilot"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning Predictions"])
api_router.include_router(upload.router, prefix="/upload", tags=["Secure Document Ingestion"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["AI Timeline Builder"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alert Engine"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice AI"])
api_router.include_router(sync.router, prefix="/sync", tags=["Offline Sync Manager"])
