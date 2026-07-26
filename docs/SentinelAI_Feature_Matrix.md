# SentinelAI — Complete Feature Prioritization Matrix

> **Version**: 1.0  
> **Date**: July 11, 2026  
> **Purpose**: Hackathon build planning, MVP recommendation, judge score optimization  
> **Format**: Every feature scored on 4 dimensions

---

## Scoring Guide

| Dimension | Scale | Meaning |
|---|---|---|
| **Category** | Must / Should / Good / Future | Build priority for hackathon |
| **Implementation Time** | Hours (hackathon context) | Realistic estimate for a 3-person team |
| **Hackathon Score Contribution** | 1–10 | How much this feature impresses judges |
| **Technical Complexity** | 1–10 | Engineering difficulty (1=easy, 10=hardest) |

---

## CATEGORY 1 — MUST HAVE (Build These First)

*These features define SentinelAI. Without them, the demo fails.*

---

### 1.1 Core Infrastructure

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-01 | **Attack Scenario Simulator** | Generates synthetic realistic log streams for 5 attack types (phishing, UPI fraud, credential stuffing, ransomware, insider threat) | 6h | 9/10 | 5/10 | Simulator |
| F-02 | **Real-Time Event Streaming** | WebSocket pipeline from simulator/ingestion to dashboard — live feed without page refresh | 4h | 8/10 | 6/10 | Backend |
| F-03 | **Event Normalization Engine** | Parses and normalizes diverse log formats into a unified Common Event Model | 5h | 5/10 | 6/10 | Backend |
| F-04 | **PostgreSQL Event Store** | Stores normalized events with indexing for fast retrieval | 3h | 3/10 | 3/10 | Backend |
| F-05 | **Redis Pub/Sub Bus** | Real-time event routing between services | 2h | 3/10 | 3/10 | Backend |
| F-06 | **FAISS Vector Index** | Stores embedded event representations for RAG queries | 4h | 6/10 | 7/10 | AI Layer |
| F-07 | **Gemini API Integration** | Core LLM connection — authenticated, rate-managed, error-handled | 3h | 7/10 | 4/10 | AI Layer |

**Subtotal: 27 hours | Avg Score: 5.9 | Avg Complexity: 4.9**

---

### 1.2 Threat Reasoning Engine (TRE)

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-08 | **Alert Narrative Generator** | LLM produces 6W explanation (who, what, when, where, why, how) for each detected incident | 5h | 10/10 | 6/10 | TRE |
| F-09 | **MITRE ATT&CK Tagger** | Maps every alert to ATT&CK technique IDs (T1059, T1078, etc.) | 4h | 9/10 | 5/10 | TRE |
| F-10 | **Risk Score Calculator** | Produces 0–100 risk score with contributing factors for each alert | 3h | 8/10 | 5/10 | TRE |
| F-11 | **Alert Deduplication** | Groups related events into unified incident timelines — reduces noise | 4h | 8/10 | 6/10 | TRE |
| F-12 | **Severity Classification** | Auto-classifies: Critical / High / Medium / Low / Info with justification | 2h | 7/10 | 3/10 | TRE |
| F-13 | **Next-Step Prediction (Basic)** | Shows 1–2 probable next attacker moves based on current ATT&CK phase | 5h | 10/10 | 7/10 | TRE + PAPE |

**Subtotal: 23 hours | Avg Score: 8.7 | Avg Complexity: 5.3**

---

### 1.3 SOC Dashboard

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-14 | **Live Alert Feed** | Real-time scrolling alert list with severity indicators, MITRE tags, timestamps | 5h | 9/10 | 5/10 | Frontend |
| F-15 | **Attack Chain Timeline** | Visual horizontal timeline showing progression of an attack, each step tagged to ATT&CK | 6h | 10/10 | 6/10 | Frontend |
| F-16 | **Incident Detail View** | Full incident page: narrative, evidence, timeline, risk score, recommended actions | 4h | 9/10 | 5/10 | Frontend |
| F-17 | **Risk Score Dashboard** | Top-level risk posture gauge, trend sparklines, critical alerts counter | 3h | 8/10 | 4/10 | Frontend |
| F-18 | **Alert Priority Queue** | Sorted alert list — Critical first, with one-click triage actions | 3h | 8/10 | 3/10 | Frontend |

**Subtotal: 21 hours | Avg Score: 8.8 | Avg Complexity: 4.6**

---

### 1.4 Natural Language SOC Interface (NLSI)

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-19 | **NL Query Input UI** | Chat-style interface where analyst types plain English questions | 3h | 9/10 | 3/10 | NLSI |
| F-20 | **RAG Query Engine** | Retrieves relevant events from FAISS, constructs context, sends to Gemini for answer | 6h | 10/10 | 8/10 | NLSI |
| F-21 | **10 Pre-Validated Query Types** | Tested and validated responses for 10 common analyst questions | 4h | 8/10 | 4/10 | NLSI |
| F-22 | **Evidence-Backed Answers** | Every NL answer includes citations — specific log lines, timestamps, evidence | 4h | 9/10 | 6/10 | NLSI |

**Subtotal: 17 hours | Avg Score: 9.0 | Avg Complexity: 5.3**

---

### 1.5 Autonomy Controls

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-23 | **Autonomy Level Selector** | UI control: Observe / Advise / Contain / Remediate — switches platform behavior | 3h | 9/10 | 4/10 | Response |
| F-24 | **Human Approval Workflow** | For Advise mode — system recommends action, waits for analyst click to execute | 3h | 8/10 | 4/10 | Response |
| F-25 | **One Automated Response Action** | Demo: disable user account OR block IP on confirmed high-confidence alert | 4h | 10/10 | 5/10 | Response |
| F-26 | **Immutable Audit Log** | Every action logged with timestamp, AI justification, actor, and outcome | 3h | 8/10 | 4/10 | Response |
| F-27 | **Action Rollback** | Undo any automated action — restores previous state with audit entry | 3h | 7/10 | 5/10 | Response |

**Subtotal: 16 hours | Avg Score: 8.4 | Avg Complexity: 4.4**

---

### MUST HAVE TOTAL
```
Total Features:    27
Total Hours:       104 hours
Average Score:     8.2 / 10
Average Complexity: 4.9 / 10
```

---

## CATEGORY 2 — SHOULD HAVE (Build After Must Have)

*These features significantly differentiate SentinelAI and improve demo impact.*

---

### 2.1 Compliance Autopilot (CAP)

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-28 | **GDPR Breach Notification Draft** | Auto-generates Art. 33 breach notification pre-filled from incident data | 5h | 9/10 | 5/10 | CAP |
| F-29 | **DPDP Report Template** | India-specific breach notification under DPDP Act 2023 | 4h | 10/10 | 4/10 | CAP |
| F-30 | **Evidence Package Generator** | One-click: packages all evidence (logs, screenshots, timeline) into court-ready ZIP | 4h | 8/10 | 5/10 | CAP |
| F-31 | **Regulatory Deadline Tracker** | Shows countdown: "GDPR notification due in 47 hours" | 2h | 7/10 | 2/10 | CAP |

**Subtotal: 15 hours | Avg Score: 8.5 | Avg Complexity: 4.0**

---

### 2.2 Executive Reporting

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-32 | **One-Click Executive Summary** | Generates board-ready incident summary in plain language — no jargon | 4h | 9/10 | 5/10 | TRE + CAP |
| F-33 | **MTTD / MTTR Tracker** | Live metrics showing detection and response times vs. industry baseline | 3h | 8/10 | 4/10 | Dashboard |
| F-34 | **Threat Trend Charts** | 7-day / 30-day trend graphs for alert volume, attack types, severity distribution | 4h | 7/10 | 4/10 | Dashboard |
| F-35 | **Risk Posture Score** | Organization-wide composite risk score (0–100) with change indicators | 3h | 8/10 | 5/10 | TRE |

**Subtotal: 14 hours | Avg Score: 8.0 | Avg Complexity: 4.5**

---

### 2.3 Phishing Intelligence Engine (PIE)

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-36 | **Email Analysis Demo** | Paste or upload a suspicious email — PIE analyzes and returns phishing score | 5h | 9/10 | 6/10 | PIE |
| F-37 | **Phishing Score Breakdown** | Shows why email is suspicious: urgency language, spoofed sender, malicious URL, etc. | 3h | 8/10 | 4/10 | PIE |
| F-38 | **SMS/URL Classifier** | Classifies URLs and SMS content for phishing patterns in real-time | 4h | 8/10 | 5/10 | PIE |
| F-39 | **Phishing Pattern Library** | Displays top 10 current phishing patterns detected (mock data for demo) | 2h | 6/10 | 2/10 | PIE |

**Subtotal: 14 hours | Avg Score: 7.8 | Avg Complexity: 4.3**

---

### 2.4 Behavioral Anomaly (UEBA — Basic)

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-40 | **User Behavior Baseline** | Builds simulated behavioral profile per user (login times, data access, volume) | 5h | 8/10 | 7/10 | UEBA |
| F-41 | **Anomaly Scoring** | Scores deviations from baseline — drives insider threat detection | 4h | 9/10 | 7/10 | UEBA |
| F-42 | **Insider Threat Alert** | Flags when a user's behavior diverges significantly from their own history | 4h | 9/10 | 6/10 | UEBA |
| F-43 | **Entity Risk Timeline** | Per-user or per-device risk score timeline — shows when risk elevated | 3h | 7/10 | 5/10 | UEBA |

**Subtotal: 16 hours | Avg Score: 8.3 | Avg Complexity: 6.3**

---

### SHOULD HAVE TOTAL
```
Total Features:    16
Total Hours:       59 hours
Average Score:     8.1 / 10
Average Complexity: 4.8 / 10
```

---

## CATEGORY 3 — GOOD TO HAVE (Build If Time Permits)

*These polish the demo and show depth — but demo is still excellent without them.*

---

### 3.1 Advanced Intelligence Features

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-44 | **Attack Network Graph** | Interactive D3 graph: victims → mule accounts → suspects — visual and clickable | 8h | 10/10 | 8/10 | TRE |
| F-45 | **Predictive Attack Path Panel** | Full PAPE output: next 3–5 attacker moves ranked by probability | 7h | 10/10 | 8/10 | PAPE |
| F-46 | **Dark Web Mention Alerts** | Mock dark web monitoring — shows "credentials from your domain found on breach forum" | 4h | 9/10 | 4/10 | Intel Layer |
| F-47 | **Threat Landscape Map** | World map with real-time (mock) attack origin points and target industries | 5h | 8/10 | 5/10 | Intel Layer |
| F-48 | **CVE Enrichment** | Links detected vulnerabilities to public CVE database with severity and patch status | 4h | 7/10 | 5/10 | Intel Layer |

**Subtotal: 28 hours | Avg Score: 8.8 | Avg Complexity: 6.0**

---

### 3.2 User Experience Polish

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-49 | **Onboarding Flow** | Step-by-step wizard: connect sources → first alert in < 15 minutes | 5h | 8/10 | 4/10 | Frontend |
| F-50 | **Dark Mode UI** | Full dark mode — critical for SOC context (low-light environments) | 3h | 7/10 | 2/10 | Frontend |
| F-51 | **Alert Sound Notifications** | Audio alert for Critical severity — tactically relevant for live SOC | 1h | 6/10 | 1/10 | Frontend |
| F-52 | **Keyboard Shortcuts** | Power-user keyboard shortcuts for rapid alert triage | 3h | 5/10 | 2/10 | Frontend |
| F-53 | **Mobile Responsive Dashboard** | Dashboard usable on mobile/tablet | 4h | 6/10 | 3/10 | Frontend |
| F-54 | **Animated Alert Transitions** | Smooth micro-animations when new alerts arrive | 2h | 6/10 | 2/10 | Frontend |

**Subtotal: 18 hours | Avg Score: 6.3 | Avg Complexity: 2.3**

---

### 3.3 Citizen & Law Enforcement Features

| # | Feature | Description | Time (hrs) | Score | Complexity | Engine |
|---|---|---|---|---|---|---|
| F-55 | **Citizen Complaint Portal** | Simplified complaint form — pre-fills based on detected fraud | 6h | 9/10 | 5/10 | CAP |
| F-56 | **Case Tracker for Citizens** | Real-time case status view (Filed → Assigned → Investigating → Resolved) | 4h | 8/10 | 4/10 | Dashboard |
| F-57 | **FIR Auto-Draft (Police)** | CCTNS-compatible FIR template with IT Act sections auto-populated | 6h | 9/10 | 6/10 | CAP |
| F-58 | **Officer Assignment Engine** | Workload-balanced case routing to cyber crime officers | 5h | 7/10 | 6/10 | NLSI backend |
| F-59 | **State Crime Dashboard (SCRB)** | District-level crime heatmap and trend analytics for state admin | 7h | 8/10 | 7/10 | Dashboard |

**Subtotal: 28 hours | Avg Score: 8.2 | Avg Complexity: 5.6**

---

### GOOD TO HAVE TOTAL
```
Total Features:    16
Total Hours:       74 hours
Average Score:     7.8 / 10
Average Complexity: 4.6 / 10
```

---

## CATEGORY 4 — FUTURE SCOPE (Post-Hackathon)

*Mention in the pitch deck as roadmap. Do NOT build during hackathon.*

---

### 4.1 Phase 2 Features (Months 7–12)

| # | Feature | Description | Est. Time | Score | Complexity |
|---|---|---|---|---|---|
| F-60 | **Deepfake Detection Engine** | Video/audio synthetic media classifier for CEO fraud, vishing | 4 weeks | 9/10 | 9/10 |
| F-61 | **Purple Team Simulation** | Built-in attack simulation to test your own detection coverage | 3 weeks | 9/10 | 8/10 |
| F-62 | **Production Endpoint Agent** | Lightweight Windows/Mac/Linux agent — < 2% CPU | 6 weeks | 8/10 | 9/10 |
| F-63 | **OT/ICS Protocol Support** | Modbus, DNP3 ingestion for critical infrastructure | 6 weeks | 8/10 | 9/10 |
| F-64 | **Mobile App (iOS + Android)** | Analyst mobile app for alerts, approvals, and on-the-go SOC | 4 weeks | 7/10 | 7/10 |
| F-65 | **Multi-Tenant Architecture** | Full tenant isolation for SaaS production deployment | 6 weeks | 6/10 | 9/10 |
| F-66 | **Supply Chain Intelligence** | Monitors open-source dependencies and CI/CD pipelines for compromise | 5 weeks | 8/10 | 8/10 |
| F-67 | **Adversarial Robustness Layer** | Monitors SentinelAI's own models for adversarial attack | 4 weeks | 9/10 | 9/10 |

---

### 4.2 Phase 3 Features (Months 13–24)

| # | Feature | Description |
|---|---|---|
| F-68 | **Federated Threat Intelligence Network** | Anonymous cross-customer threat sharing — living intelligence moat |
| F-69 | **AI Policy Engine** | Define security policy in natural language — AI enforces it |
| F-70 | **SentinelAI Marketplace** | Third-party detection rules, custom integrations, community threat feeds |
| F-71 | **Autonomous Red Team Agents** | AI agents that continuously simulate attacks against customer environments |

---

## MASTER FEATURE TABLE — ALL 59 HACKATHON FEATURES

| # | Feature | Category | Hours | Score | Complexity | ROI* |
|---|---|---|---|---|---|---|
| F-01 | Attack Scenario Simulator | Must | 6 | 9 | 5 | **1.8** |
| F-02 | Real-Time Event Streaming | Must | 4 | 8 | 6 | **2.0** |
| F-03 | Event Normalization Engine | Must | 5 | 5 | 6 | **1.0** |
| F-04 | PostgreSQL Event Store | Must | 3 | 3 | 3 | **1.0** |
| F-05 | Redis Pub/Sub Bus | Must | 2 | 3 | 3 | **1.5** |
| F-06 | FAISS Vector Index | Must | 4 | 6 | 7 | **1.5** |
| F-07 | Gemini API Integration | Must | 3 | 7 | 4 | **2.3** |
| F-08 | **Alert Narrative Generator** | Must | 5 | **10** | 6 | **2.0** |
| F-09 | **MITRE ATT&CK Tagger** | Must | 4 | **9** | 5 | **2.3** |
| F-10 | Risk Score Calculator | Must | 3 | 8 | 5 | **2.7** |
| F-11 | Alert Deduplication | Must | 4 | 8 | 6 | **2.0** |
| F-12 | Severity Classification | Must | 2 | 7 | 3 | **3.5** |
| F-13 | **Next-Step Prediction** | Must | 5 | **10** | 7 | **2.0** |
| F-14 | **Live Alert Feed** | Must | 5 | **9** | 5 | **1.8** |
| F-15 | **Attack Chain Timeline** | Must | 6 | **10** | 6 | **1.7** |
| F-16 | Incident Detail View | Must | 4 | 9 | 5 | **2.3** |
| F-17 | Risk Score Dashboard | Must | 3 | 8 | 4 | **2.7** |
| F-18 | Alert Priority Queue | Must | 3 | 8 | 3 | **2.7** |
| F-19 | NL Query Input UI | Must | 3 | 9 | 3 | **3.0** |
| F-20 | **RAG Query Engine** | Must | 6 | **10** | 8 | **1.7** |
| F-21 | 10 Pre-Validated Queries | Must | 4 | 8 | 4 | **2.0** |
| F-22 | **Evidence-Backed Answers** | Must | 4 | **9** | 6 | **2.3** |
| F-23 | **Autonomy Level Selector** | Must | 3 | **9** | 4 | **3.0** |
| F-24 | Human Approval Workflow | Must | 3 | 8 | 4 | **2.7** |
| F-25 | **Automated Response Action** | Must | 4 | **10** | 5 | **2.5** |
| F-26 | Immutable Audit Log | Must | 3 | 8 | 4 | **2.7** |
| F-27 | Action Rollback | Must | 3 | 7 | 5 | **2.3** |
| F-28 | **GDPR Breach Notification** | Should | 5 | **9** | 5 | **1.8** |
| F-29 | **DPDP Report Template** | Should | 4 | **10** | 4 | **2.5** |
| F-30 | Evidence Package Generator | Should | 4 | 8 | 5 | **2.0** |
| F-31 | Regulatory Deadline Tracker | Should | 2 | 7 | 2 | **3.5** |
| F-32 | **Executive Summary** | Should | 4 | **9** | 5 | **2.3** |
| F-33 | MTTD/MTTR Tracker | Should | 3 | 8 | 4 | **2.7** |
| F-34 | Threat Trend Charts | Should | 4 | 7 | 4 | **1.8** |
| F-35 | Risk Posture Score | Should | 3 | 8 | 5 | **2.7** |
| F-36 | **Email Analysis Demo (PIE)** | Should | 5 | **9** | 6 | **1.8** |
| F-37 | Phishing Score Breakdown | Should | 3 | 8 | 4 | **2.7** |
| F-38 | SMS/URL Classifier | Should | 4 | 8 | 5 | **2.0** |
| F-39 | Phishing Pattern Library | Should | 2 | 6 | 2 | **3.0** |
| F-40 | User Behavior Baseline | Should | 5 | 8 | 7 | **1.6** |
| F-41 | Anomaly Scoring | Should | 4 | 9 | 7 | **2.3** |
| F-42 | **Insider Threat Alert** | Should | 4 | **9** | 6 | **2.3** |
| F-43 | Entity Risk Timeline | Should | 3 | 7 | 5 | **2.3** |
| F-44 | **Attack Network Graph** | Good | 8 | **10** | 8 | **1.3** |
| F-45 | **Predictive Attack Path Panel** | Good | 7 | **10** | 8 | **1.4** |
| F-46 | Dark Web Mention Alerts | Good | 4 | 9 | 4 | **2.3** |
| F-47 | Threat Landscape Map | Good | 5 | 8 | 5 | **1.6** |
| F-48 | CVE Enrichment | Good | 4 | 7 | 5 | **1.8** |
| F-49 | Onboarding Flow | Good | 5 | 8 | 4 | **1.6** |
| F-50 | Dark Mode UI | Good | 3 | 7 | 2 | **2.3** |
| F-51 | Alert Sound Notifications | Good | 1 | 6 | 1 | **6.0** |
| F-52 | Keyboard Shortcuts | Good | 3 | 5 | 2 | **1.7** |
| F-53 | Mobile Responsive Dashboard | Good | 4 | 6 | 3 | **1.5** |
| F-54 | Animated Alert Transitions | Good | 2 | 6 | 2 | **3.0** |
| F-55 | Citizen Complaint Portal | Good | 6 | 9 | 5 | **1.5** |
| F-56 | Case Tracker for Citizens | Good | 4 | 8 | 4 | **2.0** |
| F-57 | FIR Auto-Draft (Police) | Good | 6 | 9 | 6 | **1.5** |
| F-58 | Officer Assignment Engine | Good | 5 | 7 | 6 | **1.4** |
| F-59 | State Crime Dashboard (SCRB) | Good | 7 | 8 | 7 | **1.1** |

*ROI = Score ÷ Complexity (higher = more bang per unit effort)*

---

## COMPLEXITY vs. IMPACT QUADRANT

```
HIGH IMPACT (Score 8–10)
         │
         │    SWEET SPOT            INVEST IF TIME
         │    ─────────             ─────────────
         │    F-08 Narrative  ●     F-44 Network Graph  ●
         │    F-09 ATT&CK     ●     F-45 Attack Path    ●
HIGH     │    F-13 Next-Step  ●     F-20 RAG Engine     ●
IMPACT   │    F-15 Timeline   ●     F-40 UEBA Baseline  ●
         │    F-23 Autonomy   ●     F-41 Anomaly Score  ●
         │    F-25 Response   ●
         │    F-29 DPDP       ●
         │    F-19 NL Query   ●
         ├────────────────────────────────────────────────
         │
         │    QUICK WINS            SKIP / DEFER
LOW      │    ─────────             ─────────
IMPACT   │    F-12 Severity   ●     F-52 Shortcuts  ●
         │    F-51 Sound      ●     F-53 Mobile     ●
         │    F-54 Animation  ●
         │
         └─────────────────────────────────────────────────
              LOW COMPLEXITY         HIGH COMPLEXITY
              (1–4)                  (7–10)
```

---

## RECOMMENDED MVP BUILD ORDER

### 🏗️ PHASE A — Foundation (Hours 1–12)
*Goal: Platform exists and runs*

| Order | Feature | Hours | Why First |
|---|---|---|---|
| 1 | F-07 Gemini API Integration | 3h | Everything depends on this |
| 2 | F-04 PostgreSQL Event Store | 3h | Data needs a home |
| 3 | F-05 Redis Pub/Sub Bus | 2h | Real-time pipeline |
| 4 | F-01 Attack Simulator | 4h | Need data to work with |

**Phase A Total: 12 hours**

---

### 🧠 PHASE B — AI Core (Hours 13–28)
*Goal: SentinelAI can reason about threats*

| Order | Feature | Hours | Why Here |
|---|---|---|---|
| 5 | F-03 Event Normalization | 5h | AI needs clean data |
| 6 | F-08 Alert Narrative Generator | 5h | **The crown jewel — build early, demo often** |
| 7 | F-09 MITRE ATT&CK Tagger | 4h | Adds immediate credibility |
| 8 | F-12 Severity Classification | 2h | Quick + needed for dashboard |

**Phase B Total: 16 hours**

---

### 📊 PHASE C — Dashboard (Hours 29–44)
*Goal: Analysts can SEE what SentinelAI knows*

| Order | Feature | Hours | Why Here |
|---|---|---|---|
| 9 | F-02 Real-Time Event Streaming | 4h | Dashboard needs live data |
| 10 | F-14 Live Alert Feed | 5h | **First visual — must look great** |
| 11 | F-17 Risk Score Dashboard | 3h | Top-level posture view |
| 12 | F-16 Incident Detail View | 4h | Drilldown into alerts |

**Phase C Total: 16 hours**

---

### 💬 PHASE D — NL Interface (Hours 45–58)
*Goal: Anyone can ask SentinelAI anything*

| Order | Feature | Hours | Why Here |
|---|---|---|---|
| 13 | F-06 FAISS Vector Index | 4h | NL query needs this |
| 14 | F-20 RAG Query Engine | 6h | **Most impressive feature for judges** |
| 15 | F-19 NL Query Input UI | 3h | Interface for the RAG |

**Phase D Total: 13 hours**

---

### ⚡ PHASE E — Response & Autonomy (Hours 59–72)
*Goal: SentinelAI takes action, not just alerts*

| Order | Feature | Hours | Why Here |
|---|---|---|---|
| 16 | F-23 Autonomy Level Selector | 3h | **Differentiator — show the spectrum** |
| 17 | F-25 Automated Response Action | 4h | **Live demo action = wow moment** |
| 18 | F-26 Immutable Audit Log | 3h | Trust mechanism for autonomy |
| 19 | F-13 Next-Step Prediction | 5h | Caps off the demo perfectly |

**Phase E Total: 15 hours**

---

### 🎯 PHASE F — High-Score Additions (Hours 73–104)
*Only if 72-hour hackathon or team is fast*

| Order | Feature | Hours | Score Gain |
|---|---|---|---|
| 20 | F-29 DPDP Report Template | 4h | +10 (India-specific killer feature) |
| 21 | F-32 Executive Summary | 4h | +9 (non-technical audience appeal) |
| 22 | F-15 Attack Chain Timeline | 6h | +10 (visual showstopper) |
| 23 | F-11 Alert Deduplication | 4h | +8 (reduces noise — analysts love this) |
| 24 | F-36 PIE Email Demo | 5h | +9 (interactive judge involvement) |
| 25 | F-10 Risk Score Calculator | 3h | +8 (quantifies value) |
| 26 | F-22 Evidence-Backed Answers | 4h | +9 (builds trust in AI answers) |
| 27 | F-28 GDPR Draft | 5h | +9 (compliance wow) |
| 28 | F-42 Insider Threat Alert | 4h | +9 (surprising use case) |
| 29 | F-21 10 Pre-Validated Queries | 4h | +8 (depth of NL coverage) |

**Phase F Total: 43 hours**

---

## TIME BUDGET BREAKDOWN

### For a 48-Hour Hackathon (3-person team)

```
AVAILABLE: 48 hours × 3 people = 144 person-hours
OVERHEAD (sleep, breaks, prep): ~40 person-hours
BUILDABLE: ~104 person-hours

RECOMMENDED ALLOCATION:
─────────────────────────────────────────────────────
Phase A — Foundation:      12h  ████░░░░░░  (12%)
Phase B — AI Core:         16h  ████████░░  (15%)
Phase C — Dashboard:       16h  ████████░░  (15%)
Phase D — NL Interface:    13h  ██████░░░░  (13%)
Phase E — Response:        15h  ███████░░░  (14%)
Phase F — High Score:      32h  ████████████ (31%)
─────────────────────────────────────────────────────
TOTAL:                    104h  = 27 features built
```

### For a 72-Hour Hackathon (3-person team)

```
AVAILABLE: 72 hours × 3 people = 216 person-hours
OVERHEAD: ~60 person-hours
BUILDABLE: ~156 person-hours

Phases A–F complete:      104h  (27 features)
ADDITIONAL:                52h  (10–12 more features)

ADD IN ORDER:
F-44 Attack Network Graph    8h  +10 score
F-45 Predictive Path Panel   7h  +10 score
F-46 Dark Web Alerts         4h  +9 score
F-55 Citizen Complaint       6h  +9 score
F-57 FIR Auto-Draft          6h  +9 score
F-33 MTTD/MTTR Tracker       3h  +8 score
F-35 Risk Posture Score      3h  +8 score
F-50 Dark Mode UI            3h  +7 score (polish)
F-54 Alert Animations        2h  +6 score (delight)
F-51 Sound Notifications     1h  +6 score (easy win)
──────────────────────────────────────────
Additional:               43h  (10 features)
72h Total:               147h  (37 features)
```

---

## HACKATHON SCORE CONTRIBUTION ANALYSIS

### Features by Judge Appeal Category

**🎯 Technical Innovation (judges: engineers, CTOs)**
- F-08 Alert Narrative Generator (10/10)
- F-20 RAG Query Engine (10/10)
- F-25 Automated Response Action (10/10)
- F-44 Attack Network Graph (10/10)
- F-45 Predictive Path Panel (10/10)

**🇮🇳 India-Specific Impact (judges: govt, policy)**
- F-29 DPDP Report Template (10/10)
- F-55 Citizen Complaint Portal (9/10)
- F-57 FIR Auto-Draft (9/10)
- F-59 State Crime Dashboard (8/10)

**👔 Business Viability (judges: investors, VCs)**
- F-32 Executive Summary (9/10)
- F-28 GDPR Breach Notification (9/10)
- F-29 DPDP Report (10/10)
- F-33 MTTD/MTTR Tracker (8/10)

**😮 Demo Showstopper (judges: everyone)**
- F-15 Attack Chain Timeline (10/10)
- F-25 Live Automated Response (10/10)
- F-19 NL Query (9/10) — invite judge to type
- F-13 Next-Step Prediction (10/10)
- F-08 AI Narrative (10/10) — read it aloud

---

## FINAL MVP RECOMMENDATION

### The Minimum Winning Demo (Phases A–E only)

> **27 features | ~76 person-hours | Estimated score: 82–88/100**

If you build only Phases A through E, you have:
- ✅ A fully working threat simulator
- ✅ Real-time AI-powered alert feed with MITRE ATT&CK tagging
- ✅ LLM-generated attack narratives (the crown jewel)
- ✅ Natural language query interface that actually works
- ✅ Configurable autonomy controls
- ✅ One live autonomous response action with audit log
- ✅ Predictive next-step modeling

**This is already better than anything else in the room.**

### The Winning Demo (Phases A–F)

> **37 features | ~104 person-hours | Estimated score: 92–96/100**

Add Phases F and you get:
- ✅ DPDP breach notification (India's #1 differentiator)
- ✅ GDPR compliance draft (global market signal)
- ✅ Executive summary generator (non-technical judge appeal)
- ✅ Attack chain timeline visualization (visual showstopper)
- ✅ Phishing email live demo (interactive judge moment)
- ✅ Insider threat detection (surprising use case)

### The Championship Demo (Phases A–F + Attack Network + Path)

> **39 features | ~119 person-hours | Estimated score: 96–99/100**

The final two features that make it unforgettable:
- ✅ **F-44 Attack Network Graph** — interactive visualization of the full fraud network. Nothing else in the room will have this.
- ✅ **F-45 Predictive Attack Path** — "We predicted what the attacker would do next. Watch the simulation. We were right." This is the closing scene of your demo.

---

## WHAT TO SAY IN THE PITCH FOR FUTURE SCOPE FEATURES

When judges ask about features you didn't build:

> *"Deepfake detection (our DFD engine) is on the Phase 2 roadmap. The model architecture is designed — we deprioritized it for the hackathon because the inference cost per frame was $0.03 and we wanted to validate the core reasoning engine first. In production, we'd use our tiered inference architecture to batch-process video frames."*

This shows: **you made deliberate, reasoned trade-off decisions** — not that you ran out of time. That's a senior PM answer, not a student answer.

---

## FEATURES NEVER TO CUT

No matter how tight the timeline, **never cut**:

| Feature | Why It's Non-Negotiable |
|---|---|
| F-08 Alert Narrative Generator | This IS SentinelAI. Cut it and you're just another dashboard. |
| F-25 Automated Response Action | The demo's climax. Without it, you're reactive, not proactive. |
| F-19 + F-20 NL Query | The accessibility differentiator. Every judge will want to try it. |
| F-09 MITRE ATT&CK Tagger | Instant credibility signal for technical judges. |
| F-15 Attack Chain Timeline | The visual that makes people say "wow" in the first 30 seconds. |

---

*SentinelAI Feature Prioritization Matrix v1.0 — July 11, 2026*  
*For hackathon build planning and MVP scoping.*
