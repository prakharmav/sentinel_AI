# ============================================================
# SentinelAI — Hackathon Demo Flow PDF Compiler
#
# Generates a professional, print-ready PDF containing the
# step-by-step "Digital Arrest Scam" demo script with code blocks.
# ============================================================

from __future__ import annotations

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

DEMO_STEPS = [
    {
        "step": "STEP 1: Incident Ingestion (Bilingual Voice AI)",
        "desc": "A citizen speaks or uploads an audio recording explaining they were placed under 'digital arrest' by impersonators claiming to be CBI officers and coerced into transferring INR 2,50,000 to a 'verification account'.",
        "meta": "API Endpoint: POST /api/v1/voice/interact\nPayload: audio_file (digital_arrest_complaint.wav), language_hint (en)",
        "code": "{\n  \"language\": \"en\",\n  \"transcription\": \"I received a Skype call from someone claiming to be a CBI Inspector...\",\n  \"stt_confidence\": 0.94,\n  \"routed_agent\": \"fraud_specialist\",\n  \"text_answer\": \"This is a confirmed Digital Arrest impersonation scam...\",\n  \"noise_reduction_applied\": true,\n  \"processing_time_ms\": 320\n}"
    },
    {
        "step": "STEP 2: Automated FIR Registration & Hotspot Mapping",
        "desc": "The system automatically parses the vocal query, files an official police First Information Report (FIR), and creates a geo-tagged incident entry located in Bengaluru.",
        "meta": "API Endpoint: POST /api/v1/crimes/\nPayload: case_number, category, total_amount_involved, location_details",
        "code": "{\n  \"crime_id\": \"8b512e09-e85d-4f18-ad9d-091f09ea1c2b\",\n  \"case_number\": \"CYB/KA/2026/9021\",\n  \"status\": \"REPORTED\",\n  \"hotspot_registered\": true,\n  \"latitude\": 12.9626,\n  \"longitude\": 77.6387\n}"
    },
    {
        "step": "STEP 3: Graph Network Insertion (Neo4j Linkage)",
        "desc": "The backend updates the Neo4j Graph database, creating relationships linking the suspect's phone number and destination bank account to the crime.",
        "meta": "Cypher execution target node linkages",
        "code": "MERGE (c:Crime {id: \"8b512e09...\", case_number: \"CYB/KA/2026/9021\"})\nMERGE (s:Suspect {name: \"Mule Account Holder #12\"})\nMERGE (b:BankAccount {account_number: \"XXXX8721\"})\n\nMERGE (s)-[:CONTROLS]->(b)\nMERGE (s)-[:INVOLVED_IN]->(c)"
    },
    {
        "step": "STEP 4: Live WebSocket Alert Broadcast",
        "desc": "The Alert Engine scans the updated database, detects a risk spike (e.g. repeated phone number usage by other scammers), and pushes a real-time notification to the analyst SOC dashboard.",
        "meta": "WebSocket Channel: /ws/alerts",
        "code": "{\n  \"alert_id\": \"a988dca8-3921-4f10-bf91-b3b320df92a2\",\n  \"event_type\": \"NEW_FRAUD_RING\",\n  \"severity\": \"CRITICAL\",\n  \"message\": \"Flagged suspicious phone network associated with suspect account...\"\n}"
    },
    {
        "step": "STEP 5: Investigator Copilot Search",
        "desc": "The investigating officer uses the AI Copilot to find historically related FIRs or suspect details in the region.",
        "meta": "API Endpoint: POST /api/v1/copilot/query",
        "code": "{\n  \"answer\": \"I found 2 related cases involving Skype digital arrest in the last 30 days...\",\n  \"sources\": [\"FIR/KA/2026/1024\", \"FIR/KA/2026/1088\"],\n  \"explainability\": {\n    \"engine_used\": \"LangGraph RAG Orchestrator\"\n  }\n}"
    },
    {
        "step": "STEP 6: Chronological Timeline Generation",
        "desc": "The system compiles a chronological timeline mapping all incident milestones from initial phishing calls to money laundering exits.",
        "meta": "API Endpoint: POST /api/v1/timeline/generate",
        "code": "{\n  \"crime_id\": \"8b512e09-e85d-4f18-ad9d-091f09ea1c2b\",\n  \"timeline_events\": [\n    { \"event_id\": \"1\", \"title\": \"Initial Contact\", \"severity\": \"MEDIUM\" },\n    { \"event_id\": \"2\", \"title\": \"Digital Arrest Coercion\", \"severity\": \"HIGH\" },\n    { \"event_id\": \"3\", \"title\": \"Fund Layering Transfer\", \"severity\": \"CRITICAL\" }\n  ]\n}"
    },
    {
        "step": "STEP 7: Government PDF Report Compilation",
        "desc": "The officer compiles a formal, tamper-proof police report complete with vector charts, official signature blocks, and verification stamps.",
        "meta": "API Endpoint: POST /api/v1/reports/build",
        "code": "{\n  \"report_id\": \"f5e921d8-001a-4122-83b1-0c5889fa6e92\",\n  \"pdf_download_url\": \"/api/v1/reports/pdf/f5e921d8-001a-4122-83b1-0c5889fa6e92\",\n  \"qr_verification_url\": \"https://sentinelai.gov/verify/report/f5e921d8...\"\n}"
    }
]


def generate_demo_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Styling
    style_title = ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=1,
        spaceAfter=8
    )
    
    style_subtitle = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4B5563"),
        alignment=1,
        spaceAfter=20
    )
    
    style_h2 = ParagraphStyle(
        'H2Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#111827"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#374151"),
        spaceAfter=6
    )
    
    style_meta = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=4
    )
    
    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#065F46"),
        spaceAfter=10
    )

    flowables = []
    
    flowables.append(Paragraph("🏆 SENTINELAI — MASTER HACKATHON DEMO FLOW", style_title))
    flowables.append(Paragraph("End-to-End Cyber Investigation Pipeline — Pitch Script", style_subtitle))
    
    for item in DEMO_STEPS:
        step_blocks = [
            Paragraph(item["step"], style_h2),
            Paragraph(f"<b>Description:</b> {item['desc']}", style_body),
            Paragraph(f"<b>Metadata:</b> {item['meta']}", style_meta),
            Spacer(1, 4)
        ]
        
        # Code block wrapper inside a table
        code_p = Paragraph(item["code"].replace("\n", "<br/>").replace(" ", "&nbsp;"), style_code)
        code_table = Table([[code_p]], colWidths=[520])
        code_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F3F4F6")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        
        step_blocks.append(code_table)
        step_blocks.append(Spacer(1, 10))
        
        flowables.append(KeepTogether(step_blocks))
        
    doc.build(flowables)
    print(f"Demo flow PDF generated successfully at: {output_path}")


if __name__ == "__main__":
    artifact_dir = "C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\dcbbb72c-a0ea-4bb9-82bf-3d1b48c47e42"
    os.makedirs(artifact_dir, exist_ok=True)
    pdf_target = os.path.join(artifact_dir, "hackathon_demo_flow.pdf")
    generate_demo_pdf(pdf_target)
