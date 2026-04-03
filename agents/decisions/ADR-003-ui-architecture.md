# ADR-003: UI Architecture and View Layout

## Status
Approved (Architect Review — 2026-04-03)

## Architect Review Notes

**Verdict: Approved**

The UI architecture is well-structured and directly maps to the five PRD views (Overview, Epics, Prompt Inventory, Session History, Task Graph). Key strengths:

1. **Application shell** (header, sidebar nav, main content, status bar) provides a clean navigation model consistent with PRD Section 11.
2. **State management** (React Context + useReducer) is appropriate for v1's single-user, read-only model (Assumption A10). Migration path to Zustand/Redux is acknowledged for v2.
3. **No external component library** keeps bundle lean and avoids design system lock-in. Tailwind utility classes are sufficient for the dashboard's UI patterns.
4. **File-based routing** via Next.js maps cleanly to the five views.
5. **Desktop-first responsive strategy** is correct given the primary workstation use case.

**Observations and recommendations:**

1. **Error boundaries:** Each view should be wrapped in a React error boundary so that a rendering failure in one view (e.g., malformed chart data) does not crash the entire application. This is critical for the graceful degradation principle (ADR-002 Rule 1).

2. **Loading and empty states:** The architecture should specify loading states (during parser execution) and empty states (no data found, new project). These are common UX gaps that surface late in development.

3. **Accessibility:** The sidebar navigation and interactive elements (drawer, expandable rows, copy-to-clipboard) must meet WCAG 2.1 AA. Epic E6-S4 covers this but the architecture should note it as a cross-cutting concern.

4. **Status badge color mapping:** The canonical 8-status model (PRD Section 12) should be centralized as a theme constant rather than hardcoded per component. Recommended: a `STATUS_THEME` map exported from a shared constants module.

5. **Prompt detail drawer:** The slide-in drawer pattern is good for the prompt inventory view but should specify keyboard navigation (Escape to close, focus trap). This supports both accessibility and power-user efficiency.

6. **Chart empty states:** When no sessions exist or an epic has no tasks, charts should display meaningful empty states rather than rendering empty axes. Data contract specifies "gaps produce flat lines, not interpolation."

7. **File watcher integration:** The architecture should specify that the file watcher (chokidar, from ADR-001) triggers a re-parse and state update through the same Context provider, ensuring all views reactively update. The 500ms debounce (E5-S2) should be documented here as a cross-cutting performance constraint.

## Context
The dashboard SPA needs a clear view structure, navigation model, and component architecture that supports the five primary views defined in the PRD (Overview, Epics, Prompt Inventory, Session History, Task Graph).

## Decision

### Application Shell

```
┌──────────────────────────────────────────────────────┐
│  Header: Project Name  |  Repo Selector  |  Refresh │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  Sidebar   │  Main Content Area                      │
│  Nav       │                                         │
│            │  (View-specific content)                │
│  Overview  │                                         │
│  Epics     │                                         │
│  Prompts   │                                         │
│  Sessions  │                                         │
│  Tasks     │                                         │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  Status Bar: Last parsed | File count | Warnings     │
└──────────────────────────────────────────────────────┘
```

### View Breakdown

#### 1. Overview View (`/`)
- Project summary cards (metrics grid)
- Chart panels (epic completion, prompt status, session throughput)
- Blockers & warnings panel
- Next prompt widget

#### 2. Epics View (`/epics`)
- Epic table/cards with progress bars
- Click-to-expand story breakdown
- Story → task drill-down

#### 3. Prompt Inventory View (`/prompts`)
- Sortable/filterable prompt table
- Prompt detail drawer (slides in from right)
- Prompt body rendered as markdown

#### 4. Session History View (`/sessions`)
- Chronological session timeline
- Expandable session detail cards
- Links to associated prompt and handoff files

#### 5. Task Graph View (`/tasks`)
- Epic → Story → Task tree
- Status badges with canonical colors
- Completion rollup percentages

### State Management
- **Global state:** Parsed `DashboardState` object loaded once, refreshed on demand
- **No external state management library in v1** — React context + useReducer is sufficient
- **State flow:** Parser output → React context provider → view components consume via hooks

### Component Library Approach
- No external component library (Material UI, Ant Design, etc.)
- Build minimal, purpose-built components using Tailwind CSS utility classes
- Keeps bundle small, avoids design system lock-in, maximizes agent control

### Routing
- Next.js file-based routing (pages directory or app directory)
- Five top-level routes matching the five views

### Responsive Design
- Desktop-first layout (primary use case is developer workstation)
- Sidebar collapses to hamburger menu on narrow viewports
- Charts and tables scroll horizontally on small screens

## Consequences
- UI is lightweight and purpose-built for this dashboard
- No component library dependency to manage or upgrade
- Tailwind provides consistent styling without custom CSS files
- React context is sufficient for v1 but may need migration to Zustand/Redux if state grows in v2
