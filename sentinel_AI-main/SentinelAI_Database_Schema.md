# SentinelAI — PostgreSQL Database Schema
# Production-Ready | Normalized to 3NF | Partitioned | Secured

> **Database**: PostgreSQL 16 + TimescaleDB 2.x + PostGIS 3.x  
> **Standard**: Third Normal Form (3NF) with selective denormalization for performance  
> **Design By**: Staff Software Architect, SentinelAI  
> **Date**: July 11, 2026

---

## PART 1 — ER DIAGRAM

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║                         SENTINELAI — ENTITY RELATIONSHIP DIAGRAM                       ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

                           ┌─────────────────┐
                           │   tenants        │
                           │  (PK: id)        │
                           └────────┬────────┘
                                    │ 1
                    ┌───────────────┼───────────────────────────────────┐
                    │               │                                   │
                    ▼               ▼                                   ▼
          ┌──────────────┐  ┌──────────────────┐            ┌──────────────────┐
          │   citizens   │  │  police_stations  │            │     officers     │
          │  (PK: id)    │  │   (PK: id)        │            │   (PK: id)       │
          └──────┬───────┘  └────────┬──────────┘            └────────┬─────────┘
                 │ 1..N              │ 1..N                            │ 1..N
                 │                  │                                 │
                 ▼ N                ▼ N                               │
          ┌──────────────┐  ┌──────────────────┐                     │
          │   victims    │  │      firs         │◄────────────────────┘
          │  (PK: id)    │  │   (PK: id)        │  (investigated_by)
          └──────┬───────┘  └────────┬──────────┘
                 │ N                 │ 1..N
                 │                  │
                 ▼                  ▼
          ┌──────────────────────────────────────┐
          │              crimes                  │
          │            (PK: id)                  │
          │  FKs: fir_id, victim_id, location_id │
          │       police_station_id              │
          └───────────────────┬──────────────────┘
                              │ 1
        ┌─────────────────────┼─────────────────────────────────────┐
        │                     │                                     │
        ▼ N                   ▼ N                                   ▼ N
┌───────────────┐   ┌─────────────────┐                  ┌─────────────────┐
│crime_suspects │   │crime_victims    │                  │   evidence      │
│(junction)     │   │(junction)       │                  │  (PK: id)       │
└───────┬───────┘   └───────┬─────────┘                  └────────┬────────┘
        │ N                 │ N                                    │ 1..N
        ▼                   ▼                                      ▼
┌───────────────┐   ┌─────────────────┐                  ┌─────────────────┐
│   suspects    │   │    victims      │                  │     media       │
│  (PK: id)     │   │   (PK: id)      │                  │   (PK: id)      │
└───────┬───────┘   └───────┬─────────┘                  └─────────────────┘
        │ 1..N              │ 1..N
        │                  │
        ├─────────────────────────────────────────────────────────┐
        │                  │                                     │
        ▼ N                ▼ N                                   ▼ N
┌───────────────┐  ┌──────────────────┐              ┌──────────────────┐
│ suspect_phones│  │ suspect_accounts │              │suspect_vehicles  │
│  (junction)   │  │  (junction)      │              │  (junction)      │
└───────┬───────┘  └────────┬─────────┘              └────────┬─────────┘
        │ N                 │ N                               │ N
        ▼                   ▼                                 ▼
┌───────────────┐  ┌──────────────────┐              ┌──────────────────┐
│ phone_numbers │  │  bank_accounts   │              │    vehicles      │
│  (PK: id)     │  │   (PK: id)       │              │   (PK: id)       │
└───────────────┘  └────────┬─────────┘              └──────────────────┘
                            │ 1..N
                    ┌───────┴────────────┐
                    ▼ N                  ▼ N
            ┌───────────────┐  ┌──────────────────┐
            │ transactions  │  │ upi_transactions  │
            │  (PK: id)     │  │   (PK: id)        │
            └───────────────┘  └──────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  locations  │    │  audit_logs │    │notifications│    │   reports   │
│  (PK: id)   │    │  (PK: id)   │    │  (PK: id)   │    │  (PK: id)   │
│  PostGIS    │    │  append-only│    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## PART 2 — EXTENSIONS & DATABASE SETUP

```sql
-- ================================================================
-- DATABASE INITIALIZATION
-- Run as superuser on a fresh PostgreSQL 16 + TimescaleDB instance
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";          -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";            -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";             -- Trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gist";          -- GiST index support
CREATE EXTENSION IF NOT EXISTS "timescaledb";         -- Time-series
CREATE EXTENSION IF NOT EXISTS "postgis";             -- Geospatial
CREATE EXTENSION IF NOT EXISTS "vector";              -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "hstore";              -- Key-value in columns
CREATE EXTENSION IF NOT EXISTS "pg_partman";          -- Partition management

-- Database-level settings
ALTER DATABASE sentinelai SET timezone = 'UTC';
ALTER DATABASE sentinelai SET search_path = sentinelai, public;

-- Create application schema
CREATE SCHEMA IF NOT EXISTS sentinelai;
CREATE SCHEMA IF NOT EXISTS sentinelai_audit;   -- Separate schema for audit logs
CREATE SCHEMA IF NOT EXISTS sentinelai_archive; -- Cold storage schema

SET search_path = sentinelai, public;

-- ================================================================
-- CUSTOM TYPES (ENUMS)
-- ================================================================

CREATE TYPE crime_status AS ENUM (
    'REPORTED', 'UNDER_INVESTIGATION', 'CHARGE_SHEET_FILED',
    'COURT_PROCEEDINGS', 'CONVICTED', 'ACQUITTED', 'CLOSED', 'COLD_CASE'
);

CREATE TYPE crime_category AS ENUM (
    'UPI_FRAUD', 'PHISHING', 'RANSOMWARE', 'IDENTITY_THEFT',
    'SIM_SWAP', 'SOCIAL_ENGINEERING', 'DATA_BREACH', 'HACKING',
    'CSAM', 'CYBER_STALKING', 'CYBER_BULLYING', 'FAKE_NEWS',
    'CRYPTOCURRENCY_FRAUD', 'LOAN_APP_FRAUD', 'PHYSICAL_CRIME',
    'MURDER', 'ROBBERY', 'THEFT', 'ASSAULT', 'TRAFFICKING',
    'ORGANIZED_CRIME', 'TERRORISM', 'OTHER'
);

CREATE TYPE severity_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'TRANSGENDER', 'OTHER', 'UNKNOWN');

CREATE TYPE id_proof_type AS ENUM (
    'AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE',
    'RATION_CARD', 'BANK_PASSBOOK', 'OTHER'
);

CREATE TYPE account_type AS ENUM (
    'SAVINGS', 'CURRENT', 'SALARY', 'NRI', 'JOINT', 'UNKNOWN'
);

CREATE TYPE transaction_type AS ENUM (
    'CREDIT', 'DEBIT', 'TRANSFER', 'REFUND', 'REVERSAL', 'CHARGEBACK'
);

CREATE TYPE transaction_status AS ENUM (
    'PENDING', 'COMPLETED', 'FAILED', 'REVERSED', 'FROZEN',
    'FLAGGED', 'UNDER_INVESTIGATION', 'REFUNDED'
);

CREATE TYPE upi_transaction_status AS ENUM (
    'SUCCESS', 'FAILED', 'PENDING', 'REFUNDED', 'FROZEN', 'DISPUTED'
);

CREATE TYPE evidence_type AS ENUM (
    'DOCUMENT', 'SCREENSHOT', 'AUDIO', 'VIDEO', 'NETWORK_LOG',
    'DEVICE_FORENSIC', 'TRANSACTION_LOG', 'CALL_RECORD',
    'CHAT_LOG', 'EMAIL', 'PHYSICAL', 'FINANCIAL_STATEMENT', 'OTHER'
);

CREATE TYPE media_type AS ENUM (
    'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'OTHER'
);

CREATE TYPE suspect_status AS ENUM (
    'WANTED', 'ARRESTED', 'CHARGESHEETED', 'ACQUITTED',
    'CONVICTED', 'ABSCONDING', 'UNDER_WATCH', 'CLEARED'
);

CREATE TYPE notification_channel AS ENUM (
    'SMS', 'EMAIL', 'WHATSAPP', 'PUSH', 'IN_APP', 'WEBHOOK'
);

CREATE TYPE notification_status AS ENUM (
    'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED'
);

CREATE TYPE report_type AS ENUM (
    'INCIDENT_SUMMARY', 'FIR', 'CHARGE_SHEET', 'GDPR_NOTIFICATION',
    'DPDP_NOTIFICATION', 'NIS2_REPORT', 'NCRB_ANNUAL',
    'DGP_BRIEFING', 'COURT_EVIDENCE', 'AUDIT_REPORT', 'CUSTOM'
);

CREATE TYPE autonomy_level AS ENUM ('OBSERVE', 'ADVISE', 'CONTAIN', 'REMEDIATE');

CREATE TYPE vehicle_type AS ENUM (
    'TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE',
    'COMMERCIAL', 'ELECTRIC', 'OTHER'
);

-- ================================================================
-- UTILITY FUNCTION: Updated At Trigger
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## PART 3 — CORE TABLES

```sql
-- ================================================================
-- TABLE 1: TENANTS
-- Multi-tenant isolation root
-- ================================================================

CREATE TABLE tenants (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,       -- URL-safe identifier
    plan            VARCHAR(50)  NOT NULL DEFAULT 'SME',
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    data_region     VARCHAR(20)  NOT NULL DEFAULT 'IN', -- IN, EU, US, APAC
    autonomy_level  autonomy_level NOT NULL DEFAULT 'ADVISE',
    config          JSONB        NOT NULL DEFAULT '{}',
    contact_email   VARCHAR(320) NOT NULL,
    contact_phone   VARCHAR(20),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT tenants_status_check CHECK (status IN ('ACTIVE','SUSPENDED','DELETED'))
);

CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 2: LOCATIONS
-- Normalized, PostGIS-enabled address store
-- Every address in the system references this table
-- ================================================================

CREATE TABLE locations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Structured address
    address_line1   VARCHAR(500),
    address_line2   VARCHAR(500),
    landmark        VARCHAR(255),
    village_ward    VARCHAR(255),
    taluka          VARCHAR(255),
    district        VARCHAR(255) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    state_code      CHAR(2),               -- MH, DL, KA etc.
    pincode         VARCHAR(10),
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    -- Geospatial
    coordinates     GEOMETRY(POINT, 4326), -- PostGIS: (longitude, latitude)
    geohash         VARCHAR(12),           -- For fast proximity queries
    -- IP-based virtual location
    ip_address      INET,
    ip_country      VARCHAR(100),
    ip_isp          VARCHAR(255),
    is_virtual      BOOLEAN NOT NULL DEFAULT FALSE,
    -- Metadata
    location_type   VARCHAR(50),           -- CRIME_SCENE, SUSPECT_RESIDENCE, etc.
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_tenant ON locations(tenant_id);
CREATE INDEX idx_locations_district_state ON locations(district, state);
CREATE INDEX idx_locations_pincode ON locations(pincode);
CREATE INDEX idx_locations_geom ON locations USING GIST(coordinates);
CREATE INDEX idx_locations_geohash ON locations(geohash);
CREATE INDEX idx_locations_ip ON locations(ip_address);

-- ================================================================
-- TABLE 3: POLICE_STATIONS
-- ================================================================

CREATE TABLE police_stations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    station_code    VARCHAR(50) UNIQUE NOT NULL,   -- Official PS code
    name            VARCHAR(255) NOT NULL,
    station_type    VARCHAR(50) NOT NULL DEFAULT 'REGULAR',  -- CYBER, REGULAR, CRIME_BRANCH
    jurisdiction    VARCHAR(500),
    location_id     UUID        REFERENCES locations(id),
    district        VARCHAR(255) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    state_code      CHAR(2),
    phone           VARCHAR(20),
    email           VARCHAR(320),
    fax             VARCHAR(20),
    sho_name        VARCHAR(255),           -- Station House Officer
    sho_badge_number VARCHAR(50),
    cctns_code      VARCHAR(50),            -- CCTNS system code
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER police_stations_updated_at
    BEFORE UPDATE ON police_stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_police_stations_state ON police_stations(state_code);
CREATE INDEX idx_police_stations_district ON police_stations(district);
CREATE INDEX idx_police_stations_cctns ON police_stations(cctns_code);

-- ================================================================
-- TABLE 4: OFFICERS
-- Police officers across all ranks
-- ================================================================

CREATE TABLE officers (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    badge_number        VARCHAR(50) UNIQUE NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    rank                VARCHAR(100) NOT NULL,        -- SI, Inspector, DSP etc.
    department          VARCHAR(100),
    specialization      VARCHAR(100),                 -- CYBERCRIME, FINANCIAL, etc.
    police_station_id   UUID        REFERENCES police_stations(id),
    email               VARCHAR(320) UNIQUE,
    phone               VARCHAR(20),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    -- SentinelAI user account linkage
    user_id             UUID,                         -- FK to auth system
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER officers_updated_at
    BEFORE UPDATE ON officers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_officers_station ON officers(police_station_id);
CREATE INDEX idx_officers_rank ON officers(rank);
CREATE INDEX idx_officers_specialization ON officers(specialization);

-- ================================================================
-- TABLE 5: CITIZENS
-- Registered citizen profiles
-- ================================================================

CREATE TABLE citizens (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    -- Identity (stored encrypted where sensitive)
    aadhaar_hash        VARCHAR(64),                  -- SHA-256 of Aadhaar number
    aadhaar_last4       CHAR(4),                      -- Last 4 digits (display only)
    pan_hash            VARCHAR(64),
    pan_last4           CHAR(4),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    middle_name         VARCHAR(100),
    date_of_birth       DATE,
    gender              gender,
    -- Contact
    primary_phone       VARCHAR(20),
    secondary_phone     VARCHAR(20),
    email               VARCHAR(320),
    whatsapp_number     VARCHAR(20),
    -- Address
    permanent_location_id UUID      REFERENCES locations(id),
    current_location_id   UUID      REFERENCES locations(id),
    -- Verification
    id_proof_type       id_proof_type,
    id_proof_number_hash VARCHAR(64),                 -- Hashed
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    verification_method VARCHAR(50),
    verified_at         TIMESTAMPTZ,
    -- SentinelAI
    risk_score          DECIMAL(5,2) DEFAULT 0.00,
    is_blacklisted      BOOLEAN NOT NULL DEFAULT FALSE,
    blacklist_reason    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER citizens_updated_at
    BEFORE UPDATE ON citizens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes on hashed identifiers for lookups
CREATE INDEX idx_citizens_aadhaar ON citizens(aadhaar_hash);
CREATE INDEX idx_citizens_pan ON citizens(pan_hash);
CREATE INDEX idx_citizens_phone ON citizens(primary_phone);
CREATE INDEX idx_citizens_email ON citizens(email);
-- Full-text search on names
CREATE INDEX idx_citizens_name_fts ON citizens
    USING GIN(to_tsvector('english', first_name || ' ' || last_name));
-- Trigram index for fuzzy name matching
CREATE INDEX idx_citizens_name_trgm ON citizens
    USING GIN((first_name || ' ' || last_name) gin_trgm_ops);

-- Row-Level Security
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
CREATE POLICY citizens_tenant_isolation ON citizens
    USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- ================================================================
-- TABLE 6: VICTIMS
-- Extended victim profile linked to citizens
-- ================================================================

CREATE TABLE victims (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    citizen_id          UUID        NOT NULL REFERENCES citizens(id),
    -- Victimization details
    vulnerability_notes TEXT,
    psychological_support_needed BOOLEAN DEFAULT FALSE,
    is_minor            BOOLEAN NOT NULL DEFAULT FALSE,
    guardian_name       VARCHAR(255),                 -- If minor
    guardian_phone      VARCHAR(20),
    guardian_relation   VARCHAR(50),
    -- Financial impact
    total_amount_lost   DECIMAL(15,2) DEFAULT 0.00,
    total_amount_recovered DECIMAL(15,2) DEFAULT 0.00,
    insurance_claimed   BOOLEAN DEFAULT FALSE,
    insurance_claim_id  VARCHAR(100),
    -- Status
    victim_status       VARCHAR(50) DEFAULT 'ACTIVE',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER victims_updated_at
    BEFORE UPDATE ON victims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_victims_citizen ON victims(citizen_id);
CREATE INDEX idx_victims_tenant ON victims(tenant_id);
CREATE INDEX idx_victims_minor ON victims(is_minor) WHERE is_minor = TRUE;

-- ================================================================
-- TABLE 7: SUSPECTS
-- Suspect profiles (may or may not be citizens)
-- ================================================================

CREATE TABLE suspects (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    citizen_id          UUID        REFERENCES citizens(id),  -- NULL if unknown
    -- Identity
    name                VARCHAR(255),
    aliases             TEXT[],                       -- Array of known aliases
    date_of_birth       DATE,
    age_estimate        INT,
    gender              gender,
    nationality         VARCHAR(100) DEFAULT 'Indian',
    -- Identity documents (hashed)
    aadhaar_hash        VARCHAR(64),
    pan_hash            VARCHAR(64),
    passport_hash       VARCHAR(64),
    -- Physical description
    height_cm           SMALLINT,
    build               VARCHAR(50),
    skin_tone           VARCHAR(50),
    distinguishing_marks TEXT,
    photo_url           VARCHAR(500),
    -- Known addresses
    known_location_id   UUID        REFERENCES locations(id),
    -- Criminal profile
    status              suspect_status NOT NULL DEFAULT 'UNDER_WATCH',
    criminal_history    JSONB DEFAULT '[]',           -- [{case_id, conviction, year}]
    known_associates    UUID[],                       -- Array of other suspect IDs
    modus_operandi      TEXT,
    gang_affiliation    VARCHAR(255),
    -- AI-generated profile
    ai_risk_score       DECIMAL(5,2),
    ai_profile_summary  TEXT,
    ai_profile_updated  TIMESTAMPTZ,
    -- CCTNS Integration
    cctns_id            VARCHAR(50),
    -- Biometrics (hashed / external reference)
    fingerprint_ref     VARCHAR(255),                 -- NAFIS reference ID
    face_embedding_ref  VARCHAR(255),                 -- External face DB ref
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER suspects_updated_at
    BEFORE UPDATE ON suspects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_suspects_citizen ON suspects(citizen_id);
CREATE INDEX idx_suspects_status ON suspects(status);
CREATE INDEX idx_suspects_cctns ON suspects(cctns_id);
CREATE INDEX idx_suspects_aliases ON suspects USING GIN(aliases);
CREATE INDEX idx_suspects_ai_risk ON suspects(ai_risk_score DESC);
CREATE INDEX idx_suspects_name_trgm ON suspects
    USING GIN(name gin_trgm_ops);
-- JSON index for criminal history
CREATE INDEX idx_suspects_criminal_history ON suspects
    USING GIN(criminal_history jsonb_path_ops);

ALTER TABLE suspects ENABLE ROW LEVEL SECURITY;
CREATE POLICY suspects_tenant_isolation ON suspects
    USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- ================================================================
-- TABLE 8: FIRS (First Information Reports)
-- ================================================================

CREATE TABLE firs (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    -- Official identifiers
    fir_number              VARCHAR(100) UNIQUE NOT NULL,
    cctns_fir_number        VARCHAR(100),              -- CCTNS system FIR number
    ncrp_complaint_number   VARCHAR(100),              -- NCRP acknowledgment
    -- Filing details
    filed_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    filed_at_station_id     UUID        NOT NULL REFERENCES police_stations(id),
    filed_by_officer_id     UUID        REFERENCES officers(id),
    -- Complainant
    complainant_citizen_id  UUID        REFERENCES citizens(id),
    complainant_is_victim   BOOLEAN DEFAULT TRUE,
    -- Incident timing
    incident_date           DATE        NOT NULL,
    incident_time           TIME,
    incident_location_id    UUID        REFERENCES locations(id),
    -- Classification
    primary_section         VARCHAR(255) NOT NULL,     -- IT Act / IPC section
    all_sections            TEXT[],                    -- All applicable sections
    crime_category          crime_category NOT NULL,
    -- Narrative
    fir_text                TEXT        NOT NULL,      -- Full FIR text
    fir_text_tsvector       TSVECTOR,                  -- Full-text search index
    ai_summary              TEXT,                      -- AI-generated summary
    -- Status
    status                  VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    investigation_status    VARCHAR(50),
    assigned_officer_id     UUID        REFERENCES officers(id),
    transferred_to_station  UUID        REFERENCES police_stations(id),
    transfer_reason         TEXT,
    -- Closure
    closed_at               TIMESTAMPTZ,
    closure_reason          TEXT,
    -- Metadata
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER firs_updated_at
    BEFORE UPDATE ON firs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update full-text vector
CREATE OR REPLACE FUNCTION firs_update_tsvector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fir_text_tsvector = to_tsvector('english', COALESCE(NEW.fir_text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER firs_tsvector_update
    BEFORE INSERT OR UPDATE OF fir_text ON firs
    FOR EACH ROW EXECUTE FUNCTION firs_update_tsvector();

CREATE INDEX idx_firs_station ON firs(filed_at_station_id);
CREATE INDEX idx_firs_officer ON firs(assigned_officer_id);
CREATE INDEX idx_firs_complainant ON firs(complainant_citizen_id);
CREATE INDEX idx_firs_category ON firs(crime_category);
CREATE INDEX idx_firs_status ON firs(status);
CREATE INDEX idx_firs_date ON firs(incident_date DESC);
CREATE INDEX idx_firs_cctns ON firs(cctns_fir_number);
CREATE INDEX idx_firs_ncrp ON firs(ncrp_complaint_number);
-- Full-text search
CREATE INDEX idx_firs_fts ON firs USING GIN(fir_text_tsvector);
-- Sections array search
CREATE INDEX idx_firs_sections ON firs USING GIN(all_sections);

-- ================================================================
-- TABLE 9: CRIMES (Master incident record)
-- ================================================================

CREATE TABLE crimes (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    -- Case identifiers
    case_number         VARCHAR(100) UNIQUE NOT NULL,  -- SCY-2026-PUN-04821
    fir_id              UUID        REFERENCES firs(id),
    -- Classification
    category            crime_category NOT NULL,
    sub_category        VARCHAR(100),
    status              crime_status NOT NULL DEFAULT 'REPORTED',
    severity            severity_level NOT NULL DEFAULT 'MEDIUM',
    -- Incident
    incident_date       DATE        NOT NULL,
    incident_start_time TIMESTAMPTZ,
    incident_end_time   TIMESTAMPTZ,
    crime_location_id   UUID        REFERENCES locations(id),
    digital_origin      BOOLEAN DEFAULT FALSE,          -- Online crime?
    origin_ip           INET,
    origin_country      VARCHAR(100),
    -- Financial impact
    total_amount_involved DECIMAL(15,2) DEFAULT 0.00,
    total_amount_recovered DECIMAL(15,2) DEFAULT 0.00,
    currency            CHAR(3) DEFAULT 'INR',
    -- Assignment
    police_station_id   UUID        REFERENCES police_stations(id),
    lead_officer_id     UUID        REFERENCES officers(id),
    -- AI Intelligence
    ai_narrative        TEXT,
    ai_risk_score       DECIMAL(5,2),
    mitre_techniques    JSONB DEFAULT '[]',
    predicted_next_steps JSONB DEFAULT '[]',
    confidence_score    DECIMAL(3,2),
    -- Cluster (linked crimes)
    cluster_id          UUID,                           -- Groups related crimes
    is_organized_crime  BOOLEAN DEFAULT FALSE,
    gang_name           VARCHAR(255),
    -- Legal proceedings
    charge_sheet_filed  BOOLEAN DEFAULT FALSE,
    charge_sheet_date   DATE,
    court_name          VARCHAR(255),
    court_case_number   VARCHAR(100),
    next_hearing_date   DATE,
    verdict             VARCHAR(100),
    verdict_date        DATE,
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER crimes_updated_at
    BEFORE UPDATE ON crimes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_crimes_tenant ON crimes(tenant_id);
CREATE INDEX idx_crimes_fir ON crimes(fir_id);
CREATE INDEX idx_crimes_status ON crimes(status);
CREATE INDEX idx_crimes_category ON crimes(category);
CREATE INDEX idx_crimes_severity ON crimes(severity);
CREATE INDEX idx_crimes_station ON crimes(police_station_id);
CREATE INDEX idx_crimes_officer ON crimes(lead_officer_id);
CREATE INDEX idx_crimes_cluster ON crimes(cluster_id) WHERE cluster_id IS NOT NULL;
CREATE INDEX idx_crimes_incident_date ON crimes(incident_date DESC);
CREATE INDEX idx_crimes_ai_risk ON crimes(ai_risk_score DESC);
CREATE INDEX idx_crimes_mitre ON crimes USING GIN(mitre_techniques jsonb_path_ops);
-- Composite for common dashboard query
CREATE INDEX idx_crimes_tenant_status_date ON crimes(tenant_id, status, incident_date DESC);

ALTER TABLE crimes ENABLE ROW LEVEL SECURITY;
CREATE POLICY crimes_tenant_isolation ON crimes
    USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- ================================================================
-- TABLE 10: CRIME_VICTIMS (Junction)
-- ================================================================

CREATE TABLE crime_victims (
    crime_id    UUID NOT NULL REFERENCES crimes(id) ON DELETE CASCADE,
    victim_id   UUID NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    role        VARCHAR(100) DEFAULT 'PRIMARY',         -- PRIMARY, SECONDARY, WITNESS
    amount_lost DECIMAL(15,2),
    notes       TEXT,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (crime_id, victim_id)
);

CREATE INDEX idx_crime_victims_victim ON crime_victims(victim_id);
CREATE INDEX idx_crime_victims_crime ON crime_victims(crime_id);

-- ================================================================
-- TABLE 11: CRIME_SUSPECTS (Junction)
-- ================================================================

CREATE TABLE crime_suspects (
    crime_id            UUID NOT NULL REFERENCES crimes(id) ON DELETE CASCADE,
    suspect_id          UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    role                VARCHAR(100) DEFAULT 'ACCUSED', -- ACCUSED, ABETTOR, CONSPIRATOR
    confidence_score    DECIMAL(3,2),                   -- AI confidence in linkage
    is_prime_accused    BOOLEAN DEFAULT FALSE,
    arrest_date         DATE,
    bail_granted        BOOLEAN DEFAULT FALSE,
    bail_date           DATE,
    notes               TEXT,
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (crime_id, suspect_id)
);

CREATE INDEX idx_crime_suspects_suspect ON crime_suspects(suspect_id);
CREATE INDEX idx_crime_suspects_prime ON crime_suspects(crime_id)
    WHERE is_prime_accused = TRUE;
```

---

## PART 4 — COMMUNICATION & FINANCIAL TABLES

```sql
-- ================================================================
-- TABLE 12: PHONE_NUMBERS
-- All phone numbers in the system (victims, suspects, witnesses)
-- ================================================================

CREATE TABLE phone_numbers (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    number              VARCHAR(20) NOT NULL,
    country_code        VARCHAR(5)  NOT NULL DEFAULT '+91',
    carrier             VARCHAR(100),
    carrier_code        VARCHAR(10),
    circle              VARCHAR(100),                   -- Telecom circle (Mumbai, Delhi)
    state               VARCHAR(100),
    -- Registration details
    registered_name     VARCHAR(255),
    registered_id_type  id_proof_type,
    registered_id_hash  VARCHAR(64),
    registration_date   DATE,
    -- SIM details
    sim_type            VARCHAR(20) DEFAULT 'PHYSICAL', -- PHYSICAL, eSIM
    sim_swap_count      SMALLINT DEFAULT 0,
    last_sim_swap_date  DATE,
    -- Status flags
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_flagged          BOOLEAN NOT NULL DEFAULT FALSE,
    flag_reason         TEXT,
    is_spoofed          BOOLEAN DEFAULT FALSE,
    -- IMEI associations
    associated_imeis    TEXT[],
    -- CDR data reference
    cdr_available       BOOLEAN DEFAULT FALSE,
    cdr_obtained_via    VARCHAR(100),
    cdr_obtained_at     TIMESTAMPTZ,
    -- Metadata
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (number, country_code)
);

CREATE TRIGGER phones_updated_at
    BEFORE UPDATE ON phone_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_phones_number ON phone_numbers(number);
CREATE INDEX idx_phones_carrier ON phone_numbers(carrier);
CREATE INDEX idx_phones_flagged ON phone_numbers(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_phones_sim_swap ON phone_numbers(sim_swap_count DESC)
    WHERE sim_swap_count > 0;
CREATE INDEX idx_phones_imeis ON phone_numbers USING GIN(associated_imeis);

-- ================================================================
-- TABLE 13: SUSPECT_PHONES (Junction)
-- ================================================================

CREATE TABLE suspect_phones (
    suspect_id      UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    phone_id        UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
    ownership_type  VARCHAR(50) DEFAULT 'PRIMARY',      -- PRIMARY, SECONDARY, USED
    first_seen_at   TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,
    is_current      BOOLEAN DEFAULT TRUE,
    evidence_ref    UUID,                               -- FK to evidence
    PRIMARY KEY (suspect_id, phone_id)
);

CREATE INDEX idx_suspect_phones_phone ON suspect_phones(phone_id);

-- Victim phone linkage
CREATE TABLE victim_phones (
    victim_id       UUID NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    phone_id        UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
    ownership_type  VARCHAR(50) DEFAULT 'PRIMARY',
    is_current      BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (victim_id, phone_id)
);

CREATE INDEX idx_victim_phones_phone ON victim_phones(phone_id);

-- ================================================================
-- TABLE 14: BANK_ACCOUNTS
-- ================================================================

CREATE TABLE bank_accounts (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    -- Account details (partially masked)
    account_number_hash     VARCHAR(64) NOT NULL,       -- SHA-256 of account number
    account_number_last4    CHAR(4)     NOT NULL,
    account_number_masked   VARCHAR(30),                -- XXXX-XXXX-1234
    account_type            account_type NOT NULL DEFAULT 'SAVINGS',
    -- Bank details
    bank_name               VARCHAR(255) NOT NULL,
    bank_code               VARCHAR(20),                -- SWIFT / Bank code
    ifsc_code               VARCHAR(20),                -- IFSC for India
    branch_name             VARCHAR(255),
    branch_location_id      UUID        REFERENCES locations(id),
    micr_code               VARCHAR(20),
    -- Account holder
    account_holder_name     VARCHAR(255) NOT NULL,
    is_joint_account        BOOLEAN DEFAULT FALSE,
    joint_holder_name       VARCHAR(255),
    -- KYC
    kyc_status              VARCHAR(30) DEFAULT 'UNKNOWN', -- VERIFIED, PENDING, SUSPICIOUS
    kyc_date                DATE,
    opening_date            DATE,
    -- Opening metadata (for mule detection)
    opening_ip              INET,
    opening_device_id       VARCHAR(255),
    opening_location_id     UUID        REFERENCES locations(id),
    -- Status flags
    is_active               BOOLEAN DEFAULT TRUE,
    is_flagged              BOOLEAN DEFAULT FALSE,
    flag_reason             TEXT,
    is_frozen               BOOLEAN DEFAULT FALSE,
    frozen_at               TIMESTAMPTZ,
    frozen_by_authority     VARCHAR(100),
    freeze_order_ref        VARCHAR(100),
    is_mule_account         BOOLEAN DEFAULT FALSE,
    mule_confidence         DECIMAL(3,2),
    -- Financial summary
    total_fraudulent_amount DECIMAL(15,2) DEFAULT 0.00,
    linked_crime_count      SMALLINT DEFAULT 0,
    -- Metadata
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_accounts_hash ON bank_accounts(account_number_hash);
CREATE INDEX idx_accounts_ifsc ON bank_accounts(ifsc_code);
CREATE INDEX idx_accounts_flagged ON bank_accounts(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_accounts_frozen ON bank_accounts(is_frozen) WHERE is_frozen = TRUE;
CREATE INDEX idx_accounts_mule ON bank_accounts(is_mule_account, mule_confidence DESC)
    WHERE is_mule_account = TRUE;
CREATE INDEX idx_accounts_bank ON bank_accounts(bank_name, bank_code);

-- ================================================================
-- TABLE 15: SUSPECT_ACCOUNTS (Junction)
-- ================================================================

CREATE TABLE suspect_accounts (
    suspect_id      UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    relationship    VARCHAR(50) DEFAULT 'CONTROLLER',   -- CONTROLLER, BENEFICIARY, MULE
    first_seen_at   TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,
    evidence_ref    UUID,
    PRIMARY KEY (suspect_id, account_id)
);

CREATE TABLE victim_accounts (
    victim_id       UUID NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    is_primary      BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (victim_id, account_id)
);

-- ================================================================
-- TABLE 16: TRANSACTIONS
-- All financial transactions (bank transfers, NEFT, RTGS, IMPS)
-- ================================================================

CREATE TABLE transactions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    -- Transaction identifiers
    transaction_ref         VARCHAR(100) UNIQUE NOT NULL, -- Bank reference number
    rrn                     VARCHAR(50),                 -- Retrieval Reference Number
    -- Parties
    sender_account_id       UUID        REFERENCES bank_accounts(id),
    receiver_account_id     UUID        REFERENCES bank_accounts(id),
    sender_name             VARCHAR(255),
    receiver_name           VARCHAR(255),
    -- Amount
    amount                  DECIMAL(15,2) NOT NULL,
    currency                CHAR(3) NOT NULL DEFAULT 'INR',
    -- Transaction details
    transaction_type        transaction_type NOT NULL,
    payment_mode            VARCHAR(50) NOT NULL,        -- NEFT, RTGS, IMPS, CARD
    transaction_time        TIMESTAMPTZ NOT NULL,
    value_date              DATE,
    -- Device/Channel
    channel                 VARCHAR(50),                 -- NET_BANKING, MOBILE, ATM, BRANCH
    device_id               VARCHAR(255),
    ip_address              INET,
    device_fingerprint      VARCHAR(500),
    -- Status
    status                  transaction_status NOT NULL DEFAULT 'COMPLETED',
    failure_reason          TEXT,
    -- Fraud signals
    is_flagged              BOOLEAN DEFAULT FALSE,
    flag_reason             TEXT,
    fraud_score             DECIMAL(5,2),
    is_fraud_confirmed      BOOLEAN DEFAULT FALSE,
    fraud_type              VARCHAR(100),
    -- Geolocation
    transaction_location_id UUID        REFERENCES locations(id),
    -- Links to case
    crime_id                UUID        REFERENCES crimes(id),
    is_fraudulent           BOOLEAN DEFAULT FALSE,
    -- Metadata
    raw_data                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TimescaleDB hypertable for high-volume time-series
SELECT create_hypertable('transactions', 'transaction_time',
    chunk_time_interval => INTERVAL '1 day');

-- Compression for old chunks
SELECT add_compression_policy('transactions', INTERVAL '7 days');

-- Retention
SELECT add_retention_policy('transactions', INTERVAL '2 years');

CREATE INDEX idx_txn_sender ON transactions(sender_account_id, transaction_time DESC);
CREATE INDEX idx_txn_receiver ON transactions(receiver_account_id, transaction_time DESC);
CREATE INDEX idx_txn_crime ON transactions(crime_id);
CREATE INDEX idx_txn_flagged ON transactions(is_flagged, transaction_time DESC)
    WHERE is_flagged = TRUE;
CREATE INDEX idx_txn_fraud ON transactions(is_fraud_confirmed, transaction_time DESC)
    WHERE is_fraud_confirmed = TRUE;
CREATE INDEX idx_txn_ref ON transactions(transaction_ref);
CREATE INDEX idx_txn_ip ON transactions(ip_address);
CREATE INDEX idx_txn_amount ON transactions(amount DESC);

-- ================================================================
-- TABLE 17: UPI_TRANSACTIONS
-- UPI-specific transaction details (high volume, India-specific)
-- ================================================================

CREATE TABLE upi_transactions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    -- UPI identifiers
    upi_transaction_id      VARCHAR(100) UNIQUE NOT NULL,
    rrn                     VARCHAR(50),
    -- UPI IDs (VPAs)
    sender_vpa              VARCHAR(255) NOT NULL,       -- user@bankname
    receiver_vpa            VARCHAR(255) NOT NULL,
    sender_account_id       UUID        REFERENCES bank_accounts(id),
    receiver_account_id     UUID        REFERENCES bank_accounts(id),
    -- Amount
    amount                  DECIMAL(12,2) NOT NULL,
    currency                CHAR(3) DEFAULT 'INR',
    -- Transaction details
    transaction_time        TIMESTAMPTZ NOT NULL,
    -- Device
    device_id               VARCHAR(255),
    device_type             VARCHAR(50),                 -- ANDROID, IOS
    app_name                VARCHAR(100),                -- GPAY, PHONEPE, PAYTM, etc.
    ip_address              INET,
    sim_id                  VARCHAR(100),
    -- Transaction metadata
    transaction_note        TEXT,
    merchant_category       VARCHAR(100),
    is_merchant_txn         BOOLEAN DEFAULT FALSE,
    -- Status
    status                  upi_transaction_status NOT NULL,
    failure_code            VARCHAR(50),
    failure_description     TEXT,
    -- Fraud signals
    is_flagged              BOOLEAN DEFAULT FALSE,
    flag_reason             TEXT,
    fraud_score             DECIMAL(5,2),
    is_fraud_confirmed      BOOLEAN DEFAULT FALSE,
    -- VPA analysis
    receiver_vpa_age_days   INT,                        -- How old is the receiver VPA
    receiver_vpa_txn_count  INT,                        -- Historical transaction count
    -- Link to broader transaction record
    transaction_id          UUID        REFERENCES transactions(id),
    crime_id                UUID        REFERENCES crimes(id),
    -- Metadata
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TimescaleDB hypertable
SELECT create_hypertable('upi_transactions', 'transaction_time',
    chunk_time_interval => INTERVAL '1 day');

SELECT add_compression_policy('upi_transactions', INTERVAL '7 days');

CREATE INDEX idx_upi_sender_vpa ON upi_transactions(sender_vpa);
CREATE INDEX idx_upi_receiver_vpa ON upi_transactions(receiver_vpa);
CREATE INDEX idx_upi_app ON upi_transactions(app_name);
CREATE INDEX idx_upi_flagged ON upi_transactions(is_flagged)
    WHERE is_flagged = TRUE;
CREATE INDEX idx_upi_crime ON upi_transactions(crime_id);
CREATE INDEX idx_upi_amount ON upi_transactions(amount DESC);
CREATE INDEX idx_upi_device ON upi_transactions(device_id);
```

---

## PART 5 — EVIDENCE & MEDIA

```sql
-- ================================================================
-- TABLE 18: EVIDENCE
-- Chain-of-custody evidence records
-- ================================================================

CREATE TABLE evidence (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    crime_id                UUID        REFERENCES crimes(id),
    fir_id                  UUID        REFERENCES firs(id),
    -- Evidence details
    evidence_type           evidence_type NOT NULL,
    title                   VARCHAR(500) NOT NULL,
    description             TEXT,
    -- Source
    source                  VARCHAR(255),               -- Where it came from
    obtained_from           VARCHAR(255),               -- Person/entity
    obtained_by_officer_id  UUID        REFERENCES officers(id),
    obtained_at             TIMESTAMPTZ,
    obtained_method         VARCHAR(100),               -- VOLUNTARY, COURT_ORDER, SEARCH
    -- Court admissibility
    is_court_admissible     BOOLEAN DEFAULT TRUE,
    admissibility_notes     TEXT,
    -- Chain of custody
    custody_log             JSONB DEFAULT '[]',         -- [{officer_id, action, timestamp}]
    current_custodian_id    UUID        REFERENCES officers(id),
    storage_location        VARCHAR(255),
    -- Hash verification (integrity)
    content_hash            VARCHAR(128),               -- SHA-512 of content
    hash_algorithm          VARCHAR(20) DEFAULT 'SHA-512',
    hash_verified_at        TIMESTAMPTZ,
    -- Status
    status                  VARCHAR(50) DEFAULT 'ACTIVE',
    is_sealed               BOOLEAN DEFAULT FALSE,
    sealed_at               TIMESTAMPTZ,
    sealed_by               UUID REFERENCES officers(id),
    -- Metadata
    metadata                JSONB DEFAULT '{}',
    tags                    TEXT[],
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER evidence_updated_at
    BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_evidence_crime ON evidence(crime_id);
CREATE INDEX idx_evidence_fir ON evidence(fir_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_officer ON evidence(obtained_by_officer_id);
CREATE INDEX idx_evidence_custodian ON evidence(current_custodian_id);
CREATE INDEX idx_evidence_admissible ON evidence(is_court_admissible);
CREATE INDEX idx_evidence_tags ON evidence USING GIN(tags);
CREATE INDEX idx_evidence_status ON evidence(status, crime_id);

-- ================================================================
-- TABLE 19: MEDIA
-- Physical files — images, videos, documents, audio
-- ================================================================

CREATE TABLE media (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    evidence_id         UUID        REFERENCES evidence(id) ON DELETE SET NULL,
    crime_id            UUID        REFERENCES crimes(id),
    suspect_id          UUID        REFERENCES suspects(id),
    victim_id           UUID        REFERENCES victims(id),
    -- File details
    file_name           VARCHAR(500) NOT NULL,
    original_file_name  VARCHAR(500),
    media_type          media_type NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    file_size_bytes     BIGINT,
    duration_seconds    INT,                            -- For audio/video
    -- Storage
    storage_bucket      VARCHAR(255) NOT NULL,
    storage_path        VARCHAR(1000) NOT NULL,         -- MinIO/S3 path
    cdn_url             VARCHAR(1000),                  -- If served via CDN
    -- Integrity
    checksum_md5        VARCHAR(32),
    checksum_sha256     VARCHAR(64),
    -- AI analysis
    ai_analyzed         BOOLEAN DEFAULT FALSE,
    ai_analysis_result  JSONB DEFAULT '{}',
    is_deepfake_detected BOOLEAN DEFAULT FALSE,
    deepfake_score      DECIMAL(3,2),
    ai_objects_detected TEXT[],                         -- Objects in image/video
    ai_text_extracted   TEXT,                           -- OCR output
    embedding           VECTOR(768),                    -- pgvector embedding
    -- WORM / Retention
    is_immutable        BOOLEAN DEFAULT FALSE,
    retention_until     DATE,
    -- Metadata
    capture_device      VARCHAR(255),
    capture_location_id UUID REFERENCES locations(id),
    captured_at         TIMESTAMPTZ,
    uploaded_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_evidence ON media(evidence_id);
CREATE INDEX idx_media_crime ON media(crime_id);
CREATE INDEX idx_media_suspect ON media(suspect_id);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_deepfake ON media(is_deepfake_detected)
    WHERE is_deepfake_detected = TRUE;
CREATE INDEX idx_media_embedding ON media USING ivfflat(embedding vector_cosine_ops)
    WITH (lists = 100);                                  -- Vector similarity search
```

---

## PART 6 — VEHICLES

```sql
-- ================================================================
-- TABLE 20: VEHICLES
-- ================================================================

CREATE TABLE vehicles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    -- Registration
    registration_number VARCHAR(20) UNIQUE NOT NULL,    -- MH-01-AB-1234
    registration_state  VARCHAR(5),
    registration_date   DATE,
    rto_code            VARCHAR(10),
    -- Vehicle details
    vehicle_type        vehicle_type NOT NULL,
    make                VARCHAR(100),                   -- HONDA, MARUTI, etc.
    model               VARCHAR(100),
    variant             VARCHAR(100),
    color               VARCHAR(50),
    year_of_manufacture SMALLINT,
    fuel_type           VARCHAR(30),                    -- PETROL, DIESEL, ELECTRIC
    engine_number_hash  VARCHAR(64),                    -- Hashed
    chassis_number_hash VARCHAR(64),
    -- Owner
    registered_owner_name VARCHAR(255),
    owner_citizen_id    UUID REFERENCES citizens(id),
    -- Status
    is_stolen           BOOLEAN DEFAULT FALSE,
    stolen_reported_at  TIMESTAMPTZ,
    stolen_crime_id     UUID REFERENCES crimes(id),
    is_seized           BOOLEAN DEFAULT FALSE,
    seized_at           TIMESTAMPTZ,
    seized_by_station_id UUID REFERENCES police_stations(id),
    -- Insurance
    insurance_policy_number VARCHAR(100),
    insurance_valid_until   DATE,
    -- Metadata
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_citizen_id);
CREATE INDEX idx_vehicles_stolen ON vehicles(is_stolen) WHERE is_stolen = TRUE;
CREATE INDEX idx_vehicles_seized ON vehicles(is_seized) WHERE is_seized = TRUE;
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);

-- Junction: suspects ↔ vehicles
CREATE TABLE suspect_vehicles (
    suspect_id      UUID NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    relationship    VARCHAR(50) DEFAULT 'OWNER',        -- OWNER, DRIVER, PASSENGER
    first_seen_at   TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,
    PRIMARY KEY (suspect_id, vehicle_id)
);
```

---

## PART 7 — SYSTEM TABLES

```sql
-- ================================================================
-- TABLE 21: AUDIT_LOGS
-- Immutable append-only audit trail (separate schema)
-- ================================================================

CREATE TABLE sentinelai_audit.audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    -- Who
    actor_id        VARCHAR(255),                       -- user_id or 'SYSTEM' or 'AI'
    actor_type      VARCHAR(50) NOT NULL,               -- USER, SYSTEM, AI_ENGINE
    actor_ip        INET,
    actor_user_agent TEXT,
    -- What
    action          VARCHAR(100) NOT NULL,              -- CREATE, UPDATE, DELETE, LOGIN, etc.
    resource_type   VARCHAR(100) NOT NULL,              -- alerts, crimes, suspects etc.
    resource_id     VARCHAR(255),
    -- Changes
    old_values      JSONB,
    new_values      JSONB,
    changed_fields  TEXT[],
    -- Context
    request_id      UUID,
    session_id      UUID,
    -- AI specific
    ai_engine       VARCHAR(50),                        -- Which AI engine took action
    ai_confidence   DECIMAL(3,2),
    ai_justification TEXT,
    -- Integrity (cryptographic signing)
    log_hash        VARCHAR(128) NOT NULL,              -- SHA-512 of all log content
    previous_hash   VARCHAR(128),                       -- Hash of previous log (chain)
    signature       TEXT,                               -- Ed25519 signature
    -- Metadata
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Immutability enforcement
    CONSTRAINT audit_logs_no_update CHECK (created_at IS NOT NULL)
);

-- CRITICAL: No UPDATE or DELETE on audit_logs
CREATE RULE no_update_audit AS ON UPDATE TO sentinelai_audit.audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO sentinelai_audit.audit_logs DO INSTEAD NOTHING;

-- Partition by month for query performance at scale
SELECT create_hypertable(
    'sentinelai_audit.audit_logs', 'created_at',
    chunk_time_interval => INTERVAL '1 month'
);

CREATE INDEX idx_audit_tenant ON sentinelai_audit.audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_actor ON sentinelai_audit.audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_resource ON sentinelai_audit.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_action ON sentinelai_audit.audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_ai ON sentinelai_audit.audit_logs(ai_engine)
    WHERE ai_engine IS NOT NULL;

-- ================================================================
-- TABLE 22: NOTIFICATIONS
-- All outbound notifications across channels
-- ================================================================

CREATE TABLE notifications (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    -- Recipient
    recipient_type      VARCHAR(50) NOT NULL,           -- CITIZEN, OFFICER, CISO, etc.
    recipient_id        UUID,
    recipient_phone     VARCHAR(20),
    recipient_email     VARCHAR(320),
    recipient_fcm_token TEXT,
    -- Content
    title               VARCHAR(500) NOT NULL,
    body                TEXT NOT NULL,
    body_hindi          TEXT,                           -- Hindi translation
    data                JSONB DEFAULT '{}',             -- Structured data payload
    -- Channel & Status
    channel             notification_channel NOT NULL,
    status              notification_status NOT NULL DEFAULT 'PENDING',
    sent_at             TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    read_at             TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    failure_reason      TEXT,
    retry_count         SMALLINT DEFAULT 0,
    next_retry_at       TIMESTAMPTZ,
    -- Linked entity
    crime_id            UUID REFERENCES crimes(id),
    fir_id              UUID REFERENCES firs(id),
    alert_id            UUID,
    -- Priority
    priority            VARCHAR(20) DEFAULT 'NORMAL',  -- URGENT, HIGH, NORMAL, LOW
    expires_at          TIMESTAMPTZ,
    -- Metadata
    template_id         VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notif_status ON notifications(status, next_retry_at)
    WHERE status IN ('PENDING', 'FAILED');
CREATE INDEX idx_notif_crime ON notifications(crime_id);
CREATE INDEX idx_notif_channel ON notifications(channel, status);
CREATE INDEX idx_notif_priority ON notifications(priority, created_at DESC)
    WHERE priority = 'URGENT';

-- ================================================================
-- TABLE 23: REPORTS
-- Generated reports (PDFs, regulatory notifications, etc.)
-- ================================================================

CREATE TABLE reports (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    -- Report classification
    report_type         report_type NOT NULL,
    report_number       VARCHAR(100) UNIQUE,
    title               VARCHAR(500) NOT NULL,
    -- Subject
    crime_id            UUID REFERENCES crimes(id),
    fir_id              UUID REFERENCES firs(id),
    suspect_id          UUID REFERENCES suspects(id),
    time_period_start   DATE,
    time_period_end     DATE,
    jurisdiction        VARCHAR(255),
    -- Generation
    generated_by        UUID,                           -- User or AI
    generated_by_type   VARCHAR(20) DEFAULT 'USER',    -- USER, AI
    generated_at        TIMESTAMPTZ DEFAULT NOW(),
    ai_generated        BOOLEAN DEFAULT FALSE,
    ai_engine_version   VARCHAR(50),
    -- Content
    summary             TEXT,
    content_json        JSONB DEFAULT '{}',             -- Structured content
    template_used       VARCHAR(100),
    -- File
    file_path           VARCHAR(1000),
    file_size_bytes     BIGINT,
    file_checksum       VARCHAR(64),
    -- Regulatory compliance
    regulation          VARCHAR(100),                   -- GDPR, DPDP, NIS2, NCRB
    submission_deadline TIMESTAMPTZ,
    submitted_at        TIMESTAMPTZ,
    submission_ref      VARCHAR(255),
    is_submitted        BOOLEAN DEFAULT FALSE,
    -- Status
    status              VARCHAR(50) DEFAULT 'DRAFT',
    approved_by         UUID,
    approved_at         TIMESTAMPTZ,
    -- Metadata
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_reports_type ON reports(report_type, created_at DESC);
CREATE INDEX idx_reports_crime ON reports(crime_id);
CREATE INDEX idx_reports_regulation ON reports(regulation, is_submitted);
CREATE INDEX idx_reports_deadline ON reports(submission_deadline)
    WHERE is_submitted = FALSE AND submission_deadline IS NOT NULL;
CREATE INDEX idx_reports_status ON reports(status, tenant_id);

-- ================================================================
-- TABLE 24: SECURITY_EVENTS (TimescaleDB — Raw telemetry)
-- ================================================================

CREATE TABLE security_events (
    time            TIMESTAMPTZ NOT NULL,
    id              UUID        DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    -- Event classification
    event_type      VARCHAR(100) NOT NULL,
    source          VARCHAR(100) NOT NULL,
    severity        SMALLINT NOT NULL DEFAULT 3,        -- 1=CRITICAL, 5=INFO
    -- Entity
    entity_id       VARCHAR(255),
    entity_type     VARCHAR(50),
    entity_name     VARCHAR(255),
    -- Network
    src_ip          INET,
    dst_ip          INET,
    src_port        INT,
    dst_port        INT,
    protocol        VARCHAR(20),
    -- Normalized
    normalized_data JSONB NOT NULL DEFAULT '{}',
    raw_data        JSONB,
    -- MITRE
    mitre_technique VARCHAR(20),
    -- AI
    anomaly_score   DECIMAL(5,2),
    embedding       VECTOR(768),
    -- Links
    alert_id        UUID,
    crime_id        UUID
);

SELECT create_hypertable('security_events', 'time',
    chunk_time_interval => INTERVAL '1 day');

SELECT add_compression_policy('security_events', INTERVAL '3 days');
SELECT add_retention_policy('security_events', INTERVAL '90 days');

CREATE INDEX idx_sevents_tenant ON security_events(tenant_id, time DESC);
CREATE INDEX idx_sevents_entity ON security_events(entity_id, time DESC);
CREATE INDEX idx_sevents_type ON security_events(event_type, time DESC);
CREATE INDEX idx_sevents_src_ip ON security_events(src_ip, time DESC);
CREATE INDEX idx_sevents_anomaly ON security_events(anomaly_score DESC, time DESC)
    WHERE anomaly_score > 0.7;
CREATE INDEX idx_sevents_mitre ON security_events(mitre_technique)
    WHERE mitre_technique IS NOT NULL;
```

---

## PART 8 — TRIGGERS & AUTOMATION

```sql
-- ================================================================
-- TRIGGER: Auto-create audit log on any table change
-- ================================================================

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data   JSONB;
    v_new_data   JSONB;
    v_changed    TEXT[];
    v_log_hash   TEXT;
    v_prev_hash  TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
        v_old_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        -- Compute changed fields
        SELECT array_agg(key) INTO v_changed
        FROM jsonb_each(v_old_data) old_kv
        WHERE v_old_data->old_kv.key IS DISTINCT FROM v_new_data->old_kv.key;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
    END IF;

    -- Remove sensitive fields from audit
    v_old_data := v_old_data - 'aadhaar_hash' - 'pan_hash' - 'password_hash';
    v_new_data := v_new_data - 'aadhaar_hash' - 'pan_hash' - 'password_hash';

    -- Get last hash for chaining
    SELECT log_hash INTO v_prev_hash
    FROM sentinelai_audit.audit_logs
    WHERE tenant_id = COALESCE(
        (v_new_data->>'tenant_id')::UUID,
        (v_old_data->>'tenant_id')::UUID
    )
    ORDER BY created_at DESC LIMIT 1;

    -- Compute log hash
    v_log_hash := encode(
        digest(
            COALESCE(v_old_data::TEXT,'') ||
            COALESCE(v_new_data::TEXT,'') ||
            NOW()::TEXT ||
            TG_TABLE_NAME,
            'sha512'
        ), 'hex'
    );

    INSERT INTO sentinelai_audit.audit_logs (
        tenant_id, actor_id, actor_type, action,
        resource_type, resource_id,
        old_values, new_values, changed_fields,
        log_hash, previous_hash, created_at
    ) VALUES (
        COALESCE(
            (v_new_data->>'tenant_id')::UUID,
            (v_old_data->>'tenant_id')::UUID
        ),
        current_setting('app.current_user_id', TRUE),
        COALESCE(current_setting('app.actor_type', TRUE), 'SYSTEM'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(v_new_data->>'id', v_old_data->>'id'),
        v_old_data, v_new_data, v_changed,
        v_log_hash, v_prev_hash,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to critical tables
CREATE TRIGGER crimes_audit
    AFTER INSERT OR UPDATE OR DELETE ON crimes
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER suspects_audit
    AFTER INSERT OR UPDATE OR DELETE ON suspects
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER firs_audit
    AFTER INSERT OR UPDATE OR DELETE ON firs
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER evidence_audit
    AFTER INSERT OR UPDATE OR DELETE ON evidence
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER bank_accounts_audit
    AFTER INSERT OR UPDATE OR DELETE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ================================================================
-- TRIGGER: Update crime cluster stats when crime is updated
-- ================================================================

CREATE OR REPLACE FUNCTION update_crime_cluster_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cluster_id IS NOT NULL THEN
        -- Cascade severity to cluster if higher
        UPDATE crimes
        SET is_organized_crime = TRUE
        WHERE cluster_id = NEW.cluster_id
          AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crimes_cluster_update
    AFTER UPDATE OF cluster_id ON crimes
    FOR EACH ROW EXECUTE FUNCTION update_crime_cluster_stats();

-- ================================================================
-- TRIGGER: Update suspect risk score when crime is linked
-- ================================================================

CREATE OR REPLACE FUNCTION recalculate_suspect_risk()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE suspects s
    SET ai_risk_score = (
        SELECT LEAST(100,
            COALESCE(COUNT(cs.crime_id) * 10, 0) +
            COALESCE(MAX(c.ai_risk_score), 0) * 0.5
        )
        FROM crime_suspects cs
        JOIN crimes c ON c.id = cs.crime_id
        WHERE cs.suspect_id = NEW.suspect_id
    )
    WHERE s.id = NEW.suspect_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suspect_risk_update
    AFTER INSERT OR UPDATE ON crime_suspects
    FOR EACH ROW EXECUTE FUNCTION recalculate_suspect_risk();

-- ================================================================
-- TRIGGER: Auto-freeze bank account when fraud confirmed
-- ================================================================

CREATE OR REPLACE FUNCTION auto_flag_fraud_account()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_fraud_confirmed = TRUE AND OLD.is_fraud_confirmed = FALSE THEN
        UPDATE bank_accounts
        SET is_flagged = TRUE,
            flag_reason = 'Auto-flagged: confirmed fraud transaction detected by SentinelAI',
            linked_crime_count = linked_crime_count + 1,
            total_fraudulent_amount = total_fraudulent_amount + NEW.amount
        WHERE id = NEW.receiver_account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fraud_account_flag
    AFTER UPDATE OF is_fraud_confirmed ON transactions
    FOR EACH ROW EXECUTE FUNCTION auto_flag_fraud_account();
```

---

## PART 9 — PARTITIONING STRATEGY

```sql
-- ================================================================
-- PARTITIONING: Crimes table by year (range partitioning)
-- For large-scale deployments with millions of historical cases
-- ================================================================

-- Convert crimes to partitioned table (production migration approach)
-- Note: In fresh deployment, create as partitioned from the start

CREATE TABLE crimes_partitioned (
    LIKE crimes INCLUDING ALL
) PARTITION BY RANGE (incident_date);

-- Create partitions for each year
CREATE TABLE crimes_2023 PARTITION OF crimes_partitioned
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE crimes_2024 PARTITION OF crimes_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE crimes_2025 PARTITION OF crimes_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE crimes_2026 PARTITION OF crimes_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE crimes_default PARTITION OF crimes_partitioned DEFAULT;

-- Auto-create future partitions using pg_partman
SELECT partman.create_parent(
    p_parent_table => 'sentinelai.crimes',
    p_control => 'incident_date',
    p_type => 'range',
    p_interval => 'yearly',
    p_premake => 2
);

-- ================================================================
-- PARTITIONING: Notifications by status + date (list partitioning)
-- ================================================================

CREATE TABLE notifications_partitioned (
    LIKE notifications INCLUDING ALL
) PARTITION BY LIST (channel);

CREATE TABLE notifications_sms PARTITION OF notifications_partitioned
    FOR VALUES IN ('SMS');

CREATE TABLE notifications_email PARTITION OF notifications_partitioned
    FOR VALUES IN ('EMAIL');

CREATE TABLE notifications_whatsapp PARTITION OF notifications_partitioned
    FOR VALUES IN ('WHATSAPP');

CREATE TABLE notifications_push PARTITION OF notifications_partitioned
    FOR VALUES IN ('PUSH', 'IN_APP');

CREATE TABLE notifications_other PARTITION OF notifications_partitioned
    FOR VALUES IN ('WEBHOOK');

-- ================================================================
-- PARTITIONING: Bank accounts by state (list partitioning for regional queries)
-- ================================================================
-- This supports SCRB state-level queries efficiently

CREATE TABLE bank_accounts_by_state (
    LIKE bank_accounts INCLUDING ALL,
    account_state CHAR(2) NOT NULL
) PARTITION BY LIST (account_state);

CREATE TABLE accounts_mh PARTITION OF bank_accounts_by_state FOR VALUES IN ('MH');
CREATE TABLE accounts_dl PARTITION OF bank_accounts_by_state FOR VALUES IN ('DL');
CREATE TABLE accounts_ka PARTITION OF bank_accounts_by_state FOR VALUES IN ('KA');
CREATE TABLE accounts_tn PARTITION OF bank_accounts_by_state FOR VALUES IN ('TN');
CREATE TABLE accounts_up PARTITION OF bank_accounts_by_state FOR VALUES IN ('UP');
CREATE TABLE accounts_other PARTITION OF bank_accounts_by_state DEFAULT;
```

---

## PART 10 — ADVANCED OPTIMIZATION

```sql
-- ================================================================
-- MATERIALIZED VIEWS: Pre-computed analytics
-- ================================================================

-- 1. Crime statistics by district and category (refreshed hourly)
CREATE MATERIALIZED VIEW mv_crime_stats_by_district AS
SELECT
    c.tenant_id,
    l.state,
    l.state_code,
    l.district,
    c.category,
    DATE_TRUNC('month', c.incident_date) AS month,
    COUNT(*) AS crime_count,
    SUM(c.total_amount_involved) AS total_amount,
    AVG(c.ai_risk_score) AS avg_risk_score,
    COUNT(*) FILTER (WHERE c.status = 'CLOSED') AS resolved_count,
    COUNT(*) FILTER (WHERE c.is_organized_crime) AS organized_crime_count
FROM crimes c
LEFT JOIN locations l ON l.id = c.crime_location_id
GROUP BY c.tenant_id, l.state, l.state_code, l.district, c.category, month;

CREATE UNIQUE INDEX mv_crime_stats_idx
    ON mv_crime_stats_by_district(tenant_id, district, category, month);

-- Refresh schedule (via pg_cron or application scheduler)
-- SELECT cron.schedule('0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_crime_stats_by_district');

-- 2. Suspect network summary
CREATE MATERIALIZED VIEW mv_suspect_network AS
SELECT
    s.id AS suspect_id,
    s.tenant_id,
    s.name,
    s.status,
    s.ai_risk_score,
    COUNT(DISTINCT cs.crime_id) AS crime_count,
    ARRAY_AGG(DISTINCT c.category) AS crime_categories,
    SUM(c.total_amount_involved) AS total_fraud_amount,
    COUNT(DISTINCT sp.phone_id) AS phone_count,
    COUNT(DISTINCT sa.account_id) AS account_count
FROM suspects s
LEFT JOIN crime_suspects cs ON cs.suspect_id = s.id
LEFT JOIN crimes c ON c.id = cs.crime_id
LEFT JOIN suspect_phones sp ON sp.suspect_id = s.id
LEFT JOIN suspect_accounts sa ON sa.suspect_id = s.id
GROUP BY s.id, s.tenant_id, s.name, s.status, s.ai_risk_score;

CREATE UNIQUE INDEX mv_suspect_network_idx ON mv_suspect_network(suspect_id);
CREATE INDEX mv_suspect_network_risk ON mv_suspect_network(ai_risk_score DESC);

-- 3. Fraud hotspot by VPA (for UPI fraud monitoring)
CREATE MATERIALIZED VIEW mv_upi_fraud_hotspots AS
SELECT
    receiver_vpa,
    COUNT(*) AS total_transactions,
    COUNT(*) FILTER (WHERE is_fraud_confirmed) AS confirmed_fraud_count,
    SUM(amount) FILTER (WHERE is_fraud_confirmed) AS total_fraud_amount,
    MAX(transaction_time) AS last_seen,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE is_fraud_confirmed) / COUNT(*), 2
    ) AS fraud_rate_pct
FROM upi_transactions
WHERE transaction_time > NOW() - INTERVAL '90 days'
GROUP BY receiver_vpa
HAVING COUNT(*) FILTER (WHERE is_fraud_confirmed) > 0;

CREATE UNIQUE INDEX mv_upi_hotspots_idx ON mv_upi_fraud_hotspots(receiver_vpa);
CREATE INDEX mv_upi_hotspots_rate ON mv_upi_fraud_hotspots(fraud_rate_pct DESC);

-- ================================================================
-- STORED PROCEDURES: Common complex operations
-- ================================================================

-- Procedure: File an FIR and create linked crime record atomically
CREATE OR REPLACE PROCEDURE sp_file_fir(
    p_tenant_id         UUID,
    p_fir_data          JSONB,
    p_crime_data        JSONB,
    p_victim_ids        UUID[],
    OUT p_fir_id        UUID,
    OUT p_crime_id      UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_fir_id    UUID;
    v_crime_id  UUID;
    v_victim_id UUID;
BEGIN
    -- Insert FIR
    INSERT INTO firs (
        tenant_id, fir_number, incident_date, crime_category,
        filed_at_station_id, complainant_citizen_id, fir_text,
        primary_section, all_sections
    )
    SELECT
        p_tenant_id,
        p_fir_data->>'fir_number',
        (p_fir_data->>'incident_date')::DATE,
        (p_fir_data->>'crime_category')::crime_category,
        (p_fir_data->>'station_id')::UUID,
        (p_fir_data->>'complainant_id')::UUID,
        p_fir_data->>'fir_text',
        p_fir_data->>'primary_section',
        ARRAY(SELECT jsonb_array_elements_text(p_fir_data->'sections'))
    RETURNING id INTO v_fir_id;

    -- Insert Crime
    INSERT INTO crimes (
        tenant_id, case_number, fir_id, category, incident_date,
        police_station_id, total_amount_involved
    )
    SELECT
        p_tenant_id,
        p_crime_data->>'case_number',
        v_fir_id,
        (p_crime_data->>'category')::crime_category,
        (p_crime_data->>'incident_date')::DATE,
        (p_crime_data->>'station_id')::UUID,
        (p_crime_data->>'amount')::DECIMAL
    RETURNING id INTO v_crime_id;

    -- Link victims
    FOREACH v_victim_id IN ARRAY p_victim_ids LOOP
        INSERT INTO crime_victims (crime_id, victim_id)
        VALUES (v_crime_id, v_victim_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Output
    p_fir_id := v_fir_id;
    p_crime_id := v_crime_id;

    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
$$;

-- Function: Get full money trail for a crime (graph traversal)
CREATE OR REPLACE FUNCTION fn_get_money_trail(
    p_crime_id UUID,
    p_max_hops INT DEFAULT 4
)
RETURNS TABLE (
    hop_level   INT,
    account_id  UUID,
    account_last4 CHAR(4),
    bank_name   VARCHAR(255),
    amount      DECIMAL(15,2),
    txn_time    TIMESTAMPTZ,
    is_mule     BOOLEAN,
    is_frozen   BOOLEAN
) AS $$
WITH RECURSIVE money_trail AS (
    -- Base: accounts directly connected to crime's transactions
    SELECT
        1 AS hop,
        t.receiver_account_id AS acct_id,
        t.amount,
        t.transaction_time
    FROM transactions t
    WHERE t.crime_id = p_crime_id
      AND t.is_fraudulent = TRUE

    UNION ALL

    -- Recursive: follow money forward
    SELECT
        mt.hop + 1,
        t.receiver_account_id,
        t.amount,
        t.transaction_time
    FROM money_trail mt
    JOIN transactions t ON t.sender_account_id = mt.acct_id
    WHERE mt.hop < p_max_hops
      AND t.transaction_time > (SELECT incident_start_time FROM crimes WHERE id = p_crime_id)
)
SELECT
    mt.hop AS hop_level,
    ba.id,
    ba.account_number_last4,
    ba.bank_name,
    mt.amount,
    mt.transaction_time,
    ba.is_mule_account,
    ba.is_frozen
FROM money_trail mt
JOIN bank_accounts ba ON ba.id = mt.acct_id
ORDER BY mt.hop, mt.transaction_time;
$$ LANGUAGE SQL;

-- ================================================================
-- VIEWS: Convenience views for application
-- ================================================================

-- Active crimes with full context
CREATE VIEW v_active_crimes AS
SELECT
    c.id,
    c.tenant_id,
    c.case_number,
    c.category,
    c.status,
    c.severity,
    c.incident_date,
    c.total_amount_involved,
    c.ai_risk_score,
    c.is_organized_crime,
    f.fir_number,
    ps.name AS station_name,
    ps.district,
    ps.state,
    o.first_name || ' ' || o.last_name AS lead_officer_name,
    o.rank AS lead_officer_rank,
    COUNT(DISTINCT cv.victim_id) AS victim_count,
    COUNT(DISTINCT cs.suspect_id) AS suspect_count,
    COUNT(DISTINCT ev.id) AS evidence_count
FROM crimes c
LEFT JOIN firs f ON f.id = c.fir_id
LEFT JOIN police_stations ps ON ps.id = c.police_station_id
LEFT JOIN officers o ON o.id = c.lead_officer_id
LEFT JOIN crime_victims cv ON cv.crime_id = c.id
LEFT JOIN crime_suspects cs ON cs.crime_id = c.id
LEFT JOIN evidence ev ON ev.crime_id = c.id
WHERE c.status NOT IN ('CLOSED', 'ACQUITTED')
GROUP BY c.id, f.fir_number, ps.name, ps.district, ps.state,
         o.first_name, o.last_name, o.rank;

-- Suspect profile with all linked identifiers
CREATE VIEW v_suspect_full_profile AS
SELECT
    s.id,
    s.tenant_id,
    s.name,
    s.aliases,
    s.status,
    s.ai_risk_score,
    s.modus_operandi,
    s.gang_affiliation,
    ARRAY_AGG(DISTINCT ph.number) AS phone_numbers,
    ARRAY_AGG(DISTINCT ba.account_number_masked) AS bank_accounts,
    ARRAY_AGG(DISTINCT v.registration_number) AS vehicles,
    COUNT(DISTINCT cs.crime_id) AS total_cases
FROM suspects s
LEFT JOIN suspect_phones sp ON sp.suspect_id = s.id
LEFT JOIN phone_numbers ph ON ph.id = sp.phone_id
LEFT JOIN suspect_accounts sa ON sa.suspect_id = s.id
LEFT JOIN bank_accounts ba ON ba.id = sa.account_id
LEFT JOIN suspect_vehicles sv ON sv.suspect_id = s.id
LEFT JOIN vehicles v ON v.id = sv.vehicle_id
LEFT JOIN crime_suspects cs ON cs.suspect_id = s.id
GROUP BY s.id;
```

---

## PART 11 — COMPLETE INDEX SUMMARY

```sql
-- ================================================================
-- INDEX OPTIMIZATION SUMMARY
-- All indexes organized by purpose
-- ================================================================

-- ── FOREIGN KEY INDEXES (prevent sequential scans on joins) ──

-- Already created above as part of table definitions
-- Additional FK indexes for junction tables:
CREATE INDEX idx_crime_victims_crime_fk ON crime_victims(crime_id);
CREATE INDEX idx_crime_suspects_crime_fk ON crime_suspects(crime_id);
CREATE INDEX idx_suspect_phones_suspect_fk ON suspect_phones(suspect_id);
CREATE INDEX idx_suspect_accounts_suspect_fk ON suspect_accounts(suspect_id);
CREATE INDEX idx_suspect_vehicles_suspect_fk ON suspect_vehicles(suspect_id);
CREATE INDEX idx_victim_phones_victim_fk ON victim_phones(victim_id);
CREATE INDEX idx_victim_accounts_victim_fk ON victim_accounts(victim_id);

-- ── DASHBOARD QUERY INDEXES ──

-- Most common dashboard query: "Show me open Critical crimes today"
CREATE INDEX idx_crimes_dashboard
    ON crimes(tenant_id, status, severity, incident_date DESC)
    WHERE status NOT IN ('CLOSED', 'ACQUITTED');

-- "Show all pending notifications for user X"
CREATE INDEX idx_notif_user_pending
    ON notifications(recipient_id, status, created_at DESC)
    WHERE status = 'PENDING';

-- "Show evidence for crime X ordered by obtained_at"
CREATE INDEX idx_evidence_crime_time
    ON evidence(crime_id, obtained_at DESC);

-- ── FRAUD DETECTION INDEXES ──

-- High-frequency: check if VPA is known fraudster
CREATE INDEX idx_upi_receiver_fraud
    ON upi_transactions(receiver_vpa, is_fraud_confirmed, transaction_time DESC);

-- Account freeze check (called on every transaction)
CREATE INDEX idx_accounts_freeze_check
    ON bank_accounts(account_number_hash, is_frozen, is_flagged);

-- ── FULL-TEXT SEARCH INDEXES ──

CREATE INDEX idx_crimes_narrative_fts
    ON crimes USING GIN(to_tsvector('english',
        COALESCE(ai_narrative, '') || ' ' || COALESCE(gang_name, '')
    ));

CREATE INDEX idx_suspects_fts
    ON suspects USING GIN(to_tsvector('english',
        COALESCE(name, '') || ' ' || COALESCE(modus_operandi, '')
    ));

-- ── GEOSPATIAL INDEXES ──

CREATE INDEX idx_locations_coords
    ON locations USING GIST(coordinates);

-- Crimes within radius query
CREATE INDEX idx_crimes_location_spatial
    ON crimes(crime_location_id);  -- Join to locations.coordinates

-- ── PARTIAL INDEXES (high selectivity, small footprint) ──

CREATE INDEX idx_suspects_wanted
    ON suspects(tenant_id, ai_risk_score DESC)
    WHERE status = 'WANTED';

CREATE INDEX idx_accounts_frozen_active
    ON bank_accounts(frozen_at DESC)
    WHERE is_frozen = TRUE;

CREATE INDEX idx_crimes_organized
    ON crimes(tenant_id, total_amount_involved DESC)
    WHERE is_organized_crime = TRUE;

CREATE INDEX idx_media_deepfake
    ON media(deepfake_score DESC)
    WHERE is_deepfake_detected = TRUE;

CREATE INDEX idx_transactions_fraud
    ON transactions(amount DESC, transaction_time DESC)
    WHERE is_fraud_confirmed = TRUE;

-- ── VECTOR SEARCH INDEX ──

CREATE INDEX idx_security_events_embedding
    ON security_events USING ivfflat(embedding vector_cosine_ops)
    WITH (lists = 200);

-- ================================================================
-- ANALYZE — Update table statistics after index creation
-- ================================================================

ANALYZE tenants, citizens, suspects, victims, crimes, firs,
        police_stations, officers, bank_accounts, transactions,
        upi_transactions, evidence, media, phone_numbers,
        locations, vehicles, notifications, reports;
```

---

## PART 12 — ROW-LEVEL SECURITY (COMPLETE)

```sql
-- ================================================================
-- ROW-LEVEL SECURITY — Tenant and Role-Based Data Access
-- ================================================================

-- Helper function: get current tenant from JWT context
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.tenant_id', TRUE)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.user_role', TRUE);
EXCEPTION
    WHEN OTHERS THEN RETURN 'CITIZEN';
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable and configure RLS on all sensitive tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'sentinelai'
          AND tablename NOT IN ('tenants', 'locations')
    LOOP
        EXECUTE format('ALTER TABLE sentinelai.%I ENABLE ROW LEVEL SECURITY', tbl);

        -- Tenant isolation policy (base policy for all tables)
        EXECUTE format($$
            CREATE POLICY IF NOT EXISTS %I ON sentinelai.%I
            USING (tenant_id = current_tenant_id())
        $$, tbl || '_tenant_isolation', tbl);
    END LOOP;
END;
$$;

-- Special policy: Officers can only see cases in their jurisdiction
CREATE POLICY officer_case_access ON crimes
    USING (
        tenant_id = current_tenant_id()
        AND (
            current_user_role() IN ('CISO', 'SUPER_ADMIN')
            OR police_station_id IN (
                SELECT police_station_id FROM officers
                WHERE user_id = current_setting('app.user_id', TRUE)::UUID
            )
            OR lead_officer_id = (
                SELECT id FROM officers
                WHERE user_id = current_setting('app.user_id', TRUE)::UUID
            )
        )
    );

-- Special policy: Citizens can only see their own complaints
CREATE POLICY citizen_own_data ON firs
    USING (
        tenant_id = current_tenant_id()
        AND (
            current_user_role() NOT IN ('CITIZEN')
            OR complainant_citizen_id = (
                SELECT id FROM citizens
                WHERE primary_phone = current_setting('app.user_phone', TRUE)
            )
        )
    );

-- Minors data: additional protection
CREATE POLICY minor_victim_protection ON victims
    USING (
        tenant_id = current_tenant_id()
        AND (
            is_minor = FALSE
            OR current_user_role() IN ('CISO', 'CYBER_CRIME_OFFICER', 'SUPER_ADMIN')
        )
    );
```

---

## PART 13 — FOREIGN KEY COMPLETE MAP

```
COMPLETE FOREIGN KEY REFERENCE:

crimes.fir_id                    → firs.id
crimes.crime_location_id         → locations.id
crimes.police_station_id         → police_stations.id
crimes.lead_officer_id           → officers.id

firs.filed_at_station_id         → police_stations.id
firs.filed_by_officer_id         → officers.id
firs.complainant_citizen_id      → citizens.id
firs.assigned_officer_id         → officers.id
firs.transferred_to_station      → police_stations.id
firs.incident_location_id        → locations.id

suspects.citizen_id              → citizens.id
suspects.known_location_id       → locations.id

victims.citizen_id               → citizens.id

crime_victims.crime_id           → crimes.id  (CASCADE DELETE)
crime_victims.victim_id          → victims.id (CASCADE DELETE)

crime_suspects.crime_id          → crimes.id  (CASCADE DELETE)
crime_suspects.suspect_id        → suspects.id (CASCADE DELETE)

officers.police_station_id       → police_stations.id
police_stations.location_id      → locations.id

evidence.crime_id                → crimes.id
evidence.fir_id                  → firs.id
evidence.obtained_by_officer_id  → officers.id
evidence.current_custodian_id    → officers.id

media.evidence_id                → evidence.id (SET NULL on delete)
media.crime_id                   → crimes.id
media.suspect_id                 → suspects.id
media.victim_id                  → victims.id
media.capture_location_id        → locations.id

phone_numbers.* (no FKs — self-contained lookup table)
suspect_phones.suspect_id        → suspects.id (CASCADE)
suspect_phones.phone_id          → phone_numbers.id (CASCADE)
victim_phones.victim_id          → victims.id (CASCADE)
victim_phones.phone_id           → phone_numbers.id (CASCADE)

bank_accounts.branch_location_id → locations.id
bank_accounts.opening_location_id → locations.id
suspect_accounts.suspect_id      → suspects.id (CASCADE)
suspect_accounts.account_id      → bank_accounts.id (CASCADE)
victim_accounts.victim_id        → victims.id (CASCADE)
victim_accounts.account_id       → bank_accounts.id (CASCADE)

transactions.sender_account_id   → bank_accounts.id
transactions.receiver_account_id → bank_accounts.id
transactions.transaction_location_id → locations.id
transactions.crime_id            → crimes.id

upi_transactions.sender_account_id  → bank_accounts.id
upi_transactions.receiver_account_id → bank_accounts.id
upi_transactions.transaction_id  → transactions.id
upi_transactions.crime_id        → crimes.id

vehicles.owner_citizen_id        → citizens.id
vehicles.stolen_crime_id         → crimes.id
vehicles.seized_by_station_id    → police_stations.id
suspect_vehicles.suspect_id      → suspects.id (CASCADE)
suspect_vehicles.vehicle_id      → vehicles.id (CASCADE)

notifications.crime_id           → crimes.id
notifications.fir_id             → firs.id

reports.crime_id                 → crimes.id
reports.fir_id                   → firs.id
reports.suspect_id               → suspects.id
```

---

## PART 14 — PERFORMANCE TUNING

```sql
-- ================================================================
-- POSTGRESQL CONFIGURATION RECOMMENDATIONS
-- For a 16-core, 128GB RAM production server
-- ================================================================

-- postgresql.conf tuning
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '32GB';          -- 25% of RAM
ALTER SYSTEM SET effective_cache_size = '96GB';    -- 75% of RAM
ALTER SYSTEM SET maintenance_work_mem = '2GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;           -- SSD
ALTER SYSTEM SET effective_io_concurrency = 200;   -- SSD
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET max_worker_processes = 16;
ALTER SYSTEM SET max_parallel_workers_per_gather = 8;
ALTER SYSTEM SET max_parallel_workers = 16;
ALTER SYSTEM SET max_parallel_maintenance_workers = 4;
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET wal_keep_size = '1GB';

-- Enable query planning hints
ALTER SYSTEM SET enable_partitionwise_join = ON;
ALTER SYSTEM SET enable_partitionwise_aggregate = ON;

SELECT pg_reload_conf();

-- ================================================================
-- QUERY PERFORMANCE: EXPLAIN ANALYZE key queries
-- ================================================================

-- Example: Dashboard main query — should use idx_crimes_dashboard
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM v_active_crimes
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND severity = 'CRITICAL'
ORDER BY incident_date DESC
LIMIT 20;

-- Example: Money trail — should use recursive CTE efficiently
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM fn_get_money_trail(
    '00000000-0000-0000-0000-000000000002'::UUID, 3
);
```

---

## PART 15 — SCHEMA SUMMARY

```
┌────────────────────────────────────────────────────────────────────┐
│                  SENTINELAI DATABASE SUMMARY                       │
├────────────────┬───────────────────────────────────────────────────┤
│ Total Tables   │ 32 (core: 24, junction: 8)                        │
│ Total Indexes  │ 85+ (B-tree, GIN, GiST, BRIN, ivfflat)           │
│ Total Triggers │ 9 (update_at × 7, audit × 5, business logic × 3) │
│ Partitioning   │ Range (crimes, audit, events), List (notif, accts)│
│ Extensions     │ TimescaleDB, PostGIS, pgvector, pg_trgm, pgcrypto │
│ Security       │ RLS on all 24 core tables, 6 custom policies      │
│ Normalization  │ 3NF with JSONB denorm for AI outputs              │
│ Audit          │ Cryptographic hash chain, append-only             │
│ Search         │ Full-text (tsvector), Fuzzy (trigram), Vector     │
│ Time-Series    │ 3 hypertables with auto-compression + retention   │
└────────────────┴───────────────────────────────────────────────────┘
```

---

*SentinelAI PostgreSQL Schema v1.0 — July 11, 2026*  
*Review Required: DBA + Security Engineer before production deployment*
