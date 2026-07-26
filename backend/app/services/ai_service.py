try:
    import google.generativeai as genai
except ImportError:
    genai = None
import json
import logging
from typing import Optional, Dict, Any, List

from app.core.config import settings

logger = logging.getLogger("sentinelai")

class AIService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model_name = settings.GEMINI_MODEL
            logger.info(f"Gemini API configured with model: {self.model_name}")
        else:
            logger.warning("Gemini API key missing. Running in AI Mock / Fallback mode.")
            self.model_name = None

    async def generate_threat_narrative(self, case_number: str, logs: List[Dict[str, Any]]) -> str:
        """
        Threat Reasoning Engine (TRE)
        Generates 6W plain-English threat summaries from raw security logs.
        """
        if not self.model_name:
            return f"Mock Threat Narrative: Coordinated attack targeting UPI endpoints detected for case {case_number}. Flagged anomalous transfers totaling INR 25,000."

        prompt = f"""
        Analyze the following incident logs for Case {case_number} and produce a structured, high-stakes threat narrative:
        
        Logs:
        {json.dumps(logs, indent=2)}
        
        Your analysis must cover:
        1. WHO: Attacker profile (source IPs, devices)
        2. WHAT: Actions taken (transactions, links clicked)
        3. WHEN: Timestamps and duration
        4. WHERE: Targets (bank accounts, virtual interfaces)
        5. WHY: Attacker intent and pattern
        6. HOW: Specific methods (phishing, credential stuffing)
        
        Keep the summary highly professional, clear, and factual.
        """
        
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return f"Error generating narrative: {e}"

    async def parse_unstructured_fir(self, raw_text: str) -> Dict[str, Any]:
        """
        FIR parsing via LLM
        Extracts entities (victims, suspects, banking details) and recommends IT Act sections.
        """
        if not self.model_name:
            # Fallback mock schema
            return {
                "extracted_crime_category": "UPI_FRAUD",
                "extracted_entities": {
                    "victims": ["Riya Sharma"],
                    "suspects": ["Abhishek Modi (alias: Sunny)"],
                    "banking_references": ["SBI Bank account ending 4821"]
                },
                "suggested_legal_sections": ["IT Act Section 66C", "IT Act Section 66D", "IPC Section 420"]
            }

        prompt = f"""
        Analyze this raw police report / complaint:
        ---
        {raw_text}
        ---
        Extract the following structure as JSON:
        {{
            "extracted_crime_category": "UPI_FRAUD | PHISHING | RANSOMWARE | IDENTITY_THEFT | DATA_BREACH | HACKING | OTHER",
            "extracted_entities": {{
                "victims": ["name1", "name2"],
                "suspects": ["suspect1", "suspect2"],
                "banking_references": ["account details, merchant IDs"]
            }},
            "suggested_legal_sections": ["IT Act / IPC sections relevant to the crime details"]
        }}
        
        Return ONLY valid JSON.
        """
        
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except Exception as e:
            logger.error(f"Unstructured FIR parsing failed: {e}")
            return {"error": str(e)}

    async def query_rag_engine(self, user_query: str) -> Dict[str, Any]:
        """
        Natural Language SOC Interface (NLSI)
        RAG model query handler.
        """
        if not self.model_name:
            return {
                "answer": f"Mock answer for '{user_query}': The IP address 192.168.1.105 attempted login 14 times outside business hours.",
                "confidence": 0.85,
                "citations": ["TimescaleDB security_events log #1842-1856"]
            }

        prompt = f"""
        You are SentinelAI's Natural Language SOC Interface.
        Answer the following SOC Analyst query based on standard security contexts:
        ---
        {user_query}
        ---
        Provide a concise response, calculate confidence (0.0 to 1.0), and list the types of logs cited.
        Return as JSON:
        {{
            "answer": "response text",
            "confidence": 0.95,
            "citations": ["references"]
        }}
        """
        
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            return {"error": str(e)}

ai_service = AIService()
