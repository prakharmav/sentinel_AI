import os
from typing import Any, Dict, Optional, List
from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelAI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "production-level-secure-random-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://frontend:3000",   # Docker service name
        "*",                       # Fallback for development
    ]

    # PostgreSQL Connection parameters
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "secure_postgres_password"
    DATABASE_NAME: str = "sentinelai"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], values: Any) -> Any:
        if isinstance(v, str):
            return v
        
        # Get individual fields from the parsed inputs (supports pydantic v2 settings loading)
        data = values.data
        host = data.get("DATABASE_HOST")
        port = data.get("DATABASE_PORT")
        user = data.get("DATABASE_USER")
        password = data.get("DATABASE_PASSWORD")
        db = data.get("DATABASE_NAME")
        
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"

    # Neo4j Graph Database
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "secure_neo4j_password"

    # Redis Cache & Rate Limiting
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""

    # Gemini API Key
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-thinking"

    # Spatio-Temporal Prediction Thresholds
    HOTSPOT_ALERT_THRESHOLD: float = 0.75

    # Keycloak Authorization (Zero Trust)
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "sentinelai"
    KEYCLOAK_CLIENT_ID: str = "sentinelai-backend"

    # Telemetry
    OPENTELEMETRY_ENABLED: bool = True
    JAEGER_ENDPOINT: str = "http://localhost:4317"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
