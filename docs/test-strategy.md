# Test Strategy — Project Manager Dashboard v1

> **Version:** 1.0
> **Author Role:** QA Test Architect
> **Prompt:** 7.0.1
> **Date:** 2026-04-04
> **Status:** Approved for implementation

---

## 1. Introduction

This document defines the test strategy for the Project Manager Dashboard, a local-first, read-only SPA that reads YAML-frontmatter markdown files from a repository and renders project status, metrics, and navigation. The strategy covers all test levels — unit, integration, component, and end-to-end — and defines quality gates for each implementation phase.

### 1.1 Objectives

- Ensure parser accuracy: correct extraction, validation, and rollup of all YAML frontmatter data
- Ensure UI correctness: all 5 views render accurately from `DashboardState`
- Ensure resilience: malformed inputs produce warnings, never crashes
- Ensure security: no path traversal, XSS, YAML injection, or symlink escape
- Ensure performance: 250+ prompt files parse within acceptable time
- Ensure accessibility: WCAG 2.1 AA compliance for keyboard navigation, focus management, and color contrast

### 1.2 Scope

| In Scope | Out of Scope |
|---|---|
| Parser layers 1–3 (scanner, extractor, graph builder) | Backend/API testing (none exists) |
| All 5 UI views + application shell | Authentication testing (none exists) |
| File watcher and refresh logic | Mobile-optimized layouts (best-effort only) |
| Multi-repo selector | Full-text search (deferred to v2) |
| Security hardening validations | Git URL repository sources (deferred to v2) |
| Accessibility (WCAG 2.1 AA) | |
| Performance at scale (250+ prompts) | |

### 1.3 Reference Documents

| Document | Path |
|---|---|
| PRD | `docs/project-manager-dashboard-prd.md` |
| Data Contract | `docs/project-manager-dashboard-data-contract.md` |
| Business Rules | `docs/business-rules.md` |
| Epics | `agents/epics/project-manager-dashboard-epics.md` |
| ADR-002 Parser | `agents/decisions/ADR-002-parser-architecture.md` |
| ADR-003 UI | `agents/decisions/ADR-003-ui-architecture.md` |
| Architecture Overview | `agents/context/architecture-overview.md` |
| Security Findings | `docs/security-review-findings.md` |
| Operational Review | `docs/operational-review.md` |

---

## 2. Test Levels

### 2.1 Unit Tests

**Purpose:** Verify individual functions and modules in isolation.

**Scope:**
- Parser Layer 1 — File Scanner functions
- Parser Layer 2 — Frontmatter extraction and validation functions
- Parser Layer 3 — Graph builder, rollup calculations, next-prompt selection
- Utility functions (date parsing, tuple sorting, path sanitization)

**Characteristics:**
- No filesystem access (mocked inputs)
- No DOM rendering
- Fast execution (<5 seconds total)
- High coverage target (≥90% line coverage for parser modules)

**Key Unit Test Scenarios:**

| Module | Scenario | Expected Outcome |
|---|---|---|
| Frontmatter Extractor | Valid YAML with all required fields | Returns typed `ParsedPrompt` |
| Frontmatter Extractor | Missing required field (`prompt_id`) | Returns `ParseWarning` with severity `error`, skips file |
| Frontmatter Extractor | Missing optional field (`archived_at`) | Returns `ParsedPrompt` with null/default, emits `warning` |
| Frontmatter Extractor | Invalid YAML syntax | Returns `ParseWarning`, does not throw |
| Frontmatter Extractor | YAML bomb (deeply nested anchors) | Rejects input, returns `ParseWarning` |
| Frontmatter Extractor | Prototype pollution (`__proto__`, `constructor`) | Fields stripped or rejected |
| Frontmatter Extractor | ISO 8601 date parsing — valid | Correctly parsed `Date` object |
| Frontmatter Extractor | ISO 8601 date parsing — invalid string | Returns `ParseWarning` |
| Frontmatter Extractor | Unrecognized status value | Returns `ParsedPrompt` + `ParseWarning` |
| Tuple Sorter | Standard IDs: `1.0.1`, `2.0.1`, `16.0.2` | Correct numeric ordering |
| Tuple Sorter | Inserted IDs: `16.0.1`, `16.0.2`, `16.1.1`, `17.0.1` | `16.0.1 < 16.0.2 < 16.1.1 < 17.0.1` |
| Tuple Sorter | Non-numeric IDs: `00_bootstrap` | Sorted after numeric IDs or handled gracefully |
| Dependency Resolver | Linear chain (A → B → C), all done | C is eligible |
| Dependency Resolver | Prerequisite not done | Prompt not eligible |
| Dependency Resolver | Prerequisite does not exist | Emit warning, treat as unmet |
| Dependency Resolver | Circular prerequisites (A → B → A) | Detect cycle, emit error |
| Completion Rollup | 5 done, 2 cancelled, 3 total active | 100% completion (5/5) |
| Completion Rollup | 3 done, 1 superseded, 6 total | 50% completion (3/6) adjusted |
| Completion Rollup | Zero prompts | 0% or N/A, no division by zero |
| Next-Prompt Selector | Multiple eligible, different IDs | Returns lowest tuple |
| Next-Prompt Selector | All prompts done | Returns null/empty |
| Next-Prompt Selector | Eligible prompt is blocked | Skips blocked, returns next |
| Path Sanitizer | `../../../etc/passwd` | Rejected |
| Path Sanitizer | Encoded traversal (`%2e%2e%2f`) | Rejected |
| Path Sanitizer | Null byte injection (`file%00.md`) | Rejected |
| Path Sanitizer | Valid relative path within repo | Accepted |
| Health Badge | No blockers, recent completion | "On Track" |
| Health Badge | 3+ blocked prompts | "Blocked" |
| Health Badge | No completions, no prompts done | "Not Started" |

### 2.2 Integration Tests

**Purpose:** Verify interactions between parser layers and between parser and filesystem.

**Scope:**
- Parser Layer 1 → Layer 2 pipeline (scan → extract)
- Parser Layer 2 → Layer 3 pipeline (extract → graph build)
- Full parser pipeline (filesystem → `DashboardState`)
- File watcher → parser re-execution → state update

**Characteristics:**
- Uses test fixture directories (real `.md` files on disk)
- Tests the complete parse pipeline against known repo structures
- Validates `DashboardState` output shape and accuracy

**Key Integration Test Scenarios:**

| Scenario | Input | Expected Outcome |
|---|---|---|
| Minimal valid repo | `prompts/index.md` + 1 active prompt + 1 epic | Correct `DashboardState` with 1 prompt, 1 epic, metrics |
| Full repo snapshot | Fixture with 10 prompts, 3 epics, 5 handoffs | All entities linked correctly; metrics accurate |
| Mixed active/archive | 5 active + 3 archived prompts | Totals include archived; completion % correct |
| All archived | 0 active + 10 archived prompts | Empty active list; completion rollups correct |
| Missing `prompts/index.md` | Repo without index file | Capability detection fails; meaningful error |
| Missing required directories | No `agents/epics/` | Capability detection fails gracefully |
| Malformed files mixed with valid | 8 valid + 2 malformed prompts | 8 parsed correctly; 2 produce `ParseWarning[]` |
| Handoff-to-prompt linking | Handoff with `prompt_id: "3.0.1"` | Linked to correct prompt in graph |
| Multiple handoffs per prompt | 2 handoffs for same `prompt_id` | Both linked; latest used for session display |
| Epic/story/task extraction | Combined markdown epic file | Correct hierarchy: epic → stories → tasks |
| File watcher trigger | File change after initial parse | Re-parse triggered; state updated |
| Batch file changes | `git checkout` changes 20 files at once | Single debounced re-parse (3s batch window) |

### 2.3 Component Tests

**Purpose:** Verify individual React components render correctly given props/state.

**Scope:**
- All UI components in `src/components/`
- View-level components (Overview, Epics, Prompts, Sessions, Tasks)
- Application shell (header, sidebar, status bar)
- Prompt detail drawer
- Next-prompt widget
- Charts (status distribution, burndown)
- Status badges

**Characteristics:**
- Rendered in jsdom via Testing Library
- No browser required
- Mocked `DashboardState` context provider
- Focus on rendering correctness, user interactions, and accessibility

**Key Component Test Scenarios:**

| Component | Scenario | Expected Outcome |
|---|---|---|
| MetricsCard | Valid metrics data | Renders correct totals and percentages |
| MetricsCard | Zero values | Displays "0" or "N/A", no layout break |
| StatusBadge | Each of 8 statuses | Correct color, label, ARIA attributes |
| StatusBadge | Unknown status | Fallback styling, no crash |
| PromptTable | 10 prompts | Renders all rows with correct data |
| PromptTable | 0 prompts | Renders empty state message |
| PromptTable | Sort by status | Rows reorder correctly |
| PromptTable | Filter by phase | Only matching rows visible |
| PromptDetailDrawer | Open with valid prompt | All metadata fields displayed |
| PromptDetailDrawer | Escape key | Drawer closes |
| PromptDetailDrawer | Focus trap | Tab cycles within drawer |
| NextPromptWidget | Eligible prompt available | Shows prompt with copy button |
| NextPromptWidget | No eligible prompts | Shows "all caught up" message |
| NextPromptWidget | Copy to clipboard | Clipboard API called; visual feedback shown |
| EpicAccordion | Expand epic | Shows stories and tasks |
| EpicAccordion | All tasks done | Epic shows 100% badge |
| SessionTimeline | 5 sessions | Chronological order, links to handoffs |
| SessionTimeline | 0 sessions | Empty state message |
| Chart (StatusDistribution) | Valid data | Renders chart with correct segments |
| Chart (StatusDistribution) | No data | Empty chart state (no broken axes) |
| ErrorBoundary | Child throws error | Fallback UI rendered, not propagated |
| Sidebar | Click navigation | Active view updates |
| RefreshButton | Click | Triggers re-parse |
| StatusBar | After parse | Shows timestamp, file count, warning count |
| RepoSelector | Valid path | Loads repo; parser executes |
| RepoSelector | Path traversal attempt | Rejected; error message shown |

### 2.4 End-to-End Tests

**Purpose:** Verify complete user workflows in a real browser environment.

**Scope:**
- Full application launch and initial parse
- Navigation between all 5 views
- Interactive features (drill-down, drawer, copy, filter, sort)
- Responsive layout at 3 breakpoints
- Keyboard-only navigation paths
- File change detection and refresh

**Characteristics:**
- Runs in real browser (Chromium via Playwright)
- Uses fixture repositories on disk
- Tests full user journeys from launch to interaction
- Slowest test level; run in CI, not on every save

**Key E2E Test Scenarios:**

| Scenario | Steps | Expected Outcome |
|---|---|---|
| Initial load | Open app → wait for parse | Overview displays with correct metrics |
| Navigate all views | Click each sidebar link | Each view renders without error |
| Prompt drill-down | Prompts view → click row → drawer opens | Drawer shows complete prompt metadata |
| Drawer keyboard nav | Open drawer → Tab through → Escape | Focus trapped; drawer closes on Escape |
| Epic accordion | Epics view → expand epic → expand story | Task list visible with status badges |
| Copy next prompt | Overview → next prompt widget → click copy | Clipboard contains prompt content; toast shown |
| Sort prompts | Prompts view → click column header | Table reorders correctly |
| Filter prompts | Prompts view → select status filter | Only matching rows visible |
| Refresh button | Click refresh → wait | Metrics recalculate; timestamp updates |
| Empty repo | Load fixture with 0 prompts | Empty states on all views; no errors |
| Large repo | Load fixture with 250+ prompts | All prompts visible; UI responsive |
| Multi-repo switch | Select different repo from selector | New repo loads; state fully replaces |
| Responsive: desktop | 1280px viewport | Full sidebar, multi-column layout |
| Responsive: tablet | 768px viewport | Collapsed sidebar, adjusted layout |
| Responsive: mobile | 375px viewport | Hamburger menu, stacked layout |
| Keyboard-only: full workflow | Tab through entire app, no mouse | All interactive elements reachable |
| Screen reader labels | Audit ARIA labels | All interactive elements have accessible names |

---

## 3. Test Scenarios by Epic

### 3.1 E1 — Parser Foundation

| Story | Key Test Scenarios |
|---|---|
| E1-S1: Frontmatter contract | Required fields present; optional fields nullable; invalid YAML handled |
| E1-S2: File scanning | Correct directories scanned; non-.md files ignored; symlinks rejected |
| E1-S3: Parser pipeline | Layer 1→2→3 produces correct `DashboardState`; warnings collected |
| E1-S4: Sorting & dependencies | Tuple sort order; prerequisite resolution; cycle detection |
| E1-S5: Eligibility engine | Next-prompt algorithm; blocked exclusion; all-done case |
| E1-S6: JSON emitter | Output matches `DashboardState` interface; deterministic output |

### 3.2 E2 — Overview Dashboard

| Story | Key Test Scenarios |
|---|---|
| E2-S1: App shell | Sidebar navigation; header displays project name; status bar updates |
| E2-S2: Metrics cards | Correct totals; correct percentages; zero-value handling |
| E2-S3: Blockers panel | Blocked prompts listed; empty state when no blockers |
| E2-S4: Next-prompt widget | Correct prompt selected; copy works; empty state |

### 3.3 E3 — Epics View

| Story | Key Test Scenarios |
|---|---|
| E3-S1: Epic table | All epics listed; completion badges accurate |
| E3-S2: Drill-down | Story expansion; task listing; status badges |
| E3-S3: Task tree | Three-level hierarchy renders; all statuses represented |

### 3.4 E4 — Prompt Inventory & Sessions

| Story | Key Test Scenarios |
|---|---|
| E4-S1: Prompt table | All prompts (active + archived) listed; sort and filter work |
| E4-S2: Detail drawer | All metadata fields displayed; prerequisite links; handoff links |
| E4-S3: Session timeline | Chronological order; handoff links work |
| E4-S4: Session detail | Changed files listed; blockers shown; next prompts linked |

### 3.5 E5 — Refresh & Repo Management

| Story | Key Test Scenarios |
|---|---|
| E5-S1: Manual refresh | Button triggers re-parse; metrics update |
| E5-S2: File watcher | Single-file change detected; batch debounce works |
| E5-S3: Repo selector | Valid path loads; path traversal rejected; allowlist enforced |

### 3.6 E6 — Review, Quality, Hardening

| Story | Key Test Scenarios |
|---|---|
| E6-S1: Malformed metadata | Parser handles gracefully; warnings emitted; UI shows warnings |
| E6-S2: Performance | 250+ prompts parse in <2s; UI remains responsive |
| E6-S3: Accessibility | Keyboard nav; focus management; ARIA labels; color contrast |
| E6-S4: Security | Path traversal; XSS; YAML injection; symlink; prototype pollution |

---

## 4. Test Fixture Requirements

### 4.1 Fixture Directory Structure

```
tests/fixtures/
├── valid-minimal/          # Minimum viable repo (1 epic, 1 prompt, 1 handoff)
│   ├── prompts/
│   │   ├── index.md
│   │   └── active/
│   │       └── 1.0.1-sample.md
│   ├── agents/
│   │   ├── epics/
│   │   │   └── sample-epics.md
│   │   └── handoffs/
│   │       └── S-2026-01-01-001-sample.md
│   └── schemas/
├── valid-full/             # Complete repo snapshot (~30 prompts, all entities)
│   └── (mirrors real repo structure)
├── valid-mixed-archive/    # Mix of active and archived prompts
│   ├── prompts/
│   │   ├── index.md
│   │   ├── active/ (5 prompts)
│   │   └── archive/ (5 prompts)
│   └── agents/ (...)
├── empty-repo/             # Repo with required dirs but zero content files
│   ├── prompts/
│   │   ├── index.md (empty table)
│   │   └── active/
│   └── agents/
│       ├── epics/
│       └── handoffs/
├── large-scale/            # 250+ generated prompt files for performance testing
│   └── (auto-generated fixture)
├── malformed/              # Files with intentionally broken YAML/frontmatter
│   ├── prompts/active/
│   │   ├── missing-required-field.md
│   │   ├── invalid-yaml-syntax.md
│   │   ├── empty-frontmatter.md
│   │   ├── no-frontmatter.md
│   │   ├── unrecognized-status.md
│   │   ├── invalid-date-format.md
│   │   └── duplicate-prompt-id.md
│   └── agents/epics/
│       └── malformed-epic.md
├── adversarial/            # Security-focused test inputs
│   ├── prompts/active/
│   │   ├── yaml-bomb.md
│   │   ├── prototype-pollution.md
│   │   ├── xss-in-title.md
│   │   ├── javascript-link.md
│   │   └── null-bytes-in-path.md
│   └── path-traversal/
│       └── (symlinks and ../ attempts)
├── edge-cases/             # Boundary conditions
│   ├── prompts/active/
│   │   ├── all-optional-fields-null.md
│   │   ├── non-numeric-id.md
│   │   ├── inserted-prompt-16.0.2.md
│   │   ├── circular-prerequisites.md
│   │   └── superseded-prompt.md
│   └── agents/handoffs/
│       ├── multiple-handoffs-same-prompt-a.md
│       └── multiple-handoffs-same-prompt-b.md
└── missing-structure/      # Repos missing required directories
    ├── no-index/           # Missing prompts/index.md
    ├── no-epics-dir/       # Missing agents/epics/
    └── no-handoffs-dir/    # Missing agents/handoffs/
```

### 4.2 Fixture File Specifications

#### Valid Prompt Fixture (`valid-minimal/prompts/active/1.0.1-sample.md`)
Must contain all required frontmatter fields per data contract:
- `prompt_id`, `title`, `phase`, `status`, `epic_id`, `story_id`, `task_ids`
- `owner_role`, `prerequisites`, `required_reading`
- `downstream_prompts`, `inserted_after`, `affects_prompts`, `review_required`
- `session_handoff`, `supersedes`, `superseded_by`, `insert_reason`
- `created_at`, `updated_at`, `completed_at`, `archived_at`

#### Valid Handoff Fixture (`valid-minimal/agents/handoffs/S-2026-01-01-001-sample.md`)
Must contain all required handoff frontmatter fields:
- `session_id`, `prompt_id`, `role`, `status_outcome`
- `completion_percent`, `started_at`, `ended_at`
- `changed_files`, `blockers`, `next_recommended_prompts`, `summary`

#### Valid Epics Fixture (`valid-minimal/agents/epics/sample-epics.md`)
Must follow combined markdown format:
```markdown
## Epic E1: Sample Epic
**Status:** in_progress

### E1-S1 Sample Story
**Status:** ready

#### Tasks
- E1-S1-T1: Sample task — status: ready
```

#### Malformed Fixtures
Each file should test exactly one failure mode:
- `missing-required-field.md` — omits `prompt_id`
- `invalid-yaml-syntax.md` — unclosed quote in YAML
- `empty-frontmatter.md` — `---\n---` with no fields
- `no-frontmatter.md` — plain markdown, no `---` delimiters
- `unrecognized-status.md` — `status: "invalid_value"`
- `invalid-date-format.md` — `created_at: "not-a-date"`
- `duplicate-prompt-id.md` — same `prompt_id` as another fixture

#### Adversarial Fixtures
- `yaml-bomb.md` — deeply nested YAML anchors/aliases
- `prototype-pollution.md` — frontmatter with `__proto__` or `constructor` keys
- `xss-in-title.md` — `title: "<script>alert('xss')</script>"`
- `javascript-link.md` — markdown body with `[click](javascript:alert(1))`
- `null-bytes-in-path.md` — `session_handoff: "path%00.md"`

### 4.3 Large-Scale Fixture Generation

For performance testing (250+ prompts), use a fixture generator script:
- Generate 250 valid prompt files with sequential IDs (`1.0.1` through `250.0.1`)
- Generate 10 epic files, 50 stories, 200 tasks
- Generate 100 handoff files linked to completed prompts
- Include 5% malformed files (~12 files) to test mixed-validity parsing
- Include realistic prerequisite chains (max depth 8)
- Store generator script in `tests/fixtures/generate-large-scale.ts`

---

## 5. Security Test Requirements

Based on findings from `docs/security-review-findings.md`:

### 5.1 HIGH Priority

| Finding | Test Approach |
|---|---|
| HIGH-001: Path traversal via repo selector | Unit test path sanitizer with `../`, encoded traversal (`%2e%2e`), null bytes, unicode normalization; E2E test repo selector rejects malicious paths |
| HIGH-002: XSS via markdown rendering | Component test with malicious markdown (script tags, javascript: links, event handlers); verify `rehype-raw` is never enabled; verify CSP meta tag present |

### 5.2 MEDIUM Priority

| Finding | Test Approach |
|---|---|
| MED-001: YAML injection | Unit test YAML bomb rejection, JS execution prevention, type coercion handling |
| MED-002: Symlink traversal | Integration test scanner with symlinks; verify `followSymlinks: false` in chokidar config |
| MED-003: Dependency supply chain | CI check: `npm audit` in pipeline; lock file integrity verification |
| MED-004: Prototype pollution | Unit test frontmatter with `__proto__`, `constructor.prototype`; verify sanitized |

### 5.3 LOW Priority

| Finding | Test Approach |
|---|---|
| LOW-001: Error message leakage | Component test error boundaries show relative paths only; no stack traces in UI |
| LOW-002: Clipboard API abuse | Component test copy button with large content; verify truncation |
| LOW-003: File watcher DoS | Integration test batch changes; verify debounce limits (500ms single, 3s batch) |

---

## 6. Performance Test Approach

### 6.1 Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Parse time (250 prompts) | < 2 seconds | Wall-clock time from scan start to `DashboardState` ready |
| Parse time (30 prompts) | < 500 milliseconds | Wall-clock time for typical project |
| Initial page load | < 3 seconds | First meaningful paint on localhost |
| Bundle size | < 500 KB gzipped | `next build` output analysis |
| Memory usage | < 100 MB | Node.js heap during parse of 250+ files |
| File watcher response | < 1 second after debounce | Time from file change to UI update |

### 6.2 Performance Test Scenarios

| Scenario | Approach |
|---|---|
| Parser throughput | Time full parse of `large-scale` fixture (250+ prompts); assert < 2s |
| Parser memory | Monitor heap during parse of `large-scale` fixture; assert < 100 MB |
| Incremental parse | Time re-parse after single file change; assert < 500ms |
| Chart rendering | Time chart render with 250 data points; assert no UI freeze (>100ms frame) |
| Bundle analysis | Run `next build`; verify gzipped output < 500 KB |
| Startup time | Measure time from `npm start` to interactive; assert < 3s |

### 6.3 Performance Test Tooling

- **Parser benchmarks:** Custom timing in Jest tests using `performance.now()`
- **Bundle analysis:** `@next/bundle-analyzer` or `source-map-explorer`
- **Memory profiling:** Node.js `--max-old-space-size` constraints in test runner
- **Lighthouse:** Automated Lighthouse CI for page load metrics (optional, CI only)

---

## 7. Accessibility Test Requirements

### 7.1 Standards

- **Target:** WCAG 2.1 AA compliance
- **Scope:** All 5 views, application shell, prompt detail drawer, interactive widgets

### 7.2 Automated Accessibility Tests

| Test | Tool | Scope |
|---|---|---|
| ARIA violations | axe-core (via @axe-core/react or jest-axe) | All rendered views |
| Color contrast | axe-core | All status badges, text elements |
| Heading hierarchy | axe-core | All views |
| Form labels | axe-core | Repo selector, search/filter inputs |
| Image alt text | axe-core | Charts (must have text alternatives) |

### 7.3 Manual / E2E Accessibility Tests

| Test | Approach |
|---|---|
| Keyboard-only navigation | E2E test: Tab through all interactive elements without mouse |
| Focus management | E2E test: drawer open → focus moves inside; drawer close → focus returns |
| Focus trap in drawer | E2E test: Tab cycles within drawer, does not escape |
| Skip navigation link | E2E test: First Tab press reveals skip link |
| Screen reader announcement | Manual test: verify ARIA live regions for status updates |
| Reduced motion | E2E test: `prefers-reduced-motion` disables transitions |

---

## 8. Recommended Test Tooling

| Tool | Purpose | Justification |
|---|---|---|
| **Jest** | Unit and integration test runner | De facto standard for TypeScript/React projects; fast, parallel execution |
| **@testing-library/react** | Component tests | Tests user-facing behavior, not implementation; promotes accessible patterns |
| **@testing-library/user-event** | User interaction simulation | Realistic event dispatching for component tests |
| **Playwright** | End-to-end tests | Multi-browser support; reliable selectors; built-in assertions; supports accessibility testing |
| **jest-axe** | Automated accessibility | Integrates axe-core with Jest for component-level a11y assertions |
| **@axe-core/playwright** | E2E accessibility | Axe-core integration for Playwright E2E accessibility scans |
| **gray-matter** | Test fixture validation | Same parser used in production; validates fixture YAML correctness |
| **@next/bundle-analyzer** | Bundle size analysis | Verifies <500KB gzipped target; identifies large dependencies |
| **msw (Mock Service Worker)** | API mocking (if needed) | Intercepts network requests for isolated testing (minimal use expected) |

### 8.1 Test Configuration

```
dashboard/
├── jest.config.ts            # Jest configuration
├── jest.setup.ts             # Global test setup (Testing Library matchers)
├── playwright.config.ts      # Playwright E2E configuration
├── tests/
│   ├── unit/                 # Unit tests (*.test.ts)
│   ├── integration/          # Integration tests (*.integration.test.ts)
│   ├── components/           # Component tests (*.test.tsx)
│   ├── e2e/                  # Playwright E2E tests (*.spec.ts)
│   └── fixtures/             # Shared test fixtures
└── src/
    └── **/*.test.ts          # Co-located unit tests (optional pattern)
```

### 8.2 Test Naming Conventions

- Unit tests: `<module>.test.ts` (e.g., `frontmatter-extractor.test.ts`)
- Integration tests: `<pipeline>.integration.test.ts` (e.g., `parser-pipeline.integration.test.ts`)
- Component tests: `<Component>.test.tsx` (e.g., `PromptTable.test.tsx`)
- E2E tests: `<workflow>.spec.ts` (e.g., `prompt-drill-down.spec.ts`)

---

## 9. Quality Gates

### 9.1 Phase 4: Parser Implementation (Prompts 11.0.1–15.0.1)

| Gate | Criteria | Blocking? |
|---|---|---|
| Unit test coverage | ≥90% line coverage for `src/parser/` | Yes |
| All unit tests pass | 0 failures | Yes |
| Integration tests pass | Parser pipeline produces correct `DashboardState` for `valid-minimal` and `valid-full` fixtures | Yes |
| Malformed input handling | Parser produces warnings (not crashes) for all `malformed/` fixtures | Yes |
| Security: path sanitization | Path traversal tests pass | Yes |
| Security: YAML safety | YAML bomb and prototype pollution tests pass | Yes |
| Performance baseline | 30-prompt parse < 500ms | Yes |
| TypeScript strict mode | Zero type errors | Yes |
| Lint clean | Zero ESLint errors (warnings acceptable) | Yes |

### 9.2 Phase 5: UI Implementation (Prompts 16.0.1–23.0.1)

| Gate | Criteria | Blocking? |
|---|---|---|
| Component test coverage | ≥80% line coverage for `src/components/` | Yes |
| All component tests pass | 0 failures | Yes |
| Accessibility: axe-core | Zero violations on all 5 views | Yes |
| Empty states | All views render meaningful empty states | Yes |
| Error boundaries | Each view wrapped; child errors contained | Yes |
| Status badge consistency | All 8 statuses render correct color/label | Yes |
| Chart rendering | Charts render with and without data | Yes |
| TypeScript strict mode | Zero type errors | Yes |
| Lint clean | Zero ESLint errors | Yes |

### 9.3 Phase 6: Validation and Hardening (Prompts 24.0.1–27.0.1)

| Gate | Criteria | Blocking? |
|---|---|---|
| E2E tests pass | All Playwright scenarios pass | Yes |
| Keyboard navigation | All interactive elements reachable via keyboard | Yes |
| Focus management | Drawer focus trap works; focus returns on close | Yes |
| Performance: 250+ prompts | Parse < 2s; UI responsive | Yes |
| Bundle size | < 500 KB gzipped | Yes |
| Security hardening | All HIGH/MEDIUM security findings mitigated | Yes |
| Malformed metadata validation | All `malformed/` and `adversarial/` fixtures handled | Yes |
| WCAG 2.1 AA | Zero critical/serious axe violations | Yes |
| `npm audit` | Zero high/critical vulnerabilities | Yes |

### 9.4 Phase 7: Release (Prompts 28.0.1–30.0.1)

| Gate | Criteria | Blocking? |
|---|---|---|
| All previous gates passed | No regressions | Yes |
| Full E2E suite green | All scenarios across 3 viewports | Yes |
| Documentation complete | README with setup, test, and build instructions | Yes |
| Human sponsor review | Approval on UX, functionality, and quality | Yes |

---

## 10. Test Execution Strategy

### 10.1 Local Development

| When | What Runs | Command |
|---|---|---|
| On save (watch mode) | Unit tests for changed files | `npm run test:watch` |
| Before commit (pre-commit hook) | Unit + component tests | `npm run test` |
| Manual | Full E2E suite | `npm run test:e2e` |
| Manual | Performance benchmarks | `npm run test:perf` |

### 10.2 CI Pipeline

| Stage | Tests | Fail Behavior |
|---|---|---|
| Build | TypeScript compilation + lint | Block merge |
| Unit + Integration | All Jest tests | Block merge |
| Component | All component tests | Block merge |
| Accessibility | jest-axe on all views | Block merge |
| Bundle analysis | Verify < 500 KB gzipped | Block merge |
| E2E | Playwright full suite | Block merge |
| Security | `npm audit --audit-level=high` | Block merge |
| Performance | 250-prompt parse benchmark | Warn (non-blocking for now) |

### 10.3 Test Data Management

- Fixtures committed to repository under `tests/fixtures/`
- Large-scale fixtures generated by script (not committed; generated in CI)
- Fixture generation script committed as `tests/fixtures/generate-large-scale.ts`
- No external test data dependencies
- No network access required for any test

---

## 11. Risk-Based Test Prioritization

Based on the risk register (`agents/context/risk-register.md`):

| Risk | Likelihood | Impact | Test Priority |
|---|---|---|---|
| R1: Weak markdown discipline | High | Medium | High — extensive malformed fixture testing |
| R2: Inconsistent prompt shapes | Medium | High | High — schema validation tests |
| R3: Inserted prompt ordering | Medium | High | High — tuple sorting with inserted IDs |
| R4: Prerequisite drift | Medium | Medium | Medium — dependency resolver tests |
| R5: Parser performance at scale | Medium | High | High — 250-prompt benchmark |
| R6: Path traversal | Low | Critical | Critical — security test suite |
| R10: Missing lifecycle fields | High | Medium | High — frontmatter extractor tests |
| R11: Epic parsing schema undefined | High | Medium | High — epic extraction tests |
| R13: No React error boundaries | Medium | High | High — error boundary component tests |
| R14: Bundle size exceeds target | Medium | Medium | Medium — bundle analysis gate |
| R15: XSS via markdown | Low | Critical | Critical — security test suite |
| R17: Prototype pollution | Low | High | High — adversarial fixture tests |

---

## 12. Definitions

| Term | Definition |
|---|---|
| **Test Level** | Unit, integration, component, or end-to-end |
| **Quality Gate** | A set of pass/fail criteria that must be met before proceeding to the next phase |
| **Fixture** | A predefined test input (file, directory, or data structure) used to exercise specific scenarios |
| **ParseWarning** | A structured diagnostic emitted by the parser for malformed or unexpected input: `{ file, line?, code, message, severity }` |
| **DashboardState** | The top-level data structure produced by the parser, consumed by the React UI |
| **Tuple Sort** | Numeric comparison of prompt ID segments (e.g., `[16, 0, 2]` vs `[17, 0, 1]`) |

---

## Appendix A: Test Scenario Traceability Matrix

| PRD Requirement | Test Level | Test Scenario Reference |
|---|---|---|
| FR-1: Repository detection | Integration | §2.2 — Minimal valid repo, missing structure |
| FR-2: Project metrics | Unit, Component | §2.1 — Completion rollup; §2.3 — MetricsCard |
| FR-6: Archived prompt totals | Integration | §2.2 — Mixed active/archive |
| FR-7: Prompt detail drawer | Component, E2E | §2.3 — PromptDetailDrawer; §2.4 — Prompt drill-down |
| FR-8: Next prompt widget | Unit, Component | §2.1 — Next-prompt selector; §2.3 — NextPromptWidget |
| FR-11: Inserted prompts | Unit | §2.1 — Tuple sorter with inserted IDs |
| FR-16: Refresh model | Integration, E2E | §2.2 — File watcher; §2.4 — Refresh button |
| Security HIGH-001 | Unit, E2E | §5.1 — Path traversal tests |
| Security HIGH-002 | Component | §5.1 — XSS tests |
| WCAG 2.1 AA | Component, E2E | §7 — All accessibility tests |
| Performance 250+ | Integration | §6 — Large-scale fixture parse |

---

*End of test strategy document.*
