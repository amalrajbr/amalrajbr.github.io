# Portfolio Experience Section — Implementation Plan

## Goal
Add a "Work Contributions" section to index.html showcasing 4 years of engineering work,
organized with sticky horizontal tabs and expandable cards.

---

## Design Decisions (confirmed)
- [x] Card layout with expand/collapse for bullet details
- [x] Horizontal sticky tabs (sticks below fixed nav)
- [x] No skills summary table (existing Tech Stack section covers it)
- [x] Go-to-top floating button (bottom-right)
- [x] Matches existing blue/slate Tailwind palette
- [x] All card data stored in JS objects (maintainable)

---

## Grouping Rules
- Club related items into one meaningful card (e.g. all N+1/GIN/prefetch work → one card)
- Rewrite text — shorter, recruiter-punchy, DO NOT copy markdown wording
- No dates on cards (makes old work feel stale)
- Keep impressive standalone features separate
- Minor/infra improvements can be grouped into a single "Platform Improvements" card

## Tab Structure (consolidated)
| Tab | Icon | Cards | Sourced from |
|-----|------|-------|--------------|
| Backend | fa-server | 15 | Sections 1.1–1.40 (clustered) |
| Frontend | fa-desktop | 5 | Sections 2, 3, 9 |
| AI & ML | fa-robot | 3 | Sections 6, 7, 8 |
| DevOps | fa-cloud | 3 | Sections 4, 5 |
| Data Eng | fa-database | 1 | Section 10 |

## Backend Card Groups (14 cards)
1.  Recommendation Engine          ← 1.1 + 1.5
2.  Survey Platform Overhaul       ← 1.2 + 1.30 + 1.34 + 1.37
3.  Data Privacy & Anonymization   ← 1.6
4.  Alerting & Risk APIs           ← 1.4
5.  Admin Safety & Audit Framework ← 1.3 + 1.8 + 1.16
6.  Authentication Suite           ← 1.10 + 1.13 + 1.14 + 1.19
7.  User Impersonation System      ← 1.12
8.  Catalog & Resource Library     ← 1.11
9.  Large-Scale Schema Migrations  ← 1.9 + 1.20 + 1.23
10. Query & Performance Wins       ← 1.22 + cross-cutting N+1/GIN work
11. Analytics APIs                 ← 1.29 + 1.33 + 1.36
12. Survey Application from Scratch← 1.7
13. ETL & Data Pipeline            ← 1.39 + 1.40
14. Third-Party Integrations        ← 1.15 + 1.32 + 1.35 + 1.38
    (webhook ingestion, programmatic dashboard provisioning, rate limiting)
15. Platform & Dev Tooling          ← 1.17 + 1.21 + 1.24 + 1.26 + 1.27 + 1.28 + 1.31
    (streaming CSV, Poetry migration, threaded comments, attribution tracking, scheduled jobs)

## Frontend Cards (5)
1. Top-N Analytics Feature         ← 3.1
2. Data Privacy State Management   ← 2.1
3. Auth Flow Enhancement           ← 2.2
4. Code Review & Release Mgmt      ← 2.3 + 3.3
5. Build Tooling & API Cleanup     ← Section 9

## AI & ML Cards (3)
1. AI Hackathon — Multi-Agent System  ← Section 7
2. AI Agent Skill Plugins             ← Section 6
3. MCP / RAG Prototype                ← Section 8

## DevOps Cards (3)
1. AI-Powered Test Coordinator Agent  ← 4.1
2. CI/CD & Dev Automation             ← 4.2 + 4.3 + 4.4 + 4.5
3. Multi-Region Cloud Secrets         ← 5.1

---

## Card Design (per item)
- NO expand/collapse. No bullet lists. Recruiters skim.
- 1–2 punchy sentences: lead with the technical achievement, not the context.
- Tech tags below. That's it.

```
┌──────────────────────────────────────────────────────┐
│ Recommendation Engine Pipeline    [Sep – Oct 2025]   │
│                                                      │
│ Built end-to-end recommendation pipeline; replaced   │
│ M2M with PostgreSQL ArrayField + GIN indexing,       │
│ eliminating N+1 queries via prefetch_related.        │
│                                                      │
│ [GIN indexing] [N+1 elimination] [service layer]    │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1 — CSS & Styles
- [x] 1.1 Add tab button styles (active state, hover, border-bottom indicator)
- [x] 1.2 Add count badge styles (blue pill)
- [x] 1.3 Add tech tag chip styles
- [x] 1.4 Add card hover effect (shadow + border color)
- [x] 1.5 Add go-to-top button visibility transition
- [x] 1.6 Add tab horizontal scroll (hide scrollbar on all browsers)
- [x] 1.7 Add scroll-margin-top to #experience for fixed nav offset
- NOTE: No expand/collapse needed — cards are static

### Phase 2 — HTML Structure
- [x] 2.1 Add Experience section skeleton (section tag, header div)
- [x] 2.2 Add sticky tab bar with 5 buttons
- [x] 2.3 Add 5 empty tab panel divs (populated by JS on load)
- [x] 2.4 Add go-to-top button HTML (fixed, bottom-right)

### Phase 3 — JavaScript Core
- [x] 3.1 Write switchTab() function
- [x] 3.2 Write createCard() template function (static — no toggle logic)
- [x] 3.3 Write renderTab() function
- [x] 3.4 Write scroll listener for go-to-top button
- [x] 3.5 Add initial render call for all tabs

### Phase 4 — Data: Backend (15 consolidated cards)
- [x] 4.1  Recommendation Engine + Ranking Stats Engine
- [x] 4.2  Survey Platform Overhaul
- [x] 4.3  Data Privacy & Anonymization Engine
- [x] 4.4  Alerting & Risk APIs
- [x] 4.5  Admin Safety & Audit Framework
- [x] 4.6  Authentication Suite
- [x] 4.7  User Impersonation System
- [x] 4.8  Catalog & Resource Library
- [x] 4.9  Large-Scale Schema Migrations
- [x] 4.10 Query & Performance Wins
- [x] 4.11 Analytics APIs
- [x] 4.12 Survey Application from Scratch (Django Ninja)
- [x] 4.13 ETL & Data Pipeline
- [x] 4.14 Third-Party Integrations
- [x] 4.15 Platform & Dev Tooling

### Phase 5 — Data: Other Tabs
- [x] 5.1 Add Frontend data (5 cards)
- [x] 5.2 Add AI & ML data (3 cards)
- [x] 5.3 Add DevOps data (3 cards)
- [x] 5.4 Add Data Engineering data (1 card)

### Phase 6 — Verify & Polish
- [x] 6.1 All cards written — 15+5+3+3+1 = 27 total
- [x] 6.2 Card count per tab matches badge numbers (15/5/3/3/1)
- [x] 6.3 Sticky tab uses top-[65px] matching nav height
- [x] 6.4 Go-to-top scroll listener triggers at scrollY > 400
- [x] 6.5 .tabs-scrollable hides scrollbar on webkit/firefox/IE
- [x] 6.6 Wording verified — all rewritten, no direct markdown copy-paste

---

## Notes
- Nav height ≈ 65px (py-4 = 32px + text-xl line height ~28px + 1px border)
  → sticky tab: `top: 65px`, section scroll-margin: `scroll-margin-top: 65px`
- Cards: 2-column grid on md+, 1-column on mobile
- Items without bullet points: no expand button shown, just summary + tags
- Backend tab is default active tab on load
