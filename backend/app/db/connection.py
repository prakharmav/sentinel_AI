from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import redis
import logging
from neo4j import GraphDatabase

from app.core.config import settings

logger = logging.getLogger("sentinelai")

# ── 1. PostgreSQL Connection ──
engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ── 2. Neo4j Graph Connection ──
neo4j_driver = None
if settings.NEO4J_URI:
    try:
        neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        logger.info("Neo4j Graph Database driver connected.")
    except Exception as e:
        logger.error(f"Neo4j connection error: {e}")

# ── 3. Redis Cache Connection ──
redis_client = None
try:
    redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
    if settings.REDIS_PASSWORD:
        redis_url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}"
    redis_client = redis.from_url(redis_url, decode_responses=True)
    logger.info("Redis cache client connected.")
except Exception as e:
    logger.error(f"Redis connection error: {e}")

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_graph():
    if not neo4j_driver:
        return None
    session = neo4j_driver.session()
    try:
        yield session
    finally:
        session.close()

def get_redis():
    return redis_client
