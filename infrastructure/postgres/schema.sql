-- ================================================================
-- SentinelAI — PostgreSQL DDL Database Schema
-- Database: PostgreSQL 16 + PostGIS + TimescaleDB
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS sentinelai;
SET search_path = sentinelai, public;

-- Enums
CREATE TYPE crime_status AS ENUM ('REPORTED', 'UNDER_INVESTIGATION', 'CLOSED', 'COLD_CASE');
CREATE TYPE severity_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
CREATE TYPE notification_channel AS ENUM ('SMS', 'EMAIL', 'WHATSAPP', 'PUSH');

-- 1. Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'SME',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Locations Table (PostGIS-enabled)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    district VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    coordinates GEOMETRY(POINT, 4326),
    geohash VARCHAR(12),
    ip_address INET,
    is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Citizens Table (Stores profiles)
CREATE TABLE citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    aadhaar_hash VARCHAR(64) UNIQUE, -- SHA-256
    pan_hash VARCHAR(64) UNIQUE,
    gender gender_type NOT NULL DEFAULT 'UNKNOWN',
    primary_phone VARCHAR(20) NOT NULL,
    email VARCHAR(320),
    permanent_location_id UUID REFERENCES locations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Users Table (Security & credentials)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN', -- CITIZEN, POLICE, INVESTIGATOR, ADMIN
    mfa_enabled BOOLEAN DEFAULT TRUE,
    mfa_type VARCHAR(20) DEFAULT 'TOTP',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Police Stations Table
CREATE TABLE police_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(320),
    location_id UUID REFERENCES locations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FIRs Table (Police reports)
CREATE TABLE firs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fir_number VARCHAR(100) UNIQUE NOT NULL,
    filed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    filed_at_station_id UUID NOT NULL REFERENCES police_stations(id),
    complainant_citizen_id UUID REFERENCES citizens(id),
    incident_date DATE NOT NULL,
    incident_location_id UUID REFERENCES locations(id),
    primary_section VARCHAR(255) NOT NULL, -- e.g. IT Act Sec 66D
    all_sections TEXT[] NOT NULL DEFAULT '{}',
    crime_category VARCHAR(100) NOT NULL,
    fir_text TEXT NOT NULL,
    ai_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Crimes Table (Investigation cases)
CREATE TABLE crimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    fir_id UUID REFERENCES firs(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    status crime_status NOT NULL DEFAULT 'REPORTED',
    severity severity_level NOT NULL DEFAULT 'MEDIUM',
    incident_date DATE NOT NULL,
    crime_location_id UUID REFERENCES locations(id),
    total_amount_involved DECIMAL(15, 2) DEFAULT 0.00,
    total_amount_recovered DECIMAL(15, 2) DEFAULT 0.00,
    police_station_id UUID REFERENCES police_stations(id),
    lead_officer_id UUID REFERENCES users(id),
    ai_narrative TEXT,
    ai_risk_score DECIMAL(5, 2),
    mitre_techniques JSONB DEFAULT '[]',
    predicted_next_steps JSONB DEFAULT '[]',
    cluster_id UUID,
    is_organized_crime BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Victims Table (Extended metadata)
CREATE TABLE victims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    crime_id UUID NOT NULL REFERENCES crimes(id) ON DELETE CASCADE,
    amount_lost DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Suspects Table
CREATE TABLE suspects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    crime_id UUID REFERENCES crimes(id) ON DELETE SET NULL,
    citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL, -- NULL if anonymous
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(100)[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'UNDER_WATCH', -- WANTED, ARRESTED etc.
    modus_operandi TEXT,
    ai_risk_score DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Phone Numbers Table
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    number VARCHAR(20) UNIQUE NOT NULL,
    carrier VARCHAR(100),
    sim_swap_count INT DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Bank Accounts Table
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_number_hash VARCHAR(64) UNIQUE NOT NULL,
    account_number_masked VARCHAR(30) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_frozen BOOLEAN DEFAULT FALSE,
    is_mule BOOLEAN DEFAULT FALSE,
    mule_confidence DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. UPI VPAs Table
CREATE TABLE upi_vpas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vpa VARCHAR(255) UNIQUE NOT NULL,
    registered_name VARCHAR(255) NOT NULL,
    linked_bank_id UUID REFERENCES bank_accounts(id),
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Evidence Locker Table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    crime_id UUID REFERENCES crimes(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    evidence_type VARCHAR(100) NOT NULL, -- SCREENSHOT, TRANSACTION_LOG, etc.
    description TEXT,
    content_hash VARCHAR(128) NOT NULL, -- SHA-512
    storage_path VARCHAR(1000) NOT NULL, -- S3/MinIO
    is_court_admissible BOOLEAN DEFAULT TRUE,
    chain_of_custody JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    crime_id UUID REFERENCES crimes(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL, -- GDPR_NOTIFICATION, DPDP_NOTIFICATION, NCRB_ANNUAL
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    file_path VARCHAR(1000),
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Audit Logs Table (Append-only, separated)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- INSERT, UPDATE, DELETE
    resource_type VARCHAR(100) NOT NULL, -- crimes, suspects, etc.
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent updates/deletions on audit logs (tamper-proof)
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- 16. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    channel notification_channel NOT NULL DEFAULT 'SMS',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- RELATIONSHIP JUNCTION TABLES
-- ================================================================

-- Link Suspects to Phone Numbers
CREATE TABLE suspect_phones (
    suspect_id UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    phone_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
    PRIMARY KEY (suspect_id, phone_id)
);

-- Link Suspects to Bank Accounts
CREATE TABLE suspect_accounts (
    suspect_id UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (suspect_id, account_id)
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================

CREATE INDEX idx_crimes_tenant_date ON crimes(tenant_id, incident_date DESC);
CREATE INDEX idx_crimes_severity ON crimes(severity) WHERE status != 'CLOSED';
CREATE INDEX idx_firs_number ON firs(fir_number);
CREATE INDEX idx_suspects_crime ON suspects(crime_id);
CREATE INDEX idx_victims_crime ON victims(crime_id);
CREATE INDEX idx_bank_masked ON bank_accounts(account_number_masked);
CREATE INDEX idx_bank_mule ON bank_accounts(is_mule) WHERE is_mule = TRUE;
CREATE INDEX idx_vpas_name ON upi_vpas(vpa);
CREATE INDEX idx_locations_geom ON locations USING GIST(coordinates);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
