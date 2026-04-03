# ADR-003: UI Architecture and View Layout

## Status
Proposed

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
