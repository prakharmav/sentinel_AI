# SentinelAI — Enterprise Folder Structure Design

> **Standard**: Clean Architecture / Twelve-Factor App  
> **Frameworks**: Next.js 14+ (App Router), FastAPI (Python Monorepo), Neo4j 5.x, Kubernetes (Helm), Terraform  
> **Design Role**: Principal Infrastructure Architect, SentinelAI  
> **Date**: July 11, 2026

---

## 1. COMPLETE DIRECTORY TREE

```
sentinelai/
├── 📁 .github/                          # CI/CD Workflows & Git Configuration
│   ├── 📁 workflows/
│   │   ├── frontend-ci.yml
│   │   ├── backend-ci.yml
│   │   ├── ai-model-ci.yml
│   │   ├── terraform-cd.yml
│   │   └── security-sast.yml
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
│
├── 📁 ai-layer/                          # AI Engines, ML Pipelines, & Model Assets
│   ├── 📁 engines/                       # Runtime AI Inference Engines
│   │   ├── 📁 tre/                       # Threat Reasoning Engine (Gemini)
│   │   │   ├── __init__.py
│   │   │   ├── engine.py
│   │   │   ├── schemas.py
│   │   │   └── validator.py
│   │   ├── 📁 ueba/                      # User & Entity Behavior Analytics (VAE+GNN)
│   │   ├── 📁 pape/                      # Predictive Attack Path Engine (Markov)
│   │   ├── 📁 pie/                       # Phishing Intelligence Engine (BERT)
│   │   ├── 📁 dfd/                       # Deepfake Detector (CNN/Vision Transformers)
│   │   └── 📁 cap/                       # Compliance Autopilot (Rules Engine)
│   ├── 📁 models/                        # Pre-trained Model Checkpoints & Weights
│   │   ├── ueba_vae_latest.pt
│   │   ├── pie_bert_weights.bin
│   │   └── pape_transition_matrix.npy
│   ├── 📁 pipelines/                     # Model Training & Validation Pipelines
│   │   ├── train_ueba.py
│   │   ├── train_pie.py
│   │   └── validate_models.py
│   └── 📁 features/                      # Offline Feature Store Definitions
│       └── entity_features.py
│
├── 📁 backend/                           # FastAPI Backend Microservices
│   ├── 📁 shared/                        # Shared Libraries (Internal Packages)
│   │   ├── 📁 database/                  # Database Connections
│   │   │   ├── pg_session.py
│   │   │   ├── redis_cache.py
│   │   │   └── neo4j_driver.py
│   │   ├── 📁 security/                  # Cryptography, Auth, RBAC
│   │   │   ├── token_verifier.py
│   │   │   └── encryption.py
│   │   ├── 📁 models/                    # Shared Pydantic Schemas
│   │   └── 📁 telemetry/                 # Prometheus & OpenTelemetry Loggers
│   │       ├── metrics.py
│   │       └── tracer.ts
│   ├── 📁 ingest-service/                # Log parser & enrichment worker
│   │   ├── 📁 adapters/
│   │   ├── 📁 pipeline/
│   │   ├── Dockerfile
│   │   └── main.py
│   ├── 📁 alert-service/                 # Correlation, rules & alert processing
│   │   ├── 📁 routers/
│   │   ├── 📁 services/
│   │   ├── Dockerfile
│   │   └── main.py
│   ├── 📁 nl-query-service/              # Natural Language Interface & Vector Search
│   │   ├── 📁 rag/
│   │   ├── Dockerfile
│   │   └── main.py
│   └── 📁 response-service/              # Autonomous remediation orchestrator
│       ├── 📁 actions/
│       ├── Dockerfile
│       └── main.py
│
├── 📁 frontend/                          # Next.js 14+ Application
│   ├── 📁 app/                           # Next.js App Router Pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── mfa/
│   │   ├── 📁 dashboard/                 # SOC Main Panel
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── 📁 incidents/                 # Investigation boards
│   │   │   └── [id]/
│   │   ├── 📁 query/                     # NL SOC Interface Console
│   │   ├── 📁 cases/                     # Police Case Management
│   │   └── 📁 reports/                   # Regulatory reporting center
│   ├── 📁 components/                    # Reusable React UI Elements
│   │   ├── 📁 ui/                        # Primitive Design Tokens (buttons, cards)
│   │   ├── 📁 charts/                    # Custom visualization canvas (Recharts/D3)
│   │   ├── 📁 graph/                     # Neo4j Network Graph Visualizers
│   │   └── 📁 forms/                     # Form elements with validation
│   ├── 📁 hooks/                         # Global Custom Hooks (useWebSocket, useAuth)
│   ├── 📁 lib/                           # Utility scripts & API SDK configurations
│   │   ├── api-client.ts
│   │   └── rbac.ts
│   └── package.json
│
├── 📁 infrastructure/                    # IaC & Deployment manifests
│   ├── 📁 docker/                        # Multi-stage Docker definitions
│   │   ├── dev.dockerfile
│   │   └── prod.dockerfile
│   ├── 📁 terraform/                     # Cloud resource mapping
│   │   ├── 📁 modules/
│   │   │   ├── database/
│   │   │   ├── kubernetes/
│   │   │   └── networking/
│   │   └── environments/
│   │       ├── 📁 prod/
│   │       └── 📁 staging/
│   ├── 📁 kubernetes/                    # GitOps Configuration
│   │   ├── 📁 argocd/                    # Application CD mappings
│   │   └── 📁 helm/                      # SentinelAI Helm Chart definitions
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       └── templates/
│   └── 📁 neo4j/                         # Graph Database Schema Migrations
│       ├── 📁 migrations/
│       │   ├── 001-constraints.cypher
│       │   └── 002-indexes.cypher
│       └── apoc.conf
│
├── 📁 tests/                             # Unified Testing Suite
│   ├── 📁 unit/                          # Isolated function checks
│   │   ├── test_auth.py
│   │   └── test_prediction.py
│   ├── 📁 integration/                   # Cross-service flows
│   ├── 📁 load/                          # Performance validation scripts (k6)
│   │   └── socket_load.js
│   └── 📁 security/                      # DAST / SAST / Injection validations
│       └── prompt_injection_tests.py
│
├── docker-compose.yml                    # Local multi-service environment setup
├── pyproject.toml                        # Backend dependency resolution
└── README.md
```

---

## 2. DETAILED DIRECTORY BREAKDOWN

### 2.1 Frontend Module (`/frontend`)

Designed around Next.js App Router and Atomic Design principles.

*   `app/`: Organizes routes. Grouped layouts (e.g., `(auth)`) keep URL paths clean. App routing provides out-of-the-box streaming SSR and loading skeletons.
*   `components/`: Divided into logic layers:
    *   `ui/`: Base design components (buttons, input fields, badges) without business logic (Radix UI/Shadcn style).
    *   `charts/`: Recharts/D3 configurations for rendering metrics (MTTD/MTTR trends).
    *   `graph/`: Houses Sigma.js and WebGL rendering layouts to visualize the Neo4j fraud network.
*   `hooks/`: Decouples business logic from rendering components (e.g., `useWebSocket` coordinates active session streaming updates across components).
*   `lib/`: Manages system utilities. Includes axios wrappers (`api-client.ts`) that inject trace-IDs into outgoing call headers and handle token refreshing.

### 2.2 AI Engine Module (`/ai-layer`)

Separates models, offline training, and live inference logic to prevent runtime delays.

*   `engines/`: Contains runtime wrappers for active algorithms. Each subdirectory represents a standalone domain. For example, `tre/` manages prompt schemas, rate limiting, and output parsers for the Threat Reasoning Engine.
*   `models/`: Repository for serialized training weights (GNN models, Markov matrix checkpoints). Large assets are linked via Git LFS (Large File Storage) configurations.
*   `pipelines/`: Scripts for data training. Updates the feature store periodically without impacting live production queries.
*   `features/`: Shared feature schemas used by both offline training runs and live UEBA models.

### 2.3 Backend Microservices (`/backend`)

A modular codebase containing independent services sharing core libraries.

*   `shared/`: Internal helper package. It includes shared connection pools (PostgreSQL/TimescaleDB session managers, Redis caching clients) and authorization utilities, preventing code duplication.
*   `ingest-service/`: Ingests high-throughput event logs. Relies on clean pipeline structures (Syslog adapters, normalizers) to parsing payloads quickly before pushing to Kafka.
*   `alert-service/`: Evaluates events against rule engines (Sigma patterns) and raises system alerts.
*   `nl-query-service/`: Integrates FAISS vector indexes and semantic parsers to support NLSI (Natural Language SOC Interface) queries.

### 2.4 Infrastructure & IaC (`/infrastructure`)

Consolidates local containers, cloud architectures, and database migrations.

*   `terraform/`: Automates resource provisioning (VPS networks, managed DB clusters). Uses environment separations (`prod/`, `staging/`) to prevent staging configurations from affecting production environments.
*   `kubernetes/`: Implements declarative continuous deployment:
    *   `helm/`: Standardizes package templates for deploying all 12 microservices inside the cluster.
    *   `argocd/`: Defines deployment specifications to sync application states directly with repository updates.
*   `neo4j/`: Contains cypher migration scripts (defining constraints, vector indexes) to manage database structure versions.

### 2.5 Testing Suite (`/tests`)

Organizes testing strategies to ensure security, high performance, and robustness.

*   `unit/`: Contains fast-executing, mock-based tests to validate code logic.
*   `integration/`: Verifies cross-service flows, such as testing if an alert triggers the appropriate notification dispatch.
*   `load/`: Performance tests (written in k6) that verify the socket connections under concurrent load.
*   `security/`: Special test suites that audit the LLM pipeline against prompt injection vulnerabilities and security policy bypass attempts.

---

## 3. KEY ENGINEERING PATTERNS APPLIED

### 3.1 Twelve-Factor App Compliance
*   **Codebase**: One codebase tracked in revision control (Git Monorepo), with multiple deployments.
*   **Dependencies**: Explicitly declared and isolated via `pyproject.toml` (poetry) and `package.json` (npm).
*   **Config**: Strictly stored in the environment (e.g., config maps injected at runtime, not checked into the repository).
*   **Backing Services**: Databases, caching queues, and AI APIs are treated as attached resources, mapped dynamically via Vault secrets.

### 3.2 Security and Secret Isolation
*   All environment variables, API key constants, and database passwords are excluded from the codebase.
*   The `.github/` folder enforces SAST (Static Application Security Testing) scanning using GitHub CodeQL to detect hardcoded secrets or vulnerability patterns before code is merged.

### 3.3 Optimized Docker Configuration
*   Container builds rely on multi-stage `Dockerfiles` located in `/infrastructure/docker`.
*   Development builds include debugging tools, while production builds use minimal base images to reduce the container attack surface.
*   Caching layers are structured with dependency installation steps preceding code copy actions, ensuring faster build pipelines.

---

*SentinelAI Enterprise Folder Structure v1.0 — July 11, 2026*  
*Infrastructure Architecture Review: Approved*
