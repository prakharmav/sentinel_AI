# SentinelAI: Intelligence Command Center (Screen 1)

## Purpose
The primary situational awareness dashboard for police and investigators. It provides a real-time overview of active crimes, fraud alerts, and predictive analytics.

## Layout
- **Global Header**: Logo, Global Search, and Notifications.
- **Top Metrics**: Quick-glance indicators for Total Incidents, Risk Score, and Active Investigations.
- **Hero Section**: Interactive Heatmap of the jurisdiction with crime clusters.
- **Priority Feed**: AI-curated list of "High Severity" alerts (Crime, Fraud, Scams).
- **Predictive Module**: "Likely Next Incidents" based on AI historical analysis.
- **Bottom Navigation**: Fast switching between modules.

## Component Hierarchy
1. `TopAppBar` (Logo, User, Command Palette)
2. `StatsGrid` (Metric Cards)
3. `CrimeHeatmapCard` (Interactive Map)
4. `AI_SummaryCard` (Natural language brief of current status)
5. `AlertList` (Scrollable list of Investigation Cards)
6. `BottomNavBar` (Main navigation)

## Visual Design
- **Theme**: Obsidian Dark (#010101).
- **Cards**: Surface-low with 1px border (#ffffff/10) and subtle blur.
- **Typography**: Inter (SF Pro feel). Large, bold headings for clarity.
- **Animations**: Skeleton loading states for data, subtle pulse for live alerts.

## Developer Notes
- Use Tailwind `backdrop-blur-xl` for card backgrounds.
- High-priority alerts use a soft red glow (`shadow-red-500/20`).
- Implement `IntersectionObserver` for smooth scroll reveals.