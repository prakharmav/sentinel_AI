---
name: SentinelAI Intelligence System
colors:
  surface: '#10131b'
  surface-dim: '#10131b'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#181c23'
  surface-container: '#1c2027'
  surface-container-high: '#262a32'
  surface-container-highest: '#31353d'
  on-surface: '#e0e2ed'
  on-surface-variant: '#c0c6d6'
  inverse-surface: '#e0e2ed'
  inverse-on-surface: '#2d3038'
  outline: '#8b91a0'
  outline-variant: '#414754'
  surface-tint: '#aac7ff'
  primary: '#aac7ff'
  on-primary: '#003064'
  primary-container: '#3e90ff'
  on-primary-container: '#002957'
  inverse-primary: '#005db8'
  secondary: '#c6c6cb'
  on-secondary: '#2f3034'
  secondary-container: '#46464b'
  on-secondary-container: '#b5b4ba'
  tertiary: '#ffb691'
  on-tertiary: '#552000'
  tertiary-container: '#eb6a12'
  on-tertiary-container: '#4a1b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#10131b'
  on-background: '#e0e2ed'
  surface-variant: '#31353d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The design system is engineered for high-stakes public safety environments, prioritizing clarity, authority, and rapid cognitive processing. The aesthetic combines the utilitarian precision of **Modern Enterprise SaaS** with a **Government-Grade** sense of security.

The visual language follows a **Refined Minimalist** approach with **Subtle Glassmorphism**. This ensures that complex data visualizations remain the focal point while the interface feels premium and technologically advanced. By utilizing a dark-first architecture, the system reduces eye strain for operators in command centers while allowing critical alerts (Primary and Status colors) to pop with maximum "signal-to-noise" efficiency. 

Key attributes include:
- **Professionalism:** No unnecessary decorative elements; every pixel serves a functional purpose.
- **Modernity:** Floating panels, soft blurs, and high-quality typography inspired by cutting-edge developer tools.
- **Authority:** A structured, rigid grid balanced by approachable rounded corners to signify a sophisticated, human-centric AI.

## Colors

The palette is anchored in **Deep Obsidian**, providing a pure black base that optimizes contrast for OLED displays and high-brightness command environments. 

- **Primary (Intelligence Blue):** Used for primary actions, active states, and brand identifiers.
- **Surface & Borders:** Surfaces use **Dark Graphite** with low-opacity white borders (5-10%) to create separation without heavy visual weight.
- **Functional Accents:** Cyber Teal is reserved for AI-driven insights and data-heavy visualizations to distinguish machine intelligence from user-generated content.
- **Severity Tiers:** A strict traffic-light system is applied to alerts. High severity uses Crimson Red, Medium uses a specialized safety Orange, and Low uses Amber Gold.

## Typography

This design system utilizes **Inter** for its exceptional legibility in data-dense environments. The type scale is optimized for high information density.

- **Weight Usage:** Use **Semibold (600)** for section headers and primary button labels. **Medium (500)** is the default for interactive labels and UI metadata.
- **Legibility:** Paragraphs should never exceed 75 characters in width. 
- **Monospaced elements:** For coordinate data, timestamps, and ID numbers, utilize a monospaced variant or `font-variant-numeric: tabular-nums` to ensure vertical alignment in tables.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop. 

- **The 4px Rule:** All spacing, padding, and margins must be multiples of 4px to maintain rhythmic consistency.
- **Content Density:** In "Intelligence Views" (maps and tables), use `sm` (8px) spacing between related elements. In "Settings" or "Analytical Reports," use `md` (16px) or `lg` (24px) for better breathing room.
- **Breakpoints:** 
    - **Desktop:** 1200px+ (12 columns, 24px margins)
    - **Tablet:** 768px - 1199px (8 columns, 16px margins)
    - **Mobile:** <767px (4 columns, 12px margins)

## Elevation & Depth

Hierarchy is established through a combination of **Tonal Layering** and **Glassmorphism**.

- **Level 0 (Background):** Pure Obsidian (#010101).
- **Level 1 (Cards/Panels):** Dark Graphite (#1C1C1E) with a 1px border (#FFFFFF, 8% opacity).
- **Level 2 (Modals/Popovers):** Dark Graphite with a `backdrop-filter: blur(20px)` and a slightly brighter border (12% white).
- **Shadows:** Use extremely soft, large-radius shadows (`0 20px 40px rgba(0,0,0,0.4)`) to lift floating elements. Avoid hard shadows.
- **Interactive Depth:** On hover, cards should increase their border opacity to 20% rather than changing their background color, maintaining the "glass" look.

## Shapes

The shape language balances the rigid nature of government software with modern "friendly" enterprise aesthetics. 

- **Default Radius:** Most containers, cards, and input fields use **0.5rem (8px)**. 
- **Large Components:** Hero sections or primary dashboard cards use **1rem (16px)** to emphasize the "Modern" direction.
- **Small Elements:** Tooltips and tags use **0.25rem (4px)** for a sharper, more precise look.
- **Buttons:** Use the standard 8px radius to match input fields, creating a unified form-factor.

## Components

- **Buttons:** 
    - *Primary:* Solid Intelligence Blue with white text.
    - *Ghost:* Transparent background with a 1px white (15%) border. White text.
    - *Action:* On hover, buttons should have a subtle "glow" effect using a soft outer shadow of their own color.
- **Inputs:** Darker than the surface color (#0A0A0A) with a 1px border. Focused state uses a 1px Primary Blue border and a 2px blue outer glow.
- **Cards:** No background color on Level 1; only the 1px subtle border. Level 2 cards (AI-summaries) use a subtle Cyber Teal tint in the border (20% opacity).
- **Command Palette:** A center-aligned modal, heavily blurred, with a search input that has no border—only a bottom separator.
- **Status Chips:** Small, condensed labels with a low-opacity background of the status color and a high-opacity text color (e.g., Red text on 10% Red background).
- **AI Summaries:** Distinctively styled with a subtle gradient border transition from Primary Blue to Cyber Teal to signify "SentinelAI" processing.