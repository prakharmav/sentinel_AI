import hashlib
import io
import logging

logger = logging.getLogger("sentinelai")

def calculate_sha512(data: bytes) -> str:
    """
    Computes secure SHA-512 hashes for digital evidence sealing integrity validations.
    """
    return hashlib.sha512(data).hexdigest()

def generate_pdf_report(title: str, summary: str, details: str) -> io.BytesIO:
    """
    Formulates a formatted DPDP compliance PDF buffer.
    """
    buffer = io.BytesIO()
    # Simple binary placeholder compliance structure for downstream downloads
    report_text = f"=== SENTINELAI REGULATORY COMPLIANCE DRAFT ===\n\nTitle: {title}\nSummary: {summary}\nDetails: {details}\n"
    buffer.write(report_text.encode("utf-8"))
    buffer.seek(0)
    return buffer
