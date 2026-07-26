# SentinelAI — Complete User Journey Document

> **Version**: 1.0  
> **Date**: July 11, 2026  
> **Author**: Product Design, SentinelAI  
> **Purpose**: UX Research, Hackathon Demo, Implementation Planning

---

## How to Read This Document

Each user journey follows this structure:

```
1. Profile          — Who this person is
2. Pain Points      — What is broken today
3. Current Journey  — Step-by-step WITHOUT SentinelAI
4. Future Journey   — Step-by-step WITH SentinelAI
5. AI Touch Points  — Which AI engines activate at each step
6. Screens          — Every screen this user sees
7. Expected Outputs — What they get at the end
8. Edge Cases       — Unusual but valid scenarios
9. Failure Scenarios — What breaks and how we handle it
```

---

# USER 1 — CITIZEN

## 1.1 Profile

| Attribute | Detail |
|---|---|
| **Name** | Riya Sharma |
| **Age** | 28 |
| **Occupation** | Freelance graphic designer, Pune |
| **Tech Literacy** | Medium — uses UPI, social media, WhatsApp |
| **Languages** | Hindi + English |
| **Device** | Android smartphone (primary), laptop (secondary) |
| **Incident** | Received a fake KYC update SMS, clicked the link, lost ₹47,000 from her SBI account |

---

## 1.2 Pain Points

| # | Pain Point | Severity |
|---|---|---|
| PP-01 | **No real-time fraud warning** — Riya had no alert when her money moved at 2 AM | 🔴 Critical |
| PP-02 | **NCRP is complex** — The complaint portal has 12 form fields; she didn't know which crime category applied | 🔴 Critical |
| PP-03 | **Police don't follow up** — Filed an FIR at the local station; officer said "cyber cell will contact you." They never did. | 🔴 Critical |
| PP-04 | **Evidence gap** — She deleted the SMS before realizing she needed it. No one told her what evidence to preserve. | 🟠 High |
| PP-05 | **No status visibility** — No way to know if her complaint is being worked on, by whom, or what the status is | 🟠 High |
| PP-06 | **Money recovery feels impossible** — Bank says "lodge police complaint." Police say "talk to bank." Circular loop. | 🔴 Critical |
| PP-07 | **Language barrier** — The NCRP portal is English-only; intimidating for Hindi-first users | 🟠 High |
| PP-08 | **No awareness** — Riya didn't know that clicking a link could result in full account access being granted | 🟡 Medium |

---

## 1.3 Current Journey (Without SentinelAI)

```
TRIGGER: Riya receives SMS — "SBI KYC update required or account blocked. Click: bit.ly/xxxxx"

Step 1:  Clicks the link → fake SBI portal → enters mobile number, OTP, debit card details
         [TIME: 3 minutes]

Step 2:  ₹47,000 transferred in 2 transactions at 2:14 AM and 2:17 AM
         Riya is asleep. No alert received.
         [TIME: Instant. Riya unaware.]

Step 3:  Morning — Riya checks UPI app. Sees transaction notifications.
         Panics. Calls SBI customer care (1800 number).
         Put on hold for 22 minutes.
         [TIME: ~30 minutes after discovery]

Step 4:  Bank agent says — "You need to file a police complaint first. 
         We can only initiate chargeback after an FIR number is provided."
         [TIME: Another 20 minutes on call]

Step 5:  Riya goes to local police station. Constable at desk has no idea about cybercrime.
         Directed to write a hand-written complaint. Told to come back tomorrow.
         [TIME: 3 hours including travel]

Step 6:  Next day — visits again. FIR is filed. Crime category: "Cheating."
         No mention of IT Act sections. No urgency flag.
         [TIME: 2 hours]

Step 7:  FIR number given. Riya goes back to bank. Bank initiates internal investigation.
         Timeline: 30–45 working days.
         [TIME: 45 days pass. No updates.]

Step 8:  Riya visits bank branch again. Told "investigation ongoing."
         She files on NCRP portal separately. Gets acknowledgment number. No follow-up.
         [TIME: 50 days total]

Step 9:  Case assigned to cyber crime cell officer (understaffed, 200+ pending cases).
         Officer eventually calls after 60 days. Evidence is stale. Money gone.
         [TIME: 60+ days. Resolution: ₹0 recovered.]

OUTCOME: ₹47,000 lost. 3+ months of stress. Zero accountability. Zero recovery.
```

---

## 1.4 Future Journey (With SentinelAI)

```
TRIGGER: Riya receives SMS — "SBI KYC update required. Click: bit.ly/xxxxx"

Step 1:  SentinelAI's PIE engine scans the SMS in real-time via bank/telco integration.
         Detects: spoofed sender ID, known malicious URL pattern, urgency language.
         ALERT sent to Riya's mobile within 2 seconds:
         ⚠️ "This SMS is likely a scam. Do NOT click the link. Your bank will never
         ask for OTP via SMS link. Report it here → [one tap]"
         [TIME: 2 seconds. ACTION: Warning sent BEFORE click.]

Step 2A: Riya does NOT click. Reports via SentinelAI app in one tap.
         PIE logs the incident. Pattern shared (anonymized) with CERT-In feed.
         [OUTCOME: Fraud prevented. ₹47,000 saved.]

─ ─ ─ ─ ─ ─ ─ ─ ALTERNATE PATH (Riya clicks anyway) ─ ─ ─ ─ ─ ─ ─ ─

Step 2B: Riya clicks. SentinelAI's bank integration detects anomalous transaction:
         • 2:14 AM (unusual hour for Riya — baseline says she transacts 9AM–9PM)
         • Destination account flagged in NCRP fraud registry
         • Amount: ₹25,000 — unusual single transfer for her pattern
         AUTONOMOUS ACTION: Transaction flagged for bank's fraud system.
         Bank receives real-time alert. Second transaction (₹22,000) BLOCKED.
         Riya receives: "Suspicious transaction detected. ₹22,000 transfer blocked.
         Click here to file a complaint and recover ₹25,000."
         [TIME: 3 seconds from transaction. ₹22,000 saved autonomously.]

Step 3:  Riya taps the notification. SentinelAI Citizen App opens.
         Pre-filled complaint form appears:
         • Incident type: UPI Fraud / Phishing
         • Amount: ₹25,000 (auto-detected)
         • Timestamp, merchant ID, destination account: auto-filled
         • Evidence: screenshot of SMS automatically captured and attached
         • Applicable IT Act sections: pre-selected (Section 66C, 66D)
         She verifies, adds her name, taps SUBMIT.
         [TIME: 2 minutes. No form confusion. Hindi option available.]

Step 4:  Complaint auto-routed to:
         → NCRP (complaint registered, acknowledgment instant)
         → Cyber Crime Officer assigned based on workload (SentinelAI's SCRB routing)
         → Bank's fraud team (chargeback initiated in parallel — no chicken-and-egg)
         → 1930 helpline flagged for freeze request on destination account
         [TIME: Instant. Parallel routing.]

Step 5:  SentinelAI sends Riya a case tracker link (WhatsApp + SMS):
         "Case #SCY-2026-PUN-04821 filed. Assigned to Officer Ramesh Kumar,
         Pune Cyber Cell. Expected update: 48 hours. Current status: ACTIVE."
         [Riya can check status anytime without calling anyone]

Step 6:  Within 4 hours — destination account freeze order sent via SentinelAI
         to the receiving bank. ₹25,000 frozen (not yet transferred to next hop).
         Riya notified: "Freeze order applied. Recovery likely."
         [TIME: 4 hours. Previous: Never.]

Step 7:  Within 48 hours — officer contacts Riya via app chat.
         Case resolved. ₹25,000 refunded. ₹22,000 never left.
         Riya receives: "✅ ₹47,000 fully protected. Case closed. Report attached."

OUTCOME: ₹47,000 saved. 48-hour resolution. Zero visits to police station. Full transparency.
```

---

## 1.5 AI Touch Points

| Step | Engine Activated | Action |
|---|---|---|
| SMS received | **PIE** (Phishing Intelligence Engine) | Real-time SMS phishing classification |
| Transaction initiated | **UEBA** (Behavioral AI) | Anomaly vs. Riya's baseline patterns |
| Transaction routing | **TRE** (Threat Reasoning Engine) | Cross-references destination account with fraud DB |
| Complaint filing | **CAP** (Compliance Autopilot) | Auto-fills IT Act sections, routes to correct authority |
| Case assignment | **NLSI** backend | Workload-balanced officer assignment |
| Account freeze | **Autonomous Response Engine** | Issues freeze instruction to receiving bank |
| Recovery tracking | **Dashboard** | Real-time case status updates |

---

## 1.6 Screens

| Screen ID | Screen Name | Key Elements |
|---|---|---|
| S-C-01 | **Fraud Alert Notification** | Warning banner, "This is a scam" explanation, one-tap report, one-tap dismiss |
| S-C-02 | **Transaction Blocked Alert** | Amount blocked, reason in plain Hindi/English, "File complaint" CTA |
| S-C-03 | **Pre-Filled Complaint Form** | Auto-populated fields, evidence attachments, IT Act sections, language toggle |
| S-C-04 | **Complaint Confirmation** | Case number, officer assigned, expected timeline, WhatsApp share |
| S-C-05 | **Case Tracker** | Status timeline (Filed → Assigned → Investigating → Resolved), chat with officer |
| S-C-06 | **Recovery Dashboard** | Amount at risk, amount frozen, amount recovered, case progress |
| S-C-07 | **Awareness Card** | Post-incident education: "How this scam worked. How to stay safe." |

---

## 1.7 Expected Outputs

| Output | Format | Recipient |
|---|---|---|
| Fraud alert notification | Push notification (mobile) | Citizen |
| Pre-filled NCRP complaint | Digital form → PDF | Citizen + NCRP system |
| Case tracking ID | SMS + WhatsApp | Citizen |
| Bank chargeback initiation | API call | Bank fraud system |
| Freeze order | Automated API | Receiving bank |
| 1930 Helpline flag | Real-time feed | National helpline system |
| CERT-In threat feed update | Anonymized pattern | CERT-In (national feed) |
| Case closure report | PDF | Citizen + Officer |

---

## 1.8 Edge Cases

| EC # | Scenario | SentinelAI Handling |
|---|---|---|
| EC-01 | Citizen is the actual attacker (false report) | Behavioral profiling flags inconsistencies; manual review triggered for large amounts |
| EC-02 | Fraud SMS in a regional language (Tamil, Bengali) | PIE's multilingual NLP model handles 12 Indian languages |
| EC-03 | Money already fully transferred before alert fires | Case filed, freeze attempted on secondary hop; recovery pathway activated |
| EC-04 | Citizen has no smartphone (elderly, rural) | 1930 helpline integration; complaint filed by operator using same system |
| EC-05 | Same scam number used against 50+ victims | SentinelAI clusters cases; coordinated investigation triggered; officer gets unified brief |
| EC-06 | Citizen loses their phone after complaint filed | Web portal access with OTP-based login (no account required) |
| EC-07 | International money transfer (cross-border fraud) | BharatPol integration triggered; Interpol notice flagged if threshold met |

---

## 1.9 Failure Scenarios

| FS # | Failure | Detection Method | Recovery |
|---|---|---|---|
| FS-01 | PIE misclassifies legitimate bank SMS as phishing | User feedback "This is not a scam" → retraining signal | Alert retracted; apology notification; PIE model updated |
| FS-02 | Bank API times out during freeze order | Retry queue (3 attempts, exponential backoff); manual escalation if all fail | Officer notified; manual freeze initiated |
| FS-03 | Citizen app crashes during complaint submission | Auto-save every field change; draft restored on relaunch | Data preserved; user resumes from last step |
| FS-04 | Duplicate complaint filed (citizen + police separately) | Duplicate detection via phone number + incident time + amount | Cases merged; citizen notified; single case officer assigned |
| FS-05 | TRE produces incorrect IT Act section | Legal review flag on all auto-populated legal fields; officer can edit before filing | Officer edits; feedback logged; model fine-tuned |

---
---

# USER 2 — POLICE OFFICER

## 2.1 Profile

| Attribute | Detail |
|---|---|
| **Name** | Sub-Inspector Vikram Desai |
| **Age** | 36 |
| **Role** | Sub-Inspector, Local Police Station, Nagpur |
| **Tech Literacy** | Low-Medium — uses CCTNS for FIR entry, WhatsApp for coordination |
| **Workload** | 80+ active cases. Handles everything: theft, domestic disputes, traffic, AND cybercrime complaints |
| **Challenge** | Cyber complaints arrive at his station but he has no cybercrime training |

---

## 2.2 Pain Points

| # | Pain Point | Severity |
|---|---|---|
| PP-01 | **No cybercrime knowledge** — Receives cyber complaints but doesn't know relevant IT Act sections, digital evidence procedures, or investigation steps | 🔴 Critical |
| PP-02 | **CCTNS is data entry, not intelligence** — He enters FIRs but gets zero analytical support | 🔴 Critical |
| PP-03 | **No cross-case visibility** — Cannot see if similar complaints were filed in other stations | 🔴 Critical |
| PP-04 | **Evidence collection failure** — Regularly fails to instruct complainants to preserve digital evidence (screenshots, transaction IDs, device logs) | 🟠 High |
| PP-05 | **Workload imbalance** — 200 cyber cases pile up because there is no triage system — serious fraud and minor trolling treated the same | 🟠 High |
| PP-06 | **No feedback loop** — Once a case is transferred to cyber cell, Vikram gets no updates. Cannot answer the complainant. | 🟠 High |
| PP-07 | **Paper-based processes** — Handwritten complaints, photocopied documents, physical file movement | 🟡 Medium |

---

## 2.3 Current Journey (Without SentinelAI)

```
TRIGGER: Citizen Riya walks into the station with a fraud complaint.

Step 1:  Vikram listens. Doesn't fully understand what a "phishing link" is.
         Writes handwritten complaint. Crime category: "Cheating under IPC 420."
         Misses IT Act 66C, 66D entirely.
         [TIME: 45 minutes]

Step 2:  Vikram checks if he needs to file FIR or non-cognizable report (NCR).
         Calls his supervisor. Gets told: "File FIR if amount > ₹10,000."
         [TIME: 20 minutes]

Step 3:  Enters FIR into CCTNS manually. Fields are limited.
         Key digital evidence fields (URL, IP, UPI transaction ID) have no dedicated field.
         Enters in "description" as free text.
         [TIME: 30 minutes]

Step 4:  FIR filed. Case transferred to district cyber cell.
         No structured handover. Only the FIR PDF is shared.
         Digital evidence not collected from victim's phone.
         [TIME: Transfer takes 2–3 days physically]

Step 5:  Riya calls Vikram weekly asking for updates.
         Vikram has no information. Tells her to call cyber cell.
         Cyber cell number is often not picked up.
         [TIME: Ongoing. Relationship with citizen deteriorates.]

Step 6:  Cyber cell eventually calls Vikram for additional info.
         He has none — case file has no digital forensic details.
         Investigation stalls.
         [TIME: 30–60 days]

OUTCOME: Weak FIR. Missing digital evidence. Delayed transfer. Investigation dead end.
```

---

## 2.4 Future Journey (With SentinelAI)

```
TRIGGER: Citizen Riya walks into station OR SentinelAI auto-routes complaint to station.

Step 1:  Vikram opens SentinelAI on his tablet (provided at station).
         Riya's pre-filed complaint is already there — pre-filled from her app submission.
         Vikram reviews the AI-generated case brief:
         "Phishing attack via spoofed SBI SMS. Victim: Riya Sharma. 
         Amount: ₹25,000. Destination account flagged in 14 previous cases.
         Applicable sections: IT Act 66C, 66D + IPC 420, 34. Evidence: attached."
         [TIME: 2 minutes to review vs. 45 minutes of handwriting]

Step 2:  SentinelAI's TRE shows Vikram a "Nearby Similar Cases" panel:
         "3 similar phishing complaints filed in Nagpur in the last 7 days.
         Same destination account. Coordinated attack suspected."
         One-tap to merge cases into a cluster investigation.
         [TIME: Instant. Vikram sees the full picture.]

Step 3:  AI-generated evidence checklist appears:
         ✅ Victim's transaction ID — collected
         ✅ Screenshot of phishing SMS — collected
         ⬜ Victim's device IMEI — [collect this]
         ⬜ Call logs from the 30 mins before fraud — [request from telco via portal]
         ⬜ Destination account KYC — [auto-requesting via bank API]
         Vikram follows the checklist. Nothing missed.
         [TIME: 10 minutes. Complete evidence package.]

Step 4:  FIR is auto-drafted in CCTNS-compatible format with:
         • Correct IT Act + IPC sections pre-filled
         • All digital evidence fields populated
         • Victim statement in structured format
         Vikram reviews, makes any corrections, digitally signs.
         FIR filed in CCTNS with one click.
         [TIME: 5 minutes vs. 30 minutes manual entry]

Step 5:  SentinelAI auto-routes case to the appropriate cyber cell officer
         based on case type, workload, and officer specialization.
         Vikram gets a notification when the cyber cell accepts the case.
         Case tracker shared with Riya automatically.
         [TIME: Instant routing. No physical file movement.]

Step 6:  Vikram can check case status anytime via his dashboard.
         Can answer Riya's questions: "Your case is with Officer Ramesh Kumar. Last update: 2 days ago."
         [OUTCOME: Citizen trust maintained. Vikram not embarrassed.]

OUTCOME: Complete FIR in 17 minutes. All evidence collected. Coordinated attack detected.
         Case correctly routed. Citizen informed. Vikram feels competent and supported.
```

---

## 2.5 AI Touch Points

| Step | Engine | Action |
|---|---|---|
| Complaint arrives | **TRE** | Auto-generates case brief with applicable legal sections |
| Pattern matching | **UEBA** | Cross-station case clustering — detects coordinated attacks |
| Evidence collection | **TRE + CAP** | Dynamic evidence checklist per crime type |
| FIR drafting | **CAP** | CCTNS-compatible FIR auto-draft with legal sections |
| Case routing | **NLSI backend** | Workload-balanced routing to correct cyber cell officer |
| Telco/bank requests | **Autonomous Response** | Auto-initiates legal data requests via API |

---

## 2.6 Screens

| Screen ID | Screen Name | Key Elements |
|---|---|---|
| S-P-01 | **Station Dashboard** | Today's complaints, priority queue, active cases, alerts |
| S-P-02 | **AI Case Brief** | Incident summary, legal sections, evidence status, linked cases |
| S-P-03 | **Evidence Checklist** | Dynamic list per crime type, collection status, telco/bank request buttons |
| S-P-04 | **FIR Auto-Draft** | Pre-filled FIR, editable fields, IT Act sections, CCTNS sync button |
| S-P-05 | **Case Cluster Map** | Geographic and temporal visualization of linked cases |
| S-P-06 | **Case Transfer Screen** | Officer assignment, case file package, acknowledgment tracking |
| S-P-07 | **Citizen Communication** | Status updates auto-sent to citizen, officer notes visible |

---

## 2.7 Expected Outputs

| Output | Format | Recipient |
|---|---|---|
| AI Case Brief | On-screen summary | Police Officer |
| CCTNS-ready FIR | Structured digital document | CCTNS system |
| Evidence package | Encrypted ZIP (logs, screenshots, IDs) | Cyber Crime Officer |
| Legal data requests | Automated API calls | Bank / Telco |
| Case cluster report | PDF / On-screen | Officer + Supervisor |
| Citizen status update | SMS + WhatsApp | Citizen |
| Case routing notification | In-app | Cyber Crime Officer |

---

## 2.8 Edge Cases

| EC # | Scenario | Handling |
|---|---|---|
| EC-01 | Citizen arrives without a digital complaint (walk-in only) | Officer fills complaint using voice-to-text in Hindi; SentinelAI transcribes and classifies |
| EC-02 | Incident involves a minor | System flags mandatory POCSO procedures; additional evidence steps added |
| EC-03 | Victim is too distressed to provide details | Simplified 3-question emergency intake mode; full details collected later |
| EC-04 | Complaint involves a politically sensitive person | System flags for supervisor review before FIR is filed; override requires supervisor PIN |
| EC-05 | Two officers at same station attempt to handle same complaint | Duplicate lock on case file; second officer sees "Case taken by SI Desai" |
| EC-06 | Station has no internet connectivity | Offline mode — local cache saves complaint; auto-syncs when connectivity restored |

---

## 2.9 Failure Scenarios

| FS # | Failure | Recovery |
|---|---|---|
| FS-01 | AI suggests wrong legal section (rare) | Officer can override; correction logged for model training |
| FS-02 | CCTNS sync fails | FIR saved locally; manual CCTNS entry option with pre-populated fields |
| FS-03 | Evidence checklist incomplete (bank API down) | Manual flag raised; evidence gap noted in file; officer reminded at 24h |
| FS-04 | Case cluster misidentifies unrelated cases | Officer can unlink cases; feedback improves clustering model |
| FS-05 | Officer loses or damages tablet | Cloud sync — any device login restores full case context |

---
---

# USER 3 — BANK OFFICER (FRAUD OPERATIONS)

## 3.1 Profile

| Attribute | Detail |
|---|---|
| **Name** | Priya Menon |
| **Age** | 32 |
| **Role** | Fraud Risk Analyst, SBI Digital Banking Fraud Operations, Mumbai |
| **Tech Literacy** | High — works with CBS (Core Banking System), FRM tools, Excel |
| **Workload** | Reviews 150–200 fraud alerts per day. 8-hour shift. |
| **KPI** | False positive rate, chargeback recovery rate, SLA compliance |
| **Pressure** | RBI mandates 30-day fraud resolution. 1930 helpline freeze requests must be actioned in 1 hour. |

---

## 3.2 Pain Points

| # | Pain Point | Severity |
|---|---|---|
| PP-01 | **Alert overload** — 150–200 fraud alerts per day from CBS. Most are false positives. True frauds are buried. | 🔴 Critical |
| PP-02 | **No police coordination** — Knows a fraud is happening but cannot proactively reach police. Waits for FIR number to action chargeback. | 🔴 Critical |
| PP-03 | **Money mule detection is manual** — Identifies money mule accounts through manual pattern review. Takes days. Mules have moved money by then. | 🔴 Critical |
| PP-04 | **No cross-bank visibility** — Same fraudster uses accounts across 5 banks. Each bank sees only its slice. | 🟠 High |
| PP-05 | **1930 Freeze SLA pressure** — Must act on 1930 freeze requests within 1 hour. Receives 50+ per day. No intelligent triage — all treated equally. | 🟠 High |
| PP-06 | **Regulatory reporting manual** — RBI fraud reporting (FRMS portal) requires manual data entry for each case | 🟠 High |
| PP-07 | **No recovery prediction** — Doesn't know which cases are likely to result in recovery vs. write-off before committing resources | 🟡 Medium |

---

## 3.3 Current Journey (Without SentinelAI)

```
TRIGGER: CBS raises fraud alert — "Unusual transaction: ₹25,000 to new payee at 2:14 AM"

Step 1:  Priya reviews alert in CBS fraud module.
         Alert has: transaction ID, amount, timestamp, account number.
         No context, no history, no risk score, no reasoning.
         [TIME: Opens case #143 of 189 for the day]

Step 2:  Manually pulls customer transaction history from CBS.
         Opens Excel. Cross-references with known fraud patterns.
         Compares destination account with internal mule blacklist.
         [TIME: 12–15 minutes per case]

Step 3:  Calls the customer to verify if transaction was authorized.
         Customer doesn't pick up (it's 2:14 AM).
         Priya moves to next alert. Returns later.
         [TIME: 5 minutes + callback attempt]

Step 4:  Customer calls back at 8 AM. Confirms fraud.
         Priya initiates dispute. Asks for police FIR number.
         Customer says they haven't filed yet.
         Priya: "Please file a complaint and share the FIR number. 
         We can only process chargeback after that."
         [TIME: Circular dependency created. Days pass.]

Step 5:  1930 helpline sends freeze request.
         Priya manually checks if the account has any funds remaining.
         Places internal hold. Updates FRMS portal manually.
         [TIME: 45 minutes per freeze request. 50+ per day = impossible.]

Step 6:  RBI audit coming. Priya manually compiles fraud stats from CBS exports,
         Excel spreadsheets, email threads.
         [TIME: 3 days of report preparation]

OUTCOME: Average fraud resolution: 22 days. False positive rate: 35%. 
         RBI compliance reports filed late. Recovery rate: ~18%.
```

---

## 3.4 Future Journey (With SentinelAI)

```
TRIGGER: SentinelAI detects anomalous transaction pattern — BEFORE CBS even raises alert.

Step 1:  SentinelAI's UEBA engine flags: "Customer Riya Sharma — 2:14 AM transaction.
         Behavioral score: 94/100 ANOMALOUS. Reasons:
         • Transaction time outside 99th percentile of her pattern (never transacts past 11 PM)
         • Destination account: flagged in 14 prior fraud cases across 3 banks
         • Transaction immediately preceded by link-click event (PIE integration)"
         [TIME: Alert generated in < 3 seconds of transaction attempt]

Step 2:  SentinelAI autonomously requests transaction hold (within configurable rules).
         Sends Priya a HIGH PRIORITY alert (not buried in 189 others):
         "🔴 CONFIRMED FRAUD — High confidence (97%). Customer: Riya Sharma.
         Amount: ₹25,000. ACTION TAKEN: Second transaction (₹22,000) blocked.
         REQUIRED: Confirm first transaction status. FIR auto-initiated."
         [TIME: Priya reviews one pre-triaged, high-confidence alert]

Step 3:  Priya opens the alert. SentinelAI shows:
         • Full transaction timeline
         • Customer behavioral baseline vs. this event
         • Destination account's cross-bank fraud history (via shared intelligence API)
         • 14 other affected customers at same bank — same mule account
         • Regulatory obligations pre-calculated: "RBI FRMS report required within 7 days"
         One-click options: [CONFIRM FRAUD] [MARK LEGITIMATE] [REQUEST CALLBACK]
         [TIME: 90 seconds to triage vs. 15 minutes]

Step 4:  Priya clicks CONFIRM FRAUD.
         SentinelAI automatically:
         → Freezes destination account (API call to receiving bank)
         → Initiates chargeback process
         → Pre-fills FRMS portal report
         → Notifies customer: "We've detected fraud and are protecting your account"
         → Shares case intelligence with 1930 helpline and NCRP
         → Files police cooperation request (removing FIR dependency)
         [TIME: All parallel. 10 seconds.]

Step 5:  1930 freeze request arrives for a related case.
         SentinelAI has already pre-triaged it:
         "HIGH PRIORITY — Account connected to active cluster (17 victims). 
         ₹3.4L at risk. Freeze recommended. Funds still present."
         One-tap freeze. Pre-filled freeze documentation.
         [TIME: 45 seconds per request vs. 45 minutes]

Step 6:  End of month. RBI FRMS report:
         SentinelAI auto-generates the full report from case data.
         Priya reviews and approves. Submitted in 20 minutes.
         [TIME: 20 minutes vs. 3 days]

OUTCOME: Fraud detected in 3 seconds. ₹22,000 blocked autonomously.
         Priya triages 189 alerts in 2 hours instead of 8. Recovery rate improves to 61%.
         Zero regulatory deadline missed.
```

---

## 3.5 AI Touch Points

| Step | Engine | Action |
|---|---|---|
| Transaction monitoring | **UEBA** | Real-time behavioral baseline comparison |
| Alert generation | **TRE** | Contextual fraud narrative with cross-bank linkage |
| Transaction blocking | **Autonomous Response** | Configurable auto-block on high-confidence fraud |
| Cross-bank intelligence | **Intelligence Layer** | Shared mule account database across participating banks |
| FRMS reporting | **CAP** | Auto-generated RBI regulatory report |
| 1930 triage | **TRE** | Priority scoring for freeze requests based on funds at risk |
| Cluster detection | **UEBA + PAPE** | Identifies coordinated fraud campaigns across accounts |

---

## 3.6 Screens

| Screen ID | Screen Name | Key Elements |
|---|---|---|
| S-B-01 | **Fraud Operations Dashboard** | Alert queue (pre-triaged), active cases, cluster map, SLA countdown |
| S-B-02 | **Fraud Alert Detail** | Transaction timeline, behavioral score, destination account history, action buttons |
| S-B-03 | **Cross-Bank Intelligence Panel** | Shared mule account data, linked cases across banks, total at-risk amount |
| S-B-04 | **1930 Triage Queue** | Pre-sorted freeze requests by funds at risk + account status |
| S-B-05 | **Chargeback Workflow** | Status tracker, FIR linking, communication log with customer |
| S-B-06 | **RBI FRMS Report Generator** | Auto-populated regulatory report, review + approve, submission status |
| S-B-07 | **Mule Account Network Map** | Graph visualization of money mule networks detected |

---

## 3.7 Expected Outputs

| Output | Format | Recipient |
|---|---|---|
| High-confidence fraud alert | Push notification (real-time) | Bank Officer |
| Behavioral anomaly report | Structured alert with evidence | Bank Officer |
| Transaction freeze instruction | Automated API | Receiving bank |
| RBI FRMS report | Regulatory template PDF | RBI portal |
| Cross-bank fraud intelligence | Anonymized API feed | Other participating banks |
| Customer notification | SMS + email | Account holder |
| 1930 freeze documentation | Structured form | 1930 helpline system |

---

## 3.8 Edge Cases

| EC # | Scenario | Handling |
|---|---|---|
| EC-01 | Customer claims fraud but initiated the transfer themselves (friendly fraud) | UEBA shows no behavioral anomaly; pattern consistent with customer's history; flag for manual review |
| EC-02 | Money mule is also a victim (unknowingly received and forwarded funds) | TRE flags account as "likely mule — possible victim" with lower criminal confidence score |
| EC-03 | International transfer via correspondent banking | SWIFT transaction monitoring integration; BharatPol notification if international mule detected |
| EC-04 | Bank officer incorrectly marks legitimate transaction as fraud | Customer appeal workflow; UEBA model receives corrective signal |
| EC-05 | Destination bank is not on SentinelAI network | Fallback to 1930 manual process; officer alerted with contact information |

---

## 3.9 Failure Scenarios

| FS # | Failure | Recovery |
|---|---|---|
| FS-01 | UEBA baseline insufficient for new account (<30 days old) | Conservative thresholds applied; additional manual review flagged |
| FS-02 | Auto-block triggers on legitimate large transaction (e.g., property payment) | Customer immediately notified; one-tap unblock via authenticator app; full audit trail |
| FS-03 | Cross-bank API returns stale data | Timestamp on all shared intelligence; stale data (>24h) flagged with warning |
| FS-04 | FRMS portal API is down | Report saved locally; retry queue; manual download option with pre-filled PDF |

---
---

# USER 4 — CYBER CRIME OFFICER

## 4.1 Profile

| Attribute | Detail |
|---|---|
| **Name** | Inspector Ramesh Kumar |
| **Age** | 41 |
| **Role** | Cyber Crime Inspector, Pune City Cyber Crime Cell |
| **Tech Literacy** | Medium-High — uses CCTNS, email, basic forensic tools |
| **Workload** | 200+ active cases. 5-member team. Handles financial fraud, ransomware, CSAM, social media crimes |
| **Biggest Challenge** | Evidence collection, suspect tracing, inter-agency coordination, overwhelming caseload |

---

## 4.2 Pain Points

| # | Pain Point | Severity |
|---|---|---|
| PP-01 | **Caseload crisis** — 200+ cases, 5 officers. No intelligent prioritization. Most serious cases don't get proportionate attention. | 🔴 Critical |
| PP-02 | **Evidence decay** — Digital evidence (device logs, transaction metadata) has a short window. By the time cases reach him, evidence is stale or deleted. | 🔴 Critical |
| PP-03 | **No intelligence linkage** — Cannot see if the suspect in case #47 is also appearing in cases #91 and #128 across the state | 🔴 Critical |
| PP-04 | **Manual suspect profiling** — Building a criminal profile requires manual review of FIRs, social media, CCTNS records, telecom data. Takes days. | 🟠 High |
| PP-05 | **No dark web visibility** — Knows that stolen credentials and malware are traded on dark web but has no tools to monitor | 🟠 High |
| PP-06 | **Warrant and intercept delays** — CDR requests to telecom companies take 7–15 days via legal process | 🟠 High |
| PP-07 | **Jurisdictional complexity** — Attacker in Rajasthan, victim in Pune, servers in Singapore. Nobody takes lead. | 🟠 High |
| PP-08 | **Report writing is manual** — Charge sheets and court-admissible reports take 10+ hours to write per case | 🟡 Medium |

---

## 4.3 Current Journey (Without SentinelAI)

```
TRIGGER: Case transferred from police station. FIR received (physical file + CCTNS entry).

Step 1:  Ramesh receives stack of 8 new cases this week.
         Reads through each FIR manually. Prioritizes by gut feeling + amount.
         Cases assigned to team members based on availability.
         [TIME: 2–3 hours of case review]

Step 2:  Opens Case: UPI fraud, ₹25,000. 
         Calls victim Riya. Gets transaction IDs.
         Sends formal letter to SBI for transaction logs.
         SBI responds in 7–10 working days (if responsive).
         [TIME: 7–10 days just to get basic data]

Step 3:  Sends CDR request to telecom company for the suspect's phone number.
         Legal process: Superintendent of Police signature required.
         Response time: 10–15 days.
         [TIME: 10–15 days]

Step 4:  Bank data and CDR arrive. Ramesh manually cross-references:
         • Which phone was used at the time of fraud?
         • Does the account have prior complaints?
         • What is the call pattern?
         All done in Excel. No intelligence tools.
         [TIME: 2–3 days of manual analysis]

Step 5:  Suspect identified (possibly). Ramesh needs to check CCTNS for prior cases.
         CCTNS search is by name or FIR number only. No fuzzy matching. No alias search.
         Calls 3 other district cyber cells to ask if they've seen this suspect.
         [TIME: 2–3 days of coordination]

Step 6:  Arrest warrant application drafted manually.
         Court submission. Hearing scheduled.
         [TIME: 2–4 weeks]

Step 7:  Charge sheet written. 40-page document. All manual.
         References all 47 transactions manually tabulated.
         [TIME: 3–4 days of writing]

OUTCOME: Simple ₹25,000 fraud — 60–90 days to charge sheet. 
         200+ more cases waiting. True criminals identified only ~30% of time.
```

---

## 4.4 Future Journey (With SentinelAI)

```
TRIGGER: SentinelAI auto-routes case from station with complete intelligence package.

Step 1:  Ramesh opens his Cyber Crime Officer Dashboard.
         Not 8 unread FIRs — 8 pre-analyzed case briefs:
         "Case Priority Score: 87/100 — UPI fraud, ₹25,000. 
         Suspect profile: 78% match with 'Abhishek Modi' (alias: Sunny) — 
         linked to 14 similar cases across Pune, Nashik, Aurangabad.
         Cluster: 'SBI KYC Scam Network — 39 victims, ₹18.4L total.'
         Evidence ready: transaction logs (auto-fetched), call records pending."
         [TIME: 3 minutes to review vs. 3 hours]

Step 2:  Ramesh clicks on the suspect profile.
         SentinelAI's TRE shows:
         • CCTNS history (3 prior cyber complaints — different aliases)
         • Mobile number connected to 11 victim transactions
         • Bank account opened 45 days ago (common mule pattern)
         • Location trail from tower data (approximate — within legal limits)
         • Dark web mention: credentials matching his pattern found on breach forum
         [TIME: Instant. Previously: 2–3 days of manual research]

Step 3:  Ramesh sees the attack network graph:
         Cluster of 39 victims → 4 mule accounts → 2 aggregator accounts → 
         1 primary suspect. Visual, interactive, evidence-linked.
         He assigns 2 officers to the cluster. One lead investigator coordinates.
         [TIME: Assignment in 5 minutes]

Step 4:  CDR request: SentinelAI generates pre-filled legal request template.
         SP digital signature via e-Sign (no physical document).
         Submitted electronically to telecom gateway.
         Estimated response: 48 hours (vs. 15 days).
         [TIME: 10 minutes to prepare + 48 hours vs. 15 days]

Step 5:  Bank data auto-fetched (SentinelAI has formal MOU with partner banks).
         Transaction logs, KYC details, account opening IP address — all available.
         [TIME: Instant for partner banks vs. 7–10 days]

Step 6:  Suspect located. Arrest warrant application:
         SentinelAI auto-generates the Section 41A notice / warrant application 
         with all evidence pre-compiled.
         [TIME: 30 minutes vs. 2–4 weeks]

Step 7:  Charge sheet:
         SentinelAI generates structured charge sheet draft:
         • All 47 transactions in tabular format (auto-generated)
         • All applicable IT Act + IPC sections cited with case law references
         • Evidence annexure with digital chain of custody documentation
         Ramesh reviews, edits, signs.
         [TIME: 4 hours vs. 3–4 days]

OUTCOME: Case resolved in 8–10 days vs. 60–90 days.
         39 victims in cluster get coordinated justice.
         Ramesh can handle 3x more cases with same team.
```

---

## 4.5 AI Touch Points

| Step | Engine | Action |
|---|---|---|
| Case intake | **TRE** | Auto-generates priority score and case brief |
| Suspect profiling | **UEBA + TRE** | Cross-references CCTNS, bank data, telecom, dark web |
| Network mapping | **TRE + PAPE** | Visualizes fraud network — victims, mules, aggregators, suspects |
| Dark web monitoring | **Intelligence Layer** | Continuous monitoring of breach forums for Indian credential leaks |
| Legal document generation | **CAP** | Auto-generates CDR requests, warrant applications, charge sheets |
| Bank data fetch | **Autonomous Response** | Automated data pull from partner bank APIs |
| Case assignment | **NLSI backend** | Workload-optimized assignment to officer with matching specialization |

---

## 4.6 Screens

| Screen ID | Screen Name | Key Elements |
|---|---|---|
| S-CC-01 | **Cyber Cell Command Dashboard** | Case queue (priority-sorted), active clusters, team workload, SLA tracker |
| S-CC-02 | **AI Case Brief** | Suspect profile, victim list, evidence status, recommended next actions |
| S-CC-03 | **Suspect Intelligence Profile** | CCTNS history, alias mapping, bank accounts, mobile numbers, location trail |
| S-CC-04 | **Attack Network Graph** | Interactive graph: victims → mule accounts → suspects → financials |
| S-CC-05 | **Evidence Locker** | Chain of custody, digital evidence files, hash verification, court-admissible packaging |
| S-CC-06 | **Legal Document Generator** | CDR request, arrest warrant, Section 41A notice, charge sheet templates |
| S-CC-07 | **Dark Web Intelligence Feed** | Indian credential leaks, threat actor forums, malware marketplace alerts |
| S-CC-08 | **Court Submission Tracker** | Case hearing dates, document submission status, outcome logging |

---

## 4.7 Expected Outputs

| Output | Format | Recipient |
|---|---|---|
| AI Case Brief | On-screen + PDF | Cyber Crime Officer |
| Suspect Intelligence Profile | On-screen structured report | Officer + Supervisor |
| Attack Network Graph | Interactive visualization + PDF | Officer + Court |
| CDR Legal Request | Pre-filled PDF (e-sign ready) | Telecom company |
| Bank Data Request | API call + formal PDF | Partner banks |
| Arrest Warrant Application | Court-ready document | Magistrate |
| Charge Sheet Draft | NCRB-format digital document | Court |
| Court Evidence Package | Encrypted, hash-verified ZIP | Court |
| 1930 Intelligence Contribution | Anonymized threat feed | National 1930 system |

---

## 4.8 Edge Cases

| EC # | Scenario | Handling |
|---|---|---|
| EC-01 | Suspect is a minor | System flags mandatory Juvenile Justice Act procedures; senior officer review required |
| EC-02 | Attack originates from another country | BharatPol integration triggered; MLAT (Mutual Legal Assistance Treaty) request template generated |
| EC-03 | Evidence involves encrypted communications (WhatsApp, Signal) | System notes the legal pathway; flags for MEITY interception request process |
| EC-04 | Two officers in different states claim jurisdiction | SCRB Admin arbitration workflow triggered; case assigned to higher-value state |
| EC-05 | Suspect profile confidence score is low (< 60%) | Officer explicitly warned: "Low confidence — additional verification required before arrest action" |
| EC-06 | Dark web credential found matching a VIP/political figure | Immediate SCRB Admin escalation; case quarantined; only designated senior officer access |

---

## 4.9 Failure Scenarios

| FS # | Failure | Recovery |
|---|---|---|
| FS-01 | AI suspect profile is wrong person (false ID) | Confidence score prominently displayed; officer verification required before any action; full evidence trail |
| FS-02 | Bank API returns incomplete data | Manual request fallback; officer notified of gap with specific missing fields highlighted |
| FS-03 | Network graph is too complex to render (1000+ nodes) | Auto-clustering; summary view with drill-down; export to Gephi for offline analysis |
| FS-04 | Charge sheet auto-draft misses a legal section | Legal AI review flag; officer must explicitly sign off; post-correction feedback to model |
| FS-05 | Dark web data is stale or inaccurate | Data timestamped; confidence score; source reliability rating displayed |

---
---

# USER 5 — SCRB ADMIN (State Crime Records Bureau)

## 5.1 Profile

| Attribute | Detail |
|---|---|
| **Name** | Deputy SP Meera Iyer |
| **Age** | 48 |
| **Role** | Deputy Superintendent of Police, Maharashtra SCRB |
| **Tech Literacy** | Medium — manages CCTNS state node, NCRB reporting |
| **Responsibilities** | Crime statistics for the state, inter-district coordination, NCRB reporting, resource allocation, senior leadership briefings |
| **Reporting to** | DGP (Director General of Police) + NCRB (National Crime Records Bureau) |

---

## 5.2 Pain Points

| # | Pain Point | Severity |
|---|---|---|
| PP-01 | **No real-time state intelligence** — Crime data arrives weekly/monthly from districts. Meera is always operating on stale information. | 🔴 Critical |
| PP-02 | **NCRB reporting is manual** — Compiling annual crime statistics from 45,000 cases across 36 districts requires weeks of Excel work | 🔴 Critical |
| PP-03 | **Resource allocation is gut-based** — Decides which districts get more officers, vehicles, and equipment based on last year's crime stats. No predictive analytics. | 🟠 High |
| PP-04 | **No cross-district pattern detection** — A gang operating across 5 districts appears in 5 separate district reports. No one sees the unified picture at state level. | 🔴 Critical |
| PP-05 | **DGP briefings are stressful** — Must present crime trends to DGP monthly. Data is compiled manually from district reports. Charts are made in PowerPoint. Takes 2 days. | 🟠 High |
| PP-06 | **No predictive crime mapping** — Cannot warn districts about upcoming crime trends. Only describes what already happened. | 🟠 High |
| PP-07 | **Corrupt or incomplete data from districts** — Some districts under-report crime (political pressure). Meera has no way to detect this systematically. | 🟠 High |

---

## 5.3 Current Journey (Without SentinelAI)

```
TRIGGER: Monthly district crime report due to NCRB in 10 days.

Step 1:  Meera sends email to all 36 district police superintendents:
         "Please submit monthly crime statistics by [date]."
         Response rate: 28/36 by deadline. 8 follow-up calls required.
         [TIME: 3 days of follow-ups]

Step 2:  Receives 36 Excel files with varying formats.
         Consolidation: manual copy-paste into master Excel.
         Formatting errors, missing data, different category codes.
         [TIME: 4 days of data cleaning]

Step 3:  Identifies some anomalies: one district reports zero cybercrime cases.
         Calls that district SP. Gets told: "We file under IPC Cheating."
         Reclassification required. More calls.
         [TIME: 2 days]

Step 4:  Creates PowerPoint for DGP briefing.
         Charts: cybercrime up 23%, financial fraud up 41%.
         Context: none. Recommendations: "increase manpower" (generic).
         [TIME: 1 day]

Step 5:  DGP asks: "Which districts are hotspots? Which gangs are active?"
         Meera doesn't have granular data. Promises a follow-up report.
         [TIME: Another 3 days of research]

Step 6:  NCRB report submitted. Late by 5 days.
         NCRB flags data inconsistencies. Correction cycle begins.
         [TIME: Total: 3 weeks of effort for one monthly report]

OUTCOME: Stale data. Generic insights. Reactive policy. Stressed team. Late NCRB submission.
```

---

## 5.4 Future Journey (With SentinelAI)

```
TRIGGER: Meera logs into SentinelAI SCRB Dashboard at 9 AM on any given day.

Step 1:  Real-time Maharashtra crime intelligence visible:
         • 12,847 active cases across 36 districts — live
         • Cybercrime clusters detected: 4 active organized networks
         • Hotspot map: Nashik, Aurangabad, Thane — spike in UPI fraud (48 hours)
         • Alert: "District Nanded — zero cybercrime entries in 11 days. 
           Possible under-reporting. Previous 30-day average: 23/day."
         [TIME: 3 minutes to understand state crime picture vs. 3 weeks]

Step 2:  Meera clicks on the hotspot alert.
         TRE shows: "Coordinated SIM swap fraud ring — 3 suspects identified,
         operating across Nashik and Thane. 127 victims. ₹43L stolen.
         Recommended action: Joint operation with both district cyber cells."
         One-click to initiate inter-district coordination task:
         Officers notified in both districts simultaneously.
         [TIME: 5 minutes to identify + initiate vs. never detecting this before]

Step 3:  Under-reporting detection:
         Nanded district flagged for sudden drop in crime entries.
         SentinelAI shows: "NCRP complaints from Nanded-area phone numbers 
         are being filed (62 in 11 days) but CCTNS entries from Nanded: 0.
         Possible data entry delay or deliberate suppression."
         Meera can send a formal audit request in one click.
         [TIME: Automated detection vs. never catching this]

Step 4:  DGP Monthly Briefing — due tomorrow.
         Meera clicks "Generate DGP Briefing Report."
         SentinelAI auto-generates:
         • Executive summary (2 pages)
         • Crime trend charts (6 charts, all auto-generated)
         • Top 5 organized crime networks active this month
         • District-wise performance heatmap
         • Resource allocation recommendations based on predictive crime model
         • 3-month crime forecast for each district
         [TIME: 20 minutes review + approval vs. 2 days of manual preparation]

Step 5:  NCRB Report:
         SentinelAI auto-generates NCRB-format report directly from live data.
         Meera reviews, approves, submits via NCRB API integration.
         [TIME: 45 minutes vs. 3 weeks. Always on time.]

Step 6:  Predictive resource allocation:
         "Based on crime trajectory, recommend deploying 2 additional officers
         and 1 mobile forensic unit to Nashik district for next 45 days."
         Meera approves the recommendation. Resource order generated automatically.
         [TIME: 10 minutes decision vs. gut-based quarterly review]

OUTCOME: Real-time intelligence. Proactive gang detection. Under-reporting caught.
         DGP briefing in 20 minutes. NCRB report on time. Resources optimally allocated.
         Meera transforms from report compiler to strategic intelligence commander.
```

---

## 5.5 AI Touch Points

| Step | Engine | Action |
|---|---|---|
| Real-time monitoring | **UEBA + TRE** | Continuous crime pattern analysis across all 36 districts |
| Hotspot detection | **PAPE** | Predictive crime mapping using historical trends + active signals |
| Under-reporting detection | **UEBA** | Anomaly detection on data entry patterns vs. NCRP complaint data |
| Network detection | **TRE** | Cross-district gang and fraud network identification |
| DGP report generation | **CAP + NLSI** | Auto-generated executive briefing from live intelligence |
| NCRB reporting | **CAP** | Regulatory report auto-generation in NCRB format |
| Resource recommendation | **PAPE** | Predictive allocation model based on crime forecasting |

---

## 5.6 Screens

| Screen ID | Screen Name | Key Elements |
|---|---|---|
| S-SC-01 | **SCRB State Command Dashboard** | Live case count, active networks, district heatmap, anomaly alerts |
| S-SC-02 | **District Comparison Matrix** | Side-by-side district performance, trend graphs, under-reporting flags |
| S-SC-03 | **Organized Crime Network View** | Cross-district gang profiles, active investigations, suspect registry |
| S-SC-04 | **Predictive Crime Map** | 30/60/90-day crime forecasts by district and crime category |
| S-SC-05 | **DGP Briefing Generator** | Report parameters, auto-generated slides + text, review + approve |
| S-SC-06 | **NCRB Report Generator** | Auto-populated NCRB format report, validation checks, submission status |
| S-SC-07 | **Resource Allocation Planner** | AI recommendations, current deployment, approval workflow |
| S-SC-08 | **Inter-District Coordination** | Task assignment across districts, progress tracker, communication log |
| S-SC-09 | **Data Quality Monitor** | District-wise data entry health, anomaly flags, audit request workflow |

---

## 5.7 Expected Outputs

| Output | Format | Recipient |
|---|---|---|
| Real-time crime intelligence dashboard | Live web app | SCRB Admin |
| Organized crime network report | PDF + interactive graph | SCRB Admin + DGP |
| Under-reporting audit flag | Alert + PDF | District SP + State DGP |
| DGP Monthly Briefing | PDF report + PPT | DGP |
| NCRB Annual/Monthly Report | NCRB-format submission | NCRB, New Delhi |
| Predictive crime forecast | District-level maps + charts | SCRB Admin |
| Resource allocation recommendation | Structured recommendation doc | SCRB Admin + Finance |
| Inter-district task order | Digital task with tracking | District Cyber Cells |

---

## 5.8 Edge Cases

| EC # | Scenario | Handling |
|---|---|---|
| EC-01 | Two districts report same organized crime network separately | SentinelAI auto-merges into unified network profile; alerts both district SPs and SCRB |
| EC-02 | Crime surge detected during elections | Election-context flag applied; system cross-references EC notifications; auto-escalates to State EC liaison |
| EC-03 | Sudden spike in crime in one district (natural disaster aftermath) | Contextual tagging — disaster-period crimes flagged separately in NCRB report |
| EC-04 | DGP requests real-time briefing (unexpected) | One-tap "Live Intelligence Brief" — auto-generates current-state snapshot in 60 seconds |
| EC-05 | Data entered incorrectly by a district and affects state statistics | Anomaly detection flags outlier entries; district alerted; corrected data accepted with audit trail |
| EC-06 | Cross-state gang (Maharashtra + Karnataka) | Automatic notification to Karnataka SCRB; joint coordination interface opened |

---

## 5.9 Failure Scenarios

| FS # | Failure | Recovery |
|---|---|---|
| FS-01 | CCTNS API goes down — live data unavailable | Last-known-good snapshot maintained; "Data as of [timestamp]" clearly displayed; manual CSV upload fallback |
| FS-02 | Predictive model gives incorrect crime forecast | Confidence interval displayed on all predictions; model version and training date shown; override option available |
| FS-03 | NCRB API rejects auto-generated report (format change) | Fallback to manual PDF download with pre-filled data; notification to dev team for format update |
| FS-04 | DGP report generation times out (data volume) | Progressive rendering — summary available in 30 seconds; full report in background; notification when complete |
| FS-05 | Under-reporting flag is a false positive (data entry delay, not suppression) | District SP receives "Potential delay detected" (not accusatory language); can mark as "Delay — explanation provided" |

---

## Summary — User Journey Comparison

| Dimension | Citizen | Police Officer | Bank Officer | Cyber Crime Officer | SCRB Admin |
|---|---|---|---|---|---|
| **Primary Goal** | Recover from fraud | File correct FIR | Detect & block fraud | Investigate & prosecute | State intelligence & policy |
| **Current Time-to-Resolution** | 60–90 days | 45–90 min per FIR | 22 days per case | 60–90 days per case | 3 weeks per report |
| **Future Time-to-Resolution** | 48 hours | 17 minutes | 2 minutes | 8–10 days | 20 minutes |
| **Primary AI Engine** | PIE + UEBA | TRE + CAP | UEBA + TRE | TRE + Intelligence Layer | PAPE + CAP |
| **Key Screen** | Fraud Alert + Tracker | AI Case Brief | Fraud Dashboard | Attack Network Graph | State Command Dashboard |
| **Most Critical Pain** | No real-time fraud alert | No cybercrime expertise | Alert overload | Evidence decay | Stale, fragmented data |
| **SentinelAI Superpower** | Pre-fraud warning | Auto-FIR with legal sections | Behavioral fraud detection | Suspect network visualization | Real-time state intelligence |

---

*SentinelAI User Journeys v1.0 — July 11, 2026*  
*For internal product design, hackathon demo planning, and implementation reference.*
