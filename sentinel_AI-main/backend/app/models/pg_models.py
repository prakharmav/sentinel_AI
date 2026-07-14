from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Date, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.sql import func
from app.core.database import Base

class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    plan = Column(String(50), nullable=False, default="SME")
    status = Column(String(20), nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(320), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    refresh_token = Column(String(500), nullable=True)
    role = Column(String(50), nullable=False)
    mfa_enabled = Column(Boolean, default=True)
    mfa_type = Column(String(20), default="TOTP")
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FirModel(Base):
    __tablename__ = "firs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    fir_number = Column(String(100), unique=True, nullable=False)
    filed_at = Column(DateTime(timezone=True), server_default=func.now())
    filed_at_station_id = Column(UUID(as_uuid=True), nullable=False)
    complainant_citizen_id = Column(UUID(as_uuid=True), nullable=True)
    incident_date = Column(Date, nullable=False)
    incident_location_id = Column(UUID(as_uuid=True), nullable=True)
    primary_section = Column(String(255), nullable=False)
    all_sections = Column(ARRAY(String), default=[])
    crime_category = Column(String(100), nullable=False)
    fir_text = Column(String, nullable=False)
    ai_summary = Column(String, nullable=True)
    status = Column(String(50), default="REGISTERED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CrimeModel(Base):
    __tablename__ = "crimes"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    fir_id = Column(UUID(as_uuid=True), ForeignKey("firs.id"), nullable=True)
    case_number = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(String(30), nullable=False, default="REPORTED")
    severity = Column(String(20), nullable=False, default="MEDIUM")
    incident_date = Column(Date, nullable=False)
    crime_location_id = Column(UUID(as_uuid=True), nullable=True)
    total_amount_involved = Column(Numeric(15, 2), default=0.00)
    total_amount_recovered = Column(Numeric(15, 2), default=0.00)
    police_station_id = Column(UUID(as_uuid=True), nullable=True)
    lead_officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    ai_narrative = Column(String, nullable=True)
    ai_risk_score = Column(Numeric(5, 2), nullable=True)
    mitre_techniques = Column(JSONB, default=[])
    predicted_next_steps = Column(JSONB, default=[])
    cluster_id = Column(UUID(as_uuid=True), nullable=True)
    is_organized_crime = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    crime_id = Column(UUID(as_uuid=True), ForeignKey("crimes.id"), nullable=True)
    report_type = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(String, nullable=True)
    file_path = Column(String(1000), nullable=True)
    is_submitted = Column(Boolean, default=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    title = Column(String(500), nullable=False)
    body = Column(String, nullable=False)
    channel = Column(String(20), nullable=False, default="SMS")
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=False)
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    address = Column(String(500), nullable=False)
    district = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=True)
    geohash = Column(String(12), nullable=True)
    ip_address = Column(String(50), nullable=True)
    is_virtual = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SuspectModel(Base):
    __tablename__ = "suspects"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    crime_id = Column(UUID(as_uuid=True), ForeignKey("crimes.id", ondelete="SET NULL"), nullable=True)
    citizen_id = Column(UUID(as_uuid=True), nullable=True)
    name = Column(String(255), nullable=False)
    aliases = Column(ARRAY(String), default=[])
    status = Column(String(50), nullable=False, default="UNDER_WATCH")
    modus_operandi = Column(String, nullable=True)
    ai_risk_score = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PhoneNumberModel(Base):
    __tablename__ = "phone_numbers"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    number = Column(String(20), unique=True, nullable=False)
    carrier = Column(String(100), nullable=True)
    sim_swap_count = Column(Integer, default=0)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EvidenceModel(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    crime_id = Column(UUID(as_uuid=True), ForeignKey("crimes.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(500), nullable=False)
    evidence_type = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    content_hash = Column(String(128), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    is_court_admissible = Column(Boolean, default=True)
    chain_of_custody = Column(JSONB, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
