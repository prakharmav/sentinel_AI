# SentinelAI Frontend v2 — Design System

Production-grade design system for the SentinelAI enterprise platform.

## Folder Structure

```
components/
├── ui/               # Atomic UI primitives (Button, Card, Input, Badge, Alert, Table, Modal, Skeleton, Spinners, Loaders)
├── charts/           # Data visualization (BarChart, LineChart, AreaChart, PieChart, HeatMap, TrendChart, PredictionChart, KPIChart)
├── dashboard/        # Dashboard cards (StatCard, MetricCard, AlertCard, CrimeCard, ActivityCard, AIInsightCard, PredictionCard, QuickActionCard)
├── layout/           # (Phase 3) Shell, Sidebar, Header, Footer
├── forms/            # (Phase 3) Form fields, validation wrappers
├── graph/            # (Phase 3) Neo4j visualization components
├── analytics/        # (Phase 3) Analytics page components
├── chat/             # (Phase 3) AI chat interface components
├── citizen/          # (Phase 3) Citizen portal components
├── shared/           # Domain-specific empty states, reusable wrappers
hooks/                # Custom React hooks (accessibility, keyboard nav)
lib/                  # Utilities (animations, performance, utils)
store/                # Zustand global state
```

## Themes

- `sentinel-dark` — Default. Deep obsidian/zinc with teal accents (Palantir aesthetic)
- `government` — Official navy blue, high-contrast, NCRB-compliant
- `light` — Future light theme scaffold

## Tech Stack

Next.js 15 · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · Zustand · React Query · Lucide Icons
