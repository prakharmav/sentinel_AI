-- ================================================================
-- SentinelAI — PostgreSQL Seed & Mock Data
-- ================================================================

SET search_path = sentinelai, public;

-- 1. Seed Tenant
INSERT INTO tenants (id, name, slug, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default State Cyber Command', 'default', 'Enterprise', 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Locations
INSERT INTO locations (id, tenant_id, address, district, state, pincode, coordinates, geohash, is_virtual)
VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Shivaji Nagar Main Road, Pune', 'Pune', 'Maharashtra', '411005', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 'tek4gpf6', FALSE),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Sector 15, Vashi, Navi Mumbai', 'Thane', 'Maharashtra', '400703', ST_SetSRID(ST_MakePoint(73.0022, 19.0760), 4326), 'te7u67ye', FALSE),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'IP Address Node (Virtual Host)', 'Pune', 'Maharashtra', '411001', NULL, NULL, TRUE);

-- 3. Seed Citizens
INSERT INTO citizens (id, tenant_id, first_name, last_name, aadhaar_hash, pan_hash, gender, primary_phone, email, permanent_location_id)
VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Riya', 'Sharma', 'aadhaar_sha256_hash_riya_sharma', 'pan_sha256_hash_riya_sharma', 'FEMALE', '+91 90000 11111', 'riya.sharma@gmail.com', '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Abhishek', 'Modi', 'aadhaar_sha256_hash_abhishek_modi', 'pan_sha256_hash_abhishek_modi', 'MALE', '+91 98765 43210', 'abhishek.modi@yahoo.com', '00000000-0000-0000-0000-000000000102');

-- 4. Seed Users (Credentials)
-- Default password: "password"
INSERT INTO users (id, tenant_id, citizen_id, email, hashed_password, role, mfa_enabled, mfa_type)
VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'citizen@sentinelai.io', '$2b$12$R9h/lIPzNgb.O71IReV5RefYyGY1s1A0gT72061g.vT6u10Gf.14O', 'CITIZEN', TRUE, 'TOTP'),
('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', NULL, 'investigator@sentinelai.io', '$2b$12$R9h/lIPzNgb.O71IReV5RefYyGY1s1A0gT72061g.vT6u10Gf.14O', 'INVESTIGATOR', TRUE, 'TOTP');

-- 5. Seed Police Station
INSERT INTO police_stations (id, tenant_id, station_code, name, district, state, phone, email, location_id)
VALUES ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'MH-PUN-CYB-01', 'Pune State Cyber Police Station', 'Pune', 'Maharashtra', '+91 20 2551 1111', 'sho.cyberpune@mahapolice.gov.in', '00000000-0000-0000-0000-000000000101');

-- 6. Seed FIR
INSERT INTO firs (id, tenant_id, fir_number, filed_at_station_id, complainant_citizen_id, incident_date, incident_location_id, primary_section, all_sections, crime_category, fir_text, ai_summary, status)
VALUES ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'FIR/CYB/2026/0482', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '2026-07-10', '00000000-0000-0000-0000-000000000101', 'IT Act Section 66D', ARRAY['IT Act Section 66D', 'IPC Section 420'], 'UPI_FRAUD', 'Complainant received a phone call from an unknown person claiming to be an SBI bank executive verifying KYC. Under coercion, complainant shared screen-sharing OTP which allowed the attacker to initiate a UPI debit transaction of INR 25,000 without authorization.', 'AI parsing completed. Extracted UPI phishing scam, suspect name Abhishek Modi, victim Riya Sharma, amount lost INR 25,000.', 'REGISTERED');

-- 7. Seed Crimes (Cases)
INSERT INTO crimes (id, tenant_id, case_number, fir_id, category, status, severity, incident_date, crime_location_id, total_amount_involved, total_amount_recovered, police_station_id, lead_officer_id, ai_narrative, ai_risk_score, mitre_techniques, is_organized_crime)
VALUES 
('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'SCY-2026-PUN-001', '00000000-0000-0000-0000-000000000401', 'UPI_FRAUD', 'UNDER_INVESTIGATION', 'CRITICAL', '2026-07-10', '00000000-0000-0000-0000-000000000101', 25000.00, 0.00, '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000030', 'Attacker impersonated SBI executive, initiated screen-sharing session, bypass OTP checks and executed unauthorized UPI debit transaction of INR 25,000.', 88.50, '[{"id": "T1110", "name": "Brute Force"}]'::jsonb, TRUE),
('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'SCY-2026-PUN-002', NULL, 'PHISHING', 'REPORTED', 'HIGH', '2026-07-11', '00000000-0000-0000-0000-000000000102', 120000.00, 20000.00, '00000000-0000-0000-0000-000000000301', NULL, 'Phishing email link disguised as income tax refund alert deployed credential-harvesting site, extracting bank banking credentials.', 65.20, '[{"id": "T1566", "name": "Phishing"}]'::jsonb, FALSE);

-- 8. Seed Victim
INSERT INTO victims (id, tenant_id, citizen_id, crime_id, amount_lost)
VALUES ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000501', 25000.00);

-- 9. Seed Suspect
INSERT INTO suspects (id, tenant_id, crime_id, citizen_id, name, aliases, status, modus_operandi, ai_risk_score)
VALUES ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000202', 'Abhishek Modi', ARRAY['Sunny', 'Modi Bhai'], 'WANTED', 'Impersonating bank executives over voice calls, targeting middle-aged citizens with remote screen-sharing applications.', 94.20);

-- 10. Seed Phones
INSERT INTO phone_numbers (id, tenant_id, number, carrier, sim_swap_count, is_flagged)
VALUES 
('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000001', '+91 98765 43210', 'Reliance Jio', 2, TRUE),
('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000001', '+91 90000 11111', 'Airtel', 0, FALSE);

-- 11. Seed Bank Accounts
INSERT INTO bank_accounts (id, tenant_id, account_number_hash, account_number_masked, bank_name, ifsc_code, holder_name, is_flagged, is_frozen, is_mule, mule_confidence)
VALUES 
('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000001', 'hash_account_number_abhishek_modi_sbi', 'XXXX-XXXX-1234', 'State Bank of India', 'SBIN00004821', 'Abhishek Modi', TRUE, TRUE, TRUE, 0.96),
('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000001', 'hash_account_number_riya_sharma_hdfc', 'XXXX-XXXX-9876', 'HDFC Bank', 'HDFC00001234', 'Riya Sharma', FALSE, FALSE, FALSE, 0.00);

-- 12. Seed UPI
INSERT INTO upi_vpas (id, tenant_id, vpa, registered_name, linked_bank_id, is_flagged)
VALUES ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', 'abhishek@sbi', 'Abhishek Modi', '00000000-0000-0000-0000-000000000901', TRUE);

-- 13. Seed Evidence
INSERT INTO evidence (id, tenant_id, crime_id, title, evidence_type, description, content_hash, storage_path, is_court_admissible, chain_of_custody)
VALUES ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'Screenshots of Phishing SMS and UPI alert', 'SCREENSHOT', 'Transaction receipt of INR 25,000 sent from complainant account to suspect account.', 'sha512_hash_value_screenshot_evidence', 'locker/evidence/001/screenshot.png', TRUE, '[{"officer_id": "00000000-0000-0000-0000-000000000030", "action": "SECURED", "timestamp": "2026-07-11T12:00:00Z"}]'::jsonb);

-- 14. Seed Report
INSERT INTO reports (id, tenant_id, crime_id, report_type, title, summary, file_path, is_submitted)
VALUES ('00000000-0000-0000-0000-000000001201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'DPDP_NOTIFICATION', 'India DPDP Breach Report - Pune Cyber Crime Incident 2026', 'Draft regulatory incident data notification to DPDP board detailing compromise of citizen Aadhaar, phone and financial record logs.', 'reports/compliance/dpdp_SCY-2026-PUN-001.pdf', FALSE);

-- Junction links
INSERT INTO suspect_phones (suspect_id, phone_id) VALUES ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000801') ON CONFLICT DO NOTHING;
INSERT INTO suspect_accounts (suspect_id, account_id) VALUES ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000901') ON CONFLICT DO NOTHING;
