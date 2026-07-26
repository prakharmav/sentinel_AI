try:
    import google.generativeai as genai
except ImportError:
    genai = None
import json
import re
import logging
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal

logger = logging.getLogger("sentinelai")

DB_SCHEMA_CONTEXT = """
You are a PostgreSQL SQL query generator. Generate ONLY a valid PostgreSQL SELECT query based on this database schema:

Tables & Columns:
1. tenants(id UUID, name VARCHAR, slug VARCHAR, plan VARCHAR, status VARCHAR)
2. locations(id UUID, address VARCHAR, district VARCHAR, state VARCHAR, pincode VARCHAR, ip_address INET, is_virtual BOOLEAN)
3. citizens(id UUID, first_name VARCHAR, last_name VARCHAR, aadhaar_hash VARCHAR, primary_phone VARCHAR, email VARCHAR, permanent_location_id UUID)
4. users(id UUID, email VARCHAR, role VARCHAR, last_login TIMESTAMPTZ)
5. police_stations(id UUID, station_code VARCHAR, name VARCHAR, district VARCHAR, state VARCHAR, phone VARCHAR)
6. firs(id UUID, fir_number VARCHAR, filed_at TIMESTAMPTZ, complainant_citizen_id UUID, primary_section VARCHAR, crime_category VARCHAR, fir_text TEXT, status VARCHAR)
7. crimes(id UUID, case_number VARCHAR, fir_id UUID, category VARCHAR, status VARCHAR, severity VARCHAR, incident_date DATE, total_amount_involved DECIMAL, total_amount_recovered DECIMAL, lead_officer_id UUID)
8. victims(id UUID, citizen_id UUID, crime_id UUID, amount_lost DECIMAL)
9. suspects(id UUID, crime_id UUID, citizen_id UUID, name VARCHAR, aliases VARCHAR[], status VARCHAR, modus_operandi TEXT, ai_risk_score DECIMAL)
10. phone_numbers(id UUID, number VARCHAR, carrier VARCHAR, sim_swap_count INT, is_flagged BOOLEAN)
11. bank_accounts(id UUID, account_number_masked VARCHAR, bank_name VARCHAR, ifsc_code VARCHAR, holder_name VARCHAR, is_flagged BOOLEAN, is_frozen BOOLEAN, is_mule BOOLEAN)
12. upi_vpas(id UUID, vpa VARCHAR, registered_name VARCHAR, linked_bank_id UUID, is_flagged BOOLEAN)
13. evidence(id UUID, crime_id UUID, title VARCHAR, evidence_type VARCHAR, content_hash VARCHAR, storage_path VARCHAR, is_court_admissible BOOLEAN)
14. reports(id UUID, crime_id UUID, report_type VARCHAR, title VARCHAR, summary TEXT, is_submitted BOOLEAN)

Guidelines:
- All queries must be read-only (SELECT statements only).
- Apply filters based on values provided in the request (e.g. severity = 'CRITICAL').
- Enforce tenant filtering on tables that contain tenant_id (e.g. crimes.tenant_id = :tenant_id).
- Respond with ONLY the executable SQL query inside a markdown block. No extra explanations in the generator step.
"""

class SQLAgent:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    def validate_sql(self, sql: str) -> bool:
        """
        Strict security verification of generated SQL query strings.
        Ensures read-only queries only.
        """
        cleaned = sql.strip().upper()
        
        # 1. Enforce SELECT queries
        if not cleaned.startswith("SELECT"):
            logger.warning(f"SQL validation blocked query (Must start with SELECT): {sql}")
            return False
            
        # 2. Block destructive or mutating SQL keywords
        forbidden = [
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", 
            "REPLACE", "CREATE", "GRANT", "REVOKE", "MERGE", "EXECUTE", 
            "COPY", "DATABASE", "SCHEMA", "RULE", "TRIGGER"
        ]
        for keyword in forbidden:
            if re.search(r'\b' + keyword + r'\b', cleaned):
                logger.warning(f"SQL validation blocked query (Forbidden keyword '{keyword}'): {sql}")
                return False
                
        return True

    async def generate_sql(self, user_query: str, tenant_id: str) -> str:
        """
        Generates PostgreSQL SELECT statement matching user query.
        """
        if not self.model:
            # Fallback mock SQL query if Gemini is offline
            return f"SELECT case_number, category, status, severity, total_amount_involved FROM crimes WHERE tenant_id = '{tenant_id}' LIMIT 5;"

        prompt = f"""
        {DB_SCHEMA_CONTEXT}
        
        User Query: "{user_query}"
        Tenant ID: "{tenant_id}"
        
        Generate the corresponding SQL statement. Remember to wrap the generated SQL in a clean block starting with ```sql.
        """
        try:
            response = self.model.generate_content(prompt)
            # Extract SQL code from markdown block
            sql_match = re.search(r"```sql(.*?)```", response.text, re.DOTALL | re.IGNORECASE)
            if sql_match:
                return sql_match.group(1).strip()
            return response.text.replace("```", "").strip()
        except Exception as e:
            logger.error(f"Gemini SQL generation failed: {e}")
            return ""

    def execute_sql(self, sql_query: str, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Executes validated SQL query string against PostgreSQL database connection.
        """
        if not self.validate_sql(sql_query):
            raise PermissionError("Generated query failed safety audit constraints (Non-SELECT or mutating statement).")

        db: Session = SessionLocal()
        try:
            # Bind parameters to prevent SQL Injection vectors
            # (In production, replace hardcoded UUID comparisons with bindings)
            statement = text(sql_query)
            result = db.execute(statement, {"tenant_id": tenant_id})
            
            # Format row records into JSON serializable dict lists
            rows = result.fetchall()
            columns = result.keys()
            return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            logger.error(f"SQL Execution failed: {e} | Query: {sql_query}")
            return [{"error": f"Database execution failure: {str(e)}", "query": sql_query}]
        finally:
            db.close()

    async def explain_results(self, user_query: str, sql_query: str, results: List[Dict[str, Any]]) -> str:
        """
        Formulates a natural language explanation of the database results.
        """
        if not self.model:
            return f"Database query executed successfully. Found {len(results)} matches matching criteria."

        prompt = f"""
        You are the SQL Explainability Agent for SentinelAI.
        Translate the following database query results into a clear, professional SOC alert brief:
        
        User Request: "{user_query}"
        Executed SQL: "{sql_query}"
        Database Output JSON:
        {json.dumps(results, indent=2)}
        
        Provide a concise plain-English explanation. If findings suggest severe risk patterns (e.g. values exceeding threshold), highlight them.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Explainability generation failed: {e}")
            return f"Query executed. Found records: {json.dumps(results)}"

    async def run(self, user_query: str, tenant_id: str) -> Dict[str, Any]:
        """
        Orchestration pipeline execution run.
        """
        # 1. Translate NL to SQL
        sql_query = await self.generate_sql(user_query, tenant_id)
        logger.info(f"Generated SQL: {sql_query}")

        try:
            # 2. Execute SQL query on Postgres session
            results = self.execute_sql(sql_query, tenant_id)
            # 3. Explain findings
            explanation = await self.explain_results(user_query, sql_query, results)
            
            return {
                "answer": explanation,
                "context_data": {
                    "sql_query": sql_query,
                    "results_count": len(results),
                    "results_payload": results
                }
            }
        except PermissionError as perm_err:
            return {
                "answer": f"Blocked: {perm_err}",
                "context_data": {"sql_query": sql_query, "status": "BLOCKED"}
            }
        except Exception as err:
            return {
                "answer": f"Execution error occurred while parsing database logs.",
                "context_data": {"sql_query": sql_query, "error": str(err)}
            }

sql_agent_instance = SQLAgent()
