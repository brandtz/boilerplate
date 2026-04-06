# Project Manager Dashboard Epics, Stories, and Tasks

## Epic E1: Repo Data Contracts and Parsing Foundation

### E1-S1 Define and validate prompt frontmatter contract
**Status:** ready
**Acceptance Criteria:**
- AC-1: All prompt YAML frontmatter fields from the data contract are documented, including lifecycle fields (`session_handoff`, `completed_at`, `archived_at`, `supersedes`, `superseded_by`, `insert_reason`)
- AC-2: A validation function returns structured errors/warnings distinguishing required fields (`prompt_id`, `status`, `title`) from optional fields per the error taxonomy in `docs/business-rules.md` Section 4.5
- AC-3: Validator rejects files with no YAML frontmatter (error), accepts files with missing optional fields (warning)
- AC-4: At least 3 example prompt files pass validation with zero errors and zero warnings
- AC-5: At least 2 example prompt files demonstrate warning-level issues (missing optional fields) and are parsed without crashing

#### Tasks
- E1-S1-T1: Define the canonical YAML schema for prompt frontmatter
- E1-S1-T2: Implement a frontmatter validator that returns structured errors/warnings
- E1-S1-T3: Create 3+ example prompt files that conform to the contract

### E1-S2 Define and validate session handoff contract
**Status:** ready
**Acceptance Criteria:**
- AC-1: All handoff YAML frontmatter fields from the data contract are documented, including lifecycle fields (`files_removed`, `tests_run`, `validation_results`, `decisions_made`, `open_risks`, `downstream_impacts`)
- AC-2: A validation function returns structured errors/warnings using the same taxonomy as the prompt validator
- AC-3: Validator rejects handoff files missing required fields (`session_id`, `prompt_id`, `status_outcome`)
- AC-4: At least 2 example handoff files pass validation with zero errors
- AC-5: Handoff-to-prompt linking resolves correctly via `prompt_id` field matching (not filename convention)

#### Tasks
- E1-S2-T1: Define the canonical YAML schema for handoff frontmatter
- E1-S2-T2: Implement a handoff frontmatter validator
- E1-S2-T3: Create 2+ example handoff files that conform to the contract

### E1-S3 Build markdown frontmatter parser
**Status:** ready
**Acceptance Criteria:**
- AC-1: Parser reads `prompts/index.md` first to build the canonical prompt registry before scanning folders
- AC-2: Parser scans `prompts/active/`, `prompts/archive/`, `agents/epics/`, and `agents/handoffs/` directories
- AC-3: Parser extracts YAML frontmatter from `.md` files using gray-matter
- AC-4: Parser produces a normalized in-memory graph model: epic → story → task → prompt → handoff
- AC-5: Parser supports the combined epics markdown format (headings-based extraction per `docs/business-rules.md` Section 4.2)
- AC-6: Parser builds a reverse index from task IDs to prompts (`Map<task_id, prompt_id[]>`)
- AC-7: Parser handles missing or malformed frontmatter gracefully: emits structured warnings/errors per the error taxonomy, never crashes
- AC-8: Parser works on repos with 250+ prompt files without error or degradation
- AC-9: All validation results (errors, warnings, info) are collected in a `validationResults[]` array in the output

#### Tasks
- E1-S3-T1: Implement YAML frontmatter extraction from markdown files
- E1-S3-T2: Implement directory scanner for epics, prompts, and handoffs folders
- E1-S3-T3: Build normalized graph model (epic → story → task → prompt → handoff)
- E1-S3-T4: Add graceful error handling for malformed files
- E1-S3-T5: Write unit tests for parser with valid and invalid inputs

### E1-S4 Build natural prompt sequence sorting
**Status:** ready
**Acceptance Criteria:**
- AC-1: Prompt IDs are parsed into numeric tuples (e.g., `"16.0.2"` → `[16, 0, 2]`)
- AC-2: Sorting compares tuples element-by-element; string-based sorting is never used
- AC-3: Inserted prompts appear in correct position: `16.0.1` < `16.0.2` < `16.1.1` < `17.0.1`
- AC-4: Prompts with non-numeric IDs (e.g., `00_bootstrap`) sort before all numeric prompts
- AC-5: Sort is stable (prompts with identical IDs retain insertion order)

#### Tasks
- E1-S4-T1: Implement numeric tuple comparison for prompt IDs
- E1-S4-T2: Write sort tests with edge cases (insertions, branches, gaps)

### E1-S5 Build dependency graph and eligibility engine
**Status:** ready
**Acceptance Criteria:**
- AC-1: Engine determines which prompts are eligible using the algorithm in `docs/business-rules.md` Section 3 (status=ready, in `prompts/active/`, all prerequisites done, not blocked)
- AC-2: Engine selects the single next recommended prompt (lowest natural sort among eligible)
- AC-3: Engine generates a human-readable rationale string explaining why the prompt is next (per `docs/business-rules.md` Section 3.3)
- AC-4: Engine generates a "no eligible prompts" message when none qualify, including blocked/waiting counts
- AC-5: Engine identifies downstream prompts affected by an insertion and flags those needing prerequisite review
- AC-6: Engine flags prompts whose prerequisites reference non-existent prompt IDs (warning)
- AC-7: Integration tests cover: linear chain, branching prerequisites, inserted prompt, all-blocked, empty repo

#### Tasks
- E1-S5-T1: Build prerequisite resolution logic against prompt status map
- E1-S5-T2: Implement next-prompt selection algorithm (ready + prerequisites met + lowest sort)
- E1-S5-T3: Implement downstream impact detection for inserted prompts
- E1-S5-T4: Write integration tests with a multi-prompt dependency graph

### E1-S6 Build JSON state emitter
**Status:** ready
**Acceptance Criteria:**
- AC-1: Parser emits a normalized JSON file conforming to a formal TypeScript interface (to be defined at prompt 9.0.1, resolves GAP-DC-03)
- AC-2: JSON includes: project summary metrics (all counters from FR-2 including `in_progress`), epics with completion %, prompts with lifecycle fields, sessions, next-prompt data with rationale, validation results
- AC-3: Emitter can be run as a CLI command (`npx dashboard-parse --repo <path> --output <json-path>`) or imported as a module
- AC-4: Snapshot tests compare emitter output against expected JSON for a known fixture
- AC-5: `schemas/dashboard-state.example.json` is demoted to non-normative example; the TypeScript interface is the specification

#### Tasks
- E1-S6-T1: Implement JSON serialization of the normalized graph model
- E1-S6-T2: Conform output schema to `schemas/dashboard-state.example.json`
- E1-S6-T3: Add CLI entry point for state generation
- E1-S6-T4: Write snapshot tests comparing emitter output against expected JSON

---

## Epic E2: Overview Dashboard Experience

### E2-S1 Build project summary cards
**Status:** draft
**Acceptance Criteria:**
- AC-1: Dashboard displays summary cards for: total epics, total stories, total tasks, total prompts, done, in_progress, blocked, in_review, ready counts
- AC-2: Summary includes both scope completion % and execution completion % (dual-metric model per `docs/business-rules.md` Section 2.4)
- AC-3: Counts update on data refresh without page reload
- AC-4: Cards are visually distinct, scannable, and use consistent color coding aligned with status badge colors
- AC-5: When all counts are zero (empty repo), cards display zero values with no errors

#### Tasks
- E2-S1-T1: Create summary card UI components
- E2-S1-T2: Wire summary data from parsed state to card components
- E2-S1-T3: Write component tests for summary cards

### E2-S2 Build overall progress charts
**Status:** draft
**Acceptance Criteria:**
- AC-1: Epic completion bar or donut chart renders with one segment per epic, sized by `completion_percent`
- AC-2: Prompt status distribution chart renders with one segment per status, reflecting current parsed state
- AC-3: Session throughput timeline chart renders using handoff `ended_at` timestamps as data points (per `docs/business-rules.md` Section 6.1); gaps between sessions produce flat lines, not interpolation
- AC-4: Remaining-prompts-over-time chart derives from total prompts minus cumulative done at each handoff date
- AC-5: Charts resize responsively when the browser window is resized
- AC-6: Charts render correctly when data is empty (zero epics, zero prompts) — show empty-state placeholder, not a broken chart

#### Tasks
- E2-S2-T1: Select and integrate chart library
- E2-S2-T2: Implement epic completion chart
- E2-S2-T3: Implement prompt status distribution chart
- E2-S2-T4: Implement session throughput timeline chart
- E2-S2-T5: Write visual regression or snapshot tests for charts

### E2-S3 Build blockers and warnings panel
**Status:** draft
**Acceptance Criteria:**
- AC-1: Panel lists all prompts with `status: blocked` and shows the blocking reason (if available from handoff)
- AC-2: Panel lists all `done` prompts that have no matching handoff file (warning)
- AC-3: Panel lists all parser validation warnings (malformed frontmatter, unresolved prerequisites, unrecognized status values) from `validationResults[]`
- AC-4: Panel items are categorized by severity (error, warning) per the taxonomy in `docs/business-rules.md` Section 4.5
- AC-5: Panel items link to the affected prompt's detail drawer when clicked
- AC-6: Panel is empty with a positive message ("No issues found") when there are zero blockers and zero warnings
- AC-7: Project health badge (On Track / At Risk / Blocked / Not Started) is displayed per `docs/business-rules.md` Section 9

#### Tasks
- E2-S3-T1: Implement blocker aggregation from parsed state
- E2-S3-T2: Implement warning aggregation (missing handoffs, invalid metadata)
- E2-S3-T3: Build blockers/warnings panel UI component
- E2-S3-T4: Write tests for blocker and warning detection logic

### E2-S4 Build next prompt widget
**Status:** draft
**Acceptance Criteria:**
- AC-1: Widget displays the selected prompt's number, title, and `owner_role`
- AC-2: Widget displays a human-readable rationale string explaining why this prompt was selected (per `docs/business-rules.md` Section 3.3)
- AC-3: Widget shows prerequisite check result: either "All N prerequisites met" or a list of unmet prerequisites with their current status
- AC-4: Widget displays a scrollable text area containing the full prompt markdown content
- AC-5: Copy-to-clipboard button copies the full prompt content; visual feedback confirms the copy succeeded
- AC-6: Widget includes a link to the source file path (relative to repo root)
- AC-7: When no prompt is eligible, widget displays the "no eligible prompts" message with blocked/waiting counts
- AC-8: Widget only considers prompts in `prompts/active/` with `status: ready` — never archived, superseded, or cancelled prompts

#### Tasks
- E2-S4-T1: Build next-prompt widget UI component
- E2-S4-T2: Implement copy-to-clipboard functionality
- E2-S4-T3: Wire eligibility engine output to widget
- E2-S4-T4: Write interaction tests for copy action and prerequisite display

---

## Epic E3: Epic / Story / Task Visibility

### E3-S1 Build epic overview table/cards
**Status:** draft
**Acceptance Criteria:**
- AC-1: All epics are displayed in a table or card layout
- AC-2: Each epic shows: ID, title, story count, task count, prompt count, completion %, status badge
- AC-3: Completion % uses the formula `done_stories / (total_stories - cancelled_stories) × 100` per `docs/business-rules.md` Section 2.3
- AC-4: Epic rows/cards are clickable — clicking drills down to the story view for that epic
- AC-5: Empty state (zero epics) shows a message, not a blank or broken table

#### Tasks
- E3-S1-T1: Build epic table/card UI component
- E3-S1-T2: Wire epic data from parsed state
- E3-S1-T3: Write component tests for epic display

### E3-S2 Build story drill-down within epic
**Status:** draft
**Acceptance Criteria:**
- AC-1: Clicking an epic expands or navigates to its stories
- AC-2: Each story shows: ID, title, task count, prompt count, completion %, status badge
- AC-3: Completion % uses `done_tasks / (total_tasks - cancelled_tasks) × 100` per `docs/business-rules.md` Section 2.2
- AC-4: Story rows link to task detail view
- AC-5: Prompt IDs associated with each story are shown as clickable links to the prompt detail drawer

#### Tasks
- E3-S2-T1: Build story list/table UI component
- E3-S2-T2: Implement epic-to-story drill-down navigation
- E3-S2-T3: Write component tests for story drill-down

### E3-S3 Build task tree and status badges
**Status:** draft
**Acceptance Criteria:**
- AC-1: Tasks display under their parent story in a collapsible tree structure
- AC-2: Each task shows a color-coded status badge matching the canonical status model
- AC-3: Badge colors are consistent across all views: `draft`=gray, `ready`=blue, `in_progress`=yellow, `in_review`=purple, `blocked`=red, `done`=green, `superseded`=strikethrough/muted, `cancelled`=strikethrough/muted
- AC-4: Task tree is collapsible (expand/collapse per story)
- AC-5: Each task shows associated prompt IDs (from the reverse index) as clickable links

#### Tasks
- E3-S3-T1: Build task tree UI component with collapsible nodes
- E3-S3-T2: Implement status badge styling per status
- E3-S3-T3: Write component tests for task tree

### E3-S4 Build latest update summaries for each node
**Status:** draft
**Acceptance Criteria:**
- AC-1: Each epic, story, and task shows its last updated date derived from the most recent handoff that references it
- AC-2: Latest session summary text (from handoff `summary` field) is visible inline or on hover
- AC-3: Data is sourced from handoff files by matching `prompt_id` → prompt `task_ids` → task → story → epic
- AC-4: Items with no associated handoff show "No updates yet" rather than a blank field

#### Tasks
- E3-S4-T1: Implement last-update resolution from handoff data
- E3-S4-T2: Build inline update summary UI
- E3-S4-T3: Write tests for update resolution logic

---

## Epic E4: Prompt Inventory and Session History

### E4-S1 Build prompt inventory table
**Status:** draft
**Acceptance Criteria:**
- AC-1: Table shows all prompts (active and archived) with columns: number, title, epic, story, status, location (`active`/`archive`), prerequisites, last updated
- AC-2: Archived prompts are visually distinguished from active prompts (muted styling or badge)
- AC-3: Superseded prompts show a clickable link to the superseding prompt
- AC-4: Table is sortable by: sequence (natural prompt-ID ordering), status, epic, updated date
- AC-5: Table supports filtering by status, epic, location, role, and keyword search (metadata fields only, per `docs/business-rules.md` Section 7)
- AC-6: Default filter shows `active` location; user can toggle to show `archive` or `all`
- AC-7: Empty-state (no prompts) displays a message, not a blank table

#### Tasks
- E4-S1-T1: Build prompt inventory table UI component
- E4-S1-T2: Implement column sorting with natural prompt-ID ordering
- E4-S1-T3: Implement filtering/search functionality
- E4-S1-T4: Write component tests for table rendering, sorting, filtering

### E4-S2 Build prompt detail drawer/page
**Status:** draft
**Acceptance Criteria:**
- AC-1: Clicking a prompt opens a detail drawer or page
- AC-2: Detail view shows all metadata fields from frontmatter: prompt_id, title, phase, status, epic_id, story_id, task_ids, owner_role, prerequisites, required_reading, downstream_prompts, supersedes, superseded_by
- AC-3: Raw prompt body renders as formatted markdown
- AC-4: If a session handoff exists (matched via `prompt_id`), it displays: summary, changed files, files removed, tests run, validation results, decisions made, open risks, downstream impacts
- AC-5: If the prompt is `done` but no matching handoff exists, an inline warning is displayed ("Handoff missing for completed prompt")
- AC-6: If the prompt is archived, `archived_at` date is displayed
- AC-7: If the prompt is superseded, a link to the superseding prompt is displayed
- AC-8: Markdown content renders without XSS vulnerabilities (sanitized rendering)

#### Tasks
- E4-S2-T1: Build prompt detail drawer UI component
- E4-S2-T2: Implement markdown rendering for prompt body and handoff notes
- E4-S2-T3: Wire all metadata fields from parsed state
- E4-S2-T4: Write component tests for detail drawer

### E4-S3 Build session timeline/history view
**Status:** draft
**Acceptance Criteria:**
- AC-1: Timeline displays all session handoffs sorted chronologically by `ended_at` (newest first)
- AC-2: Each entry shows: session ID, prompt number, role (`owner_role`), date, summary, changed file count, status outcome
- AC-3: Entries are clickable to expand full session notes inline
- AC-4: When expanded, entry shows: full summary, all changed files, files removed, tests run, blockers, next recommended prompts
- AC-5: Timeline handles 50+ sessions without degradation (virtual scroll or pagination)
- AC-6: Empty state (no sessions) shows "No sessions completed yet"

#### Tasks
- E4-S3-T1: Build session timeline UI component
- E4-S3-T2: Wire session data from parsed handoffs
- E4-S3-T3: Implement expand/collapse for session detail
- E4-S3-T4: Write component tests for timeline

### E4-S4 Link prompts to changed files and handoffs
**Status:** draft
**Acceptance Criteria:**
- AC-1: Prompt detail shows the list of changed files from the associated handoff's `changed_files` array
- AC-2: Prompt detail links to the matching handoff file (resolved via `prompt_id` match, not filename)
- AC-3: If multiple handoffs reference the same prompt_id, all are displayed sorted by `ended_at`
- AC-4: Missing handoff for a `done` prompt is flagged with an inline warning in the prompt detail and in the blockers panel
- AC-5: Changed file paths are displayed as relative paths (not clickable links in v1)

#### Tasks
- E4-S4-T1: Implement prompt-to-handoff linking in parsed model
- E4-S4-T2: Display changed files and handoff link in prompt detail
- E4-S4-T3: Write tests for link resolution

---

## Epic E5: Refresh, Watchers, and Multi-Project Support

### E5-S1 Build refresh/reparse flow
**Status:** draft
**Acceptance Criteria:**
- AC-1: Refresh button in the toolbar triggers a full re-parse of all repo artifacts and updates all UI views
- AC-2: A loading indicator (spinner or progress bar) is displayed during parse
- AC-3: If parsing fails (e.g., repo deleted, permission error), an error state is displayed with a descriptive message and a retry button
- AC-4: Refresh preserves the current view and scroll position where possible
- AC-5: Dynamic recalculation: adding or removing prompt/handoff files and refreshing produces correct updated metrics without code changes

#### Tasks
- E5-S1-T1: Implement refresh action that re-runs parser and updates state
- E5-S1-T2: Build loading and error state UI
- E5-S1-T3: Write tests for refresh flow

### E5-S2 Add local file watch support
**Status:** draft
**Acceptance Criteria:**
- AC-1: When running in dev-server mode, file changes in the repo (create, modify, delete .md files) trigger automatic re-parse
- AC-2: Debounce prevents re-parse triggers more frequently than once per 500ms
- AC-3: File watcher can be disabled via environment variable or configuration flag
- AC-4: File watcher is not available in static export mode — this is documented in the dashboard README
- AC-5: Watcher only monitors relevant directories (`prompts/`, `agents/epics/`, `agents/handoffs/`), not the entire repo

#### Tasks
- E5-S2-T1: Implement file watcher using native or library-based file system events
- E5-S2-T2: Add debounce logic for rapid changes
- E5-S2-T3: Write integration tests for file-watch-triggered refresh

### E5-S3 Add repo selector for compatible projects
**Status:** draft
**Acceptance Criteria:**
- AC-1: Dashboard displays a repo/project selector in the header/toolbar area, always visible
- AC-2: User provides a repo path via text input with a folder-browse button (if OS dialog is available) or plain text input
- AC-3: On selection, the dashboard runs capability detection per `docs/business-rules.md` Section 5
- AC-4: If capable → load and parse the new repo; update all views
- AC-5: If not capable → show error screen listing specific missing required paths, with link to documentation
- AC-6: v1 supports local filesystem paths only — no git remote URL support

#### Tasks
- E5-S3-T1: Build repo selector UI component
- E5-S3-T2: Implement repo capability detection (check for required structure)
- E5-S3-T3: Wire repo switching to parser and state reload
- E5-S3-T4: Write tests for capability detection and repo switching

### E5-S4 Persist recent project selections locally
**Status:** draft
**Acceptance Criteria:**
- AC-1: Recent project path selections persist across browser sessions using `localStorage`
- AC-2: Recent-projects list shows up to 10 entries, sorted most-recent-first
- AC-3: User can clear individual entries or all saved selections
- AC-4: Selecting a recent project triggers capability detection and load (same flow as E5-S3)
- AC-5: Invalid/missing paths in the recent list are visually indicated and do not cause errors on click (re-validate on selection)

#### Tasks
- E5-S4-T1: Implement local storage persistence for recent project paths
- E5-S4-T2: Build recent-projects list in selector UI
- E5-S4-T3: Write tests for persistence and clearing

---

## Epic E6: Review, Quality, and Hardening

### E6-S1 Build validation tests for malformed metadata
**Status:** draft
**Acceptance Criteria:**
- AC-1: Test suite covers all error/warning scenarios from the taxonomy in `docs/business-rules.md` Section 4.5: no frontmatter, missing required fields, missing optional fields, unrecognized status, prerequisite referencing non-existent prompt, done prompt with no handoff
- AC-2: Parser behavior is verified for each case: errors skip the file, warnings parse available fields
- AC-3: All warnings and errors appear in the `validationResults[]` output
- AC-4: Parser never throws an unhandled exception on any valid markdown file (including empty files, binary files in .md extension, or files >10,000 lines)

#### Tasks
- E6-S1-T1: Create test fixtures with malformed prompt and handoff files
- E6-S1-T2: Write tests verifying parser resilience
- E6-S1-T3: Write tests verifying warning output for invalid files

### E6-S2 Build performance tests for large prompt inventories
**Status:** draft
**Acceptance Criteria:**
- AC-1: Parser benchmarked with a generated fixture of 300+ prompt files and 250+ handoff files
- AC-2: Initial parse time for 300 prompts: < 2 seconds
- AC-3: Dashboard render time after parse: < 1 second
- AC-4: Incremental refresh time after a single file change: < 500ms
- AC-5: Performance regression test exists and can be run as part of CI
- AC-6: Performance thresholds are documented in the project README

#### Tasks
- E6-S2-T1: Generate large-scale test fixture (300+ prompt stubs)
- E6-S2-T2: Implement performance benchmark script
- E6-S2-T3: Define and document acceptable performance thresholds

### E6-S3 Build accessibility review and keyboard navigation
**Status:** draft
**Acceptance Criteria:**
- AC-1: All interactive elements (buttons, links, table rows, drawer toggles, copy actions) are reachable and operable via keyboard alone
- AC-2: ARIA labels are present on all dynamic content (charts, status badges, expandable sections, drawer)
- AC-3: Color contrast meets WCAG 2.1 AA (minimum 4.5:1 for normal text, 3:1 for large text)
- AC-4: Screen reader tested on Overview, Prompt Inventory, and Prompt Detail views using at least one screen reader (NVDA, VoiceOver, or Narrator)
- AC-5: Focus management is correct when opening/closing the prompt detail drawer (focus moves to drawer on open, returns to trigger on close)

#### Tasks
- E6-S3-T1: Audit all UI components for keyboard accessibility
- E6-S3-T2: Add ARIA labels and roles to dynamic components
- E6-S3-T3: Test color contrast compliance
- E6-S3-T4: Test with screen reader on overview and prompt views

### E6-S4 Build security review for file/path handling
**Status:** draft
**Acceptance Criteria:**
- AC-1: No path traversal vulnerabilities: all file read operations are sandboxed to the selected repo root (paths containing `..` are rejected)
- AC-2: All user-supplied paths (repo selector input) are validated and sanitized before use in filesystem operations
- AC-3: Markdown rendering sanitizes HTML to prevent XSS (no raw `<script>`, `<iframe>`, `javascript:` URIs, or event handlers pass through)
- AC-4: No file content is transmitted externally — all operations are local
- AC-5: No telemetry or analytics in v1
- AC-6: Security-focused tests cover: path traversal attempts, malicious markdown content, oversized files

#### Tasks
- E6-S4-T1: Security audit file path handling in parser and repo selector
- E6-S4-T2: Implement path sanitization and sandboxing
- E6-S4-T3: Audit markdown rendering for XSS vectors
- E6-S4-T4: Write security-focused tests for path traversal and XSS

### E6-S5 Build release readiness checklist and documentation
**Status:** draft
**Acceptance Criteria:**
- AC-1: Dashboard README includes: installation, setup, running in dev mode, static export, usage guide, environment variables, supported browsers (latest Chrome, Edge, Firefox)
- AC-2: Architecture documentation (`agents/context/architecture-overview.md`) updated with final component diagram reflecting implemented architecture
- AC-3: Release readiness checklist template completed with pass/fail for each item
- AC-4: All review sign-offs collected from required reviewers (PM, BSA, Architect, DevOps, DevSecOps, QA, UX)
- AC-5: No runtime CDN dependencies — dashboard works fully offline when running locally

#### Tasks
- E6-S5-T1: Write dashboard README with setup, usage, and development instructions
- E6-S5-T2: Update architecture-overview.md with final component diagram
- E6-S5-T3: Complete release readiness checklist template
- E6-S5-T4: Collect sign-offs from all required reviewers
