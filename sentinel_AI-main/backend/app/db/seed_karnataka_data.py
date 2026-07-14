# ============================================================
# SentinelAI — Karnataka Crime Dataset Generator & Seeder
#
# Generates:
#   - SQL insert statements for PostgreSQL (PostGIS enabled)
#   - Cypher nodes/edges migrations for Neo4j Graph
#   - CSV exports for direct tabular downloads
# Covers Karnataka regions: Bengaluru, Mysuru, Hubballi, Mangaluru.
# ============================================================

from __future__ import annotations

import csv
import os
import uuid
from datetime import date, datetime, timedelta
import random

# ── Configuration Constants ───────────────────────────────────

TENANT_ID = "00000000-0000-0000-0000-000000000001"
TENANT_SLUG = "karnataka-police"
TENANT_NAME = "Karnataka State Cyber Police Wing"

STATIONS = [
    {"id": str(uuid.uuid4()), "code": "CP-CYB-01", "name": "Cubbon Park Cyber Crime Cell", "lat": 12.9760, "lng": 77.5990, "addr": "Kasturba Road, Bengaluru"},
    {"id": str(uuid.uuid4()), "code": "KM-CYB-02", "name": "Koramangala Cyber Crime Cell", "lat": 12.9352, "lng": 77.6244, "addr": "80 Feet Road, Koramangala, Bengaluru"},
    {"id": str(uuid.uuid4()), "code": "MY-CYB-03", "name": "Mysuru Cyber Cell", "lat": 12.3072, "lng": 76.6498, "addr": "Police HQ Road, Mysuru"},
    {"id": str(uuid.uuid4()), "code": "MN-CYB-04", "name": "Mangaluru Cyber Cell", "lat": 12.8702, "lng": 74.8428, "addr": "Kavoor Road, Mangaluru"}
]

FIRST_NAMES = [
    "Ramesh", "Suresh", "Ganesh", "Mahesh", "Kiran", "Vijay", "Anand", "Riya",
    "Priya", "Sunitha", "Kavitha", "Nisha", "Abhishek", "Mohit", "Deepak",
    "Sandhya", "Shalini", "Prathap", "Jagadish", "Manjunath"
]
LAST_NAMES = [
    "Gowda", "Hegde", "Murthy", "Nayar", "Shetty", "Kulkarni", "Patil", "Desai",
    "Kamath", "Bhat", "Rao", "Joshi", "Naidu", "Reddy", "Urs", "Pai", "Acharya"
]

CITIES = [
    {"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
    {"name": "Mysuru", "lat": 12.2958, "lng": 76.6394},
    {"name": "Hubballi", "lat": 15.3647, "lng": 75.1240},
    {"name": "Mangaluru", "lat": 12.9141, "lng": 74.8560}
]


# ── Generator Helpers ─────────────────────────────────────────

def random_karnataka_name() -> tuple[str, str]:
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)


def random_phone() -> str:
    return f"+91-9{random.randint(10000000, 99999999)}"


def random_vpa(first: str, last: str) -> str:
    handle = f"{first.lower()}{last.lower()}{random.randint(10, 99)}"
    bank = random.choice(["okaxis", "ybl", "okicici", "sbi"])
    return f"{handle}@{bank}"


def random_aadhaar() -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(12))


def random_pan() -> str:
    chars = "".join(random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(5))
    nums = "".join(str(random.randint(0, 9)) for _ in range(4))
    check = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return f"{chars}{nums}{check}"


def random_plate() -> str:
    district = f"{random.randint(1, 55):02d}"
    letters = f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"
    number = f"{random.randint(1000, 9999)}"
    return f"KA-{district}-{letters}-{number}"


# ═══════════════════════════════════════════════════════════════
# MAIN GENERATOR PIPELINE
# ═══════════════════════════════════════════════════════════════

def generate_dataset():
    print("Generating Karnataka Cyber Crime mock dataset...")
    
    os.makedirs("infrastructure/postgres", exist_ok=True)
    os.makedirs("infrastructure/neo4j/migrations", exist_ok=True)
    os.makedirs("infrastructure/csv_exports", exist_ok=True)
    
    # ── 1. Create IDs & Nodes lists ───────────────────────────────
    users = []
    locations = []
    citizens = []
    crimes = []
    firs = []
    phones = []
    banks = []
    vpas = []
    vehicles = []
    evidence = []
    reports = []
    transactions = []

    # Seeding Locations (Cubbon Park, Indiranagar, Jayanagar etc.)
    for idx, st in enumerate(STATIONS):
        locations.append({
            "id": str(uuid.uuid4()),
            "address": st["addr"],
            "district": st["name"].split(" ")[0],
            "state": "Karnataka",
            "pincode": "5600" + str(10 + idx),
            "lat": st["lat"],
            "lng": st["lng"],
            "ip_address": f"10.20.{idx}.1"
        })

    # Add general city nodes locations
    for idx, city in enumerate(CITIES):
        locations.append({
            "id": str(uuid.uuid4()),
            "address": f"MG Road, {city['name']}",
            "district": city["name"],
            "state": "Karnataka",
            "pincode": "5700" + str(10 + idx),
            "lat": city["lat"],
            "lng": city["lng"],
            "ip_address": f"192.168.1.{50 + idx}"
        })

    # Citizens - Victims & Suspects
    victim_citizens = []
    suspect_citizens = []

    for i in range(25):
        first, last = random_karnataka_name()
        loc = random.choice(locations)
        cid = str(uuid.uuid4())
        c_item = {
            "id": cid,
            "first_name": first,
            "last_name": last,
            "aadhaar": random_aadhaar(),
            "pan": random_pan(),
            "phone": random_phone(),
            "email": f"{first.lower()}.{last.lower()}@gmail.com",
            "location_id": loc["id"]
        }
        citizens.append(c_item)
        if i < 15:
            victim_citizens.append(c_item)
        else:
            suspect_citizens.append(c_item)

    # Suspect Phones, Banks, VPAs, Vehicles
    for sc in suspect_citizens:
        pid = str(uuid.uuid4())
        phone_item = {
            "id": pid,
            "number": sc["phone"],
            "carrier": random.choice(["Jio", "Airtel", "Vodafone-Idea"]),
            "sim_swap": random.randint(0, 3)
        }
        phones.append(phone_item)
        
        bid = str(uuid.uuid4())
        bank_item = {
            "id": bid,
            "account_masked": f"Canara Bank XXXX{random.randint(1000, 9999)}",
            "bank_name": random.choice(["Canara Bank", "State Bank of India", "Karnataka Bank", "HDFC Bank"]),
            "holder_name": f"{sc['first_name']} {sc['last_name']}",
            "ifsc": "CNRB00010" + str(random.randint(10, 99)),
            "is_mule": random.choice([True, False]),
            "mule_confidence": round(random.uniform(0.6, 0.95), 2)
        }
        banks.append(bank_item)
        
        vpas.append({
            "id": str(uuid.uuid4()),
            "vpa": random_vpa(sc["first_name"], sc["last_name"]),
            "holder_name": f"{sc['first_name']} {sc['last_name']}",
            "bank_id": bid
        })
        
        vehicles.append({
            "id": str(uuid.uuid4()),
            "plate": random_plate(),
            "owner": f"{sc['first_name']} {sc['last_name']}"
        })

    # Crimes & FIRs
    base_date = date(2026, 6, 1)
    for idx, vc in enumerate(victim_citizens):
        crime_id = str(uuid.uuid4())
        fir_id = str(uuid.uuid4())
        case_nr = f"CYB/KA/{2026}/{1042 + idx}"
        fir_nr = f"FIR/KA/{2026}/{1042 + idx}"
        inc_date = base_date + timedelta(days=idx * 2)
        
        # Connect to a police station
        station = random.choice(STATIONS)
        loc = random.choice(locations)
        
        category = random.choice(["UPI_FRAUD", "PHISHING", "RANSOMWARE", "IDENTITY_THEFT"])
        amt = float(random.randint(5, 250) * 1000)

        firs.append({
            "id": fir_id,
            "fir_number": fir_nr,
            "filed_at": datetime.combine(inc_date, datetime.min.time()) + timedelta(hours=4),
            "station_id": station["id"],
            "citizen_id": vc["id"],
            "incident_date": inc_date,
            "location_id": loc["id"],
            "primary_section": "IT Act Section 66D" if category == "UPI_FRAUD" else "IT Act Section 66C",
            "crime_category": category,
            "fir_text": f"Complainant {vc['first_name']} filed grievance reporting a loss of INR {amt:,.2f} via {category} phishing link."
        })

        crimes.append({
            "id": crime_id,
            "fir_id": fir_id,
            "case_number": case_nr,
            "category": category,
            "status": random.choice(["REPORTED", "UNDER_INVESTIGATION", "CLOSED"]),
            "severity": random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
            "incident_date": inc_date,
            "location_id": loc["id"],
            "total_amount": amt,
            "recovered": amt * random.choice([0.0, 0.25, 0.5, 1.0]),
            "station_id": station["id"]
        })

        # Connect evidence
        evidence.append({
            "id": str(uuid.uuid4()),
            "crime_id": crime_id,
            "title": "Payment Settlement Logs Screen capture",
            "type": "SCREENSHOT",
            "description": f"SMS collect debit notification screenshot for INR {amt:,.0f}."
        })

    # Transactions (Neo4j transfers)
    for idx, c in enumerate(crimes):
        if c["category"] == "UPI_FRAUD":
            # Direct mock transfer
            transactions.append({
                "source": "Victim Bank Account",
                "target": random.choice(banks)["account_masked"],
                "amount": c["total_amount"],
                "timestamp": c["incident_date"].isoformat() + "T11:00:00Z"
            })

    # ═══════════════════════════════════════════════════════════════
    # 2. WRITE POSTGRESQL INSERT SQL
    # ═══════════════════════════════════════════════════════════════
    sql_path = "infrastructure/postgres/karnataka_seed.sql"
    with open(sql_path, "w") as f:
        f.write("-- ================================================================\n")
        f.write("-- SentinelAI — Karnataka Crime Dataset Seed Insertions\n")
        f.write("-- ================================================================\n\n")
        f.write("SET search_path = sentinelai, public;\n\n")
        
        # Insert Tenant
        f.write(f"INSERT INTO tenants (id, name, slug, plan, status) VALUES ('{TENANT_ID}', '{TENANT_NAME}', '{TENANT_SLUG}', 'ENTERPRISE', 'ACTIVE') ON CONFLICT DO NOTHING;\n\n")
        
        # Locations
        for loc in locations:
            f.write(f"INSERT INTO locations (id, tenant_id, address, district, state, pincode, is_virtual) VALUES ('{loc['id']}', '{TENANT_ID}', '{loc['address']}', '{loc['district']}', 'Karnataka', '{loc['pincode']}', FALSE) ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Police Stations
        for idx, st in enumerate(STATIONS):
            f.write(f"INSERT INTO police_stations (id, tenant_id, station_code, name, district, state, location_id) VALUES ('{st['id']}', '{TENANT_ID}', '{st['code']}', '{st['name']}', '{st['name'].split(' ')[0]}', 'Karnataka', '{locations[idx]['id']}') ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Citizens
        for c in citizens:
            f.write(f"INSERT INTO citizens (id, tenant_id, first_name, last_name, aadhaar_hash, pan_hash, primary_phone, email, permanent_location_id) VALUES ('{c['id']}', '{TENANT_ID}', '{c['first_name']}', '{c['last_name']}', '{c['aadhaar'][:8]}', '{c['pan'][:8]}', '{c['phone']}', '{c['email']}', '{c['location_id']}') ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Phone Numbers
        for p in phones:
            f.write(f"INSERT INTO phone_numbers (id, tenant_id, number, carrier, sim_swap_count, is_flagged) VALUES ('{p['id']}', '{TENANT_ID}', '{p['number']}', '{p['carrier']}', {p['sim_swap']}, TRUE) ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Bank Accounts
        for b in banks:
            f.write(f"INSERT INTO bank_accounts (id, tenant_id, account_number_hash, account_number_masked, bank_name, ifsc_code, holder_name, is_flagged, is_mule, mule_confidence) VALUES ('{b['id']}', '{TENANT_ID}', '{b['id']}', '{b['account_masked']}', '{b['bank_name']}', '{b['ifsc']}', '{b['holder_name']}', TRUE, {str(b['is_mule']).upper()}, {b['mule_confidence']}) ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # UPI VPAs
        for u in vpas:
            f.write(f"INSERT INTO upi_vpas (id, tenant_id, vpa, registered_name, linked_bank_id, is_flagged) VALUES ('{u['id']}', '{TENANT_ID}', '{u['vpa']}', '{u['holder_name']}', '{u['bank_id']}', TRUE) ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # FIRs
        for r in firs:
            f.write(f"INSERT INTO firs (id, tenant_id, fir_number, filed_at_station_id, complainant_citizen_id, incident_date, incident_location_id, primary_section, crime_category, fir_text, status) VALUES ('{r['id']}', '{TENANT_ID}', '{r['fir_number']}', '{r['station_id']}', '{r['citizen_id']}', '{r['incident_date']}', '{r['location_id']}', '{r['primary_section']}', '{r['crime_category']}', '{r['fir_text']}', 'REGISTERED') ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Crimes
        for c in crimes:
            f.write(f"INSERT INTO crimes (id, tenant_id, fir_id, case_number, category, status, severity, incident_date, crime_location_id, total_amount_involved, total_amount_recovered, police_station_id) VALUES ('{c['id']}', '{TENANT_ID}', '{c['fir_id']}', '{c['case_number']}', '{c['category']}', '{c['status']}', '{c['severity']}', '{c['incident_date']}', '{c['location_id']}', {c['total_amount']}, {c['recovered']}, '{c['station_id']}') ON CONFLICT DO NOTHING;\n")
        f.write("\n")

        # Evidence
        for ev in evidence:
            f.write(f"INSERT INTO evidence (id, tenant_id, crime_id, title, evidence_type, description, content_hash, storage_path) VALUES ('{ev['id']}', '{TENANT_ID}', '{ev['crime_id']}', '{ev['title']}', '{ev['type']}', '{ev['description']}', 'sha512_sealed_placeholder_hash', 's3://locker/uploads/screenshot.png') ON CONFLICT DO NOTHING;\n")
        f.write("\n")

    # ── 3. WRITE NEO4J CYPHER INSERTS ─────────────────────────────
    cypher_path = "infrastructure/neo4j/migrations/003-karnataka_seed.cypher"
    with open(cypher_path, "w") as f:
        f.write("// ============================================================\n")
        f.write("// SentinelAI — Karnataka Crime Graph Dataset Seed Migrations\n")
        f.write("// ============================================================\n\n")
        
        # Suspects Creation
        for idx, sc in enumerate(suspect_citizens):
            f.write(f"MERGE (s{idx}:Suspect {{id: '{sc['id']}', name: '{sc['first_name']} {sc['last_name']}', tenant_id: '{TENANT_ID}', risk_score: 0.90}});\n")
        f.write("\n")

        # Crimes Creation
        for idx, c in enumerate(crimes):
            f.write(f"MERGE (c{idx}:Crime {{id: '{c['id']}', case_number: '{c['case_number']}', tenant_id: '{TENANT_ID}', category: '{c['category']}', risk_score: 0.85}});\n")
        f.write("\n")

        # Bank Accounts & Phone creation
        for idx, sc in enumerate(suspect_citizens):
            f.write(f"MERGE (b{idx}:BankAccount {{id: '{banks[idx]['id']}', label: '{banks[idx]['account_masked']}', tenant_id: '{TENANT_ID}', risk_score: {banks[idx]['mule_confidence']}}});\n")
            f.write(f"MERGE (p{idx}:PhoneNumber {{id: '{phones[idx]['id']}', label: '{phones[idx]['number']}', tenant_id: '{TENANT_ID}', risk_score: 0.70}});\n")
            f.write(f"MERGE (v{idx}:Vehicle {{id: '{vehicles[idx]['id']}', label: '{vehicles[idx]['plate']}', tenant_id: '{TENANT_ID}'}});\n")
        f.write("\n")

        # Edges Relationships Linkages
        for idx, sc in enumerate(suspect_citizens):
            # Connect Suspect to their properties
            f.write(f"MATCH (s:Suspect {{id: '{sc['id']}'}}), (b:BankAccount {{id: '{banks[idx]['id']}'}}) MERGE (s)-[:CONTROLS]->(b);\n")
            f.write(f"MATCH (s:Suspect {{id: '{sc['id']}'}}), (p:PhoneNumber {{id: '{phones[idx]['id']}'}}) MERGE (s)-[:OWNS]->(p);\n")
            f.write(f"MATCH (s:Suspect {{id: '{sc['id']}'}}), (v:Vehicle {{id: '{vehicles[idx]['id']}'}}) MERGE (s)-[:OWNS]->(v);\n")
            
            # Connect Suspect to a random Crime case (Involvement)
            crime_target = random.choice(crimes)
            f.write(f"MATCH (s:Suspect {{id: '{sc['id']}'}}), (c:Crime {{id: '{crime_target['id']}'}}) MERGE (s)-[:INVOLVED_IN]->(c);\n")
        f.write("\n")

        # Money Transfers flows
        for idx, tx in enumerate(transactions):
            target_acc = tx["target"]
            # Connect Victim debit node to Suspect mule account
            f.write(f"MATCH (b1:BankAccount {{id: '{banks[idx % len(banks)]['id']}'}}), (b2:BankAccount {{id: '{banks[(idx + 1) % len(banks)]['id']}'}})\n")
            f.write(f"MERGE (b1)-[:TRANSFERRED {{amount: {tx['amount']}, timestamp: '{tx['timestamp']}'}}]->(b2);\n")
        f.write("\n")

    # ── 4. WRITE EXPORTED CSV TABLES ──────────────────────────────
    # We export Crimes, Citizens, and BankAccounts CSV for the user
    for table_name, list_data in [("crimes", crimes), ("citizens", citizens), ("banks", banks)]:
        csv_path = f"infrastructure/csv_exports/{table_name}_karnataka.csv"
        if not list_data:
            continue
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list_data[0].keys())
            writer.writeheader()
            writer.writerows(list_data)

    print("Generation complete! Files created:")
    print(f"  - SQL Seed: {sql_path}")
    print(f"  - Cypher Migrations: {cypher_path}")
    print(f"  - CSV Exports: infrastructure/csv_exports/")


if __name__ == "__main__":
    generate_dataset()
