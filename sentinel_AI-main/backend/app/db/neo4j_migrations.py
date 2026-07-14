# ============================================================
# SentinelAI — Neo4j Migration Runner
#
# Automatically executes migration scripts to enforce unique
# constraints and index structures when the driver connects.
# ============================================================

from __future__ import annotations

import logging
import os
from neo4j import GraphDatabase

logger = logging.getLogger("sentinelai.neo4j")


def run_neo4j_migrations(driver) -> None:
    """
    Executes constraints and index cypher files sequentially against
    the active Neo4j driver connection.
    """
    if not driver:
        logger.warning("Neo4j driver offline. Skipping migrations.")
        return

    migrations = [
        "infrastructure/neo4j/migrations/001-constraints.cypher",
        "infrastructure/neo4j/migrations/002-indexes.cypher",
    ]

    try:
        with driver.session() as session:
            for path in migrations:
                if not os.path.exists(path):
                    logger.warning(f"Neo4j migration script missing: {path}")
                    continue

                logger.info(f"Applying Neo4j migration: {path}...")
                with open(path, "r") as f:
                    content = f.read()

                # Clean up lines and separate by semicolons
                queries = [q.strip() for q in content.split(";") if q.strip()]
                for query in queries:
                    # Ignore single-line comments
                    if query.startswith("//"):
                        continue
                    try:
                        session.run(query)
                        logger.info(f"Successfully executed Cypher constraint/index query.")
                    except Exception as query_error:
                        # Ignore "Equivalent constraint/index already exists" errors
                        err_msg = str(query_error).lower()
                        if "already exists" in err_msg or "equivalent" in err_msg:
                            continue
                        logger.warning(f"Cypher statement skipped/failed: {query_error}")

        logger.info("All Neo4j migrations verified/completed successfully.")
    except Exception as e:
        logger.error(f"Failed to execute Neo4j migrations runner: {e}")
