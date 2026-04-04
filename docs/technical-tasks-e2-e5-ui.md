# Technical Task Specifications — Epics E2–E5: UI Components and Views

> **Author Role:** Solution Architect
> **Prompt:** 10.0.1
> **Date:** 2026-04-03
> **Status:** Complete
> **Epics:** E2, E3, E4, E5
> **Stories:** E2-S1 through E5-S4
> **Total Tasks Specified:** 55

---

## Table of Contents

1. [UI Component Folder Structure](#1-ui-component-folder-structure)
2. [Page / Route Structure](#2-page--route-structure)
3. [Shared Component Contracts](#3-shared-component-contracts)
4. [State Management and Data Flow](#4-state-management-and-data-flow)
5. [E2-S1: Build Project Summary Cards](#5-e2-s1-build-project-summary-cards)
6. [E2-S2: Build Overall Progress Charts](#6-e2-s2-build-overall-progress-charts)
7. [E2-S3: Build Blockers and Warnings Panel](#7-e2-s3-build-blockers-and-warnings-panel)
8. [E2-S4: Build Next Prompt Widget](#8-e2-s4-build-next-prompt-widget)
9. [E3-S1: Build Epic Overview Table/Cards](#9-e3-s1-build-epic-overview-tablecards)
10. [E3-S2: Build Story Drill-Down Within Epic](#10-e3-s2-build-story-drill-down-within-epic)
11. [E3-S3: Build Task Tree and Status Badges](#11-e3-s3-build-task-tree-and-status-badges)
12. [E3-S4: Build Latest Update Summaries for Each Node](#12-e3-s4-build-latest-update-summaries-for-each-node)
13. [E4-S1: Build Prompt Inventory Table](#13-e4-s1-build-prompt-inventory-table)
14. [E4-S2: Build Prompt Detail Drawer/Page](#14-e4-s2-build-prompt-detail-drawerpage)
15. [E4-S3: Build Session Timeline/History View](#15-e4-s3-build-session-timelinehistory-view)
16. [E4-S4: Link Prompts to Changed Files and Handoffs](#16-e4-s4-link-prompts-to-changed-files-and-handoffs)
17. [E5-S1: Build Refresh/Reparse Flow](#17-e5-s1-build-refreshreparse-flow)
18. [E5-S2: Add Local File Watch Support](#18-e5-s2-add-local-file-watch-support)
19. [E5-S3: Add Repo Selector for Compatible Projects](#19-e5-s3-add-repo-selector-for-compatible-projects)
20. [E5-S4: Persist Recent Project Selections Locally](#20-e5-s4-persist-recent-project-selections-locally)
21. [Cross-Cutting UI Concerns](#21-cross-cutting-ui-concerns)

---

## 1. UI Component Folder Structure

All UI code resides in `dashboard/src/` within the dashboard project directory. Components follow the Next.js App Router convention (ADR-003, operational review).

```
dashboard/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout — renders AppShell
│   │   ├── page.tsx                  # Overview view (/)
│   │   ├── epics/
│   │   │   └── page.tsx              # Epics view (/epics)
│   │   ├── prompts/
│   │   │   └── page.tsx              # Prompts view (/prompts)
│   │   ├── sessions/
│   │   │   └── page.tsx              # Sessions view (/sessions)
│   │   └── tasks/
│   │       └── page.tsx              # Tasks view (/tasks)
│   ├── components/
│   │   ├── shell/                    # Application shell
│   │   │   ├── AppShell.tsx          # Wraps header + sidebar + content + status bar
│   │   │   ├── Header.tsx            # Project name, repo selector, refresh button
│   │   │   ├── Sidebar.tsx           # Five-item nav with icons
│   │   │   └── StatusBar.tsx         # Last parsed, file count, warning count
│   │   ├── shared/                   # Reusable components across views
│   │   │   ├── StatusBadge.tsx       # Canonical 8-status badge
│   │   │   ├── ProgressBar.tsx       # Percentage bar with label
│   │   │   ├── ErrorBoundary.tsx     # React error boundary per view
│   │   │   ├── EmptyState.tsx        # Configurable empty-state message
│   │   │   ├── LoadingIndicator.tsx  # Top-bar loading indicator
│   │   │   ├── FilterBar.tsx         # Multi-dimension filter controls
│   │   │   ├── FilterChip.tsx        # Removable applied-filter pill
│   │   │   ├── CopyButton.tsx        # Copy-to-clipboard with feedback
│   │   │   └── Pagination.tsx        # Page navigation control
│   │   ├── overview/                 # Overview view (/overview)
│   │   │   ├── SummaryCard.tsx       # Individual metric card
│   │   │   ├── SummaryCardsGrid.tsx  # Grid of summary cards
│   │   │   ├── HealthBadge.tsx       # On Track / At Risk / Blocked / Not Started
│   │   │   ├── OverallProgressBar.tsx# Dual scope + execution bars
│   │   │   ├── EpicCompletionChart.tsx
│   │   │   ├── PromptStatusChart.tsx
│   │   │   ├── SessionThroughputChart.tsx
│   │   │   ├── RemainingPromptsChart.tsx
│   │   │   ├── BlockersWarningsPanel.tsx
│   │   │   ├── NextPromptWidget.tsx
│   │   │   └── RecentSessionsList.tsx
│   │   ├── epics/                    # Epics view (/epics)
│   │   │   ├── EpicAccordion.tsx     # Expandable epic with stories
│   │   │   ├── EpicCard.tsx          # Epic summary row
│   │   │   ├── StoryRow.tsx          # Story within epic accordion
│   │   │   ├── TaskList.tsx          # Task list within story
│   │   │   └── UpdateSummary.tsx     # Inline last-update text
│   │   ├── prompts/                  # Prompts view (/prompts)
│   │   │   ├── PromptTable.tsx       # Full inventory table
│   │   │   ├── PromptTableRow.tsx    # Individual row
│   │   │   ├── PromptDetailDrawer.tsx# Slide-in detail drawer
│   │   │   ├── PromptMetadata.tsx    # Metadata section in drawer
│   │   │   └── MarkdownRenderer.tsx  # XSS-safe markdown rendering
│   │   ├── sessions/                 # Sessions view (/sessions)
│   │   │   ├── SessionTimeline.tsx   # Full timeline with date groups
│   │   │   ├── SessionCard.tsx       # Collapsed session entry
│   │   │   └── SessionDetail.tsx     # Expanded session content
│   │   └── tasks/                    # Tasks view (/tasks)
│   │       ├── TaskTree.tsx          # Full epic→story→task tree
│   │       ├── TaskTreeNode.tsx      # Single tree node (any level)
│   │       └── TaskPromptLinks.tsx   # Prompt links on task nodes
│   ├── hooks/
│   │   ├── useDashboard.ts          # Context consumer hook
│   │   ├── useFilterState.ts        # URL-synced filter/search state
│   │   ├── useCopyToClipboard.ts    # Clipboard API with fallback
│   │   ├── usePagination.ts         # Pagination state management
│   │   ├── useDrawer.ts             # Open/close + focus trap
│   │   └── useAccordion.ts          # Expand/collapse state
│   ├── context/
│   │   └── DashboardContext.tsx      # React Context + useReducer provider
│   ├── constants/
│   │   ├── statusTheme.ts           # STATUS_THEME map (colors, labels, icons)
│   │   └── routes.ts                # Route path constants
│   ├── lib/
│   │   └── chartConfig.ts           # Chart.js defaults and helpers
│   ├── types/
│   │   └── index.ts                 # Re-exports from parser/types.ts
│   └── parser/                      # (from E1 technical tasks — unchanged)
│       └── ...
├── tests/
│   ├── components/
│   │   ├── shell/
│   │   │   ├── AppShell.test.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── Sidebar.test.tsx
│   │   │   └── StatusBar.test.tsx
│   │   ├── shared/
│   │   │   ├── StatusBadge.test.tsx
│   │   │   ├── ProgressBar.test.tsx
│   │   │   ├── ErrorBoundary.test.tsx
│   │   │   ├── EmptyState.test.tsx
│   │   │   ├── CopyButton.test.tsx
│   │   │   ├── FilterBar.test.tsx
│   │   │   └── Pagination.test.tsx
│   │   ├── overview/
│   │   │   ├── SummaryCard.test.tsx
│   │   │   ├── SummaryCardsGrid.test.tsx
│   │   │   ├── HealthBadge.test.tsx
│   │   │   ├── EpicCompletionChart.test.tsx
│   │   │   ├── PromptStatusChart.test.tsx
│   │   │   ├── BlockersWarningsPanel.test.tsx
│   │   │   └── NextPromptWidget.test.tsx
│   │   ├── epics/
│   │   │   ├── EpicAccordion.test.tsx
│   │   │   ├── StoryRow.test.tsx
│   │   │   └── TaskList.test.tsx
│   │   ├── prompts/
│   │   │   ├── PromptTable.test.tsx
│   │   │   ├── PromptDetailDrawer.test.tsx
│   │   │   └── MarkdownRenderer.test.tsx
│   │   ├── sessions/
│   │   │   ├── SessionTimeline.test.tsx
│   │   │   └── SessionCard.test.tsx
│   │   └── tasks/
│   │       ├── TaskTree.test.tsx
│   │       └── TaskTreeNode.test.tsx
│   ├── hooks/
│   │   ├── useDashboard.test.ts
│   │   ├── useFilterState.test.ts
│   │   ├── useCopyToClipboard.test.ts
│   │   └── useDrawer.test.ts
│   └── e2e/
│       ├── overview.spec.ts
│       ├── epics.spec.ts
│       ├── prompts.spec.ts
│       ├── sessions.spec.ts
│       └── tasks.spec.ts
└── ...
```

---

## 2. Page / Route Structure

Next.js App Router file-based routing maps to the five views defined in ADR-003 and the wireframes:

| Route | File | View | Description |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Overview | Landing page with metrics, charts, blockers, next prompt |
| `/epics` | `src/app/epics/page.tsx` | Epics | Epic → Story → Task accordion hierarchy |
| `/prompts` | `src/app/prompts/page.tsx` | Prompts | Sortable/filterable prompt inventory table + detail drawer |
| `/sessions` | `src/app/sessions/page.tsx` | Sessions | Chronological session timeline |
| `/tasks` | `src/app/tasks/page.tsx` | Tasks | Epic → Story → Task tree with status badges |

### URL Query Parameters

| View | Parameter | Example | Purpose |
|---|---|---|---|
| Epics | `filter` | `/epics?filter=E2` | Filter to specific epic |
| Epics | `status` | `/epics?status=blocked` | Filter by status |
| Prompts | `id` | `/prompts?id=3.0.1` | Open drawer for specific prompt |
| Prompts | `status` | `/prompts?status=ready` | Filter by status |
| Prompts | `epic` | `/prompts?epic=E2` | Filter by epic |
| Prompts | `location` | `/prompts?location=archive` | Toggle active/archive |
| Prompts | `role` | `/prompts?role=Engineer` | Filter by role |
| Prompts | `q` | `/prompts?q=parser` | Keyword search |
| Sessions | `id` | `/sessions?id=S-005` | Expand specific session |
| Sessions | `role` | `/sessions?role=Architect` | Filter by role |
| Tasks | `status` | `/tasks?status=blocked` | Filter by status |
| Tasks | `epic` | `/tasks?epic=E1` | Filter to specific epic |

### Root Layout (`src/app/layout.tsx`)

The root layout wraps all pages in the `DashboardProvider` context and the `AppShell` component:

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DashboardProvider>
          <AppShell>{children}</AppShell>
        </DashboardProvider>
      </body>
    </html>
  );
}
```

---

## 3. Shared Component Contracts

### 3.1 StatusBadge

**File:** `dashboard/src/components/shared/StatusBadge.tsx`

```typescript
interface StatusBadgeProps {
  status: PromptStatus;
  size?: 'sm' | 'md';  // sm for tables, md for detail views
}
```

Uses the centralized `STATUS_THEME` map from `dashboard/src/constants/statusTheme.ts`:

```typescript
// dashboard/src/constants/statusTheme.ts
interface StatusThemeEntry {
  bg: string;          // Tailwind background class
  text: string;        // Tailwind text color class
  label: string;       // Display label
  icon: string;        // Emoji or icon identifier
}

const STATUS_THEME: Record<PromptStatus, StatusThemeEntry> = {
  draft:       { bg: 'bg-gray-200',    text: 'text-gray-700',   label: 'Draft',       icon: '⚪' },
  ready:       { bg: 'bg-blue-100',    text: 'text-blue-800',   label: 'Ready',       icon: '🔵' },
  in_progress: { bg: 'bg-amber-100',   text: 'text-amber-800',  label: 'In Progress', icon: '🟡' },
  in_review:   { bg: 'bg-violet-100',  text: 'text-violet-800', label: 'In Review',   icon: '🟣' },
  blocked:     { bg: 'bg-red-100',     text: 'text-red-800',    label: 'Blocked',     icon: '🔴' },
  done:        { bg: 'bg-green-100',   text: 'text-green-800',  label: 'Done',        icon: '🟢' },
  superseded:  { bg: 'bg-gray-100',    text: 'text-gray-400',   label: 'Superseded',  icon: '——' },
  cancelled:   { bg: 'bg-gray-100',    text: 'text-gray-400',   label: 'Cancelled',   icon: '——' },
};
```

Badge renders: `<span>` with appropriate background/text color, text label, and `aria-label="Status: {label}"`. Superseded and cancelled statuses render with `line-through` text decoration.

### 3.2 ProgressBar

**File:** `dashboard/src/components/shared/ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  percent: number;       // 0–100
  label?: string;        // e.g., "Epic Completion"
  showPercentText?: boolean; // Default true
}
```

Renders with `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`. Always displays the numeric percentage as visible text.

### 3.3 ErrorBoundary

**File:** `dashboard/src/components/shared/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  viewName: string;  // For error reporting context
}
```

Catches rendering errors within a view. Displays a fallback UI with the error message and a "Retry" button that re-mounts the children. Prevents one view from crashing the entire application (ADR-003 recommendation).

### 3.4 EmptyState

**File:** `dashboard/src/components/shared/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  title: string;       // e.g., "No prompts found"
  message?: string;    // e.g., "Complete your first prompt to see data here"
  icon?: string;       // Optional icon/emoji
}
```

### 3.5 LoadingIndicator

**File:** `dashboard/src/components/shared/LoadingIndicator.tsx`

```typescript
interface LoadingIndicatorProps {
  isLoading: boolean;
}
```

Renders a thin progress bar at the top of the main content area. Sets `aria-busy="true"` on the content region during loading. Minimum display time of 300ms per wireframe accessibility requirements.

### 3.6 FilterBar

**File:** `dashboard/src/components/shared/FilterBar.tsx`

```typescript
interface FilterDimension {
  key: string;           // e.g., 'status', 'epic', 'role'
  label: string;         // Display label
  options: string[];     // Available values (dynamic)
  defaultValue: string;  // Default selection (e.g., 'All')
}

interface FilterBarProps {
  dimensions: FilterDimension[];
  searchPlaceholder?: string;     // e.g., "Search prompts..."
  onFilterChange: (filters: Record<string, string>) => void;
  onSearchChange: (query: string) => void;
  activeFilters: Record<string, string>;
  searchQuery: string;
}
```

Renders filter dropdowns and a search input. Applied filters appear as removable `FilterChip` components below the bar. Syncs with URL query parameters via `useFilterState` hook.

### 3.7 CopyButton

**File:** `dashboard/src/components/shared/CopyButton.tsx`

```typescript
interface CopyButtonProps {
  content: string;       // Text to copy
  label?: string;        // Button label (default: "Copy to Clipboard")
  successLabel?: string; // Feedback label (default: "Copied!")
}
```

Uses `navigator.clipboard.writeText()`. On success, button text changes to successLabel for 2 seconds. If clipboard API unavailable, falls back to selecting text content with instructions. Feedback text uses `aria-live="polite"`.

### 3.8 Pagination

**File:** `dashboard/src/components/shared/Pagination.tsx`

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;   // Default 25
}
```

Keyboard-accessible page navigation buttons. Syncs with URL query parameter `page`.

---

## 4. State Management and Data Flow

### 4.1 DashboardContext

**File:** `dashboard/src/context/DashboardContext.tsx`

The global state provider wraps the entire application. It holds the parsed `DashboardState` and manages refresh actions.

```typescript
interface DashboardContextValue {
  state: DashboardState | null;
  isLoading: boolean;
  error: string | null;
  repoPath: string;
  lastParsedAt: string | null;
  refresh: () => Promise<void>;
  setRepoPath: (path: string) => Promise<void>;
}

type DashboardAction =
  | { type: 'PARSE_START' }
  | { type: 'PARSE_SUCCESS'; payload: DashboardState }
  | { type: 'PARSE_ERROR'; error: string }
  | { type: 'SET_REPO_PATH'; path: string };
```

**State flow:**
1. On mount (or repo change): dispatch `PARSE_START` → run parser → dispatch `PARSE_SUCCESS` or `PARSE_ERROR`
2. On refresh button click: same flow
3. On file watcher event (dev mode): debounced dispatch of `PARSE_START`

**Exports:**
- `DashboardProvider` — React Context provider component
- `useDashboard()` — Consumer hook returning `DashboardContextValue`

### 4.2 Custom Hooks

#### `useDashboard`

**File:** `dashboard/src/hooks/useDashboard.ts`

Convenience hook wrapping `useContext(DashboardContext)`. Throws a descriptive error if used outside `DashboardProvider`.

#### `useFilterState`

**File:** `dashboard/src/hooks/useFilterState.ts`

```typescript
interface UseFilterStateReturn {
  filters: Record<string, string>;
  searchQuery: string;
  setFilter: (key: string, value: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  clearFilter: (key: string) => void;
}
```

Reads initial filter values from URL query parameters. On change, updates both local state and URL (via `useSearchParams` + `useRouter`). Per business rules Section 7, search applies case-insensitive substring matching against metadata fields: `prompt_id`, `title`, `epic_id`, `story_id`, `owner_role`.

#### `useCopyToClipboard`

**File:** `dashboard/src/hooks/useCopyToClipboard.ts`

```typescript
interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}
```

Returns `copied` as `true` for 2 seconds after a successful copy. Falls back to text selection if clipboard API is unavailable.

#### `usePagination`

**File:** `dashboard/src/hooks/usePagination.ts`

```typescript
interface UsePaginationReturn<T> {
  page: T[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}
```

Accepts full array + page size, returns the current page slice. Syncs with URL `page` parameter.

#### `useDrawer`

**File:** `dashboard/src/hooks/useDrawer.ts`

```typescript
interface UseDrawerReturn {
  isOpen: boolean;
  selectedId: string | null;
  open: (id: string) => void;
  close: () => void;
  drawerRef: React.RefObject<HTMLDivElement>;
}
```

Manages drawer open/close state. Implements focus trap when open (Tab cycles within drawer). Escape key closes drawer. Returns focus to trigger element on close. Syncs `id` URL parameter for deep-linking.

#### `useAccordion`

**File:** `dashboard/src/hooks/useAccordion.ts`

```typescript
interface UseAccordionReturn {
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (id: string) => boolean;
}
```

Manages expand/collapse state for epic/story/task accordions. State is ephemeral (not persisted). Enter/Space toggles on focused headers.

---

## 5. E2-S1: Build Project Summary Cards

### E2-S1-T1: Create Summary Card UI Components

**Files:**
- `dashboard/src/components/overview/SummaryCard.tsx`
- `dashboard/src/components/overview/SummaryCardsGrid.tsx`
- `dashboard/src/components/overview/HealthBadge.tsx`
- `dashboard/src/components/overview/OverallProgressBar.tsx`

**SummaryCard props:**

```typescript
interface SummaryCardProps {
  label: string;        // e.g., "Epics", "Done", "Blocked"
  value: number;
  variant?: 'scope' | 'execution';  // Top row = scope, bottom row = execution
}
```

Renders: a card element with label, large numeric value, and `role="status"`, `aria-label="{label} count: {value}"`.

**SummaryCardsGrid props:**

```typescript
interface SummaryCardsGridProps {
  summary: SummaryMetrics;
  project: ProjectSummary;
}
```

Renders two rows of cards per wireframe Layout:
- **Row 1 (scope):** Epics, Stories, Tasks, Prompts
- **Row 2 (execution):** Done, In Progress, Blocked, Ready

Plus the dual progress bars (scope completion % and execution completion %) and the health badge.

**HealthBadge props:**

```typescript
interface HealthBadgeProps {
  status: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
}
```

Renders the single health indicator per business rules Section 9:
- On Track → green badge with "On Track"
- At Risk → yellow badge with "At Risk"
- Blocked → red badge with "Blocked"
- Not Started → gray badge with "Not Started"

Uses `aria-label="Project health: {status}"`.

**OverallProgressBar props:**

```typescript
interface OverallProgressBarProps {
  scopePercent: number;
  executionPercent: number;
}
```

Renders two labeled `ProgressBar` instances with "Scope" and "Execution" labels.

**Test requirements:**
- SummaryCard renders label and value correctly
- SummaryCard with value 0 → displays "0", not blank
- SummaryCardsGrid renders all 8 cards from SummaryMetrics
- SummaryCardsGrid with all zeros → no errors, all cards display 0
- HealthBadge renders correct color and label for each of the 4 states
- HealthBadge has correct `aria-label`
- OverallProgressBar renders two bars with correct percentages

---

### E2-S1-T2: Wire Summary Data from Parsed State to Card Components

**File:** `dashboard/src/app/page.tsx` (Overview view)

**Specification:**

The Overview page consumes `DashboardState` via `useDashboard()` and passes data to child components:

```typescript
// In page.tsx
const { state, isLoading, error } = useDashboard();

// Pass to SummaryCardsGrid
<SummaryCardsGrid summary={state.summary} project={state.project} />
```

Data mapping from `DashboardState` to card values:

| Card | Source |
|---|---|
| Epics | `state.project.totalEpics` |
| Stories | `state.project.totalStories` |
| Tasks | `state.project.totalTasks` |
| Prompts | `state.project.totalPrompts` |
| Done | `state.summary.completedPrompts` |
| In Progress | `state.summary.promptsByStatus.in_progress` |
| Blocked | `state.summary.blockedPrompts` |
| Ready | `state.summary.promptsByStatus.ready` |
| Scope % | `state.summary.scopeCompletionPercent` |
| Execution % | `state.summary.executionCompletionPercent` |
| Health | `state.project.healthStatus` |

**Test requirements:**
- Overview page renders SummaryCardsGrid when state is loaded
- Overview page shows LoadingIndicator when `isLoading` is true
- Overview page shows error banner when `error` is non-null
- All metric values propagate correctly from mock DashboardState

---

### E2-S1-T3: Write Component Tests for Summary Cards

**Files:**
- `dashboard/tests/components/overview/SummaryCard.test.tsx`
- `dashboard/tests/components/overview/SummaryCardsGrid.test.tsx`
- `dashboard/tests/components/overview/HealthBadge.test.tsx`

**Test scenarios:**

| Component | Scenario | Assertion |
|---|---|---|
| SummaryCard | Renders with label "Epics" and value 6 | Text "Epics" and "6" visible |
| SummaryCard | Value is 0 | Text "0" visible, no layout break |
| SummaryCard | Large value (1000) | Renders correctly |
| SummaryCard | Has `role="status"` | ARIA role present |
| SummaryCardsGrid | Full metrics data | All 8 cards rendered with correct values |
| SummaryCardsGrid | All zero metrics | 8 cards with "0" values, no errors |
| SummaryCardsGrid | Dual progress bars rendered | Both scope and execution bars visible |
| HealthBadge | Status "on_track" | Green badge, text "On Track" |
| HealthBadge | Status "at_risk" | Yellow badge, text "At Risk" |
| HealthBadge | Status "blocked" | Red badge, text "Blocked" |
| HealthBadge | Status "not_started" | Gray badge, text "Not Started" |
| HealthBadge | Accessibility | `aria-label` contains status text |

---

## 6. E2-S2: Build Overall Progress Charts

### E2-S2-T1: Select and Integrate Chart Library

**Files:**
- `dashboard/src/lib/chartConfig.ts`
- `dashboard/package.json` (dependencies)

**Specification:**

Install `chart.js` and `react-chartjs-2` per ADR-001:

```bash
npm install chart.js react-chartjs-2
```

Create a chart configuration module that:
1. Registers required Chart.js components (CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, TimeScale, Tooltip, Legend)
2. Sets global defaults for Chart.js (font family matching Tailwind default, responsive: true, maintainAspectRatio: false)
3. Exports helper functions for consistent chart option construction

```typescript
// dashboard/src/lib/chartConfig.ts
export function registerChartDefaults(): void;
export function getChartColors(): Record<PromptStatus, string>;
export function createEmptyChartFallback(message: string): ChartData;
```

**Constraints:**
- Chart.js must be lazy-loaded (dynamic import) to optimize initial bundle per architect recommendation
- Total bundle contribution from chart.js should not exceed ~60KB gzipped

**Test requirements:**
- `registerChartDefaults()` does not throw
- `getChartColors()` returns entries for all 8 statuses
- Chart.js registration succeeds with required components

---

### E2-S2-T2: Implement Epic Completion Chart

**File:** `dashboard/src/components/overview/EpicCompletionChart.tsx`

**Props:**

```typescript
interface EpicCompletionChartProps {
  epicCompletionPercents: Record<string, number>;  // From SummaryMetrics
  epics: ParsedEpic[];                             // For labels
}
```

**Specification:**

Renders a stacked bar or donut chart with one segment per epic, sized by `completion_percent`.

- Chart type: horizontal bar chart or donut (bar recommended for readability with 6 epics)
- Each bar/segment labeled with epic ID and title
- Values are 0–100 per epic
- Uses distinct colors per epic (not status colors — epic colors are a separate palette)
- On hover: tooltip showing "{epic title}: {percent}% complete"
- Empty state: when `epicCompletionPercents` is empty or all zeros, render `EmptyState` with "No epic data yet"
- Chart resizes responsively (Chart.js `responsive: true`)

**Exports:**
- `EpicCompletionChart` — React component

**Test requirements:**
- Renders chart with 6 epics at various completion percentages
- Renders empty state when no epics provided
- All epics at 0% → renders chart with empty bars (not broken)
- Single epic at 100% → renders filled bar
- Chart container has `role="img"` and `aria-label="Epic completion chart"`

---

### E2-S2-T3: Implement Prompt Status Distribution Chart

**File:** `dashboard/src/components/overview/PromptStatusChart.tsx`

**Props:**

```typescript
interface PromptStatusChartProps {
  promptsByStatus: Record<PromptStatus, number>;  // From SummaryMetrics
}
```

**Specification:**

Renders a donut/pie chart with one segment per status value.

- Chart type: doughnut
- Segment colors match `STATUS_THEME` from `statusTheme.ts`
- Only non-zero segments are shown (zero-count statuses are omitted from the chart)
- Center text: total prompt count
- On hover: tooltip showing "{status}: {count} ({percent}%)"
- Empty state: all counts zero → `EmptyState` with "No prompts found"
- Includes a hidden data table for screen reader accessibility (`<table>` with `className="sr-only"`)

**Test requirements:**
- Renders donut with correct segments for sample data (5 done, 10 ready, 2 blocked)
- Zero-count statuses not rendered as segments
- All zeros → renders empty state, not broken chart
- Hidden data table present with correct values
- Chart has `role="img"` and `aria-label`

---

### E2-S2-T4: Implement Session Throughput Timeline Chart

**File:** `dashboard/src/components/overview/SessionThroughputChart.tsx`

**Props:**

```typescript
interface SessionThroughputChartProps {
  completionTimeline: TimelineDataPoint[];  // From SummaryMetrics
}
```

**Specification:**

Renders a bar chart showing sessions completed per date (derived from `completionTimeline`).

- X-axis: dates (from `TimelineDataPoint.date`)
- Y-axis: incremental sessions completed on that date (derived: `cumulativeCompleted[n] - cumulativeCompleted[n-1]`)
- Gaps between dates produce no bars (not interpolation — per business rules Section 6.1)
- Empty state: no timeline data → `EmptyState` with "No sessions completed yet"
- Chart resizes responsively

**Test requirements:**
- Renders bars for 5 data points at different dates
- Gaps between dates do not produce interpolated bars
- Single data point → renders one bar
- Empty data → renders empty state
- Chart accessible with `role="img"` and `aria-label`

---

### E2-S2-T5: Write Visual Regression or Snapshot Tests for Charts

**Files:**
- `dashboard/tests/components/overview/EpicCompletionChart.test.tsx`
- `dashboard/tests/components/overview/PromptStatusChart.test.tsx`
- `dashboard/tests/components/overview/SessionThroughputChart.test.tsx`
- `dashboard/tests/components/overview/RemainingPromptsChart.test.tsx`

**Specification:**

Also implement the Remaining Prompts Over Time chart:

**RemainingPromptsChart props:**

```typescript
interface RemainingPromptsChartProps {
  completionTimeline: TimelineDataPoint[]; // From SummaryMetrics
}
```

Renders a line chart with:
- X-axis: dates
- Y-axis: `remainingPrompts` from `TimelineDataPoint`
- Line connects data points; gaps produce flat segments (no interpolation)
- Empty state handled

**Test scenarios for all charts:**

| Chart | Scenario | Assertion |
|---|---|---|
| EpicCompletion | Mock 6 epics, varied % | Chart canvas renders; no console errors |
| EpicCompletion | Empty epics | EmptyState rendered |
| PromptStatus | Mixed statuses | Canvas renders; hidden table matches data |
| PromptStatus | All zero | EmptyState rendered |
| SessionThroughput | 10 data points | Canvas renders |
| SessionThroughput | Empty timeline | EmptyState rendered |
| RemainingPrompts | Declining line | Canvas renders |
| RemainingPrompts | Empty timeline | EmptyState rendered |
| All charts | Responsive resize | No crash on container resize |

---

## 7. E2-S3: Build Blockers and Warnings Panel

### E2-S3-T1: Implement Blocker Aggregation from Parsed State

**File:** `dashboard/src/components/overview/BlockersWarningsPanel.tsx` (logic section)

**Specification:**

Extract blockers from `DashboardState`:

```typescript
interface BlockerItem {
  promptId: string;
  title: string;
  type: 'blocker' | 'error' | 'warning';
  message: string;
  sourcePath?: string;
}
```

Aggregation logic:
1. **Blocked prompts:** Filter `state.prompts` where `status === 'blocked'`. Message: prompt title.
2. **Done prompts with no handoff:** Filter `state.warnings` where `code === 'W_DONE_NO_HANDOFF'`.
3. **Parser errors:** Filter `state.warnings` where `severity === 'error'`.
4. **Parser warnings:** Filter `state.warnings` where `severity === 'warning'` (excluding `W_DONE_NO_HANDOFF` already listed).

Each item categorized by severity per business rules Section 4.5:
- `severity === 'error'` → type `'error'`
- `code === 'W_DONE_NO_HANDOFF'` or `code === 'W_PREREQ_NOT_FOUND'` → type `'warning'` (shown in blockers panel)
- Other warnings → type `'warning'`

**Test requirements:**
- 2 blocked prompts + 1 warning → 3 items aggregated
- Zero blockers and zero warnings → returns empty array
- W_DONE_NO_HANDOFF warning correctly mapped to blocker item
- Error-level warnings correctly mapped

---

### E2-S3-T2: Implement Warning Aggregation (Missing Handoffs, Invalid Metadata)

**File:** `dashboard/src/components/overview/BlockersWarningsPanel.tsx` (logic section)

**Specification:**

Extends the aggregation from T1 with additional warning categories:

| Warning Code | Display Category | Panel Section |
|---|---|---|
| `E_NO_FRONTMATTER` | Error | Errors section |
| `E_MISSING_REQUIRED` | Error | Errors section |
| `E_INVALID_YAML` | Error | Errors section |
| `W_DONE_NO_HANDOFF` | Warning | Warnings section |
| `W_PREREQ_NOT_FOUND` | Warning | Warnings section |
| `W_UNKNOWN_STATUS` | Warning | Warnings section |
| `W_FILE_NOT_IN_INDEX` | Warning | Warnings section |
| `W_OPTIONAL_MISSING` | Info (hidden by default) | Expandable info section |

Items are grouped by severity: errors first, warnings second, info collapsed.

**Test requirements:**
- Mixed warning codes correctly categorized
- Info-level items hidden by default
- Duplicate warning codes from same file deduplicated for display

---

### E2-S3-T3: Build Blockers/Warnings Panel UI Component

**File:** `dashboard/src/components/overview/BlockersWarningsPanel.tsx`

**Props:**

```typescript
interface BlockersWarningsPanelProps {
  prompts: ParsedPrompt[];
  warnings: ParseWarning[];
  healthStatus: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
  onPromptClick: (promptId: string) => void;  // Navigates to prompt detail
}
```

**Specification:**

Renders a panel with:
1. **Section header** with count: "Blockers & Warnings ({count})"
2. **Error items** (red indicator): blocked prompts and error-level parse results
3. **Warning items** (yellow indicator): done-no-handoff, unresolved prerequisites, unknown statuses
4. **Each item clickable** → calls `onPromptClick(promptId)` to open the prompt detail drawer
5. **Empty state:** "✅ No issues found" when zero blockers and zero warnings
6. **Health badge** displayed at the top of the panel per wireframe

**Interaction:**
- Click on any item → navigates to Prompts view with drawer open for that prompt (cross-view navigation per wireframe Section 7)
- Items show: severity icon (🔴 error, 🟡 warning), prompt ID, message text

**Accessibility:**
- Panel items are buttons with `role="button"` and descriptive `aria-label`
- Section uses `aria-live="polite"` to announce changes on refresh

**Test requirements:**
- 3 blockers rendered → 3 list items visible
- Empty state → "No issues found" message displayed
- Click blocker item → `onPromptClick` called with correct promptId
- Accessibility: items have `aria-label` with severity and message
- Health badge rendered at panel top

---

### E2-S3-T4: Write Tests for Blocker and Warning Detection Logic

**File:** `dashboard/tests/components/overview/BlockersWarningsPanel.test.tsx`

**Test scenarios:**

| Scenario | Input | Assertion |
|---|---|---|
| No blockers, no warnings | Empty prompts[], empty warnings[] | "No issues found" displayed |
| 2 blocked prompts | prompts with status=blocked | 2 blocker items rendered |
| 1 done prompt with W_DONE_NO_HANDOFF | warnings with that code | 1 warning item rendered |
| Mix of errors and warnings | 1 error + 2 warnings | Error listed first, then warnings |
| Click blocker | Click first item | `onPromptClick` called with correct ID |
| Health badge "blocked" | healthStatus="blocked" | Red badge visible |
| Health badge "on_track" | healthStatus="on_track" | Green badge visible |

---

## 8. E2-S4: Build Next Prompt Widget

### E2-S4-T1: Build Next-Prompt Widget UI Component

**File:** `dashboard/src/components/overview/NextPromptWidget.tsx`

**Props:**

```typescript
interface NextPromptWidgetProps {
  nextPrompt: NextPromptInfo | null;
  noEligibleRationale: string | null;  // From SummaryMetrics
  onViewSource: (promptId: string) => void;
}
```

**Specification:**

When `nextPrompt` is not null, render:
1. **Header:** "▶ Next: {promptId} — {title}"
2. **Role:** "Role: {ownerRole}"
3. **Rationale:** Human-readable rationale string (per business rules Section 3.3)
4. **Prerequisites:** List all prerequisites with check/cross icon and their current status
5. **Prompt body:** Scrollable text area (`<pre>` or markdown-rendered) containing the full prompt markdown content
6. **Copy button:** `CopyButton` with the raw markdown of the prompt body
7. **View Source link:** Clickable link showing `sourcePath`, calls `onViewSource(promptId)`

When `nextPrompt` is null:
1. Display `noEligibleRationale` text: "No prompts are currently eligible. {n} blocked, {m} awaiting prerequisites"

**Layout:** Per wireframe — prominent placement on the Overview view. Scrollable body area with fixed header and action buttons.

**Accessibility:**
- Scrollable area is focusable with `tabindex="0"` and `role="region"`, `aria-label="Prompt content"`
- Copy button follows `CopyButton` accessibility pattern
- View Source link is a standard anchor

**Test requirements:**
- Eligible prompt → renders header, role, rationale, body, buttons
- Null nextPrompt → renders no-eligible message with rationale
- Prerequisites list: 2 met, 1 unmet → correct icons displayed
- Body area is scrollable
- Accessibility: scrollable area has correct ARIA attributes

---

### E2-S4-T2: Implement Copy-to-Clipboard Functionality

**File:** `dashboard/src/hooks/useCopyToClipboard.ts` (shared hook, used by NextPromptWidget and PromptDetailDrawer)

**Specification:**

Already defined in Section 4.2. This task implements the hook:

1. `copy(text)` → writes to clipboard via `navigator.clipboard.writeText(text)`
2. On success → set `copied = true` for 2000ms, then reset
3. On failure (clipboard API unavailable) → fall back:
   - Create a temporary `<textarea>` element
   - Set its value to the text content
   - Select the text
   - Display instruction: "Press Ctrl+C to copy"
4. Never silently fail (per wireframe UX concern 10.6)

**Test requirements:**
- Successful copy → `copied` is true, resets after 2s
- Clipboard API unavailable → fallback executed (textarea created)
- Multiple rapid copies → last copy wins, timer resets

---

### E2-S4-T3: Wire Eligibility Engine Output to Widget

**File:** `dashboard/src/app/page.tsx` (Overview view)

**Specification:**

Wire the NextPromptWidget in the Overview page:

```typescript
const { state } = useDashboard();
const router = useRouter();

const handleViewSource = (promptId: string) => {
  router.push(`/prompts?id=${promptId}`);
};

<NextPromptWidget
  nextPrompt={state.nextPrompt}
  noEligibleRationale={state.summary.noEligibleRationale}
  onViewSource={handleViewSource}
/>
```

The widget only considers data from the parser's eligibility engine (`state.nextPrompt`). The widget does not re-compute eligibility client-side — it trusts the parser output.

**Test requirements:**
- Mock DashboardState with nextPrompt → widget renders prompt data
- Mock DashboardState with null nextPrompt → widget renders no-eligible message
- onViewSource navigates to `/prompts?id={promptId}`

---

### E2-S4-T4: Write Interaction Tests for Copy Action and Prerequisite Display

**File:** `dashboard/tests/components/overview/NextPromptWidget.test.tsx`

**Test scenarios:**

| Scenario | Action | Assertion |
|---|---|---|
| Eligible prompt displayed | Render with mock NextPromptInfo | Title, role, rationale visible |
| Copy button | Click copy | Clipboard writeText called with body content |
| Copy feedback | After copy | Button shows "Copied!" text |
| No eligible prompt | Render with null nextPrompt | No-eligible message displayed |
| Prerequisites: all met | 3 prerequisites all done | 3 green check icons |
| Prerequisites: some unmet | 2 met + 1 not done | 2 checks + 1 cross |
| View Source click | Click view source | onViewSource called with correct promptId |
| Scrollable body | Long prompt body | Scroll container present with overflow |
| Keyboard: copy | Focus copy button + Enter | Copy executed |

---

## 9. E3-S1: Build Epic Overview Table/Cards

### E3-S1-T1: Build Epic Table/Card UI Component

**Files:**
- `dashboard/src/components/epics/EpicCard.tsx`
- `dashboard/src/components/epics/EpicAccordion.tsx`

**EpicCard props:**

```typescript
interface EpicCardProps {
  epic: ParsedEpic;
  completionPercent: number;
  promptCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}
```

**Specification:**

EpicCard renders a single epic row/card showing:
- Chevron icon (▶ collapsed, ▼ expanded)
- Epic ID and title (e.g., "E1: Repo Data Contracts and Parsing Foundation")
- Story count, task count, prompt count
- Status badge (derived from story statuses)
- Completion progress bar with percentage
- Last update text (from `UpdateSummary`)

Card is clickable — clicking toggles expand/collapse via `onToggle`.

**EpicAccordion** wraps the list of EpicCards and their expanded content (story list):

```typescript
interface EpicAccordionProps {
  epics: ParsedEpic[];
  epicCompletionPercents: Record<string, number>;
  taskIndex: ReverseTaskIndex;
  onPromptClick: (promptId: string) => void;
}
```

Uses `useAccordion` hook for expand/collapse state. Renders each epic as an `EpicCard` with `StoryRow` children when expanded.

**Accessibility:**
- Accordion headers have `aria-expanded="true|false"`, `aria-controls="{panel-id}"`
- Panels have `role="region"`, `aria-labelledby="{header-id}"`
- Enter/Space toggles on focused header

**Test requirements:**
- 6 epics rendered → 6 EpicCard instances
- Click epic → toggles expanded state
- Expanded epic shows stories
- Collapsed epic hides stories
- Completion bar shows correct percentage
- Status badge matches epic status
- 0 epics → EmptyState: "No epics defined"

---

### E3-S1-T2: Wire Epic Data from Parsed State

**File:** `dashboard/src/app/epics/page.tsx`

**Specification:**

The Epics page consumes `DashboardState` and renders `EpicAccordion`:

```typescript
const { state } = useDashboard();
const router = useRouter();

const handlePromptClick = (promptId: string) => {
  router.push(`/prompts?id=${promptId}`);
};

<FilterBar
  dimensions={[
    { key: 'status', label: 'Status', options: statusOptions, defaultValue: 'All' },
  ]}
  searchPlaceholder="Search epics..."
  {...filterProps}
/>
<EpicAccordion
  epics={filteredEpics}
  epicCompletionPercents={state.summary.epicCompletionPercents}
  taskIndex={state.taskIndex}
  onPromptClick={handlePromptClick}
/>
```

Filtering by status filters the epics list to only those with matching status. Keyword search matches against epic title and story titles.

**Test requirements:**
- Page renders EpicAccordion with all epics from state
- Filter by "blocked" → only blocked epics shown
- Prompt click navigates to `/prompts?id={promptId}`

---

### E3-S1-T3: Write Component Tests for Epic Display

**File:** `dashboard/tests/components/epics/EpicAccordion.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| 3 epics provided | 3 EpicCard elements rendered |
| Epic at 100% completion | Progress bar full, green |
| Epic at 0% completion | Progress bar empty |
| Epic with cancelled stories only | Completion handles division correctly (0% or N/A) |
| Click epic header | Stories revealed in expanded panel |
| Keyboard: Enter on epic header | Stories revealed |
| 0 epics | EmptyState component displayed |
| Prompt link in task row clicked | `onPromptClick` called |

---

## 10. E3-S2: Build Story Drill-Down Within Epic

### E3-S2-T1: Build Story List/Table UI Component

**File:** `dashboard/src/components/epics/StoryRow.tsx`

**Props:**

```typescript
interface StoryRowProps {
  story: ParsedStory;
  completionPercent: number;      // done_tasks / (total - cancelled) × 100
  promptIds: string[];            // From taskIndex reverse lookup
  isExpanded: boolean;
  onToggle: () => void;
  onPromptClick: (promptId: string) => void;
}
```

**Specification:**

Renders a story row within an expanded epic:
- Chevron icon (expand/collapse)
- Story ID and title
- Task count, prompt count
- Completion percentage with progress bar
- Status badge

When expanded, renders `TaskList` showing child tasks.

**Completion formula:** `done_tasks / (total_tasks - cancelled_tasks) × 100` per business rules Section 2.2.

**Prompt IDs** are computed by aggregating all task IDs in the story, looking up associated prompts via `taskIndex`, and deduplicating.

**Test requirements:**
- Story row renders ID, title, task count
- Completion % calculated correctly (3 done, 1 cancelled, 1 ready → 75%)
- Click toggle → tasks appear/disappear
- Prompt IDs shown as clickable links

---

### E3-S2-T2: Implement Epic-to-Story Drill-Down Navigation

**File:** `dashboard/src/components/epics/EpicAccordion.tsx`

**Specification:**

When an EpicCard is expanded, render its stories using `StoryRow` components. Each story is independently expandable (nested accordion). The `useAccordion` hook manages a flat set of expanded IDs across both epics and stories (IDs like `"E1"`, `"E1-S1"`, `"E1-S2"`).

Navigation flow:
1. Click epic → shows story list
2. Click story → shows task list (within the same view)
3. Click prompt link on a task → navigates to Prompts view with drawer

**Test requirements:**
- Expand epic E1 → shows stories E1-S1, E1-S2, ...
- Expand story E1-S1 → shows tasks E1-S1-T1, E1-S1-T2, E1-S1-T3
- Collapse epic → all child stories collapsed
- Two epics expanded simultaneously → both show stories

---

### E3-S2-T3: Write Component Tests for Story Drill-Down

**File:** `dashboard/tests/components/epics/StoryRow.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Story with 3 tasks | Renders task count "3" |
| Story at 100% | Progress bar full |
| Story at 0% | Progress bar empty |
| Click toggle | Tasks visible/hidden |
| Prompt links rendered | Clickable prompt IDs present |
| Click prompt link | `onPromptClick` called with correct ID |

---

## 11. E3-S3: Build Task Tree and Status Badges

### E3-S3-T1: Build Task Tree UI Component with Collapsible Nodes

**Files:**
- `dashboard/src/components/epics/TaskList.tsx`
- `dashboard/src/components/tasks/TaskTree.tsx`
- `dashboard/src/components/tasks/TaskTreeNode.tsx`

**TaskList props (used within Epics view):**

```typescript
interface TaskListProps {
  tasks: ParsedTask[];
  taskIndex: ReverseTaskIndex;
  onPromptClick: (promptId: string) => void;
}
```

**TaskTree props (used in Tasks view page):**

```typescript
interface TaskTreeProps {
  epics: ParsedEpic[];
  epicCompletionPercents: Record<string, number>;
  taskIndex: ReverseTaskIndex;
  onPromptClick: (promptId: string) => void;
}
```

**TaskTreeNode props:**

```typescript
interface TaskTreeNodeProps {
  taskId: string;
  title: string;
  status: string;
  promptIds: string[];           // From taskIndex[taskId]
  onPromptClick: (promptId: string) => void;
}
```

**Specification:**

`TaskTree` renders the full three-level tree for the Tasks view (/tasks):
- Level 1: Epics (expanded by default showing stories)
- Level 2: Stories (collapsed by default)
- Level 3: Tasks (visible when parent story expanded)

Each task node shows:
- Task ID and title
- Status badge (using `StatusBadge`)
- Associated prompt IDs as clickable links (from reverse index)

`TaskList` renders just the task level (used within Epics view story expansion).

Tree visual indicators: tree lines (├─, └─) using CSS borders or Unicode characters for visual hierarchy.

**Accessibility:**
- Tree container uses `role="tree"`, tree items use `role="treeitem"`
- Expand/collapse uses `aria-expanded`
- Status badges include `aria-label`

**Test requirements:**
- TaskTree renders 3-level hierarchy: 2 epics × 3 stories × 3 tasks
- Tasks show correct status badges
- Collapsed story → tasks hidden
- Expanded story → tasks visible
- Prompt links on task → clickable
- Empty tree (no epics) → EmptyState

---

### E3-S3-T2: Implement Status Badge Styling Per Status

**File:** `dashboard/src/components/shared/StatusBadge.tsx`

**Specification:**

Already defined in Section 3.1. This task implements the component:

1. Import `STATUS_THEME` from `constants/statusTheme.ts`
2. Render a `<span>` with:
   - Background color class from theme
   - Text color class from theme
   - Text content: status label
   - For `superseded` and `cancelled`: add `line-through` text decoration
   - `aria-label="Status: {label}"`
3. Size variants:
   - `sm`: `text-xs px-1.5 py-0.5 rounded` (for tables)
   - `md`: `text-sm px-2 py-1 rounded-md` (for detail views)

**Color mapping follows wireframe Appendix A:**

| Status | Background (Tailwind) | Text (Tailwind) |
|---|---|---|
| draft | bg-gray-200 | text-gray-700 |
| ready | bg-blue-100 | text-blue-800 |
| in_progress | bg-amber-100 | text-amber-800 |
| in_review | bg-violet-100 | text-violet-800 |
| blocked | bg-red-100 | text-red-800 |
| done | bg-green-100 | text-green-800 |
| superseded | bg-gray-100 | text-gray-400 + line-through |
| cancelled | bg-gray-100 | text-gray-400 + line-through |

All active statuses meet WCAG AA 4.5:1 contrast ratio for normal text.

**Test requirements:**
- Each of 8 statuses renders with correct background and text color classes
- `done` badge → green background, green text, "Done" label
- `superseded` badge → line-through style
- Unknown status string → fallback to gray styling, no crash
- `aria-label` present on all badges
- `sm` and `md` sizes render with correct padding classes

---

### E3-S3-T3: Write Component Tests for Task Tree

**File:** `dashboard/tests/components/tasks/TaskTree.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| 2 epics, 3 tasks each | 6 task nodes rendered when fully expanded |
| Task with status "done" | Green StatusBadge visible |
| Task with status "blocked" | Red StatusBadge visible |
| Task with 2 prompt links | 2 clickable prompt links rendered |
| Task with 0 prompt links | No prompt link section |
| Expand/collapse story | Task visibility toggles |
| Keyboard: Space on story header | Toggles expansion |
| Empty tree | EmptyState rendered |
| Filter by "blocked" | Only blocked tasks visible |

---

## 12. E3-S4: Build Latest Update Summaries for Each Node

### E3-S4-T1: Implement Last-Update Resolution from Handoff Data

**File:** `dashboard/src/components/epics/UpdateSummary.tsx` (logic section)

**Specification:**

Resolve the most recent update for an epic, story, or task:

```typescript
function resolveLastUpdate(
  entityId: string,                    // Epic ID, Story ID, or Task ID
  entityType: 'epic' | 'story' | 'task',
  prompts: ParsedPrompt[],
  sessions: ParsedHandoff[],
  taskIndex: ReverseTaskIndex
): { date: string; summary: string } | null;
```

**Resolution algorithm:**
1. **Task:** Look up `taskIndex[taskId]` to get prompt IDs → find handoffs matching those prompt IDs → return the latest by `endedAt`
2. **Story:** Aggregate all child task IDs → look up all associated prompt IDs → find latest handoff
3. **Epic:** Aggregate all child story task IDs → look up all associated prompt IDs → find latest handoff

Return `null` if no handoff references the entity.

**Test requirements:**
- Task with matching handoff → returns date and summary
- Task with no associated prompt → returns null
- Task with associated prompt but no handoff → returns null
- Story aggregation: 3 tasks, 2 with handoffs → returns the latest
- Epic aggregation: 2 stories → returns the latest across all

---

### E3-S4-T2: Build Inline Update Summary UI

**File:** `dashboard/src/components/epics/UpdateSummary.tsx`

**Props:**

```typescript
interface UpdateSummaryProps {
  date: string | null;
  summary: string | null;
}
```

**Specification:**

Renders inline (within epic/story rows):
- If date exists: "Last update: {formatted date} — {summary (truncated to 80 chars)}"
- If null: "No updates yet" (muted text)

Date format: "MMM D" (e.g., "Apr 3") for current year, "MMM D, YYYY" for prior years.

Hover over truncated summary shows full text via `title` attribute.

**Test requirements:**
- Date present → formatted date and summary displayed
- Null date → "No updates yet" displayed
- Long summary → truncated with "..." and full text in title

---

### E3-S4-T3: Write Tests for Update Resolution Logic

**File:** `dashboard/tests/components/epics/UpdateSummary.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Task with recent handoff | Date and summary rendered |
| Task with no handoff | "No updates yet" rendered |
| Story with mixed tasks | Latest handoff date shown |
| Epic aggregation | Latest across all stories shown |
| Date formatting current year | "Apr 3" format |
| Long summary | Truncated with title tooltip |

---

## 13. E4-S1: Build Prompt Inventory Table

### E4-S1-T1: Build Prompt Inventory Table UI Component

**Files:**
- `dashboard/src/components/prompts/PromptTable.tsx`
- `dashboard/src/components/prompts/PromptTableRow.tsx`

**PromptTable props:**

```typescript
interface PromptTableProps {
  prompts: ParsedPrompt[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onRowClick: (promptId: string) => void;
  currentPage: number;
  pageSize: number;
}
```

**Specification:**

Renders a full-width table with columns per wireframe:
- **# (Prompt ID):** Natural sort order (default column)
- **Title:** Prompt title text
- **Epic:** Epic ID
- **Status:** `StatusBadge` component
- **Updated:** `updatedAt` formatted as date
- **Loc:** Location indicator — "act" for active, "arc" for archive

Table features:
- **Sortable columns:** Clicking column header toggles sort. Active sort shown with ↑/↓ indicator
- **Clickable rows:** Click opens prompt detail drawer via `onRowClick`
- **Archived prompt styling:** Rows for archived prompts (those with `archivedAt` set) render with `opacity-60` and muted text
- **Superseded styling:** Rows for superseded prompts render with `line-through` on the title
- **Pagination:** Shows 25 rows per page, uses `Pagination` component

**Accessibility:**
- `<table>` with `role="table"`
- Sortable headers have `aria-sort="ascending|descending|none"`
- Rows are focusable with `tabindex="0"` and `role="row"`
- Arrow keys navigate between rows
- Enter on focused row opens drawer

**Empty state:** "No prompts match your filters" (if filtered) or "No prompts yet" (if no data)

**Test requirements:**
- 10 prompts → 10 rows rendered
- 0 prompts → EmptyState displayed
- Sort by status → rows reorder
- Sort by prompt ID → natural tuple sort order
- Click row → `onRowClick` called with promptId
- Archived prompt → muted styling
- Superseded prompt → strikethrough title
- Pagination: 30 prompts with pageSize 25 → 2 pages

---

### E4-S1-T2: Implement Column Sorting with Natural Prompt-ID Ordering

**File:** `dashboard/src/components/prompts/PromptTable.tsx` (sorting logic)

**Specification:**

Sorting logic (client-side, operates on the full prompts array before pagination):

| Column | Sort Method |
|---|---|
| # (Prompt ID) | Natural tuple sort — parse `promptId` into numeric segments, compare element-by-element. Already defined in parser `sorting.ts` — import and reuse |
| Title | Case-insensitive alphabetical |
| Epic | Alphabetical by epicId |
| Status | Custom order: `blocked` > `in_progress` > `in_review` > `ready` > `draft` > `done` > `superseded` > `cancelled` |
| Updated | Chronological by `updatedAt` |

Default sort: Prompt ID ascending.

**Import:** `import { comparePromptIds } from '@/parser/sorting';`

The sorting module from E1-S4 is reused — no re-implementation needed. This task wires the existing sort function to the table's column sort controls.

**Test requirements:**
- Sort by # ascending: 1.0.1, 2.0.1, 3.0.1, 16.0.1
- Sort by # descending: reverse
- Sort by status: blocked prompts first
- Sort toggle: click same column twice → reverses direction
- Active sort indicator visible on sorted column

---

### E4-S1-T3: Implement Filtering/Search Functionality

**File:** `dashboard/src/app/prompts/page.tsx`

**Specification:**

The Prompts page uses `FilterBar` and `useFilterState` to provide multi-dimension filtering per business rules Section 7:

**Filter dimensions:**

| Dimension | Key | Source | Default |
|---|---|---|---|
| Status | `status` | Canonical 8 statuses | "All" |
| Epic | `epic` | Dynamic from `state.epics` | "All" |
| Location | `location` | `["active", "archive", "all"]` | "active" |
| Role | `role` | Dynamic from unique `prompt.role` values | "All" |

**Search:** Case-insensitive substring match against: `promptId`, `title`, `epicId`, `storyId`, `role`. Per business rules Section 7.1, no full-text search of prompt body in v1.

**Filter application logic:**

```typescript
function filterPrompts(
  prompts: ParsedPrompt[],
  filters: Record<string, string>,
  searchQuery: string
): ParsedPrompt[] {
  return prompts.filter(p => {
    if (filters.status !== 'All' && p.status !== filters.status) return false;
    if (filters.epic !== 'All' && p.epicId !== filters.epic) return false;
    if (filters.location === 'active' && p.archivedAt) return false;
    if (filters.location === 'archive' && !p.archivedAt) return false;
    if (filters.role !== 'All' && p.role !== filters.role) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchFields = [p.promptId, p.title, p.epicId, p.storyId, p.role];
      if (!searchFields.some(f => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}
```

Active filters shown as `FilterChip` pills. "Clear Filters" resets all.

Filter result count announced via `aria-live="polite"`: "Showing {n} of {total} prompts".

**Test requirements:**
- Filter by status "ready" → only ready prompts shown
- Filter by epic "E2" → only E2 prompts shown
- Filter by location "active" (default) → archived prompts hidden
- Filter by location "all" → all prompts shown
- Search "parser" → matches prompts with "parser" in title
- Search is case-insensitive
- Combined filters: status=ready + epic=E2 → intersection
- Clear filters → all prompts shown
- Filter chips displayed and removable

---

### E4-S1-T4: Write Component Tests for Table Rendering, Sorting, Filtering

**File:** `dashboard/tests/components/prompts/PromptTable.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| 10 prompts rendered | 10 table rows visible |
| 0 prompts | EmptyState displayed |
| Sort by # ascending | Rows in natural tuple order |
| Sort by # descending | Rows in reverse tuple order |
| Sort by status | Blocked first |
| Click column header | Sort direction toggles |
| Active sort indicator | Arrow visible on sorted column |
| Row click | `onRowClick` called |
| Archived prompt | Muted styling applied |
| Pagination: 50 prompts, 25/page | Page controls visible, first 25 rows |
| Navigate to page 2 | Next 25 rows visible |
| Keyboard: Enter on row | `onRowClick` called |
| Keyboard: Arrow keys | Focus moves between rows |

---

## 14. E4-S2: Build Prompt Detail Drawer/Page

### E4-S2-T1: Build Prompt Detail Drawer UI Component

**File:** `dashboard/src/components/prompts/PromptDetailDrawer.tsx`

**Props:**

```typescript
interface PromptDetailDrawerProps {
  prompt: ParsedPrompt | null;
  handoffs: ParsedHandoff[];           // Handoffs matching this prompt's promptId
  prerequisiteStatuses: Array<{
    promptId: string;
    status: PromptStatus;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onPromptNavigate: (promptId: string) => void;  // In-drawer navigation
}
```

**Specification:**

Slide-in drawer from the right side (~40% viewport width on desktop, full-width on mobile):

1. **Header:** Close button (✕), prompt ID, title
2. **Metadata section** (`PromptMetadata`):
   - Status badge
   - Phase
   - Epic ID, Story ID, Task IDs
   - Owner role
   - Location (active/archive)
3. **Prerequisites section:**
   - Each prerequisite listed with status badge and clickable prompt ID
   - ✅ or ❌ indicator for met/unmet
   - Clicking a prerequisite calls `onPromptNavigate` to update drawer content in-place
4. **Required Reading:** List of paths
5. **Downstream Prompts:** Clickable prompt IDs
6. **Prompt Body:** Rendered as markdown via `MarkdownRenderer`
7. **Copy button:** `CopyButton` copying raw markdown body
8. **Session Handoff section (if handoff exists):**
   - Summary, changed files count, files removed, tests run, decisions, open risks, downstream impacts
   - "View Full Handoff" link
9. **Warning states:**
   - If `done` and no handoff: "⚠ Handoff missing for this completed prompt"
   - If superseded: "Superseded by: → {supersededBy}" (clickable)
   - If archived: "Archived: {archivedAt}"
10. **Source path:** Repository-relative path

**Drawer behavior:**
- Slides in from right, overlays table
- Background dimmed/inactive
- Close: ✕ button, Escape key, or click dimmed overlay
- Focus trap: Tab cycles within drawer only
- Focus returns to trigger element on close (managed by `useDrawer` hook)
- In-drawer navigation: clicking prerequisite/superseded prompt updates content in-place

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`
- Focus moves to close button on open
- Focus trap implemented
- Escape closes drawer
- `prefers-reduced-motion` respected for slide animation

**Security:**
- Markdown rendered via `MarkdownRenderer` with XSS sanitization (no raw HTML — per ADR-001 condition, security review HIGH-002)

**Test requirements:**
- Drawer opens with all metadata fields displayed
- Close button → drawer closes
- Escape key → drawer closes
- Focus trap: Tab stays within drawer
- Prerequisites: met prerequisites show ✅, unmet show ❌
- Click prerequisite → `onPromptNavigate` called
- Done prompt with handoff → handoff section visible
- Done prompt without handoff → warning message visible
- Superseded prompt → superseded-by link visible and clickable
- Archived prompt → archived date visible
- Copy button → copies prompt body
- Markdown body rendered (not raw text)

---

### E4-S2-T2: Implement Markdown Rendering for Prompt Body and Handoff Notes

**File:** `dashboard/src/components/prompts/MarkdownRenderer.tsx`

**Props:**

```typescript
interface MarkdownRendererProps {
  content: string;
}
```

**Specification:**

Uses `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support:

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
```

**Security constraints (mandatory — per security review HIGH-002):**
- **Never** enable `rehype-raw` plugin — this would allow raw HTML passthrough and XSS
- **Never** pass `allowDangerousHtml` option
- Default `react-markdown` behavior strips all raw HTML tags — this is the desired behavior
- No `<script>`, `<iframe>`, `javascript:` URIs, or event handlers will pass through

**Styling:** Apply Tailwind typography plugin classes or custom prose styles for headings, lists, code blocks, tables, and links within rendered markdown.

**Test requirements:**
- Renders headings (`# H1`, `## H2`) as correct HTML elements
- Renders lists, code blocks, tables (via remark-gfm)
- Strips `<script>` tags in markdown content — no XSS
- Strips `<iframe>` tags
- Strips `javascript:` URI links
- Handles empty string → renders nothing, no crash
- Handles very long content → renders without performance issues

---

### E4-S2-T3: Wire All Metadata Fields from Parsed State

**File:** `dashboard/src/app/prompts/page.tsx`

**Specification:**

The Prompts page manages the drawer state and wires data:

```typescript
const { state } = useDashboard();
const { isOpen, selectedId, open, close, drawerRef } = useDrawer();

// Find selected prompt
const selectedPrompt = state?.prompts.find(p => p.promptId === selectedId) ?? null;

// Find matching handoffs
const matchingHandoffs = state?.sessions.filter(s => s.promptId === selectedId) ?? [];

// Resolve prerequisite statuses
const prerequisiteStatuses = selectedPrompt?.prerequisites.map(preId => ({
  promptId: preId,
  status: state?.prompts.find(p => p.promptId === preId)?.status ?? 'draft',
})) ?? [];
```

Deep-linking: If URL has `?id=3.0.1`, open drawer for that prompt on mount.

**Test requirements:**
- URL with `?id=3.0.1` → drawer opens for prompt 3.0.1
- Click row → drawer opens with correct prompt data
- Handoffs matched by promptId and passed to drawer
- Prerequisites resolved with current status

---

### E4-S2-T4: Write Component Tests for Detail Drawer

**File:** `dashboard/tests/components/prompts/PromptDetailDrawer.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Open drawer with full prompt | All metadata fields visible |
| Close via ✕ button | `onClose` called, drawer hidden |
| Close via Escape | `onClose` called |
| Focus trap | Tab cycles within drawer |
| Focus return | After close, focus on trigger element |
| Prerequisites: 2 met, 1 unmet | Correct icons displayed |
| Click prerequisite link | `onPromptNavigate` called |
| Handoff present | Handoff section rendered with summary |
| No handoff for done prompt | Warning "Handoff missing" visible |
| Superseded prompt | "Superseded by" link visible |
| Archived prompt | Archived date visible |
| Copy button | Clipboard called with body content |
| Markdown rendered | Headings, lists visible in body |
| Mobile viewport | Drawer full-width |

---

## 15. E4-S3: Build Session Timeline/History View

### E4-S3-T1: Build Session Timeline UI Component

**File:** `dashboard/src/components/sessions/SessionTimeline.tsx`

**Props:**

```typescript
interface SessionTimelineProps {
  sessions: ParsedHandoff[];
  onPromptClick: (promptId: string) => void;
}
```

**Specification:**

Renders a chronological timeline per wireframe:
1. Sessions sorted by `endedAt` descending (newest first)
2. Grouped by date headers (e.g., "● Apr 3, 2026")
3. Each session rendered as a `SessionCard`
4. Empty state: "No sessions completed yet"
5. Pagination or virtual scroll for 50+ sessions (25 per page)

**Date grouping:** Group sessions by `endedAt` date (YYYY-MM-DD), render date headers between groups.

**Accessibility:**
- Timeline has `role="list"`, sessions have `role="listitem"`
- Date headers are `<h3>` or `role="heading"`

**Test requirements:**
- 5 sessions → 5 SessionCards rendered
- Sessions grouped by date → date headers visible
- Newest first ordering
- 0 sessions → EmptyState displayed
- 50+ sessions → pagination visible

---

### E4-S3-T2: Wire Session Data from Parsed Handoffs

**File:** `dashboard/src/app/sessions/page.tsx`

**Specification:**

The Sessions page consumes `DashboardState.sessions` and renders `SessionTimeline`:

```typescript
const { state } = useDashboard();
const router = useRouter();

const handlePromptClick = (promptId: string) => {
  router.push(`/prompts?id=${promptId}`);
};

<FilterBar
  dimensions={[
    { key: 'status', label: 'Status', options: ['All', 'complete', 'partial'], defaultValue: 'All' },
    { key: 'role', label: 'Role', options: roleOptions, defaultValue: 'All' },
  ]}
  searchPlaceholder="Search sessions..."
  {...filterProps}
/>
<SessionTimeline
  sessions={filteredSessions}
  onPromptClick={handlePromptClick}
/>
```

Filter by role, status outcome, and keyword search on session summary/prompt title.

Deep-linking: `?id=S-005` expands that specific session card.

**Test requirements:**
- Page renders SessionTimeline with all sessions
- Filter by role → matching sessions shown
- Prompt click navigates to `/prompts?id={promptId}`
- Deep-link `?id=S-005` → that card expanded

---

### E4-S3-T3: Implement Expand/Collapse for Session Detail

**Files:**
- `dashboard/src/components/sessions/SessionCard.tsx`
- `dashboard/src/components/sessions/SessionDetail.tsx`

**SessionCard props:**

```typescript
interface SessionCardProps {
  session: ParsedHandoff;
  isExpanded: boolean;
  onToggle: () => void;
  onPromptClick: (promptId: string) => void;
}
```

**Collapsed state shows:**
- Session ID
- Prompt number and title
- Role
- Status outcome badge
- Changed file count
- Summary (truncated)
- "▼ Expand Details" button

**SessionDetail props (expanded state):**

```typescript
interface SessionDetailProps {
  session: ParsedHandoff;
  onPromptClick: (promptId: string) => void;
}
```

**Expanded state additionally shows:**
- Full summary text
- Changed files list (relative paths)
- Files removed
- Tests run
- Blockers
- Decisions made
- Open risks
- Downstream impacts
- Next recommended prompts (clickable)
- "View Handoff File" link (source path)
- "View Prompt" link (navigates to prompt drawer)
- "▲ Collapse" button

**Interaction:**
- Click toggle button → expand/collapse
- Keyboard: Enter/Space on toggle button
- Expanded content uses `aria-expanded="true"` on toggle button

**Test requirements:**
- Collapsed card shows summary info
- Click expand → full detail visible
- Click collapse → detail hidden
- Click "View Prompt" → `onPromptClick` called
- Next recommended prompts clickable
- Keyboard: Enter on toggle → toggles

---

### E4-S3-T4: Write Component Tests for Timeline

**File:** `dashboard/tests/components/sessions/SessionTimeline.test.tsx` and `SessionCard.test.tsx`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| 5 sessions rendered | 5 SessionCards visible |
| Newest first | First card has latest `endedAt` |
| Date grouping | Date headers present |
| Expand card | SessionDetail content visible |
| Collapse card | Detail hidden |
| Click "View Prompt" | `onPromptClick` called |
| 0 sessions | EmptyState displayed |
| 50+ sessions | Pagination controls visible |
| Card shows correct summary | Truncated summary text matches |
| Expanded card | Full summary, changed files, etc. visible |

---

## 16. E4-S4: Link Prompts to Changed Files and Handoffs

### E4-S4-T1: Implement Prompt-to-Handoff Linking in Parsed Model

**Specification:**

This linking is primarily a parser-layer concern (E1-S3-T3 graph builder). The UI task is to consume the pre-linked data:

`DashboardState.sessions` contains all `ParsedHandoff` objects. Each has a `promptId` field.

Linking logic (client-side, in the Prompts page):
```typescript
// Find all handoffs for a given prompt
const handoffsForPrompt = state.sessions
  .filter(s => s.promptId === prompt.promptId)
  .sort((a, b) => b.endedAt.localeCompare(a.endedAt)); // newest first
```

If multiple handoffs reference the same `prompt_id`, all are displayed sorted by `endedAt` (per business rules Section 4.4).

**Test requirements:**
- Prompt with 1 handoff → 1 handoff linked
- Prompt with 2 handoffs → both linked, sorted by date
- Prompt with 0 handoffs → empty array

---

### E4-S4-T2: Display Changed Files and Handoff Link in Prompt Detail

**File:** `dashboard/src/components/prompts/PromptDetailDrawer.tsx` (handoff section)

**Specification:**

In the prompt detail drawer's handoff section, display:
1. **Changed files:** List `handoff.changedFiles` as relative paths
2. **Handoff link:** "View Handoff: {handoff.sourcePath}" (displayed as relative path text, not clickable link in v1 per AC-5)
3. **Multiple handoffs:** If multiple handoffs exist for the prompt, render each in a collapsible card sorted by `endedAt` (newest first). Label: "Session {sessionId} — {endedAt date}"

**Missing handoff warning:**
- If `prompt.status === 'done'` and `handoffsForPrompt.length === 0`:
  - Display inline warning: "⚠ Handoff missing for this completed prompt"
  - This warning also appears in the BlockersWarningsPanel (linked via `W_DONE_NO_HANDOFF`)

**Test requirements:**
- Handoff with 3 changed files → 3 file paths listed
- Multiple handoffs → newest first, each expandable
- Done prompt with no handoff → warning message displayed
- Changed file paths displayed as relative paths

---

### E4-S4-T3: Write Tests for Link Resolution

**File:** `dashboard/tests/components/prompts/PromptDetailDrawer.test.tsx` (link resolution section)

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Prompt with 1 handoff | Handoff section visible, changed files listed |
| Prompt with 2 handoffs | Both displayed, newest first |
| Prompt with 0 handoffs (not done) | No handoff section, no warning |
| Done prompt with 0 handoffs | Warning "Handoff missing" displayed |
| Handoff with 5 changed files | All 5 paths rendered |
| Handoff with 0 changed files | "No files changed" or empty list |

---

## 17. E5-S1: Build Refresh/Reparse Flow

### E5-S1-T1: Implement Refresh Action that Re-Runs Parser and Updates State

**File:** `dashboard/src/context/DashboardContext.tsx`

**Specification:**

The `refresh` function on `DashboardContextValue`:

```typescript
async function refresh() {
  dispatch({ type: 'PARSE_START' });
  try {
    const newState = await parseRepository(repoPath);
    dispatch({ type: 'PARSE_SUCCESS', payload: newState });
  } catch (err) {
    dispatch({ type: 'PARSE_ERROR', error: err instanceof Error ? err.message : 'Parse failed' });
  }
}
```

Behavior:
1. Sets `isLoading = true` (shows `LoadingIndicator`)
2. Runs the parser against `repoPath`
3. On success → replaces `state` with new `DashboardState`, sets `lastParsedAt`
4. On failure → sets `error` message, retains previous state for display
5. Preserves current view and scroll position (no page navigation)
6. `isLoading = false` after completion

**Trigger points:**
- Manual: Refresh button in Header
- Auto: File watcher events (E5-S2)
- Initial: Component mount

**Test requirements:**
- Refresh with valid repo → state updated, isLoading cycles true→false
- Refresh with invalid repo → error set, previous state retained
- Multiple rapid refreshes → last one wins (debounce or cancel previous)
- LoadingIndicator visible during parse

---

### E5-S1-T2: Build Loading and Error State UI

**Files:**
- `dashboard/src/components/shared/LoadingIndicator.tsx`
- `dashboard/src/components/shell/Header.tsx` (refresh button section)

**LoadingIndicator specification:**
- Thin animated bar at the top of the main content area
- Visible when `isLoading === true`
- Sets `aria-busy="true"` on the main content region
- Minimum display time: 300ms (don't flash for instant parses)
- Does not block user interaction — content remains visible with stale data

**Error banner specification:**
- Rendered at the top of main content when `error` is non-null
- Shows error message text
- "Retry" button → calls `refresh()` again
- `role="alert"` for screen reader announcement
- Previous data remains visible beneath the banner

**Refresh button in Header:**
- ↻ icon button with `aria-label="Refresh dashboard data"`
- Disabled during loading (prevents double-trigger)
- On click → calls `refresh()` from context

**Test requirements:**
- Loading state → LoadingIndicator visible, aria-busy set
- Error state → error banner visible with message and retry button
- Click retry → refresh called
- Refresh button disabled during loading
- Normal state → no indicator or banner visible

---

### E5-S1-T3: Write Tests for Refresh Flow

**File:** `dashboard/tests/hooks/useDashboard.test.ts`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Initial mount | Parser called, state populated |
| Click refresh | Parser re-called, state updated |
| Parse failure | `error` set, previous state retained |
| Parse success after failure | `error` cleared, new state set |
| Loading indicator | Visible during parse, hidden after |
| Refresh preserves view | No navigation triggered |
| Error banner retry | Calls refresh again |

---

## 18. E5-S2: Add Local File Watch Support

### E5-S2-T1: Implement File Watcher Using Native or Library-Based File System Events

**File:** `dashboard/src/lib/fileWatcher.ts`

**Specification:**

Uses `chokidar` (per ADR-001) to watch repo directories for changes:

```typescript
interface FileWatcherConfig {
  repoPath: string;
  onFileChange: () => void;
  enabled: boolean;
}

export function createFileWatcher(config: FileWatcherConfig): {
  start: () => void;
  stop: () => void;
};
```

**Watched directories** (per E5-S2 AC-5):
- `{repoPath}/prompts/active/`
- `{repoPath}/prompts/archive/`
- `{repoPath}/prompts/index.md`
- `{repoPath}/agents/epics/`
- `{repoPath}/agents/handoffs/`

**Configuration:**
- `followSymlinks: false` (security — per security review MED-002)
- File pattern: `**/*.md`
- Ignored: `node_modules`, `.git`, `dashboard/`
- Enabled only in dev-server mode (not static export)
- Disable via environment variable: `NEXT_PUBLIC_DISABLE_WATCHER=true`

**Events monitored:** `add`, `change`, `unlink` on `.md` files.

**Test requirements:**
- Watcher starts and stops without error
- File change event triggers `onFileChange` callback
- Watcher ignores non-.md files
- Watcher respects `enabled: false` (no events)
- `followSymlinks: false` verified in config

---

### E5-S2-T2: Add Debounce Logic for Rapid Changes

**File:** `dashboard/src/lib/fileWatcher.ts` (debounce section)

**Specification:**

Implements escalating debounce per operational review:
- **Single file change:** 500ms debounce before triggering re-parse
- **Batch changes (>3 files within 500ms):** Escalate to 3000ms debounce (handles git checkout scenarios)

```typescript
function createDebouncedHandler(onRefresh: () => void): (path: string) => void;
```

Logic:
1. On first file event, start a 500ms timer
2. On each subsequent event within the timer window:
   - Increment file count
   - If file count > 3, extend timer to 3000ms from last event
3. When timer fires (no new events for debounce period):
   - Call `onRefresh()`
   - Reset file count

**Test requirements:**
- Single file change → callback after 500ms
- 2 rapid changes within 200ms → single callback after 500ms from last
- 10 rapid changes → single callback after 3000ms from last (batch mode)
- No changes → no callback

---

### E5-S2-T3: Write Integration Tests for File-Watch-Triggered Refresh

**File:** `dashboard/tests/hooks/fileWatcher.test.ts`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| File created in prompts/active/ | onFileChange called (after debounce) |
| File modified in agents/handoffs/ | onFileChange called |
| File deleted from prompts/active/ | onFileChange called |
| Non-.md file modified | No onFileChange call |
| File change with watcher disabled | No onFileChange call |
| Rapid 5-file batch | Single onFileChange call (after 3s) |
| Watcher stop | No further events processed |

---

## 19. E5-S3: Add Repo Selector for Compatible Projects

### E5-S3-T1: Build Repo Selector UI Component

**File:** `dashboard/src/components/shell/Header.tsx` (repo selector section)

**Props (embedded in Header):**

```typescript
interface RepoSelectorProps {
  currentPath: string;
  recentPaths: string[];
  onSelectPath: (path: string) => Promise<void>;
  onClearRecent: (path?: string) => void;  // No arg = clear all
}
```

**Specification:**

Renders in the header bar (always visible per wireframe):
1. **Current repo display:** Shows the basename of the current repo path (e.g., "Boilerplate")
2. **Click to open dropdown:**
   - Text input for new path entry
   - Recent projects list (up to 10, most recent first)
   - "Clear History" action
3. **Selection flow:**
   - User enters or selects a path → `onSelectPath` called
   - Validation runs (capability detection)
   - If valid → repo loaded
   - If invalid → error message in dropdown
4. **Recent project entries:**
   - Clickable to select
   - Individual "×" to remove from list
   - Invalid/missing paths shown with ⚠ indicator

**Accessibility:**
- Dropdown uses `role="listbox"` pattern
- Text input has `aria-label="Repository path"`
- Recent items navigable via arrow keys

**Security:**
- All paths validated and sanitized before use
- No path traversal (paths must resolve to absolute paths, checked by capability detection)
- Per security review HIGH-001: allowlist approach for trusted base directories

**Test requirements:**
- Renders current path
- Click opens dropdown with input and recent list
- Enter path → `onSelectPath` called
- Select recent → `onSelectPath` called
- Clear history → `onClearRecent` called
- Invalid path → error displayed in dropdown
- Recent paths sorted newest first

---

### E5-S3-T2: Implement Repo Capability Detection (Check for Required Structure)

**File:** `dashboard/src/lib/repoDetection.ts`

**Specification:**

Reuses or delegates to the parser's `validateRepoStructure` function (from E1-S3-T2 scanner.ts):

```typescript
import { validateRepoStructure } from '@/parser/scanner';

export async function detectRepoCapability(repoPath: string): Promise<{
  capable: boolean;
  missingRequired: string[];
  missingOptional: string[];
  promptCount: number;
  epicCount: number;
  warnings: string[];
}>;
```

**Required paths** (per business rules Section 5.1):
- `prompts/index.md`
- `prompts/active/`
- `agents/epics/`
- `agents/handoffs/`

**Path validation before detection:**
1. Resolve path to absolute: `path.resolve(inputPath)`
2. Verify path does not contain `..` segments after resolution
3. Verify path exists and is a directory
4. Check against allowed base directories (per security review HIGH-001)

**Test requirements:**
- Valid repo → capable: true
- Missing `prompts/index.md` → capable: false, listed in missingRequired
- Missing optional `prompts/archive/` → capable: true, listed in missingOptional
- Path traversal attempt → rejected before filesystem access
- Non-existent path → graceful error

---

### E5-S3-T3: Wire Repo Switching to Parser and State Reload

**File:** `dashboard/src/context/DashboardContext.tsx` (setRepoPath section)

**Specification:**

The `setRepoPath` function on `DashboardContextValue`:

```typescript
async function setRepoPath(newPath: string) {
  const detection = await detectRepoCapability(newPath);
  if (!detection.capable) {
    dispatch({ type: 'PARSE_ERROR', error: `Repository not compatible: missing ${detection.missingRequired.join(', ')}` });
    return;
  }
  repoPath = newPath;
  saveRecentPath(newPath);  // localStorage
  await refresh();           // Full re-parse with new repo
}
```

On successful repo switch:
1. Run capability detection
2. If capable → update repoPath, parse new repo, save to recent
3. If not capable → show error listing missing paths
4. All views update reactively through context

**Test requirements:**
- Switch to valid repo → state fully replaced with new data
- Switch to invalid repo → error shown, previous state intact
- Recent path saved to localStorage
- All views re-render with new data

---

### E5-S3-T4: Write Tests for Capability Detection and Repo Switching

**File:** `dashboard/tests/hooks/repoDetection.test.ts`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Valid repo structure | `capable: true` |
| Missing prompts/index.md | `capable: false`, "prompts/index.md" in missingRequired |
| Missing agents/handoffs/ | `capable: false` |
| Missing optional prompts/archive/ | `capable: true`, listed in missingOptional |
| Path traversal "../../etc" | Rejected |
| Empty path string | Error |
| Non-directory path | Error |
| Switch to valid repo | State updated |
| Switch to invalid repo | Error shown, previous state retained |

---

## 20. E5-S4: Persist Recent Project Selections Locally

### E5-S4-T1: Implement Local Storage Persistence for Recent Project Paths

**File:** `dashboard/src/lib/recentProjects.ts`

**Specification:**

```typescript
const STORAGE_KEY = 'dashboard_recent_projects';
const MAX_RECENT = 10;

export function getRecentProjects(): string[];
export function saveRecentPath(path: string): void;
export function removeRecentPath(path: string): void;
export function clearRecentProjects(): void;
```

**Behavior:**
- `getRecentProjects()`: Reads from `localStorage`, parses JSON array, returns up to 10 paths sorted by most recent usage
- `saveRecentPath(path)`: Adds path to front of list (or moves to front if exists). Trims list to 10. Writes to `localStorage`
- `removeRecentPath(path)`: Removes specific path from list
- `clearRecentProjects()`: Removes all entries

**Error handling:**
- If `localStorage` is unavailable (SSR, disabled), silently fall back to in-memory array
- Malformed localStorage data → reset to empty array

**Test requirements:**
- Save 3 paths → all retrievable in order
- Save duplicate → moves to front, no duplicates
- Save 11 paths → only 10 stored (oldest dropped)
- Remove path → removed from list
- Clear → empty list
- Malformed localStorage → graceful reset

---

### E5-S4-T2: Build Recent-Projects List in Selector UI

**File:** `dashboard/src/components/shell/Header.tsx` (recent projects section, within repo selector dropdown)

**Specification:**

The recent projects list is rendered inside the repo selector dropdown:

1. List items sorted most-recent-first (from `getRecentProjects()`)
2. Each item shows:
   - Path (basename for display, full path as tooltip)
   - "×" remove button
   - If path is invalid (no longer exists on disk): ⚠ indicator, muted styling
3. Click item → triggers `onSelectPath(path)` which runs capability detection and load
4. "Clear History" link at bottom → `onClearRecent()` removes all

**Re-validation on display:** When dropdown opens, check each recent path exists (async, best-effort). Invalid paths shown with visual indicator but are still selectable (re-validation happens on actual selection).

**Test requirements:**
- 5 recent paths → 5 list items
- Click item → `onSelectPath` called
- Click "×" → item removed
- Click "Clear History" → all items removed
- Invalid path → ⚠ indicator visible

---

### E5-S4-T3: Write Tests for Persistence and Clearing

**File:** `dashboard/tests/lib/recentProjects.test.ts`

**Test scenarios:**

| Scenario | Assertion |
|---|---|
| Save and retrieve | Path retrievable |
| Order preserved | Most recent first |
| Duplicate handling | Moved to front, no duplicates |
| Max 10 | 11th save drops oldest |
| Remove specific | Only target removed |
| Clear all | Empty list |
| localStorage unavailable | No crash, in-memory fallback |
| Malformed data in storage | Graceful reset |

---

## 21. Cross-Cutting UI Concerns

### 21.1 Application Shell

**Files:**
- `dashboard/src/components/shell/AppShell.tsx`
- `dashboard/src/components/shell/Header.tsx`
- `dashboard/src/components/shell/Sidebar.tsx`
- `dashboard/src/components/shell/StatusBar.tsx`

**AppShell** wraps all content with the persistent shell layout per ADR-003 and wireframe Section 1:

```typescript
interface AppShellProps {
  children: React.ReactNode;
}
```

Layout:
- Header (fixed top)
- Sidebar (fixed left, collapsible)
- Main content area (scrollable, fills remaining space)
- Status bar (fixed bottom)

**Sidebar** (navigation):
- 5 nav items: Overview, Epics, Prompts, Sessions, Tasks
- Active view highlighted
- `role="navigation"`, `aria-label="Main navigation"`
- Collapses to hamburger on viewports < 768px
- Collapses to icon-only rail on 768–1279px

**StatusBar:**

```typescript
interface StatusBarProps {
  lastParsedAt: string | null;
  promptCount: number;
  warningCount: number;
  onWarningClick: () => void;  // Scrolls to blockers panel
}
```

Displays: last parsed timestamp, file/prompt count, warning count. Clicking warning count navigates to Overview → Blockers panel.

**Test files:**
- `dashboard/tests/components/shell/AppShell.test.tsx`
- `dashboard/tests/components/shell/Header.test.tsx`
- `dashboard/tests/components/shell/Sidebar.test.tsx`
- `dashboard/tests/components/shell/StatusBar.test.tsx`

### 21.2 Error Boundaries

Each view page wraps its content in `<ErrorBoundary viewName="...">`:

```tsx
// Example: src/app/epics/page.tsx
export default function EpicsPage() {
  return (
    <ErrorBoundary viewName="Epics">
      <EpicsViewContent />
    </ErrorBoundary>
  );
}
```

A rendering failure in one view does not crash the entire application.

### 21.3 Status Badge Theme Centralization

The `STATUS_THEME` constant (Section 3.1) is the single source of truth for status colors across all views. No component should hardcode status colors — always import from `constants/statusTheme.ts`.

### 21.4 Responsive Breakpoints

Per ADR-003 and wireframes:

| Breakpoint | Viewport | Layout Adjustments |
|---|---|---|
| Desktop | ≥ 1280px | Full sidebar, multi-column cards/charts, table view |
| Tablet | 768–1279px | Icon-only sidebar rail, fewer columns, drawer ~50% width |
| Mobile | < 768px | Hamburger menu, single column, drawer full-width, tables → card view |

### 21.5 Motion and Reduced Motion

- Drawer slide-in: respect `prefers-reduced-motion` — instant open if preferred
- Loading bar: minimum 300ms display time
- No auto-playing animations

### 21.6 Overview Recent Sessions List

**File:** `dashboard/src/components/overview/RecentSessionsList.tsx`

```typescript
interface RecentSessionsListProps {
  sessions: ParsedHandoff[];  // Last 5, sorted by endedAt desc
  onSessionClick: (sessionId: string) => void;
  onViewAll: () => void;
}
```

Shows the 5 most recent sessions in a compact table on the Overview. "View All Sessions →" link navigates to `/sessions`.

---

## Appendix A: Task Summary Table

| Task ID | Title | File(s) | Story |
|---|---|---|---|
| E2-S1-T1 | Create summary card UI components | `SummaryCard.tsx`, `SummaryCardsGrid.tsx`, `HealthBadge.tsx`, `OverallProgressBar.tsx` | E2-S1 |
| E2-S1-T2 | Wire summary data from parsed state | `app/page.tsx` | E2-S1 |
| E2-S1-T3 | Write component tests for summary cards | `SummaryCard.test.tsx`, etc. | E2-S1 |
| E2-S2-T1 | Select and integrate chart library | `chartConfig.ts`, `package.json` | E2-S2 |
| E2-S2-T2 | Implement epic completion chart | `EpicCompletionChart.tsx` | E2-S2 |
| E2-S2-T3 | Implement prompt status distribution chart | `PromptStatusChart.tsx` | E2-S2 |
| E2-S2-T4 | Implement session throughput timeline chart | `SessionThroughputChart.tsx` | E2-S2 |
| E2-S2-T5 | Write visual regression/snapshot tests | Chart test files + `RemainingPromptsChart.tsx` | E2-S2 |
| E2-S3-T1 | Implement blocker aggregation | `BlockersWarningsPanel.tsx` | E2-S3 |
| E2-S3-T2 | Implement warning aggregation | `BlockersWarningsPanel.tsx` | E2-S3 |
| E2-S3-T3 | Build blockers/warnings panel UI | `BlockersWarningsPanel.tsx` | E2-S3 |
| E2-S3-T4 | Write tests for blocker/warning detection | `BlockersWarningsPanel.test.tsx` | E2-S3 |
| E2-S4-T1 | Build next-prompt widget UI | `NextPromptWidget.tsx` | E2-S4 |
| E2-S4-T2 | Implement copy-to-clipboard functionality | `useCopyToClipboard.ts` | E2-S4 |
| E2-S4-T3 | Wire eligibility engine output to widget | `app/page.tsx` | E2-S4 |
| E2-S4-T4 | Write interaction tests for copy/prerequisites | `NextPromptWidget.test.tsx` | E2-S4 |
| E3-S1-T1 | Build epic table/card UI | `EpicCard.tsx`, `EpicAccordion.tsx` | E3-S1 |
| E3-S1-T2 | Wire epic data from parsed state | `app/epics/page.tsx` | E3-S1 |
| E3-S1-T3 | Write component tests for epic display | `EpicAccordion.test.tsx` | E3-S1 |
| E3-S2-T1 | Build story list/table UI | `StoryRow.tsx` | E3-S2 |
| E3-S2-T2 | Implement epic-to-story drill-down | `EpicAccordion.tsx` | E3-S2 |
| E3-S2-T3 | Write component tests for story drill-down | `StoryRow.test.tsx` | E3-S2 |
| E3-S3-T1 | Build task tree UI with collapsible nodes | `TaskTree.tsx`, `TaskTreeNode.tsx`, `TaskList.tsx` | E3-S3 |
| E3-S3-T2 | Implement status badge styling per status | `StatusBadge.tsx` | E3-S3 |
| E3-S3-T3 | Write component tests for task tree | `TaskTree.test.tsx` | E3-S3 |
| E3-S4-T1 | Implement last-update resolution | `UpdateSummary.tsx` | E3-S4 |
| E3-S4-T2 | Build inline update summary UI | `UpdateSummary.tsx` | E3-S4 |
| E3-S4-T3 | Write tests for update resolution | `UpdateSummary.test.tsx` | E3-S4 |
| E4-S1-T1 | Build prompt inventory table UI | `PromptTable.tsx`, `PromptTableRow.tsx` | E4-S1 |
| E4-S1-T2 | Implement sorting with natural prompt-ID ordering | `PromptTable.tsx` | E4-S1 |
| E4-S1-T3 | Implement filtering/search | `app/prompts/page.tsx` | E4-S1 |
| E4-S1-T4 | Write tests for table rendering/sorting/filtering | `PromptTable.test.tsx` | E4-S1 |
| E4-S2-T1 | Build prompt detail drawer UI | `PromptDetailDrawer.tsx` | E4-S2 |
| E4-S2-T2 | Implement markdown rendering | `MarkdownRenderer.tsx` | E4-S2 |
| E4-S2-T3 | Wire all metadata fields from parsed state | `app/prompts/page.tsx` | E4-S2 |
| E4-S2-T4 | Write component tests for detail drawer | `PromptDetailDrawer.test.tsx` | E4-S2 |
| E4-S3-T1 | Build session timeline UI | `SessionTimeline.tsx` | E4-S3 |
| E4-S3-T2 | Wire session data from parsed handoffs | `app/sessions/page.tsx` | E4-S3 |
| E4-S3-T3 | Implement expand/collapse for session detail | `SessionCard.tsx`, `SessionDetail.tsx` | E4-S3 |
| E4-S3-T4 | Write component tests for timeline | `SessionTimeline.test.tsx`, `SessionCard.test.tsx` | E4-S3 |
| E4-S4-T1 | Implement prompt-to-handoff linking | Client-side filter logic | E4-S4 |
| E4-S4-T2 | Display changed files and handoff link | `PromptDetailDrawer.tsx` | E4-S4 |
| E4-S4-T3 | Write tests for link resolution | `PromptDetailDrawer.test.tsx` | E4-S4 |
| E5-S1-T1 | Implement refresh action | `DashboardContext.tsx` | E5-S1 |
| E5-S1-T2 | Build loading and error state UI | `LoadingIndicator.tsx`, `Header.tsx` | E5-S1 |
| E5-S1-T3 | Write tests for refresh flow | `useDashboard.test.ts` | E5-S1 |
| E5-S2-T1 | Implement file watcher | `fileWatcher.ts` | E5-S2 |
| E5-S2-T2 | Add debounce logic | `fileWatcher.ts` | E5-S2 |
| E5-S2-T3 | Write integration tests for file watch | `fileWatcher.test.ts` | E5-S2 |
| E5-S3-T1 | Build repo selector UI | `Header.tsx` | E5-S3 |
| E5-S3-T2 | Implement repo capability detection | `repoDetection.ts` | E5-S3 |
| E5-S3-T3 | Wire repo switching to parser | `DashboardContext.tsx` | E5-S3 |
| E5-S3-T4 | Write tests for capability detection | `repoDetection.test.ts` | E5-S3 |
| E5-S4-T1 | Implement localStorage persistence | `recentProjects.ts` | E5-S4 |
| E5-S4-T2 | Build recent-projects list in selector | `Header.tsx` | E5-S4 |
| E5-S4-T3 | Write tests for persistence | `recentProjects.test.ts` | E5-S4 |

**Total: 55 tasks across 16 stories in 4 epics.**

---

## Appendix B: Key Decisions Made

| Decision | Rationale | Reference |
|---|---|---|
| Next.js App Router over Pages Router | Current standard; native layouts, loading, error boundaries per operational review | ADR-003, docs/operational-review.md |
| Centralized STATUS_THEME constant | Prevents color drift across 5 views; single source of truth per architect recommendation | ADR-003 review notes §4 |
| useAccordion hook for expand/collapse | Shared logic between Epics and Tasks views; ephemeral state, not persisted | Wireframe §8.4 |
| useDrawer hook with focus trap | Accessibility requirement; Escape close, focus return per wireframe §9.1 | WCAG 2.1 AA, wireframe §8.2 |
| useFilterState synced to URL | Enables deep-linking and shareability per wireframe §8.6 | Wireframe URL structure |
| Chart.js lazy-loaded | Bundle size optimization; chart code not needed on initial paint | ADR-001 bundle budget |
| MarkdownRenderer without rehype-raw | Mandatory security constraint; prevents XSS via raw HTML | Security review HIGH-002 |
| Escalating debounce (500ms/3s) | Balances responsiveness for edits with stability for batch operations | docs/operational-review.md |
| Client-side filtering and pagination | All data in memory; no API calls needed for filter/sort/paginate | ADR-003, architecture overview |
| Reuse parser sorting module in UI | Avoids re-implementing tuple sort; consistent ordering between parser and table | E1-S4 sorting.ts |
