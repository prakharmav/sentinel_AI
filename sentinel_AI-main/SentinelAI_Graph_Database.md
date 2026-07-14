# SentinelAI — Complete Graph Database Design

> **Engine**: Neo4j 5.x Enterprise  
> **Query Language**: Cypher  
> **Design Role**: Staff Graph Architect, SentinelAI  
> **Date**: July 11, 2026  
> **Purpose**: Fraud network intelligence, entity linkage, attack path analysis

---

## TABLE OF CONTENTS

1. [Graph Schema Overview](#1-graph-schema-overview)
2. [Node Definitions](#2-node-definitions)
3. [Relationship Definitions](#3-relationship-definitions)
4. [Constraints & Indexes](#4-constraints--indexes)
5. [Cypher — Schema Creation](#5-cypher--schema-creation)
6. [Cypher — CRUD Operations](#6-cypher--crud-operations)
7. [Fraud Detection Queries](#7-fraud-detection-queries)
8. [Network Analysis Queries](#8-network-analysis-queries)
9. [ML Feature Extraction Queries](#9-ml-feature-extraction-queries)
10. [Temporal Analysis Queries](#10-temporal-analysis-queries)
11. [Network Visualization Strategy](#11-network-visualization-strategy)

---

## 1. GRAPH SCHEMA OVERVIEW

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                    SENTINELAI — GRAPH DATABASE SCHEMA                               ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

                              ┌────────────────────┐
                              │   :Organization     │
                              │  (Gang, Bank, Corp) │
                              └──────────┬──────────┘
                                         │ MEMBER_OF / OPERATES_IN
                                         │
         ┌─────────────────────────────── ▼ ──────────────────────────────────────┐
         │                                                                          │
   ┌─────┴──────┐   OWNS ──────────────▶┌────────────┐                            │
   │  :Person   │──────────────────────▶ │  :Phone    │◄──USED_BY──────────────────┤
   │            │   OWNS ──────────────▶ │  :Bank     │                            │
   │ (Suspect / │──────────────────────▶ │  :UPI      │──TRANSFERRED──────────────▶│
   │  Victim /  │   OWNS ──────────────▶ │  :Vehicle  │                            │
   │  Witness / │──────────────────────▶ │  :Device   │──CONNECTED_FROM──────────▶ │
   │  Officer)  │                        └────────────┘                            │
   └─────┬──────┘                                                                   │
         │                                                                          │
         │ INVOLVED_IN / VICTIMIZED_IN / INVESTIGATED                               │
         │                                                                          │
         ▼                         ▼                            ▼                   │
   ┌────────────┐   HAS_EVIDENCE  ┌────────────┐    AT_LOCATION┌────────────┐      │
   │   :Crime   │────────────────▶│ :Evidence  │              │ :Location  │◄──────┘
   │            │◄───────────────  └────────────┘    ◄─────────└────────────┘
   │  (FIR,     │   OCCURRED_AT   ┌────────────┐       VISITED
   │  Case,     │────────────────▶│ :Location  │
   │  Incident) │                 └────────────┘
   └────────────┘
```

### Design Principles

| Principle | Implementation |
|---|---|
| **Rich Nodes** | All entity attributes stored on nodes — avoid property-less nodes |
| **Typed Relationships** | Every relationship has a semantic type, never generic "CONNECTED" |
| **Temporal Relationships** | All relationships carry `since`, `until`, `first_seen`, `last_seen` |
| **Confidence Scoring** | AI-derived linkages carry `confidence: Float` |
| **Tenant Isolation** | All nodes carry `tenant_id` property — enforced via RBAC at application layer |
| **Evidence Linking** | Every forensic relationship carries `evidence_ref` for court admissibility |
| **Bidirectional Traversal** | Relationships modeled for efficient traversal in both directions |

---

## 2. NODE DEFINITIONS

### 2.1 :Person

```
Represents any individual: suspect, victim, witness, officer, or unknown.
Label hierarchy: :Person + :Suspect | :Victim | :Witness | :Officer

Properties:
─────────────────────────────────────────────────────────────
  id               : String  [UNIQUE] — UUID from PostgreSQL
  tenant_id        : String  [INDEXED]
  name             : String
  aliases          : [String]  — All known names / aliases
  date_of_birth    : Date
  gender           : String   — MALE / FEMALE / OTHER / UNKNOWN
  nationality      : String
  aadhaar_hash     : String   — SHA-256 (never raw)
  pan_hash         : String
  cctns_id         : String   — CCTNS system identifier
  status           : String   — WANTED / ARRESTED / CONVICTED / VICTIM / UNKNOWN
  risk_score       : Float    — 0.0 to 100.0 (AI-calculated)
  role             : String   — SUSPECT / VICTIM / WITNESS / OFFICER
  modus_operandi   : String
  gang_affiliation : String
  is_minor         : Boolean
  profile_image_url: String
  created_at       : DateTime
  updated_at       : DateTime
─────────────────────────────────────────────────────────────
```

### 2.2 :Phone

```
Represents a mobile phone number (SIM card, not device).

Properties:
─────────────────────────────────────────────────────────────
  id               : String  [UNIQUE]
  tenant_id        : String  [INDEXED]
  number           : String  [UNIQUE, INDEXED]
  country_code     : String  — "+91"
  carrier          : String  — AIRTEL / JIO / VODAFONE / BSNL
  circle           : String  — Telecom circle
  state            : String
  registered_name  : String
  registration_date: Date
  sim_type         : String  — PHYSICAL / eSIM
  sim_swap_count   : Integer — Number of SIM swaps (fraud signal!)
  last_sim_swap_at : DateTime
  is_active        : Boolean
  is_flagged       : Boolean
  associated_imeis : [String] — Devices this SIM was used in
  cdr_available    : Boolean
  created_at       : DateTime
─────────────────────────────────────────────────────────────
```

### 2.3 :Bank

```
Represents a bank account (not the bank institution itself).

Properties:
─────────────────────────────────────────────────────────────
  id                    : String  [UNIQUE]
  tenant_id             : String  [INDEXED]
  account_hash          : String  [UNIQUE] — SHA-256 of account number
  account_last4         : String  — Last 4 digits for display
  account_masked        : String  — XXXX-XXXX-1234
  account_type          : String  — SAVINGS / CURRENT / SALARY / NRI
  bank_name             : String  [INDEXED]
  ifsc_code             : String  [INDEXED]
  branch_name           : String
  holder_name           : String
  kyc_status            : String  — VERIFIED / PENDING / SUSPICIOUS
  opening_date          : Date
  opening_ip            : String  — IP used to open account (mule signal)
  is_active             : Boolean
  is_flagged            : Boolean
  is_frozen             : Boolean
  frozen_at             : DateTime
  is_mule               : Boolean — AI-flagged as money mule account
  mule_confidence       : Float
  total_received        : Float   — Lifetime inflow
  total_sent            : Float   — Lifetime outflow
  fraud_amount_total    : Float   — Total confirmed fraud amount
  linked_crimes_count   : Integer
  created_at            : DateTime
─────────────────────────────────────────────────────────────
```

### 2.4 :UPI

```
Represents a UPI Virtual Payment Address (VPA).

Properties:
─────────────────────────────────────────────────────────────
  id                 : String  [UNIQUE]
  tenant_id          : String  [INDEXED]
  vpa                : String  [UNIQUE, INDEXED] — user@bank format
  registered_name    : String
  linked_bank_id     : String  — FK to :Bank node id
  linked_phone_id    : String  — FK to :Phone node id
  app_name           : String  — GPAY / PHONEPE / PAYTM / BHIM
  creation_date      : Date
  vpa_age_days       : Integer — Age of VPA (very new = fraud signal)
  total_txns         : Integer — Lifetime transaction count
  total_received     : Float
  total_sent         : Float
  fraud_txns_count   : Integer — Confirmed fraud transactions
  fraud_amount       : Float
  is_flagged         : Boolean
  is_blacklisted     : Boolean
  blacklist_reason   : String
  created_at         : DateTime
─────────────────────────────────────────────────────────────
```

### 2.5 :Vehicle

```
Represents a registered motor vehicle.

Properties:
─────────────────────────────────────────────────────────────
  id                   : String  [UNIQUE]
  tenant_id            : String
  registration_number  : String  [UNIQUE, INDEXED]
  vehicle_type         : String  — TWO_WHEELER / FOUR_WHEELER / HMV
  make                 : String
  model                : String
  color                : String
  year                 : Integer
  fuel_type            : String
  engine_hash          : String  — Hashed engine number
  chassis_hash         : String  — Hashed chassis number
  registered_owner     : String
  is_stolen            : Boolean
  stolen_since         : DateTime
  is_seized            : Boolean
  seized_by_station    : String
  insurance_valid_until: Date
  created_at           : DateTime
─────────────────────────────────────────────────────────────
```

### 2.6 :Crime

```
Represents a criminal incident / case.

Properties:
─────────────────────────────────────────────────────────────
  id                  : String  [UNIQUE]
  tenant_id           : String  [INDEXED]
  case_number         : String  [UNIQUE, INDEXED]
  fir_number          : String  [INDEXED]
  category            : String  [INDEXED] — UPI_FRAUD / PHISHING / etc.
  sub_category        : String
  status              : String  — REPORTED / UNDER_INVESTIGATION / CLOSED
  severity            : String  — CRITICAL / HIGH / MEDIUM / LOW
  incident_date       : Date    [INDEXED]
  total_amount        : Float
  recovered_amount    : Float
  is_organized        : Boolean — Part of organized crime ring
  cluster_id          : String  — Links related crimes
  ai_risk_score       : Float
  ai_narrative        : String  — TRE-generated attack narrative
  mitre_techniques    : [String] — ["T1078", "T1059"]
  predicted_next_steps: [String]
  gang_name           : String
  created_at          : DateTime
─────────────────────────────────────────────────────────────
```

### 2.7 :Evidence

```
Represents a piece of forensic evidence.

Properties:
─────────────────────────────────────────────────────────────
  id               : String  [UNIQUE]
  tenant_id        : String
  evidence_type    : String  — SCREENSHOT / TRANSACTION_LOG / AUDIO / etc.
  title            : String
  description      : String
  source           : String
  obtained_at      : DateTime
  obtained_method  : String  — VOLUNTARY / COURT_ORDER / SEARCH
  is_court_admissible : Boolean
  content_hash     : String  — SHA-512 for integrity
  storage_path     : String  — MinIO path
  chain_of_custody : String  — JSON string
  ai_analyzed      : Boolean
  is_deepfake      : Boolean
  deepfake_score   : Float
  created_at       : DateTime
─────────────────────────────────────────────────────────────
```

### 2.8 :Location

```
Represents a physical or virtual (IP-based) location.

Properties:
─────────────────────────────────────────────────────────────
  id              : String  [UNIQUE]
  tenant_id       : String
  location_type   : String  — CRIME_SCENE / RESIDENCE / IP_LOCATION / ATM
  address         : String
  district        : String  [INDEXED]
  state           : String  [INDEXED]
  state_code      : String
  pincode         : String
  latitude        : Float
  longitude       : Float
  geohash         : String  [INDEXED]
  ip_address      : String
  ip_country      : String
  ip_isp          : String
  is_virtual      : Boolean — true for IP-based locations
  created_at      : DateTime
─────────────────────────────────────────────────────────────
```

### 2.9 :Organization

```
Represents a gang, company, NGO, or any collective entity.

Properties:
─────────────────────────────────────────────────────────────
  id              : String  [UNIQUE]
  tenant_id       : String
  name            : String  [INDEXED]
  aliases         : [String]
  org_type        : String  — GANG / CORPORATION / SHELL_COMPANY / NGO / BANK
  registration_id : String  — CIN / GST / PAN of the org
  is_flagged      : Boolean
  flag_reason     : String
  state           : String
  country         : String
  established_date: Date
  leader_person_id: String  — FK to :Person
  member_count    : Integer
  known_activities: [String]
  created_at      : DateTime
─────────────────────────────────────────────────────────────
```

### 2.10 :Device

```
Represents a physical computing device (smartphone, laptop, ATM).

Properties:
─────────────────────────────────────────────────────────────
  id               : String  [UNIQUE]
  tenant_id        : String
  device_type      : String  — MOBILE / LAPTOP / ATM / SERVER / ROUTER
  os               : String  — Android / iOS / Windows / Linux
  os_version       : String
  imei             : String  [UNIQUE] — For mobile devices (hashed)
  mac_address      : String  [INDEXED] — Hashed
  device_model     : String
  manufacturer     : String
  fingerprint      : String  — Browser/device fingerprint hash
  is_flagged       : Boolean
  flag_reason      : String
  first_seen       : DateTime
  last_seen        : DateTime
  created_at       : DateTime
─────────────────────────────────────────────────────────────
```

---

## 3. RELATIONSHIP DEFINITIONS

### Core Relationships

```
RELATIONSHIP          FROM        TO          PROPERTIES
──────────────────────────────────────────────────────────────────────────────

OWNS                  :Person   → :Phone      { since: Date, is_current: Boolean,
                      :Person   → :Bank         evidence_ref: String }
                      :Person   → :UPI
                      :Person   → :Vehicle
                      :Person   → :Device

CONTROLS              :Person   → :Bank      { since: Date, confidence: Float,
                                               control_type: String }   — used when
                                               legal ownership unclear (mule accounts)

CALLED                :Phone    → :Phone      { call_count: Integer, first_call: DateTime,
                                               last_call: DateTime, total_duration_secs: Integer,
                                               evidence_ref: String }

MESSAGED              :Phone    → :Phone      { message_count: Integer, platform: String,
                                               first_msg: DateTime, last_msg: DateTime }

TRANSFERRED           :Bank     → :Bank       { amount: Float, currency: String,
                      :UPI      → :UPI         transaction_count: Integer,
                      :UPI      → :Bank         first_txn: DateTime, last_txn: DateTime,
                      :Bank     → :UPI          is_fraudulent: Boolean,
                                               total_fraud_amount: Float,
                                               payment_mode: String }

VISITED               :Person   → :Location  { visit_count: Integer, first_visit: DateTime,
                      :Device   → :Location    last_visit: DateTime, dwell_minutes: Integer,
                                               visit_type: String, evidence_ref: String }

OCCURRED_AT           :Crime    → :Location  { location_type: String }

LINKED_TO             :Phone    → :Location  { tower_id: String, first_ping: DateTime,
                                               last_ping: DateTime }  — cell tower pings

INVOLVED_IN           :Person   → :Crime     { role: String,           — ACCUSED/ABETTOR
                                               confidence: Float,
                                               is_prime_accused: Boolean,
                                               arrest_date: Date,
                                               bail_granted: Boolean }

VICTIMIZED_IN         :Person   → :Crime     { amount_lost: Float,
                                               amount_recovered: Float,
                                               reported_at: DateTime }

INVESTIGATED          :Person   → :Crime     { since: DateTime, role: String }
                                              — Officer → Crime

HAS_EVIDENCE          :Crime    → :Evidence  { evidence_type: String, added_at: DateTime }

PROVES                :Evidence → :Crime     { confidence: Float, legal_weight: String }

PROVES_INVOLVEMENT    :Evidence → :Person    { confidence: Float }

ASSOCIATED_WITH       :Person   → :Person    { relationship_type: String,  — ASSOCIATE/FAMILY
                      :Phone    → :Device      strength: Float,
                      :Bank     → :Bank        since: DateTime,
                                               evidence_ref: String }

MEMBER_OF             :Person   → :Organization { role: String, since: Date,
                                                  is_leader: Boolean }

OPERATES_IN           :Organization → :Location { since: Date }

USED_IN               :Device   → :Crime     { role: String }
                      :Phone    → :Crime
                      :Bank     → :Crime
                      :UPI      → :Crime
                      :Vehicle  → :Crime

LINKED_ACCOUNT        :Bank     → :UPI       { link_type: String,  — REGISTERED / USED
                      :UPI      → :Bank         since: DateTime }

REGISTERED_TO         :Phone    → :Person    { since: Date, is_current: Boolean }
                      :UPI      → :Person
                      :Vehicle  → :Person

CONNECTED_FROM        :Device   → :Location  { ip: String, timestamp: DateTime,
                                               connection_type: String }

SIM_IN                :Phone    → :Device    { first_seen: DateTime, last_seen: DateTime }

PRECEDED_BY           :Crime    → :Crime     { relationship: String }  — crime sequence
                                              — for organized attack chains

CO_ACCUSED            :Person   → :Person    { crime_id: String, since: DateTime }
                                              — derived from shared crime involvement

LAUNDERED_THROUGH     :Bank     → :Organization { amount: Float, method: String }
```

---

## 4. CONSTRAINTS & INDEXES

```cypher
// ================================================================
// UNIQUENESS CONSTRAINTS
// ================================================================

CREATE CONSTRAINT person_id IF NOT EXISTS
    FOR (p:Person) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT phone_id IF NOT EXISTS
    FOR (ph:Phone) REQUIRE ph.id IS UNIQUE;

CREATE CONSTRAINT phone_number_unique IF NOT EXISTS
    FOR (ph:Phone) REQUIRE ph.number IS UNIQUE;

CREATE CONSTRAINT bank_id IF NOT EXISTS
    FOR (b:Bank) REQUIRE b.id IS UNIQUE;

CREATE CONSTRAINT bank_account_hash IF NOT EXISTS
    FOR (b:Bank) REQUIRE b.account_hash IS UNIQUE;

CREATE CONSTRAINT upi_id IF NOT EXISTS
    FOR (u:UPI) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT upi_vpa_unique IF NOT EXISTS
    FOR (u:UPI) REQUIRE u.vpa IS UNIQUE;

CREATE CONSTRAINT vehicle_id IF NOT EXISTS
    FOR (v:Vehicle) REQUIRE v.id IS UNIQUE;

CREATE CONSTRAINT vehicle_reg_unique IF NOT EXISTS
    FOR (v:Vehicle) REQUIRE v.registration_number IS UNIQUE;

CREATE CONSTRAINT crime_id IF NOT EXISTS
    FOR (c:Crime) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT crime_case_unique IF NOT EXISTS
    FOR (c:Crime) REQUIRE c.case_number IS UNIQUE;

CREATE CONSTRAINT evidence_id IF NOT EXISTS
    FOR (e:Evidence) REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT location_id IF NOT EXISTS
    FOR (l:Location) REQUIRE l.id IS UNIQUE;

CREATE CONSTRAINT organization_id IF NOT EXISTS
    FOR (o:Organization) REQUIRE o.id IS UNIQUE;

CREATE CONSTRAINT device_id IF NOT EXISTS
    FOR (d:Device) REQUIRE d.id IS UNIQUE;

// ================================================================
// EXISTENCE CONSTRAINTS (Enterprise only)
// ================================================================

CREATE CONSTRAINT person_tenant IF NOT EXISTS
    FOR (p:Person) REQUIRE p.tenant_id IS NOT NULL;

CREATE CONSTRAINT crime_tenant IF NOT EXISTS
    FOR (c:Crime) REQUIRE c.tenant_id IS NOT NULL;

// ================================================================
// INDEXES — for fast lookup
// ================================================================

// Person lookups
CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name);
CREATE INDEX person_risk IF NOT EXISTS FOR (p:Person) ON (p.risk_score);
CREATE INDEX person_status IF NOT EXISTS FOR (p:Person) ON (p.status);
CREATE INDEX person_cctns IF NOT EXISTS FOR (p:Person) ON (p.cctns_id);
CREATE INDEX person_aadhaar IF NOT EXISTS FOR (p:Person) ON (p.aadhaar_hash);
CREATE INDEX person_tenant IF NOT EXISTS FOR (p:Person) ON (p.tenant_id);

// Phone lookups
CREATE INDEX phone_number IF NOT EXISTS FOR (ph:Phone) ON (ph.number);
CREATE INDEX phone_carrier IF NOT EXISTS FOR (ph:Phone) ON (ph.carrier);
CREATE INDEX phone_sim_swaps IF NOT EXISTS FOR (ph:Phone) ON (ph.sim_swap_count);
CREATE INDEX phone_flagged IF NOT EXISTS FOR (ph:Phone) ON (ph.is_flagged);

// Bank lookups
CREATE INDEX bank_ifsc IF NOT EXISTS FOR (b:Bank) ON (b.ifsc_code);
CREATE INDEX bank_name IF NOT EXISTS FOR (b:Bank) ON (b.bank_name);
CREATE INDEX bank_mule IF NOT EXISTS FOR (b:Bank) ON (b.is_mule);
CREATE INDEX bank_frozen IF NOT EXISTS FOR (b:Bank) ON (b.is_frozen);
CREATE INDEX bank_flagged IF NOT EXISTS FOR (b:Bank) ON (b.is_flagged);

// UPI lookups
CREATE INDEX upi_vpa IF NOT EXISTS FOR (u:UPI) ON (u.vpa);
CREATE INDEX upi_flagged IF NOT EXISTS FOR (u:UPI) ON (u.is_flagged);
CREATE INDEX upi_app IF NOT EXISTS FOR (u:UPI) ON (u.app_name);

// Crime lookups
CREATE INDEX crime_category IF NOT EXISTS FOR (c:Crime) ON (c.category);
CREATE INDEX crime_status IF NOT EXISTS FOR (c:Crime) ON (c.status);
CREATE INDEX crime_cluster IF NOT EXISTS FOR (c:Crime) ON (c.cluster_id);
CREATE INDEX crime_date IF NOT EXISTS FOR (c:Crime) ON (c.incident_date);
CREATE INDEX crime_severity IF NOT EXISTS FOR (c:Crime) ON (c.severity);

// Location lookups
CREATE INDEX location_district IF NOT EXISTS FOR (l:Location) ON (l.district);
CREATE INDEX location_state IF NOT EXISTS FOR (l:Location) ON (l.state);
CREATE INDEX location_geohash IF NOT EXISTS FOR (l:Location) ON (l.geohash);

// Full-text indexes (Neo4j 5.x)
CREATE FULLTEXT INDEX person_fulltext IF NOT EXISTS
    FOR (p:Person) ON EACH [p.name, p.aliases, p.modus_operandi];

CREATE FULLTEXT INDEX crime_fulltext IF NOT EXISTS
    FOR (c:Crime) ON EACH [c.ai_narrative, c.gang_name, c.case_number];

CREATE FULLTEXT INDEX org_fulltext IF NOT EXISTS
    FOR (o:Organization) ON EACH [o.name, o.aliases];

// Vector index (Neo4j 5.11+) — for semantic similarity
CREATE VECTOR INDEX person_embedding IF NOT EXISTS
    FOR (p:Person) ON (p.embedding)
    OPTIONS {indexConfig: {`vector.dimensions`: 768, `vector.similarity_function`: 'cosine'}};
```

---

## 5. CYPHER — SCHEMA CREATION

```cypher
// ================================================================
// NODE CREATION — Templates
// ================================================================

// Create a Person (Suspect)
CREATE (p:Person:Suspect {
    id: randomUUID(),
    tenant_id: $tenant_id,
    name: $name,
    aliases: $aliases,
    date_of_birth: date($dob),
    gender: $gender,
    nationality: 'Indian',
    aadhaar_hash: $aadhaar_hash,
    cctns_id: $cctns_id,
    status: 'UNDER_WATCH',
    risk_score: 0.0,
    role: 'SUSPECT',
    modus_operandi: $modus_operandi,
    created_at: datetime(),
    updated_at: datetime()
})
RETURN p;

// Create a Phone Number
CREATE (ph:Phone {
    id: randomUUID(),
    tenant_id: $tenant_id,
    number: $number,
    country_code: '+91',
    carrier: $carrier,
    circle: $circle,
    state: $state,
    registered_name: $registered_name,
    sim_swap_count: 0,
    is_active: true,
    is_flagged: false,
    created_at: datetime()
})
RETURN ph;

// Create a Bank Account
CREATE (b:Bank {
    id: randomUUID(),
    tenant_id: $tenant_id,
    account_hash: $account_hash,
    account_last4: $last4,
    account_masked: $masked,
    account_type: $type,
    bank_name: $bank_name,
    ifsc_code: $ifsc,
    holder_name: $holder,
    kyc_status: 'UNKNOWN',
    is_active: true,
    is_flagged: false,
    is_frozen: false,
    is_mule: false,
    fraud_amount_total: 0.0,
    linked_crimes_count: 0,
    created_at: datetime()
})
RETURN b;

// Create UPI VPA
CREATE (u:UPI {
    id: randomUUID(),
    tenant_id: $tenant_id,
    vpa: $vpa,
    registered_name: $name,
    app_name: $app,
    total_txns: 0,
    fraud_txns_count: 0,
    fraud_amount: 0.0,
    is_flagged: false,
    is_blacklisted: false,
    created_at: datetime()
})
RETURN u;

// Create a Crime
CREATE (c:Crime {
    id: randomUUID(),
    tenant_id: $tenant_id,
    case_number: $case_number,
    fir_number: $fir_number,
    category: $category,
    status: 'REPORTED',
    severity: $severity,
    incident_date: date($incident_date),
    total_amount: $amount,
    recovered_amount: 0.0,
    is_organized: false,
    ai_risk_score: 0.0,
    created_at: datetime()
})
RETURN c;

// Create Location
CREATE (l:Location {
    id: randomUUID(),
    tenant_id: $tenant_id,
    location_type: $type,
    address: $address,
    district: $district,
    state: $state,
    state_code: $state_code,
    pincode: $pincode,
    latitude: $lat,
    longitude: $lng,
    geohash: $geohash,
    is_virtual: false,
    created_at: datetime()
})
RETURN l;

// ================================================================
// RELATIONSHIP CREATION — Templates
// ================================================================

// Person OWNS Phone
MATCH (p:Person {id: $person_id}), (ph:Phone {id: $phone_id})
MERGE (p)-[r:OWNS]->(ph)
ON CREATE SET
    r.since = date($since),
    r.is_current = true,
    r.evidence_ref = $evidence_id
ON MATCH SET
    r.updated_at = datetime()
RETURN p, r, ph;

// Person OWNS Bank Account
MATCH (p:Person {id: $person_id}), (b:Bank {id: $bank_id})
MERGE (p)-[r:OWNS]->(b)
ON CREATE SET
    r.since = date($since),
    r.is_current = true
RETURN p, r, b;

// Phone CALLED Phone (from CDR data)
MATCH (from:Phone {number: $from_number}), (to:Phone {number: $to_number})
MERGE (from)-[r:CALLED]->(to)
ON CREATE SET
    r.call_count = 1,
    r.first_call = datetime($call_time),
    r.last_call = datetime($call_time),
    r.total_duration_secs = $duration
ON MATCH SET
    r.call_count = r.call_count + 1,
    r.last_call = datetime($call_time),
    r.total_duration_secs = r.total_duration_secs + $duration
RETURN from, r, to;

// Bank TRANSFERRED To Bank
MATCH (from:Bank {account_hash: $from_hash}), (to:Bank {account_hash: $to_hash})
MERGE (from)-[r:TRANSFERRED]->(to)
ON CREATE SET
    r.amount = $amount,
    r.currency = 'INR',
    r.transaction_count = 1,
    r.first_txn = datetime($txn_time),
    r.last_txn = datetime($txn_time),
    r.is_fraudulent = false,
    r.total_fraud_amount = 0.0,
    r.payment_mode = $mode
ON MATCH SET
    r.amount = r.amount + $amount,
    r.transaction_count = r.transaction_count + 1,
    r.last_txn = datetime($txn_time)
RETURN from, r, to;

// Mark a transfer as fraudulent
MATCH (from:Bank)-[r:TRANSFERRED]->(to:Bank)
WHERE from.account_hash = $from_hash
  AND to.account_hash = $to_hash
  AND r.last_txn >= datetime($start_time)
SET r.is_fraudulent = true,
    r.total_fraud_amount = r.total_fraud_amount + $fraud_amount
RETURN r;

// Person INVOLVED_IN Crime
MATCH (p:Person {id: $person_id}), (c:Crime {id: $crime_id})
MERGE (p)-[r:INVOLVED_IN]->(c)
ON CREATE SET
    r.role = $role,
    r.confidence = $confidence,
    r.is_prime_accused = $is_prime,
    r.arrest_date = CASE WHEN $arrest_date IS NOT NULL
                    THEN date($arrest_date) ELSE null END
RETURN p, r, c;

// Person VICTIMIZED_IN Crime
MATCH (p:Person {id: $person_id}), (c:Crime {id: $crime_id})
MERGE (p)-[r:VICTIMIZED_IN]->(c)
ON CREATE SET
    r.amount_lost = $amount_lost,
    r.amount_recovered = 0.0,
    r.reported_at = datetime()
RETURN p, r, c;

// UPI TRANSFERRED to UPI
MATCH (from:UPI {vpa: $from_vpa}), (to:UPI {vpa: $to_vpa})
MERGE (from)-[r:TRANSFERRED]->(to)
ON CREATE SET
    r.amount = $amount,
    r.transaction_count = 1,
    r.first_txn = datetime($txn_time),
    r.last_txn = datetime($txn_time),
    r.is_fraudulent = false,
    r.total_fraud_amount = 0.0
ON MATCH SET
    r.amount = r.amount + $amount,
    r.transaction_count = r.transaction_count + 1,
    r.last_txn = datetime($txn_time)
RETURN from, r, to;

// Crime HAS_EVIDENCE
MATCH (c:Crime {id: $crime_id}), (e:Evidence {id: $evidence_id})
MERGE (c)-[r:HAS_EVIDENCE]->(e)
ON CREATE SET
    r.evidence_type = e.evidence_type,
    r.added_at = datetime()
RETURN c, r, e;

// Crime OCCURRED_AT Location
MATCH (c:Crime {id: $crime_id}), (l:Location {id: $location_id})
MERGE (c)-[r:OCCURRED_AT]->(l)
ON CREATE SET
    r.location_type = $location_type
RETURN c, r, l;

// Person VISITED Location
MATCH (p:Person {id: $person_id}), (l:Location {id: $location_id})
MERGE (p)-[r:VISITED]->(l)
ON CREATE SET
    r.visit_count = 1,
    r.first_visit = datetime($visit_time),
    r.last_visit = datetime($visit_time),
    r.visit_type = $visit_type
ON MATCH SET
    r.visit_count = r.visit_count + 1,
    r.last_visit = datetime($visit_time)
RETURN p, r, l;

// Device SIM_IN Phone
MATCH (ph:Phone {id: $phone_id}), (d:Device {id: $device_id})
MERGE (ph)-[r:SIM_IN]->(d)
ON CREATE SET
    r.first_seen = datetime(),
    r.last_seen = datetime()
ON MATCH SET
    r.last_seen = datetime()
RETURN ph, r, d;
```

---

## 6. CYPHER — CRUD OPERATIONS

```cypher
// ================================================================
// READ — Common lookups
// ================================================================

// Get full person profile with all linked entities
MATCH (p:Person {id: $person_id})
OPTIONAL MATCH (p)-[:OWNS]->(ph:Phone)
OPTIONAL MATCH (p)-[:OWNS|CONTROLS]->(b:Bank)
OPTIONAL MATCH (p)-[:OWNS]->(u:UPI)
OPTIONAL MATCH (p)-[:OWNS]->(v:Vehicle)
OPTIONAL MATCH (p)-[:OWNS]->(d:Device)
OPTIONAL MATCH (p)-[:INVOLVED_IN]->(c:Crime)
OPTIONAL MATCH (p)-[:MEMBER_OF]->(o:Organization)
RETURN
    p,
    collect(DISTINCT ph) AS phones,
    collect(DISTINCT b)  AS bank_accounts,
    collect(DISTINCT u)  AS upi_accounts,
    collect(DISTINCT v)  AS vehicles,
    collect(DISTINCT d)  AS devices,
    collect(DISTINCT c)  AS crimes,
    collect(DISTINCT o)  AS organizations;

// Fuzzy name search with full-text index
CALL db.index.fulltext.queryNodes("person_fulltext", $name_query)
YIELD node, score
WHERE node.tenant_id = $tenant_id
RETURN node.id, node.name, node.aliases, node.status, node.risk_score, score
ORDER BY score DESC, node.risk_score DESC
LIMIT 20;

// Get all phones connected to a person (direct + indirect through devices)
MATCH (p:Person {id: $person_id})
MATCH (p)-[:OWNS|ASSOCIATED_WITH*1..2]-(ph:Phone)
RETURN DISTINCT ph.number, ph.carrier, ph.sim_swap_count, ph.is_flagged
ORDER BY ph.sim_swap_count DESC;

// Get transaction trail for a bank account (money in + out)
MATCH (b:Bank {id: $bank_id})
OPTIONAL MATCH (b)-[out:TRANSFERRED]->(to:Bank)
OPTIONAL MATCH (from:Bank)-[in:TRANSFERRED]->(b)
RETURN
    b,
    collect(DISTINCT {
        direction: 'OUT',
        counterparty: to.account_masked,
        bank: to.bank_name,
        amount: out.amount,
        txn_count: out.transaction_count,
        is_fraudulent: out.is_fraudulent
    }) AS outbound,
    collect(DISTINCT {
        direction: 'IN',
        counterparty: from.account_masked,
        bank: from.bank_name,
        amount: in.amount,
        txn_count: in.transaction_count,
        is_fraudulent: in.is_fraudulent
    }) AS inbound;

// UPDATE — Add arrest to suspect
MATCH (p:Person {id: $person_id})-[r:INVOLVED_IN]->(c:Crime {id: $crime_id})
SET p.status = 'ARRESTED',
    r.arrest_date = date($arrest_date),
    p.updated_at = datetime()
RETURN p, r;

// UPDATE — Freeze bank account
MATCH (b:Bank {id: $bank_id})
SET b.is_frozen = true,
    b.frozen_at = datetime(),
    b.is_flagged = true,
    b.flag_reason = $reason
RETURN b;

// UPDATE — Mark UPI as blacklisted
MATCH (u:UPI {vpa: $vpa})
SET u.is_blacklisted = true,
    u.blacklist_reason = $reason,
    u.is_flagged = true
RETURN u;
```

---

## 7. FRAUD DETECTION QUERIES

```cypher
// ================================================================
// FRAUD DETECTION QUERY LIBRARY
// ================================================================

// ── QUERY FD-01: Money Mule Network Detection ──
// Find accounts that receive money from many victims
// and forward it quickly (classic mule behavior)

MATCH (victim:Bank)-[r1:TRANSFERRED]->(mule:Bank)
WHERE r1.is_fraudulent = true
  AND victim.tenant_id = $tenant_id
WITH mule, count(DISTINCT victim) AS victim_count, sum(r1.amount) AS total_received
WHERE victim_count >= 3  // Multiple victims sending to same account = mule
MATCH (mule)-[r2:TRANSFERRED]->(next:Bank)
WHERE r2.last_txn > r1.last_txn   // Forwarded AFTER receiving
  AND duration.between(r1.last_txn, r2.last_txn).hours < 24  // Within 24h
WITH mule, victim_count, total_received, next,
     r2.amount AS forwarded_amount
RETURN
    mule.id AS mule_account_id,
    mule.account_masked AS mule_account,
    mule.bank_name AS mule_bank,
    mule.ifsc_code AS mule_ifsc,
    victim_count,
    total_received,
    collect(DISTINCT next.account_masked) AS forwarding_to,
    sum(forwarded_amount) AS total_forwarded,
    round(sum(forwarded_amount) / total_received * 100, 2) AS forwarding_pct
ORDER BY total_received DESC;

// ── QUERY FD-02: SIM Swap Fraud Ring Detection ──
// Detect persons with multiple SIM swaps linked to UPI fraud

MATCH (p:Person)-[:OWNS]->(ph:Phone)
WHERE ph.sim_swap_count >= 2
  AND ph.tenant_id = $tenant_id
MATCH (ph)-[:SIM_IN]->(d:Device)
MATCH (p)-[:OWNS]->(b:Bank)
MATCH (b)-[t:TRANSFERRED]->(target:Bank)
WHERE t.is_fraudulent = true
  AND t.last_txn > ph.last_sim_swap_at
WITH p, ph, count(DISTINCT t) AS fraud_txns, sum(t.total_fraud_amount) AS fraud_amount
RETURN
    p.name AS suspect,
    p.id AS suspect_id,
    ph.number AS phone,
    ph.sim_swap_count AS sim_swaps,
    ph.carrier AS carrier,
    fraud_txns,
    fraud_amount
ORDER BY fraud_amount DESC;

// ── QUERY FD-03: Coordinated Attack Detection ──
// Multiple crimes in same time window sharing suspects or devices

MATCH (c1:Crime)-[:INVOLVED_IN]-(p:Person)-[:INVOLVED_IN]-(c2:Crime)
WHERE c1.id <> c2.id
  AND c1.tenant_id = $tenant_id
  AND abs(duration.between(date(c1.incident_date), date(c2.incident_date)).days) <= 7
  AND c1.category = c2.category
WITH p, collect(DISTINCT c1) + collect(DISTINCT c2) AS linked_crimes,
     count(DISTINCT c1) + count(DISTINCT c2) AS crime_count
WHERE crime_count >= 3
RETURN
    p.name AS suspect,
    p.id,
    p.risk_score,
    crime_count,
    [c IN linked_crimes | c.case_number] AS case_numbers,
    [c IN linked_crimes | c.total_amount] AS amounts
ORDER BY crime_count DESC;

// ── QUERY FD-04: Multi-Hop Money Laundering Trace ──
// Trace money from confirmed fraud account through n hops

MATCH path = (source:Bank)-[:TRANSFERRED*1..5]->(terminal:Bank)
WHERE source.id = $fraud_account_id
  AND NOT (terminal)-[:TRANSFERRED]->()  // Terminal node (end of chain)
WITH path, length(path) AS hops,
     [r IN relationships(path) | r.amount] AS amounts,
     [n IN nodes(path) | n.account_masked] AS account_chain
RETURN
    account_chain,
    hops,
    amounts,
    reduce(total = 0.0, a IN amounts | total + a) AS total_moved,
    [n IN nodes(path) | n.is_mule] AS mule_flags,
    [n IN nodes(path) | n.bank_name] AS banks
ORDER BY hops ASC;

// ── QUERY FD-05: VPA Age + Fraud Correlation ──
// New UPI VPAs with high fraud amounts = fraudster pattern

MATCH (u:UPI)-[r:TRANSFERRED]->(target:UPI)
WHERE r.is_fraudulent = true
  AND u.tenant_id = $tenant_id
WITH u, target, r.total_fraud_amount AS fraud_amount
WHERE u.vpa_age_days < 30   // Very new VPA
   OR u.total_txns < 5      // Very few transactions
RETURN
    u.vpa AS sender_vpa,
    u.app_name AS app,
    u.vpa_age_days AS vpa_age,
    u.total_txns AS total_txns,
    target.vpa AS receiver_vpa,
    fraud_amount
ORDER BY fraud_amount DESC
LIMIT 50;

// ── QUERY FD-06: Shell Company / Layering Detection ──
// Organizations receiving money from flagged accounts

MATCH (b:Bank {is_flagged: true})-[:LAUNDERED_THROUGH]->(o:Organization)
WHERE b.tenant_id = $tenant_id
WITH o, collect(b) AS flagged_accounts, sum(b.fraud_amount_total) AS total
MATCH (o)-[:MEMBER_OF]-(p:Person)
WHERE p.status IN ['WANTED', 'ARRESTED', 'UNDER_WATCH']
RETURN
    o.name AS organization,
    o.org_type,
    o.registration_id,
    size(flagged_accounts) AS flagged_account_count,
    total AS total_fraud_amount,
    collect(DISTINCT p.name) AS known_suspects
ORDER BY total DESC;

// ── QUERY FD-07: Phishing Network — Shared Infrastructure ──
// Multiple crimes sharing same IP location = coordinated phishing

MATCH (c:Crime)-[:OCCURRED_AT]->(l:Location {is_virtual: true})
WHERE c.category IN ['PHISHING', 'UPI_FRAUD', 'CREDENTIAL_STUFFING']
  AND c.tenant_id = $tenant_id
WITH l, collect(c) AS crimes, count(c) AS crime_count
WHERE crime_count >= 3
MATCH (p:Person)-[:INVOLVED_IN]->(c2:Crime)-[:OCCURRED_AT]->(l)
RETURN
    l.ip_address AS shared_ip,
    l.ip_country AS country,
    l.ip_isp AS isp,
    crime_count,
    [c IN crimes | c.case_number] AS case_numbers,
    sum([c IN crimes | c.total_amount]) AS total_fraud,
    collect(DISTINCT p.name) AS suspects
ORDER BY crime_count DESC;

// ── QUERY FD-08: Suspect Alias / Duplicate Identity Detection ──
// Find persons sharing identity elements (phone, bank, device)

MATCH (p1:Person)-[:OWNS]->(shared)<-[:OWNS]-(p2:Person)
WHERE p1.id < p2.id   // Avoid duplicate pairs
  AND p1.tenant_id = $tenant_id
  AND labels(shared)[0] IN ['Phone', 'Bank', 'Device']
WITH p1, p2, collect(DISTINCT shared) AS shared_entities,
     collect(DISTINCT labels(shared)[0]) AS entity_types
WHERE size(shared_entities) >= 2   // At least 2 shared entities
RETURN
    p1.name AS person1, p1.status AS status1,
    p2.name AS person2, p2.status AS status2,
    size(shared_entities) AS shared_count,
    entity_types,
    [e IN shared_entities | e.id] AS shared_entity_ids;

// ── QUERY FD-09: Geographic Crime Cluster (Hotspot) ──
// Crimes in same geohash within time window

MATCH (c:Crime)-[:OCCURRED_AT]->(l:Location)
WHERE c.tenant_id = $tenant_id
  AND c.incident_date >= date($start_date)
  AND c.incident_date <= date($end_date)
  AND substring(l.geohash, 0, 6) = $geohash_prefix  // 6-char = ~1.2km radius
WITH l, collect(c) AS crimes, count(c) AS crime_count
WHERE crime_count >= 2
RETURN
    l.district,
    l.state,
    substring(l.geohash, 0, 6) AS area_geohash,
    crime_count,
    sum([c IN crimes | c.total_amount]) AS total_amount,
    [c IN crimes | c.category] AS categories,
    [c IN crimes | c.case_number] AS cases;

// ── QUERY FD-10: Gang Network Mapping ──
// Full gang structure — leader, members, crimes, financials

MATCH (o:Organization {id: $org_id})
OPTIONAL MATCH (leader:Person)-[:MEMBER_OF {is_leader: true}]->(o)
OPTIONAL MATCH (member:Person)-[:MEMBER_OF]->(o)
OPTIONAL MATCH (member)-[:INVOLVED_IN]->(c:Crime)
OPTIONAL MATCH (member)-[:OWNS]->(b:Bank)
RETURN
    o.name AS gang_name,
    o.org_type,
    leader.name AS gang_leader,
    collect(DISTINCT member.name) AS members,
    count(DISTINCT c) AS total_crimes,
    sum(DISTINCT c.total_amount) AS total_fraud,
    collect(DISTINCT b.bank_name) AS banks_used,
    collect(DISTINCT c.category) AS crime_types;

// ── QUERY FD-11: Repeat Offender Detection ──
// Suspects with crimes across multiple jurisdictions

MATCH (p:Person)-[:INVOLVED_IN]->(c:Crime)-[:OCCURRED_AT]->(l:Location)
WHERE p.status IN ['SUSPECTED', 'UNDER_WATCH']
  AND p.tenant_id = $tenant_id
WITH p, collect(DISTINCT l.state) AS states, collect(DISTINCT l.district) AS districts,
     count(DISTINCT c) AS crime_count, sum(c.total_amount) AS total_amount
WHERE size(states) >= 2   // Operates across state lines
RETURN
    p.name, p.id, p.risk_score,
    crime_count, total_amount,
    states AS active_states,
    size(districts) AS district_count
ORDER BY total_amount DESC;

// ── QUERY FD-12: 1930 Freeze Candidate Ranking ──
// Prioritize which accounts to freeze (funds still present, high fraud)

MATCH (victim:Bank)-[t:TRANSFERRED {is_fraudulent: true}]->(mule:Bank)
WHERE mule.tenant_id = $tenant_id
  AND NOT mule.is_frozen
WITH mule, sum(t.total_fraud_amount) AS fraud_amount,
     count(DISTINCT victim) AS victim_count
OPTIONAL MATCH (mule)-[out:TRANSFERRED]->(next:Bank)
WHERE out.last_txn > t.last_txn
WITH mule, fraud_amount, victim_count,
     coalesce(sum(out.amount), 0) AS forwarded_out,
     fraud_amount - coalesce(sum(out.amount), 0) AS funds_remaining
WHERE funds_remaining > 0
RETURN
    mule.account_masked,
    mule.bank_name,
    mule.ifsc_code,
    victim_count,
    fraud_amount,
    forwarded_out,
    funds_remaining,
    fraud_amount * 0.4 + victim_count * 10 + funds_remaining * 0.3
        AS freeze_priority_score
ORDER BY freeze_priority_score DESC
LIMIT 100;

// ── QUERY FD-13: Dark Web Credential Linkage ──
// Persons whose data appears in breach databases

MATCH (p:Person)-[:OWNS]->(b:Bank)
WHERE b.is_flagged = true
  AND b.flag_reason CONTAINS 'dark_web'
  AND p.tenant_id = $tenant_id
MATCH (p)-[:OWNS]->(ph:Phone)
RETURN
    p.name, p.id, p.risk_score,
    b.account_masked, b.bank_name,
    ph.number,
    'DARK WEB BREACH DETECTED' AS alert_type
ORDER BY p.risk_score DESC;

// ── QUERY FD-14: Insider Threat Detection ──
// Officers with unusual case access patterns

MATCH (officer:Person:Officer)-[r:INVESTIGATED]->(c:Crime)
WHERE officer.tenant_id = $tenant_id
  AND r.since > datetime() - duration({days: 7})
WITH officer, count(DISTINCT c) AS cases_accessed, collect(c.category) AS categories
WHERE cases_accessed > 20   // More than 20 case accesses in 7 days = anomaly
RETURN
    officer.id,
    cases_accessed,
    categories,
    'HIGH_VOLUME_ACCESS' AS alert_type;

// ── QUERY FD-15: Attack Chain — Crime Sequence Detection ──
// Find sequences of crimes forming a pattern (reconnaissance → execution → laundering)

MATCH path = (c1:Crime)-[:PRECEDED_BY*1..3]->(cn:Crime)
WHERE c1.tenant_id = $tenant_id
  AND NOT (:Crime)-[:PRECEDED_BY]->(c1)  // c1 is the start
WITH path, [n IN nodes(path) | n.category] AS crime_sequence,
           [n IN nodes(path) | n.case_number] AS case_sequence,
           length(path) AS sequence_length
WHERE sequence_length >= 2
RETURN
    crime_sequence,
    case_sequence,
    sequence_length,
    reduce(total = 0.0, n IN nodes(path) | total + n.total_amount) AS total_amount
ORDER BY sequence_length DESC;
```

---

## 8. NETWORK ANALYSIS QUERIES

```cypher
// ================================================================
// GRAPH ANALYSIS — Centrality, Community, Shortest Path
// ================================================================

// ── NA-01: PageRank — Most Influential Nodes in Fraud Network ──
// (Uses Neo4j Graph Data Science library)

CALL gds.graph.project(
    'fraud_network',
    ['Person', 'Bank', 'UPI', 'Phone', 'Organization'],
    {
        TRANSFERRED: { orientation: 'NATURAL' },
        OWNS: { orientation: 'NATURAL' },
        INVOLVED_IN: { orientation: 'NATURAL' },
        MEMBER_OF: { orientation: 'NATURAL' },
        CALLED: { orientation: 'NATURAL' }
    }
);

CALL gds.pageRank.stream('fraud_network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE node.tenant_id = $tenant_id
RETURN
    labels(node)[0] AS node_type,
    CASE labels(node)[0]
        WHEN 'Person' THEN node.name
        WHEN 'Bank'   THEN node.account_masked
        WHEN 'Phone'  THEN node.number
        WHEN 'UPI'    THEN node.vpa
        ELSE node.id
    END AS identifier,
    round(score, 4) AS influence_score
ORDER BY score DESC
LIMIT 30;

// ── NA-02: Louvain Community Detection — Fraud Cluster Discovery ──

CALL gds.louvain.stream('fraud_network')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId)) AS members
WHERE size(members) >= 3
RETURN
    communityId,
    size(members) AS member_count,
    [m IN members | labels(m)[0]] AS node_types,
    [m IN members WHERE 'Person' IN labels(m) | m.name] AS persons,
    [m IN members WHERE 'Bank' IN labels(m) | m.account_masked] AS accounts
ORDER BY member_count DESC
LIMIT 20;

// ── NA-03: Shortest Path Between Two Suspects ──
// "How are Suspect A and Suspect B connected?"

MATCH (s1:Person {id: $suspect_1_id}), (s2:Person {id: $suspect_2_id})
CALL gds.shortestPath.dijkstra.stream('fraud_network', {
    sourceNode: s1,
    targetNode: s2
})
YIELD index, sourceNode, targetNode, totalCost, nodeIds, path
RETURN
    length(path) AS degrees_of_separation,
    [n IN nodes(path) | {
        type: labels(n)[0],
        id: n.id,
        name: CASE labels(n)[0]
                WHEN 'Person' THEN n.name
                WHEN 'Phone'  THEN n.number
                WHEN 'Bank'   THEN n.account_masked
                ELSE n.id
              END
    }] AS connection_chain;

// ── NA-04: Betweenness Centrality — Find Key Connectors ──
// Nodes that connect otherwise separate fraud networks

CALL gds.betweenness.stream('fraud_network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE score > 0
RETURN
    labels(node)[0] AS type,
    node.id,
    COALESCE(node.name, node.number, node.vpa, node.account_masked) AS identifier,
    score AS betweenness_centrality
ORDER BY score DESC
LIMIT 20;

// ── NA-05: Triangle Detection — Closed Loops (Circular Money Flow) ──

MATCH (a:Bank)-[:TRANSFERRED]->(b:Bank)-[:TRANSFERRED]->(c:Bank)-[:TRANSFERRED]->(a)
WHERE a.tenant_id = $tenant_id
  AND a.id <> b.id AND b.id <> c.id
RETURN
    a.account_masked AS account_a,
    b.account_masked AS account_b,
    c.account_masked AS account_c,
    a.bank_name, b.bank_name, c.bank_name,
    'CIRCULAR_TRANSFER_DETECTED' AS alert_type;

// ── NA-06: K-Core Decomposition — Dense Fraud Sub-networks ──

CALL gds.kCore.stream('fraud_network')
YIELD nodeId, coreValue
WITH gds.util.asNode(nodeId) AS node, coreValue
WHERE coreValue >= 3  // Nodes in at least 3-core subgraph
RETURN
    labels(node)[0] AS type,
    node.id,
    COALESCE(node.name, node.number, node.account_masked) AS identifier,
    coreValue AS network_depth
ORDER BY coreValue DESC;

// ── NA-07: Weakly Connected Components — Separate Fraud Networks ──

CALL gds.wcc.stream('fraud_network')
YIELD nodeId, componentId
WITH componentId, count(*) AS component_size
WHERE component_size >= 5
RETURN componentId, component_size
ORDER BY component_size DESC;

// ── NA-08: Full Investigation Package for a Crime ──
// Everything connected to a crime within 3 hops

MATCH (c:Crime {id: $crime_id})
CALL gds.bfs.stream('fraud_network', {
    sourceNode: c,
    maxDepth: 3
})
YIELD path
WITH collect(path) AS paths
RETURN
    [n IN apoc.coll.toSet([n IN apoc.coll.flatten(
        [p IN paths | nodes(p)]
    ) | n]) | {
        id: n.id,
        type: labels(n)[0],
        label: COALESCE(n.name, n.number, n.vpa, n.account_masked, n.case_number),
        risk_score: n.risk_score
    }] AS network_nodes;
```

---

## 9. ML FEATURE EXTRACTION QUERIES

```cypher
// ================================================================
// FEATURE EXTRACTION — For training ML fraud detection models
// ================================================================

// ── ML-01: Person-level fraud features for UEBA model ──

MATCH (p:Person {id: $person_id})
OPTIONAL MATCH (p)-[:OWNS]->(ph:Phone)
OPTIONAL MATCH (p)-[:OWNS|CONTROLS]->(b:Bank)
OPTIONAL MATCH (p)-[:OWNS]->(u:UPI)
OPTIONAL MATCH (p)-[:INVOLVED_IN]->(c:Crime)
OPTIONAL MATCH (p)-[r:CALLED]-(other:Phone)
OPTIONAL MATCH (p)-[:VISITED]->(l:Location)
OPTIONAL MATCH (p)-[:MEMBER_OF]->(o:Organization)
RETURN
    p.id AS person_id,
    // Identity features
    count(DISTINCT ph) AS phone_count,
    max(ph.sim_swap_count) AS max_sim_swaps,
    count(DISTINCT b) AS bank_account_count,
    count(DISTINCT u) AS upi_count,
    // Financial features
    sum(b.fraud_amount_total) AS total_fraud_linked,
    sum(b.total_received) AS total_received,
    avg(b.mule_confidence) AS avg_mule_confidence,
    // Network features
    count(DISTINCT r) AS call_network_size,
    count(DISTINCT l) AS location_count,
    count(DISTINCT l.state) AS state_count,
    // Criminal history
    count(DISTINCT c) AS crime_count,
    count(DISTINCT o) AS org_memberships,
    // Label
    CASE p.status
        WHEN 'CONVICTED' THEN 1
        WHEN 'ARRESTED'  THEN 1
        WHEN 'WANTED'    THEN 1
        ELSE 0
    END AS is_criminal;

// ── ML-02: Transaction graph features for GNN model ──

MATCH (b:Bank {id: $bank_id})
OPTIONAL MATCH (b)-[out:TRANSFERRED]->(to_bank:Bank)
OPTIONAL MATCH (from_bank:Bank)-[in:TRANSFERRED]->(b)
RETURN
    b.id AS bank_id,
    // Node features
    b.is_flagged AS is_flagged,
    b.is_mule AS is_mule,
    b.fraud_amount_total AS fraud_amount,
    b.linked_crimes_count AS crime_count,
    // Out-degree features
    count(DISTINCT to_bank) AS out_degree,
    sum(out.amount) AS total_sent,
    avg(out.amount) AS avg_sent,
    max(out.amount) AS max_sent,
    count(DISTINCT to_bank.bank_name) AS recipient_bank_diversity,
    // In-degree features
    count(DISTINCT from_bank) AS in_degree,
    sum(in.amount) AS total_received,
    avg(in.amount) AS avg_received,
    // Fraud flags on edges
    sum(CASE WHEN out.is_fraudulent THEN 1 ELSE 0 END) AS fraud_out_edges,
    sum(CASE WHEN in.is_fraudulent THEN 1 ELSE 0 END) AS fraud_in_edges,
    // Neighbor features (1-hop aggregation)
    avg(to_bank.fraud_amount_total) AS avg_neighbor_fraud,
    count(DISTINCT to_bank.is_mule) AS mule_neighbor_count;

// ── ML-03: Phone network features for SIM swap model ──

MATCH (ph:Phone {id: $phone_id})
OPTIONAL MATCH (ph)-[:SIM_IN]->(d:Device)
OPTIONAL MATCH (ph)-[call:CALLED]->(other:Phone)
OPTIONAL MATCH (ph)-[:ASSOCIATED_WITH]->(ph2:Phone)
OPTIONAL MATCH (:Person)-[:REGISTERED_TO]->(ph)
RETURN
    ph.id,
    ph.sim_swap_count,
    ph.carrier,
    count(DISTINCT d) AS device_count,          // 1 phone in many devices = fraud
    count(DISTINCT call) AS calls_made,
    count(DISTINCT other) AS unique_call_targets,
    count(DISTINCT ph2) AS associated_numbers,   // Known associated numbers
    // Label
    CASE WHEN ph.is_flagged AND ph.sim_swap_count >= 2 THEN 1 ELSE 0 END AS is_fraud_phone;
```

---

## 10. TEMPORAL ANALYSIS QUERIES

```cypher
// ================================================================
// TEMPORAL ANALYSIS — Time-based fraud patterns
// ================================================================

// ── TA-01: Activity timeline for a suspect ──

MATCH (p:Person {id: $suspect_id})
CALL {
    WITH p
    MATCH (p)-[r:INVOLVED_IN]->(c:Crime)
    RETURN c.incident_date AS date, 'CRIME' AS event_type,
           c.case_number AS reference, c.total_amount AS amount,
           r.role AS role
    UNION
    WITH p
    MATCH (p)-[:OWNS]->(b:Bank)-[t:TRANSFERRED]->(target:Bank)
    WHERE t.is_fraudulent = true
    RETURN date(t.last_txn) AS date, 'FRAUD_TRANSFER' AS event_type,
           b.account_masked AS reference, t.total_fraud_amount AS amount,
           'SENDER' AS role
    UNION
    WITH p
    MATCH (p)-[:VISITED]->(l:Location)
    RETURN date(l.created_at) AS date, 'LOCATION_VISIT' AS event_type,
           l.address AS reference, 0.0 AS amount,
           'VISITOR' AS role
}
RETURN date, event_type, reference, amount, role
ORDER BY date ASC;

// ── TA-02: Crime velocity — accelerating fraud pattern ──
// Detects criminals who are increasing frequency of attacks

MATCH (p:Person)-[:INVOLVED_IN]->(c:Crime)
WHERE p.tenant_id = $tenant_id
WITH p, c.incident_date AS crime_date
ORDER BY p.id, crime_date
WITH p, collect(crime_date) AS crime_dates
WHERE size(crime_dates) >= 3
WITH p, crime_dates,
     [i IN range(1, size(crime_dates)-1) |
         duration.between(crime_dates[i-1], crime_dates[i]).days
     ] AS intervals
WITH p, crime_dates,
     reduce(s=0, d IN intervals | s + d) / size(intervals) AS avg_interval_days,
     intervals[-1] AS last_interval_days
WHERE last_interval_days < avg_interval_days * 0.5  // Last gap < 50% of average = accelerating
RETURN
    p.name, p.id,
    size(crime_dates) AS total_crimes,
    avg_interval_days AS avg_days_between_crimes,
    last_interval_days AS latest_gap_days,
    'ACCELERATING_CRIMINAL_ACTIVITY' AS alert;

// ── TA-03: Money flow velocity ──
// Time between receiving and forwarding (fast = mule)

MATCH (victim:Bank)-[recv:TRANSFERRED]->(mule:Bank)-[fwd:TRANSFERRED]->(next:Bank)
WHERE recv.is_fraudulent = true
  AND mule.tenant_id = $tenant_id
WITH mule,
     duration.between(recv.last_txn, fwd.last_txn) AS time_to_forward,
     recv.total_fraud_amount AS received,
     fwd.amount AS forwarded
WHERE time_to_forward.hours < 24
RETURN
    mule.account_masked,
    mule.bank_name,
    time_to_forward.hours AS hours_to_forward,
    received, forwarded,
    'RAPID_FORWARDING' AS pattern
ORDER BY time_to_forward.hours ASC;
```

---

## 11. NETWORK VISUALIZATION STRATEGY

### 11.1 Graph Visualization Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  VISUALIZATION LAYER STACK                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          UI Layer (React + Next.js)                       │   │
│  │  • Toolbar: Filter by node type, date range, risk score  │   │
│  │  • Side panel: Selected node details                      │   │
│  │  • Legend: Color coding, node size guide                 │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │          Rendering Engine (WebGL)                         │   │
│  │  Primary:  Sigma.js v3 (Force-directed, WebGL)            │   │
│  │  3D Mode:  Three.js + ForceGraph3D (immersive demo)       │   │
│  │  Fallback: Cytoscape.js (2D, canvas, no WebGL)           │   │
│  │  Export:   PNG, SVG, PDF, JSON, GraphML                  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │          Graph Data API (FastAPI)                         │   │
│  │  • /api/v1/graph/fraud-network?crime_id=...              │   │
│  │  • /api/v1/graph/person/{id}/network                     │   │
│  │  • /api/v1/graph/money-flow?account_id=...               │   │
│  │  • WebSocket: /ws/graph/live-updates                     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │          Neo4j + Graph Data Science                       │   │
│  │  • Cypher queries optimized for visualization             │   │
│  │  • GDS: Layout-friendly node coordinates pre-computed     │   │
│  │  • Bloom: Internal analyst tool for ad-hoc exploration   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Color Coding System

```
NODE COLORS — Universal across all views

┌──────────────────┬────────────────────┬───────────────────────┐
│  Node Type       │  Base Color        │  Flagged / Risk Color │
├──────────────────┼────────────────────┼───────────────────────┤
│ :Person / Suspect│  #EF4444 (Red)     │  #991B1B (Dark Red)   │
│ :Person / Victim │  #3B82F6 (Blue)    │  #1D4ED8 (Dark Blue)  │
│ :Person / Officer│  #10B981 (Green)   │  —                    │
│ :Phone           │  #8B5CF6 (Purple)  │  #5B21B6 (Dark Purple)│
│ :Bank            │  #F59E0B (Amber)   │  #B45309 (Dark Amber) │
│ :UPI             │  #EC4899 (Pink)    │  #BE185D (Dark Pink)  │
│ :Vehicle         │  #6B7280 (Gray)    │  #374151 (Dark Gray)  │
│ :Crime           │  #F97316 (Orange)  │  #C2410C (Dark Orange)│
│ :Evidence        │  #14B8A6 (Teal)    │  —                    │
│ :Location        │  #A3E635 (Lime)    │  —                    │
│ :Organization    │  #F43F5E (Rose)    │  #BE123C (Dark Rose)  │
│ :Device          │  #67E8F9 (Cyan)    │  #0891B2 (Dark Cyan)  │
└──────────────────┴────────────────────┴───────────────────────┘

RELATIONSHIP COLORS

TRANSFERRED        → #EF4444 (Red, line thickness ∝ amount)
CALLED             → #8B5CF6 (Purple, dashed)
OWNS               → #10B981 (Green, solid)
INVOLVED_IN        → #F97316 (Orange, solid)
VICTIMIZED_IN      → #3B82F6 (Blue, dashed)
VISITED            → #A3E635 (Lime, dotted)
ASSOCIATED_WITH    → #6B7280 (Gray, dashed)
MEMBER_OF          → #F43F5E (Rose, solid)
HAS_EVIDENCE       → #14B8A6 (Teal, dotted)
```

### 11.3 Node Sizing Strategy

```
NODE SIZE = f(risk_score, centrality, amount)

:Person   → size = 10 + (risk_score / 10)         // 10–20px
:Bank     → size = 8 + log10(fraud_amount + 1) * 3  // Logarithmic
:UPI      → size = 8 + (fraud_txns_count * 0.5)
:Crime    → size = 12 + (severity_weight)           // CRITICAL=8, HIGH=5, MED=3
            severity_weight: CRITICAL=8, HIGH=5, MEDIUM=3, LOW=1
:Phone    → size = 6 + (sim_swap_count * 2)
:Evidence → size = 8 (fixed, always small)
:Location → size = 10 (fixed, context node)
:Org      → size = 14 + (member_count * 0.2)

RELATIONSHIP THICKNESS = f(amount, frequency)

TRANSFERRED → thickness = 1 + log10(amount) * 2
CALLED      → thickness = 1 + log10(call_count)
OTHERS      → thickness = 1 (fixed)
```

### 11.4 Layout Algorithms by Use Case

```
USE CASE                    ALGORITHM           SETTINGS
──────────────────────────────────────────────────────────────────
Fraud Network Overview      Force-Directed      gravity=0.3, repulsion=500
                            (ForceAtlas2)       edge_weight=amount

Money Flow (hierarchical)   Dagre / BFS Tree    direction=LR, node_sep=60

Geographic Crime Map        Geospatial Layout   lat/lng → x/y mapping
                            (Leaflet.js base)   cluster at geohash level

Gang/Org Structure          Hierarchical        root=Organization, top-down
                                                leader_node at top

Investigation Timeline      Timeline Layout     x=date, y=entity_type

Similarity Clusters         Community Layout    Louvain communities as islands
                            (Force per cluster) inter-cluster edges light gray

3D Demo Mode                3D Force-Directed   sphere initial placement
                            (Three.js)          ambient_occlusion=true
```

### 11.5 Visualization API Response Format

```python
# graph_api_response.py
# Standard format returned by /api/v1/graph/fraud-network

{
    "meta": {
        "query_type": "fraud_network",
        "crime_id": "uuid-here",
        "node_count": 47,
        "edge_count": 83,
        "max_depth": 3,
        "generated_at": "2026-07-11T22:59:49Z"
    },
    "nodes": [
        {
            "id": "uuid",
            "label": "Amit Kumar",           # Display label
            "type": "Person",
            "subtype": "Suspect",
            "color": "#EF4444",
            "size": 18.5,
            "x": 0.0,                        # Pre-computed for layout
            "y": 0.0,
            "properties": {
                "risk_score": 85.2,
                "status": "WANTED",
                "crime_count": 4,
                "is_prime_accused": True
            },
            "badges": ["WANTED", "HIGH_RISK"],  # Overlay icons
            "tooltip": "Amit Kumar — Risk: 85/100 — 4 linked crimes"
        }
    ],
    "edges": [
        {
            "id": "edge-uuid",
            "source": "source-node-id",
            "target": "target-node-id",
            "type": "TRANSFERRED",
            "label": "₹2.4L — 3 txns",
            "color": "#EF4444",
            "width": 4.2,                    # Based on amount
            "animated": True,                # Money flow animation
            "properties": {
                "amount": 240000.0,
                "transaction_count": 3,
                "is_fraudulent": True,
                "last_txn": "2026-07-10T14:23:00Z"
            }
        }
    ],
    "clusters": [
        {
            "id": "cluster-1",
            "label": "SBI KYC Scam Ring",
            "node_ids": ["id1", "id2", "id3"],
            "color": "#EF4444",
            "bbox": {"x": 100, "y": 100, "width": 300, "height": 200}
        }
    ],
    "stats": {
        "total_fraud_amount": 4300000.0,
        "suspect_count": 3,
        "victim_count": 39,
        "mule_account_count": 4
    }
}
```

### 11.6 Real-Time Graph Updates (WebSocket)

```python
# websocket_graph_updates.py

# When a new alert fires, push graph delta to connected clients
# Client subscribes to: /ws/graph/live?crime_cluster_id=X

GRAPH_UPDATE_MESSAGE = {
    "type": "GRAPH_DELTA",
    "timestamp": "2026-07-11T22:59:49Z",
    "delta": {
        "add_nodes": [
            {
                "id": "new-bank-uuid",
                "type": "Bank",
                "label": "XXXX-1234 (SBI)",
                "color": "#F59E0B",
                "size": 12.0,
                "animation": "PULSE_RED"  # Highlight new node
            }
        ],
        "add_edges": [
            {
                "source": "existing-bank-id",
                "target": "new-bank-uuid",
                "type": "TRANSFERRED",
                "label": "₹47,000",
                "animation": "FLOW_ARROW"
            }
        ],
        "update_nodes": [
            {
                "id": "existing-suspect-id",
                "properties": {"risk_score": 92.4},
                "animation": "RISK_INCREASE"
            }
        ],
        "remove_nodes": [],
        "remove_edges": []
    }
}
```

### 11.7 View Presets for Different User Roles

```
ROLE                VIEW PRESET              DEFAULT FILTER
──────────────────────────────────────────────────────────
SOC Analyst         Full fraud network       Risk > 70
Cyber Crime Officer Suspect + crime + evidence Assigned cases only
Bank Officer        Bank + UPI + transactions Flagged accounts only
SCRB Admin          Crime clusters by district State-level clusters
Citizen             Own case only            Case = own case number
                    (simplified, no suspects visible)
```

### 11.8 Performance Optimization for Large Graphs

```
STRATEGY              IMPLEMENTATION          THRESHOLD
─────────────────────────────────────────────────────────────────
Level-of-Detail (LOD) Collapse nodes > zoom_out < 30% zoom
                      Show cluster bubbles    > 200 nodes
Progressive Loading   BFS from focal node    Load 1 hop at a time
                      Load neighbors on click
Virtual Scrolling     Only render visible     > 500 nodes on canvas
WebGL Batching        Batch draw calls        All edges in 1 draw
Edge Bundling         Bundle parallel edges   > 3 edges same nodes
Node Caching          Cache pre-computed      LRU cache, 5 min TTL
                      graph layouts
Subgraph Sampling     Show top-K nodes by     > 1000 node graph
                      PageRank score
```

---

## SUMMARY

```
╔══════════════════════════════════════════════════════════════════╗
║              SENTINELAI GRAPH DATABASE SUMMARY                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Node Types            : 10                                      ║
║  Relationship Types    : 25+                                     ║
║  Constraints           : 18 (uniqueness + existence)            ║
║  Indexes               : 30+ (B-tree + fulltext + vector)       ║
║  Fraud Detection Queries: 15 production-ready                   ║
║  Network Analysis      : 8 (PageRank, Louvain, Betweenness...)  ║
║  ML Feature Queries    : 3 (UEBA, GNN, SIM swap model)          ║
║  Temporal Queries      : 3 (timeline, velocity, flow)           ║
║  Visualization Engine  : Sigma.js / Three.js / Cytoscape.js     ║
║  Layout Algorithms     : 6 (by use case)                        ║
║  Real-time Updates     : WebSocket delta protocol               ║
╠══════════════════════════════════════════════════════════════════╣
║  KEY CAPABILITIES:                                               ║
║  ✅ Money mule chain detection (4-hop traversal)                 ║
║  ✅ SIM swap fraud ring identification                           ║
║  ✅ Coordinated attack detection (shared infrastructure)        ║
║  ✅ Gang network mapping (leader → member → crime → finance)    ║
║  ✅ Circular money flow detection (triangles + k-cycles)        ║
║  ✅ Cross-jurisdiction repeat offender tracking                 ║
║  ✅ Real-time graph updates via WebSocket                       ║
║  ✅ 3D visualization mode for demo impact                       ║
╚══════════════════════════════════════════════════════════════════╝
```

---

*SentinelAI Graph Database Design v1.0 — July 11, 2026*  
*Neo4j 5.x Enterprise + Graph Data Science Library*  
*Security Review: Required — All Cypher queries use parameterized inputs*
