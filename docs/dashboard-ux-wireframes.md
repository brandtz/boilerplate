# Dashboard UX Wireframes

**Author:** Product Designer / UX  
**Prompt:** 3.0.1  
**Date:** 2026-04-03  
**Status:** Complete

---

## Table of Contents

1. [Application Shell](#1-application-shell)
2. [View 1 — Overview](#2-view-1--overview)
3. [View 2 — Epics](#3-view-2--epics)
4. [View 3 — Prompts](#4-view-3--prompts)
5. [View 4 — Sessions](#5-view-4--sessions)
6. [View 5 — Tasks](#6-view-5--tasks)
7. [Navigation Flow](#7-navigation-flow)
8. [Interaction Patterns](#8-interaction-patterns)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [UX Concerns and Recommendations](#10-ux-concerns-and-recommendations)

---

## 1. Application Shell

The shell wraps all five views and provides persistent navigation, project context, and status.

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER                                                              │
│  [Logo/Title: Project Manager Dashboard]                             │
│  [Repo Selector ▼ (/path/to/repo)]  [↻ Refresh]  [Last parsed: …]  │
├──────────┬───────────────────────────────────────────────────────────┤
│ SIDEBAR  │  MAIN CONTENT AREA                                        │
│          │                                                           │
│ ● Overview│  (View-specific content renders here)                    │
│ ○ Epics  │                                                           │
│ ○ Prompts│                                                           │
│ ○ Sessions│                                                          │
│ ○ Tasks  │                                                           │
│          │                                                           │
│          │                                                           │
│          │                                                           │
│          │                                                           │
├──────────┴───────────────────────────────────────────────────────────┤
│  STATUS BAR: Last parsed 12:34 PM | 247 prompts | 0 warnings        │
└──────────────────────────────────────────────────────────────────────┘
```

### Shell Elements

- **Header (fixed):** Project name (derived from repo), repo selector dropdown with recent-projects list, refresh button, last-parsed timestamp.
- **Sidebar (fixed, collapsible):** Five nav items with icons. Active view is highlighted. On narrow viewports (< 768px), sidebar collapses to a hamburger menu.
- **Main Content Area (scrollable):** Renders the active view. Takes remaining horizontal and vertical space.
- **Status Bar (fixed bottom):** Shows parse timestamp, file counts, warning/error counts. Clicking warning count opens the blockers panel.

### Responsive Behavior

- **Desktop (≥ 1280px):** Full sidebar visible, multi-column layouts for cards and charts.
- **Tablet (768–1279px):** Sidebar collapses to icon-only rail; cards stack in fewer columns.
- **Mobile (< 768px):** Sidebar hidden behind hamburger; single-column layout; tables switch to card view.

---

## 2. View 1 — Overview

Route: `/`

The Overview is the landing page and operational cockpit. It provides at-a-glance project health, progress, blockers, and next action.

```
┌─────────────────────────────────────────────────────────────────────┐
│  OVERVIEW                                                            │
│                                                                      │
│  ┌─ SUMMARY CARDS (horizontal row, wraps on narrow screens) ──────┐ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │ │
│  │ │  Epics   │ │  Stories │ │  Tasks   │ │  Prompts │           │ │
│  │ │    6     │ │    34    │ │   128    │ │   247    │           │ │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │ │
│  │ │   Done   │ │In Progress│ │ Blocked  │ │  Ready   │           │ │
│  │ │    42    │ │     3    │ │     2    │ │    18    │           │ │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ PROGRESS BAR ────────────────────────────────────────────────┐  │
│  │  Overall: ████████░░░░░░░░░░░░  42% complete                  │  │
│  │  Scope:   ██████████░░░░░░░░░░  55% defined                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ HEALTH BADGE ───────────────────────────────────────────────┐   │
│  │  🟢 On Track  (or 🟡 At Risk / 🔴 Blocked / ⚪ Not Started)  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ CHARTS (2×2 grid) ──────────────────────────────────────────┐  │
│  │ ┌─────────────────────┐ ┌─────────────────────┐              │  │
│  │ │ Epic Completion      │ │ Prompt Status        │              │  │
│  │ │ (Stacked bar or      │ │ Distribution         │              │  │
│  │ │  donut chart by epic)│ │ (Donut/pie by status)│              │  │
│  │ └─────────────────────┘ └─────────────────────┘              │  │
│  │ ┌─────────────────────┐ ┌─────────────────────┐              │  │
│  │ │ Remaining Prompts    │ │ Session Throughput   │              │  │
│  │ │ Over Time (line)     │ │ Over Time (bar)      │              │  │
│  │ └─────────────────────┘ └─────────────────────┘              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ BLOCKERS & WARNINGS PANEL ──────────────────────────────────┐  │
│  │  🔴 Blocked: Prompt 12.0.1 — "Waiting on ADR-005 approval"   │  │
│  │  🟡 Warning: Prompt 8.0.1 done but no handoff found           │  │
│  │  🟡 Warning: 2 prompts have unresolved prerequisites          │  │
│  │  (Click any item → opens prompt detail drawer)                │  │
│  │  ────────────────────────────────────────────────              │  │
│  │  ✅ No issues found (shown when list is empty)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ NEXT PROMPT WIDGET ─────────────────────────────────────────┐  │
│  │  ▶ Next: 3.0.1 — "UX Designer — Dashboard Wireframes"        │  │
│  │  Role: Product Designer UX                                    │  │
│  │  Rationale: "Lowest eligible prompt; all 1 prerequisite met"  │  │
│  │  Prerequisites: ✅ 2.0.1 (done)                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ (Scrollable text area with full prompt markdown content) │ │  │
│  │  │ # Prompt 3.0.1: UX Designer — Dashboard…                │ │  │
│  │  │ …                                                        │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │  [📋 Copy to Clipboard]  [📄 View Source File]                │  │
│  │  ────────────────────────────────────────────────              │  │
│  │  (When no prompts eligible:)                                  │  │
│  │  "No eligible prompts. 2 blocked, 5 waiting on prerequisites" │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ RECENT SESSIONS (last 5) ───────────────────────────────────┐  │
│  │  Session  Prompt  Role           Date       Summary   Files   │  │
│  │  S-005    2.0.1   BSA            Apr 3      AC refin…  4      │  │
│  │  S-004    1.0.3   Architect      Apr 3      ADR-003…   2      │  │
│  │  S-003    1.0.2   PM             Apr 2      Epics r…   1      │  │
│  │  (Click row → navigates to Sessions view with detail open)    │  │
│  │  [View All Sessions →]                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Overview — Design Rationale

- **Summary cards first:** Gives instant scope awareness before any drilling. Top row = scope counters, bottom row = execution counters. This dual-metric model matches the business rules (Section 2.4).
- **Health badge:** Single glanceable indicator of overall project status per business rules Section 9.
- **Charts in 2×2 grid:** Balances information density with readability. Each chart answers a different question (which epics are done? what status distribution? is velocity stable? how much remains?).
- **Blockers before next prompt:** User should see problems before being prompted to act. Items are clickable to navigate to detail.
- **Next prompt widget is prominent:** This is the primary action center — the "what do I do next?" answer. Copy-to-clipboard removes friction from launching the next session.
- **Recent sessions at bottom:** Provides historical context but is secondary to forward-looking widgets.

---

## 3. View 2 — Epics

Route: `/epics`

The Epics view provides hierarchical project decomposition: Epic → Story → Task, with completion rollups at every level.

```
┌─────────────────────────────────────────────────────────────────────┐
│  EPICS                                                               │
│                                                                      │
│  ┌─ FILTER BAR ─────────────────────────────────────────────────┐   │
│  │  [Status: All ▼]  [Search: _______________]                   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ EPIC LIST ──────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ▼ E1: Repo Data Contracts and Parsing Foundation             │   │
│  │    Stories: 6 | Tasks: 15 | Prompts: 18 | Status: in_progress │   │
│  │    ████████████░░░░░░░░  60%                                  │   │
│  │    Last update: Apr 3 — "Parser handles 250+ files"           │   │
│  │    ┌──────────────────────────────────────────────────────┐   │   │
│  │    │  ▼ E1-S1: Define and validate prompt frontmatter     │   │   │
│  │    │    Tasks: 3 | Prompts: 2 | Status: done              │   │   │
│  │    │    ████████████████████  100%                         │   │   │
│  │    │    ┌──────────────────────────────────────────────┐   │   │   │
│  │    │    │  ☑ E1-S1-T1: Define canonical YAML schema   │   │   │   │
│  │    │    │    [done] Prompt: 5.0.1                      │   │   │   │
│  │    │    │  ☑ E1-S1-T2: Implement frontmatter validator│   │   │   │
│  │    │    │    [done] Prompt: 5.0.2                      │   │   │   │
│  │    │    │  ☑ E1-S1-T3: Create example prompt files    │   │   │   │
│  │    │    │    [done] Prompt: 5.0.3                      │   │   │   │
│  │    │    └──────────────────────────────────────────────┘   │   │   │
│  │    │                                                       │   │   │
│  │    │  ▶ E1-S2: Define and validate handoff contract       │   │   │
│  │    │    Tasks: 3 | Prompts: 2 | Status: ready             │   │   │
│  │    │    ░░░░░░░░░░░░░░░░░░░░  0%                          │   │   │
│  │    │                                                       │   │   │
│  │    │  ▶ E1-S3: Build markdown frontmatter parser          │   │   │
│  │    │    (collapsed — click to expand)                      │   │   │
│  │    └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ▶ E2: Overview Dashboard Experience                          │   │
│  │    Stories: 4 | Tasks: 14 | Prompts: 12 | Status: draft      │   │
│  │    ░░░░░░░░░░░░░░░░░░░░  0%                                  │   │
│  │                                                               │   │
│  │  ▶ E3: Epic / Story / Task Visibility                         │   │
│  │    Stories: 4 | Tasks: 11 | Prompts: 10 | Status: draft      │   │
│  │    ░░░░░░░░░░░░░░░░░░░░  0%                                  │   │
│  │                                                               │   │
│  │  ▶ E4: Prompt Inventory and Session History                   │   │
│  │    (collapsed)                                                │   │
│  │                                                               │   │
│  │  ▶ E5: Refresh, Watchers, and Multi-Project Support           │   │
│  │    (collapsed)                                                │   │
│  │                                                               │   │
│  │  ▶ E6: Review, Quality, and Hardening                         │   │
│  │    (collapsed)                                                │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Epics — Design Rationale

- **Accordion pattern:** Epic → Story → Task is a three-level tree. Accordions allow progressive disclosure without page navigation.
- **Status badges** at every level use canonical colors (gray/blue/yellow/purple/red/green/muted).
- **Progress bars** on epics and stories provide instant visual comparison.
- **Prompt links** on tasks are clickable and open the Prompt detail drawer (cross-view navigation).
- **Last update** line on each epic surfaces the most recent session activity without drilling in.
- **Filter bar** lets users narrow by status to find blocked or in-progress work quickly.
- **Completion formula** follows business rules: `done / (total - cancelled) × 100` at each level.

---

## 4. View 3 — Prompts

Route: `/prompts`

The Prompts view is a full inventory table of all prompts (active and archived) with a detail drawer.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROMPTS                                                             │
│                                                                      │
│  ┌─ FILTER / SEARCH BAR ───────────────────────────────────────┐    │
│  │  [Status: All ▼] [Epic: All ▼] [Location: Active ▼]         │    │
│  │  [Role: All ▼]   [Search: _______________ 🔍]               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─ PROMPT TABLE ───────────────────────────────────────────────┐   │
│  │  #      Title                Epic  Status     Updated   Loc  │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  1.0.1  Project Kickoff      E0    [done]     Apr 1     act  │   │
│  │  1.0.2  PM — Epics Refine    E0    [done]     Apr 2     act  │   │
│  │  1.0.3  Architect — ADRs     E0    [done]     Apr 3     act  │   │
│  │  2.0.1  BSA — Acceptance     E0    [done]     Apr 3     act  │   │
│  │ ►3.0.1  UX — Wireframes      E2    [ready]    Apr 3     act  │   │
│  │  4.0.1  Arch — Review        E0    [ready]    Apr 3     act  │   │
│  │  …                                                           │   │
│  │  16.0.1 UI — Overview Impl   E2    [draft]    Apr 3     act  │   │
│  │  16.0.2 UI — Fix chart bug   E2    [draft]    Apr 3     act  │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  (Archived — muted styling)                                  │   │
│  │  0.0.1  Bootstrap (old)      —     [superseded] Mar 30  arc  │   │
│  │                                                               │   │
│  │  ◄ 1  2  3  4  … ►  (pagination for 250+ prompts)            │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Column headers are clickable for sorting:                           │
│    # — natural prompt-ID sort (default)                              │
│    Status — grouped by status                                        │
│    Epic — grouped by epic                                            │
│    Updated — chronological                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Prompt Detail Drawer

Clicking any prompt row opens a slide-in drawer from the right side. The drawer overlays the table (does not replace it).

```
                                    ┌─────────────────────────────────┐
                                    │  PROMPT DETAIL DRAWER     [✕]  │
                                    │                                 │
                                    │  Prompt 3.0.1                   │
                                    │  "UX Designer — Wireframes"     │
                                    │  Status: [ready]                │
                                    │  Phase: product-definition      │
                                    │  Epic: E2 | Story: — | Tasks: —│
                                    │  Owner: Product Designer UX     │
                                    │  Location: active               │
                                    │                                 │
                                    │  ── Prerequisites ──────────    │
                                    │  ✅ 2.0.1 (done)                │
                                    │                                 │
                                    │  ── Required Reading ─────      │
                                    │  • docs/project-manager-…       │
                                    │  • agents/epics/project-…       │
                                    │  • agents/decisions/ADR-003…    │
                                    │  • agents/context/product-…     │
                                    │                                 │
                                    │  ── Downstream Prompts ───      │
                                    │  → 4.0.1                        │
                                    │                                 │
                                    │  ── Prompt Body ──────────      │
                                    │  ┌───────────────────────────┐  │
                                    │  │ (Rendered markdown of the │  │
                                    │  │  full prompt content,     │  │
                                    │  │  scrollable)              │  │
                                    │  └───────────────────────────┘  │
                                    │  [📋 Copy Prompt]               │
                                    │                                 │
                                    │  ── Session Handoff ──────      │
                                    │  (If handoff exists:)           │
                                    │  Summary: "Created wireframes…" │
                                    │  Changed files: 2               │
                                    │  Tests run: 0                   │
                                    │  Decisions: …                   │
                                    │  [View Full Handoff →]          │
                                    │                                 │
                                    │  (If done + no handoff:)        │
                                    │  ⚠ Handoff missing for this     │
                                    │    completed prompt             │
                                    │                                 │
                                    │  (If superseded:)               │
                                    │  Superseded by: → 3.0.2         │
                                    │                                 │
                                    │  (If archived:)                 │
                                    │  Archived: 2026-04-05           │
                                    │                                 │
                                    │  Source: prompts/active/3.0.1…  │
                                    └─────────────────────────────────┘
```

### Prompts — Design Rationale

- **Table for density:** 250+ prompts require a scannable, sortable table — not cards.
- **Natural sort as default:** Prompt IDs like 1.0.1, 2.0.1, 16.0.2 sort by numeric tuple, not alphabetically.
- **Drawer over full-page:** User can glance between the table and the detail without losing context. Drawer slides in from right (~40% width on desktop).
- **Location toggle:** Default filter is "Active" to hide archived prompts from the primary view. User can toggle to "All" or "Archive".
- **Archived prompts** are visually muted (lower opacity or gray text + "arc" badge).
- **Superseded prompts** display a clickable link to the superseding prompt.
- **Pagination:** For 250+ prompts, pagination (25–50 per page) is preferred over infinite scroll for keyboard accessibility and deep-linking.

---

## 5. View 4 — Sessions

Route: `/sessions`

The Sessions view displays a chronological history of all completed agent sessions, derived from handoff files.

```
┌─────────────────────────────────────────────────────────────────────┐
│  SESSIONS                                                            │
│                                                                      │
│  ┌─ FILTER BAR ─────────────────────────────────────────────────┐   │
│  │  [Status: All ▼]  [Role: All ▼]  [Search: _____________ 🔍]  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ SESSION TIMELINE ───────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ● Apr 3, 2026 ─────────────────────────────────────────     │   │
│  │                                                               │   │
│  │  ┌─ S-2026-04-03-005 ────────────────────────────────────┐   │   │
│  │  │  Prompt: 2.0.1 — "BSA — Acceptance Criteria"           │   │   │
│  │  │  Role: Business Systems Analyst                        │   │   │
│  │  │  Status: ✅ complete | Files changed: 4                 │   │   │
│  │  │  Summary: "Refined acceptance criteria for all epics…" │   │   │
│  │  │  [▼ Expand Details]                                    │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌─ S-2026-04-03-004 ────────────────────────────────────┐   │   │
│  │  │  Prompt: 1.0.3 — "Architect — ADR Decisions"           │   │   │
│  │  │  Role: Software Architect                              │   │   │
│  │  │  Status: ✅ complete | Files changed: 2                 │   │   │
│  │  │  Summary: "Created ADR-003 UI architecture…"           │   │   │
│  │  │  [▼ Expand Details]                                    │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ● Apr 2, 2026 ─────────────────────────────────────────     │   │
│  │                                                               │   │
│  │  ┌─ S-2026-04-02-003 (EXPANDED) ─────────────────────────┐   │   │
│  │  │  Prompt: 1.0.2 — "PM — Epics Refinement"              │   │   │
│  │  │  Role: Product Manager                                 │   │   │
│  │  │  Status: ✅ complete | Files changed: 1                 │   │   │
│  │  │  Summary: "Refined epics with stories and tasks…"      │   │   │
│  │  │  ── Full Details ──────────────────────────────────    │   │   │
│  │  │  Changed Files:                                        │   │   │
│  │  │    • agents/epics/project-manager-dashboard-epics.md   │   │   │
│  │  │  Files Removed: (none)                                 │   │   │
│  │  │  Tests Run: (none)                                     │   │   │
│  │  │  Blockers: (none)                                      │   │   │
│  │  │  Decisions Made:                                       │   │   │
│  │  │    • Split E1 into 6 stories with explicit ACs         │   │   │
│  │  │  Next Recommended: 2.0.1                               │   │   │
│  │  │  [View Handoff File →]  [View Prompt →]                │   │   │
│  │  │  [▲ Collapse]                                          │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ● Apr 1, 2026 ─────────────────────────────────────────     │   │
│  │  …                                                           │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  (When no sessions: "No sessions completed yet")                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sessions — Design Rationale

- **Timeline layout grouped by date:** Provides chronological narrative of project execution. Date headers act as visual anchors.
- **Card-per-session:** Each card shows the minimum context needed (prompt, role, status, file count, summary). Expand reveals full handoff data.
- **Newest first:** Most relevant sessions are at top.
- **Expand/collapse:** Avoids information overload while keeping full details accessible.
- **Cross-links:** "View Prompt" opens the prompt detail drawer; "View Handoff File" shows raw file path.
- **Virtual scroll or pagination:** For 50+ sessions, implement virtual scrolling to prevent DOM bloat, or paginate in groups of 25.

---

## 6. View 5 — Tasks

Route: `/tasks`

The Tasks view is an epic → story → task tree focused on task-level status and completion rollups.

```
┌─────────────────────────────────────────────────────────────────────┐
│  TASKS                                                               │
│                                                                      │
│  ┌─ FILTER BAR ─────────────────────────────────────────────────┐   │
│  │  [Status: All ▼]  [Epic: All ▼]  [Search: _____________ 🔍]  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ TASK TREE ──────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ▼ E1: Repo Data Contracts and Parsing Foundation   60%      │   │
│  │  │                                                           │   │
│  │  ├─ ▼ E1-S1: Define prompt frontmatter contract     100%    │   │
│  │  │  │                                                        │   │
│  │  │  ├── E1-S1-T1: Define canonical YAML schema      [done]  │   │
│  │  │  │   Prompts: 5.0.1 (done)                               │   │
│  │  │  │   Last updated: Apr 2                                  │   │
│  │  │  │                                                        │   │
│  │  │  ├── E1-S1-T2: Implement validator               [done]  │   │
│  │  │  │   Prompts: 5.0.2 (done)                               │   │
│  │  │  │   Last updated: Apr 2                                  │   │
│  │  │  │                                                        │   │
│  │  │  └── E1-S1-T3: Create example files              [done]  │   │
│  │  │      Prompts: 5.0.3 (done)                               │   │
│  │  │      Last updated: Apr 3                                  │   │
│  │  │                                                           │   │
│  │  ├─ ▶ E1-S2: Define handoff contract                  0%    │   │
│  │  │    (collapsed — 3 tasks)                                  │   │
│  │  │                                                           │   │
│  │  ├─ ▶ E1-S3: Build markdown parser                    0%    │   │
│  │  │    (collapsed — 5 tasks)                                  │   │
│  │  │                                                           │   │
│  │  ├─ ▶ E1-S4: Build prompt sort                        0%    │   │
│  │  ├─ ▶ E1-S5: Build dependency engine                  0%    │   │
│  │  └─ ▶ E1-S6: Build JSON emitter                       0%    │   │
│  │                                                               │   │
│  │  ▶ E2: Overview Dashboard Experience                    0%    │   │
│  │    (collapsed — 4 stories, 14 tasks)                         │   │
│  │                                                               │   │
│  │  ▶ E3: Epic / Story / Task Visibility                   0%   │   │
│  │  ▶ E4: Prompt Inventory and Session History             0%   │   │
│  │  ▶ E5: Refresh, Watchers, Multi-Project                 0%   │   │
│  │  ▶ E6: Review, Quality, Hardening                       0%   │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Legend:                                                             │
│  [done]=🟢  [in_progress]=🟡  [blocked]=🔴  [ready]=🔵             │
│  [draft]=⚪  [in_review]=🟣  [superseded]=~~muted~~                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Tasks — Design Rationale

- **Tree structure with indentation:** Mirrors the logical hierarchy (epic → story → task). Tree lines (├─, └─) provide visual grouping.
- **Collapse by default at story level:** Prevents overwhelming the user when there are 100+ tasks. Epics are expanded by default to show story-level progress.
- **Status badges inline:** Color-coded badges next to each task provide instant status recognition.
- **Prompt links on tasks:** The reverse index (task → prompt) is surfaced here, linking to the prompt drawer.
- **Completion rollups at every level:** Percentages bubble up per the business rules formulas.
- **Filter bar:** Consistent with other views. Filtering by status (e.g., "blocked") across the entire tree highlights problem areas.

---

## 7. Navigation Flow

### Primary Navigation

All five views are accessible from the sidebar at any time. The sidebar is always visible on desktop.

```
                    ┌──────────┐
                    │ Overview │ ← Landing page
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌────▼─────┐    ┌────▼─────┐
   │  Epics  │     │ Prompts  │    │ Sessions │
   └────┬────┘     └────┬─────┘    └──────────┘
        │               │
   ┌────▼────┐     ┌────▼─────────┐
   │  Tasks  │     │Prompt Drawer │
   └─────────┘     └──────────────┘
```

### Cross-View Navigation Patterns

| From | Action | Destination |
|---|---|---|
| Overview → Blockers panel item | Click blocker | Prompts view + detail drawer open |
| Overview → Next Prompt widget | Click "View Source" | Prompts view + detail drawer open |
| Overview → Recent Sessions row | Click session | Sessions view + card expanded |
| Overview → Chart (epic segment) | Click epic bar | Epics view filtered to that epic |
| Epics → Task row | Click task prompt link | Prompts view + detail drawer open |
| Epics → Story row | Click story | Expand story within Epics (same view) |
| Prompts → Table row | Click row | Detail drawer opens (same view) |
| Prompts → Drawer → Handoff link | Click handoff | Sessions view + card expanded |
| Prompts → Drawer → Prerequisite | Click prerequisite prompt ID | Drawer updates to show that prompt |
| Prompts → Drawer → Superseded link | Click superseding prompt | Drawer updates to show that prompt |
| Sessions → Card | Click "View Prompt" | Prompts view + detail drawer open |
| Tasks → Task prompt link | Click prompt ID | Prompts view + detail drawer open |
| Tasks → Epic heading | Click epic heading | Epics view filtered to that epic |
| Any view → Status bar warning count | Click count | Overview → Blockers panel scrolled into view |

### URL Structure

Each view corresponds to a clean URL for bookmarking and deep-linking:

- `/` — Overview
- `/epics` — Epics view
- `/epics?filter=E2` — Epics filtered to E2
- `/prompts` — Prompt Inventory
- `/prompts?id=3.0.1` — Prompt Inventory with drawer open for 3.0.1
- `/sessions` — Session History
- `/sessions?id=S-005` — Session with specific card expanded
- `/tasks` — Task Graph
- `/tasks?filter=blocked` — Tasks filtered to blocked status

---

## 8. Interaction Patterns

### 8.1 Drill-Down

- **Epics View:** Click epic → accordion expands to show stories. Click story → accordion expands to show tasks. This is in-place expansion, not page navigation.
- **Tasks View:** Same accordion-based drill-down. Epic → Story → Task.
- **Overview → Detail:** Clicking any entity on the Overview navigates to the relevant view with context pre-set (filter, expanded item, or drawer open).

### 8.2 Drawer Pattern

- **Trigger:** Click a prompt row in the Prompts table, or click a prompt link from any other view.
- **Behavior:** Drawer slides in from the right side, covering ~40% of the viewport width. The underlying content remains visible but dimmed/inactive.
- **Close:** Click the ✕ button, press Escape, or click the dimmed overlay area.
- **Focus trap:** When drawer is open, Tab cycles only within the drawer. Focus returns to the triggering element on close.
- **In-drawer navigation:** Clicking a prerequisite or superseded prompt ID within the drawer updates the drawer content in-place (no new drawer).
- **Scroll:** Drawer content is independently scrollable. Underlying table does not scroll.

### 8.3 Copy-to-Clipboard

- **Location:** Next Prompt widget (Overview) and Prompt Detail drawer.
- **Behavior:** Button labeled "📋 Copy to Clipboard" or "📋 Copy Prompt".
- **Feedback:** On success, button text changes to "✅ Copied!" for 2 seconds, then reverts. A toast notification is NOT used (avoids accessibility issues with transient messages).
- **Content:** Copies the full raw markdown text of the prompt (not the rendered HTML).

### 8.4 Expand/Collapse

- **Epics & Tasks views:** Chevron icons (▶ collapsed, ▼ expanded) indicate collapsible sections.
- **Sessions view:** "Expand Details" / "Collapse" button on each session card.
- **Keyboard:** Enter or Space toggles expand/collapse on focused accordion headers.
- **State persistence:** Expand/collapse state is ephemeral (resets on page navigation). Not persisted to localStorage.

### 8.5 Sorting

- **Prompts table:** Clickable column headers. Active sort column shows an arrow indicator (↑ or ↓). Default: natural prompt-ID ascending.
- **Sessions timeline:** Fixed sort (newest first). Not user-sortable.
- **Epics/Tasks:** Fixed order by epic ID. Not user-sortable.

### 8.6 Filtering

- **Filter dropdowns:** Appear in a filter bar above the content on Epics, Prompts, Sessions, and Tasks views.
- **Applied filters** are shown as removable chips/pills below the filter bar (e.g., "Status: blocked ✕").
- **URL sync:** Active filters are reflected in the URL query string for shareability.
- **Clear all:** A "Clear Filters" link resets all filters to defaults.

### 8.7 Refresh

- **Manual:** Click the ↻ Refresh button in the header. All views re-parse from repo files.
- **Auto (dev mode):** File watcher triggers re-parse on markdown file changes. Debounced at 500ms.
- **Loading state:** During refresh, a subtle loading bar appears at the top of the main content area (not a full-screen blocker). All views remain visible but display stale data until refresh completes.
- **Error state:** If parse fails, an inline error banner appears at the top of the main content area with an error message and "Retry" button. Previous data remains visible beneath.

### 8.8 Repo Selector

- **Location:** Header bar, always visible.
- **Trigger:** Click the repo name/path to open a dropdown.
- **Dropdown contents:** Text input for path entry, list of recent projects (up to 10), "Clear History" action.
- **On selection:** Capability detection runs. If compatible, full re-parse and view update. If not, error message listing missing required paths.

---

## 9. Accessibility Requirements

### 9.1 Keyboard Navigation

| Interaction | Key(s) | Behavior |
|---|---|---|
| Navigate sidebar items | Tab, Shift+Tab | Move focus through nav items |
| Activate sidebar item | Enter or Space | Navigate to the selected view |
| Navigate table rows | ↑ / ↓ arrows | Move focus between rows |
| Open prompt detail drawer | Enter on focused row | Open drawer for that prompt |
| Close drawer | Escape | Close drawer, return focus to triggering row |
| Expand/collapse accordion | Enter or Space | Toggle expand/collapse on focused header |
| Navigate within drawer | Tab | Cycle through interactive elements in drawer |
| Copy to clipboard | Enter or Space on Copy button | Execute copy action |
| Refresh | Enter or Space on Refresh button | Trigger re-parse |
| Filter dropdown | Enter to open, ↑/↓ to navigate, Enter to select | Standard combobox pattern |
| Pagination | Tab to page buttons, Enter to select | Navigate between pages |

### 9.2 Focus Management

- **Drawer open:** Focus moves to the first focusable element inside the drawer (the close button). A focus trap keeps Tab cycling within the drawer.
- **Drawer close:** Focus returns to the element that triggered the drawer (the table row or link).
- **Accordion expand:** Focus remains on the accordion header; newly revealed content is accessible by Tab.
- **Page navigation:** Focus moves to the main content heading (h1) of the new view.
- **Refresh complete:** Focus remains on the Refresh button. An `aria-live` region announces "Data refreshed successfully" or "Refresh failed: [reason]".
- **Filter applied:** Focus remains on the filter control. Result count is announced via `aria-live` region ("Showing 18 of 247 prompts").

### 9.3 ARIA Requirements

| Element | ARIA Attribute | Purpose |
|---|---|---|
| Sidebar | `role="navigation"`, `aria-label="Main navigation"` | Identifies the sidebar as the primary nav region |
| Summary cards | `role="status"`, `aria-label="[Metric] count: [N]"` | Makes metric values accessible to screen readers |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` | Conveys completion percentage |
| Health badge | `aria-label="Project health: On Track"` | Screen reader alternative to emoji/color |
| Charts | `aria-label="[Chart title]"`, `role="img"`, plus hidden data table | Charts must have text alternatives; a visually hidden data table provides full data access |
| Accordion headers | `aria-expanded="true/false"`, `aria-controls="[panel-id]"` | Communicates expand/collapse state |
| Accordion panels | `role="region"`, `aria-labelledby="[header-id]"` | Associates panel with its header |
| Prompt table | `role="table"`, sortable headers with `aria-sort="ascending/descending/none"` | Standard table semantics; sort state communicated |
| Status badges | `aria-label="Status: [status]"` | Color alone must not convey status |
| Drawer | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"` | Screen readers announce it as a modal dialog |
| Copy button | `aria-live="polite"` on feedback text | Announces "Copied!" to screen readers |
| Loading indicator | `role="alert"`, `aria-busy="true"` on content area | Announces loading state |
| Error banner | `role="alert"` | Announces error to screen readers immediately |
| Filter result count | `aria-live="polite"` | Announces filtered result count on change |

### 9.4 Color and Contrast

- All text must meet **WCAG 2.1 AA** minimum contrast ratios:
  - **Normal text (< 18px):** 4.5:1 against background
  - **Large text (≥ 18px bold or ≥ 24px):** 3:1 against background
- **Status badge colors** must not be the sole indicator of status. Each badge includes a text label (e.g., "done", "blocked") in addition to color.
- **Progress bars** must include a text percentage label visible to all users.
- **Chart segments** must be distinguishable without color (use patterns, labels, or a legend with distinct shapes in addition to color).
- **Focus indicators:** All focusable elements must show a visible focus ring (at least 2px solid, contrasting with the background). Do not rely on browser defaults — provide custom focus styles.
- **Link text:** All links must be distinguishable from surrounding text by more than color alone (underline or bold).

### 9.5 Motion and Animation

- Drawer slide-in animation should respect `prefers-reduced-motion`. If the user prefers reduced motion, the drawer should appear instantly without animation.
- Loading spinner/bar should not flash rapidly. Use a minimum display time of 300ms to avoid jarring flashes.
- No auto-playing animations or carousels.

---

## 10. UX Concerns and Recommendations

### 10.1 Information Overload on Overview

**Concern:** The Overview packs summary cards, progress bars, health badge, 4 charts, blockers panel, next prompt widget, and recent sessions into a single scrollable view. On smaller screens this requires significant scrolling.

**Recommendation:** Prioritize layout ordering so the most actionable content (health badge, blockers, next prompt) is above the fold. Charts can be placed in a collapsible "Analytics" section that defaults to collapsed on screens under 1280px wide.

### 10.2 Drawer vs. Full Page for Prompt Detail

**Concern:** The prompt detail drawer at ~40% viewport width may feel cramped for prompts with long markdown bodies, many prerequisites, and full handoff data.

**Recommendation:** Support a "Pop Out" action on the drawer that converts it to a full-width page view (`/prompts/3.0.1`). The default should remain a drawer for quick glances, with the option to expand for deep reading.

### 10.3 Epics and Tasks View Overlap

**Concern:** The Epics view (epic → story → task drill-down) and the Tasks view (same tree) present overlapping information. Users may be confused about which to use.

**Recommendation:** Differentiate the views clearly:
- **Epics view** should emphasize story-level planning and progress (who owns what, what's next in each epic). Show story descriptions and acceptance criteria summaries.
- **Tasks view** should emphasize task-level execution (individual work items, their status, and linked prompts). This is the "work queue" view.
- Add subtitle text under each nav item to clarify: "Epics — Planning & Progress" and "Tasks — Execution & Status".

### 10.4 Scalability of Accordion Trees

**Concern:** With 6 epics × 4+ stories × 3+ tasks, the fully expanded tree in Epics or Tasks view would be 100+ lines. Expanding all levels simultaneously would be unusable.

**Recommendation:** Limit expansion to one level at a time by default. Provide an "Expand All" toggle for power users, but warn that it may produce a long list. Consider a breadcrumb-style focused view: clicking a story zooms in to show only that story's tasks, with a back arrow to return.

### 10.5 Session Timeline Performance

**Concern:** At 50+ sessions, rendering all session cards with full detail could degrade performance and make scrolling unwieldy.

**Recommendation:** Use virtual scrolling or pagination (25 per page). Only render expanded card content when the user clicks "Expand" — use lazy rendering.

### 10.6 Copy-to-Clipboard UX

**Concern:** The copy action is critical (primary workflow: copy prompt → paste into Copilot). If it fails silently, users lose trust.

**Recommendation:** Always provide explicit visual and accessible feedback. If clipboard API is unavailable (some browsers, HTTP contexts), fall back to selecting the text in the text area with instructions "Press Ctrl+C to copy". Never silently fail.

### 10.7 Multi-Repo Switching Context Loss

**Concern:** When switching repos, all current view state (expanded accordions, open drawer, scroll position, active filters) is lost. This could be jarring.

**Recommendation:** Show a confirmation dialog when switching repos: "Switch to [new repo]? Current view state will be reset." Save the last-viewed state per repo in localStorage so returning to a previously loaded repo restores approximate context.

### 10.8 Empty States

**Concern:** A newly created project from the boilerplate will have zero completed prompts, zero sessions, and minimal data. Multiple empty panels could feel broken.

**Recommendation:** Design clear, friendly empty states for every panel and view:
- Summary cards: Show "0" values, not blank cards
- Charts: Show placeholder with "No data yet — complete your first prompt to see charts"
- Blockers: "✅ No issues found"
- Next Prompt: Show the first eligible prompt (likely 1.0.1)
- Sessions: "No sessions completed yet"
- Tables: "No prompts match your filters" or "No prompts yet"

### 10.9 Status Badge Consistency

**Concern:** Status badges appear across all five views (overview, epics, prompts, sessions, tasks). Inconsistent colors or labels between views would erode trust.

**Recommendation:** Define a single, canonical badge component with fixed color/label mappings used in all views:
- `draft` → gray / ⚪
- `ready` → blue / 🔵
- `in_progress` → yellow / 🟡
- `in_review` → purple / 🟣
- `blocked` → red / 🔴
- `done` → green / 🟢
- `superseded` → muted/strikethrough
- `cancelled` → muted/strikethrough

### 10.10 No Mobile-First Design

**Concern:** ADR-003 specifies desktop-first. While reasonable for the primary use case (developer workstation), a human sponsor may check the dashboard from a tablet or phone.

**Recommendation:** Ensure the responsive breakpoints (documented in ADR-003) are implemented. The mobile experience doesn't need to be optimized, but it must not be broken. Tables should switch to a stacked card layout on narrow screens. The sidebar collapses to a hamburger. The prompt detail drawer becomes a full-screen modal on mobile.

---

## Appendix A: Status Badge Color Map

| Status | Background | Text | Icon | Contrast Ratio (est.) |
|---|---|---|---|---|
| `draft` | `#E5E7EB` (gray-200) | `#374151` (gray-700) | ⚪ | ~7:1 ✅ |
| `ready` | `#DBEAFE` (blue-100) | `#1E40AF` (blue-800) | 🔵 | ~7:1 ✅ |
| `in_progress` | `#FEF3C7` (amber-100) | `#92400E` (amber-800) | 🟡 | ~7:1 ✅ |
| `in_review` | `#EDE9FE` (violet-100) | `#5B21B6` (violet-800) | 🟣 | ~6:1 ✅ |
| `blocked` | `#FEE2E2` (red-100) | `#991B1B` (red-800) | 🔴 | ~7:1 ✅ |
| `done` | `#D1FAE5` (green-100) | `#065F46` (green-800) | 🟢 | ~6:1 ✅ |
| `superseded` | `#F3F4F6` (gray-100) | `#9CA3AF` (gray-400) | ~~ | ~3:1 (large text OK) |
| `cancelled` | `#F3F4F6` (gray-100) | `#9CA3AF` (gray-400) | ~~ | ~3:1 (large text OK) |

All active statuses meet WCAG AA for normal text. Superseded/cancelled use reduced contrast intentionally (de-emphasized) but must still meet 3:1 for the text size used (≥ 18px bold).

---

## Appendix B: Wireframe Summary Table

| View | Route | Primary Content | Key Interactions |
|---|---|---|---|
| Overview | `/` | Metrics, charts, blockers, next prompt, recent sessions | Click-through to other views, copy prompt |
| Epics | `/epics` | Epic → Story → Task accordion | Expand/collapse, filter by status |
| Prompts | `/prompts` | Sortable/filterable prompt table | Sort, filter, click-to-open drawer |
| Sessions | `/sessions` | Chronological session timeline | Expand session detail, cross-link to prompt |
| Tasks | `/tasks` | Epic → Story → Task tree with badges | Expand/collapse, filter, click prompt link |
