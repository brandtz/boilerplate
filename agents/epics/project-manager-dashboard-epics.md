# Project Manager Dashboard Epics, Stories, and Tasks

## Epic E1: Repo Data Contracts and Parsing Foundation

### E1-S1 Define and validate prompt frontmatter contract
**Status:** ready
**Acceptance Criteria:**
- All prompt YAML frontmatter fields from the data contract are documented
- A validation function can detect missing or malformed required fields
- At least 3 example prompt files pass validation

#### Tasks
- E1-S1-T1: Define the canonical YAML schema for prompt frontmatter
- E1-S1-T2: Implement a frontmatter validator that returns structured errors/warnings
- E1-S1-T3: Create 3+ example prompt files that conform to the contract

### E1-S2 Define and validate session handoff contract
**Status:** ready
**Acceptance Criteria:**
- All handoff YAML frontmatter fields from the data contract are documented
- A validation function can detect missing or malformed required fields
- At least 2 example handoff files pass validation

#### Tasks
- E1-S2-T1: Define the canonical YAML schema for handoff frontmatter
- E1-S2-T2: Implement a handoff frontmatter validator
- E1-S2-T3: Create 2+ example handoff files that conform to the contract

### E1-S3 Build markdown frontmatter parser
**Status:** ready
**Acceptance Criteria:**
- Parser reads YAML frontmatter from `.md` files in specified directories
- Parser produces a normalized in-memory model of epics, stories, tasks, prompts, and handoffs
- Parser handles missing or malformed frontmatter gracefully (warns, does not crash)
- Parser works on repos with 250+ prompt files without error

#### Tasks
- E1-S3-T1: Implement YAML frontmatter extraction from markdown files
- E1-S3-T2: Implement directory scanner for epics, prompts, and handoffs folders
- E1-S3-T3: Build normalized graph model (epic → story → task → prompt → handoff)
- E1-S3-T4: Add graceful error handling for malformed files
- E1-S3-T5: Write unit tests for parser with valid and invalid inputs

### E1-S4 Build natural prompt sequence sorting
**Status:** ready
**Acceptance Criteria:**
- Prompt IDs like `16.0.1`, `16.0.2`, `16.1.1`, `17.0.1` sort by numeric tuple
- String-based sorting is never used for prompt ordering
- Inserted prompts appear in correct position relative to their neighbors

#### Tasks
- E1-S4-T1: Implement numeric tuple comparison for prompt IDs
- E1-S4-T2: Write sort tests with edge cases (insertions, branches, gaps)

### E1-S5 Build dependency graph and eligibility engine
**Status:** ready
**Acceptance Criteria:**
- Engine determines which prompts are eligible to run (status=ready, all prerequisites done, not blocked)
- Engine selects the next recommended prompt using the rules from the data contract
- Engine identifies downstream prompts affected by an insertion
- Engine flags prompts whose prerequisites are unmet or changed

#### Tasks
- E1-S5-T1: Build prerequisite resolution logic against prompt status map
- E1-S5-T2: Implement next-prompt selection algorithm (ready + prerequisites met + lowest sort)
- E1-S5-T3: Implement downstream impact detection for inserted prompts
- E1-S5-T4: Write integration tests with a multi-prompt dependency graph

### E1-S6 Build JSON state emitter
**Status:** ready
**Acceptance Criteria:**
- Parser emits a normalized JSON file matching the `dashboard-state.example.json` schema
- JSON includes project summary, epics, prompts, sessions, and next-prompt data
- Emitter can be run as a CLI command or imported as a module

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
- Dashboard displays total epics, stories, tasks, prompts, blocked, done, in-review, ready counts
- Counts update on data refresh
- Cards are visually distinct and scannable

#### Tasks
- E2-S1-T1: Create summary card UI components
- E2-S1-T2: Wire summary data from parsed state to card components
- E2-S1-T3: Write component tests for summary cards

### E2-S2 Build overall progress charts
**Status:** draft
**Acceptance Criteria:**
- Epic completion bar/donut chart renders correctly
- Prompt status distribution chart renders correctly
- Session throughput over time chart renders correctly
- Charts resize responsively

#### Tasks
- E2-S2-T1: Select and integrate chart library
- E2-S2-T2: Implement epic completion chart
- E2-S2-T3: Implement prompt status distribution chart
- E2-S2-T4: Implement session throughput timeline chart
- E2-S2-T5: Write visual regression or snapshot tests for charts

### E2-S3 Build blockers and warnings panel
**Status:** draft
**Acceptance Criteria:**
- Panel lists all blocked prompts with reason
- Panel lists missing handoffs for completed prompts
- Panel lists validation warnings (malformed frontmatter, unresolved prerequisites)

#### Tasks
- E2-S3-T1: Implement blocker aggregation from parsed state
- E2-S3-T2: Implement warning aggregation (missing handoffs, invalid metadata)
- E2-S3-T3: Build blockers/warnings panel UI component
- E2-S3-T4: Write tests for blocker and warning detection logic

### E2-S4 Build next prompt widget
**Status:** draft
**Acceptance Criteria:**
- Widget displays prompt number, title, and rationale for selection
- Widget shows prerequisite check result (all met / unmet list)
- Widget displays scrollable full prompt text
- Copy-to-clipboard button copies full prompt content
- Widget links to source file path

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
- All epics displayed in a table or card layout
- Each epic shows ID, title, story count, task count, prompt count, completion %, status
- Epic rows are clickable to drill down

#### Tasks
- E3-S1-T1: Build epic table/card UI component
- E3-S1-T2: Wire epic data from parsed state
- E3-S1-T3: Write component tests for epic display

### E3-S2 Build story drill-down within epic
**Status:** draft
**Acceptance Criteria:**
- Clicking an epic expands or navigates to its stories
- Each story shows ID, title, task count, prompt count, completion %, status
- Story rows link to task detail

#### Tasks
- E3-S2-T1: Build story list/table UI component
- E3-S2-T2: Implement epic-to-story drill-down navigation
- E3-S2-T3: Write component tests for story drill-down

### E3-S3 Build task tree and status badges
**Status:** draft
**Acceptance Criteria:**
- Tasks display under their parent story with status badges
- Badge colors match canonical status model (draft, ready, in_progress, done, blocked, etc.)
- Task tree is collapsible

#### Tasks
- E3-S3-T1: Build task tree UI component with collapsible nodes
- E3-S3-T2: Implement status badge styling per status
- E3-S3-T3: Write component tests for task tree

### E3-S4 Build latest update summaries for each node
**Status:** draft
**Acceptance Criteria:**
- Each epic, story, and task shows its last updated date
- Latest session summary text is visible inline or on hover
- Data sourced from handoff files

#### Tasks
- E3-S4-T1: Implement last-update resolution from handoff data
- E3-S4-T2: Build inline update summary UI
- E3-S4-T3: Write tests for update resolution logic

---

## Epic E4: Prompt Inventory and Session History

### E4-S1 Build prompt inventory table
**Status:** draft
**Acceptance Criteria:**
- Table shows all prompts with columns: number, title, epic, story, status, prerequisites, updated
- Table is sortable by sequence, status, epic, updated date
- Table supports filtering by status, epic, search text

#### Tasks
- E4-S1-T1: Build prompt inventory table UI component
- E4-S1-T2: Implement column sorting with natural prompt-ID ordering
- E4-S1-T3: Implement filtering/search functionality
- E4-S1-T4: Write component tests for table rendering, sorting, filtering

### E4-S2 Build prompt detail drawer/page
**Status:** draft
**Acceptance Criteria:**
- Clicking a prompt opens a detail drawer or page
- Detail view shows: metadata, raw prompt body, prerequisites, required reading, session notes, changed files, tests run, blockers, next prompts, linked handoffs
- Markdown content renders properly

#### Tasks
- E4-S2-T1: Build prompt detail drawer UI component
- E4-S2-T2: Implement markdown rendering for prompt body and handoff notes
- E4-S2-T3: Wire all metadata fields from parsed state
- E4-S2-T4: Write component tests for detail drawer

### E4-S3 Build session timeline/history view
**Status:** draft
**Acceptance Criteria:**
- Timeline displays all session handoffs chronologically
- Each entry shows: session ID, prompt number, role, date, summary, changed file count, status outcome
- Entries are clickable to expand full session notes

#### Tasks
- E4-S3-T1: Build session timeline UI component
- E4-S3-T2: Wire session data from parsed handoffs
- E4-S3-T3: Implement expand/collapse for session detail
- E4-S3-T4: Write component tests for timeline

### E4-S4 Link prompts to changed files and handoffs
**Status:** draft
**Acceptance Criteria:**
- Prompt detail shows list of changed files from associated handoff
- Prompt detail links to matching handoff file
- Missing handoff is flagged as a warning

#### Tasks
- E4-S4-T1: Implement prompt-to-handoff linking in parsed model
- E4-S4-T2: Display changed files and handoff link in prompt detail
- E4-S4-T3: Write tests for link resolution

---

## Epic E5: Refresh, Watchers, and Multi-Project Support

### E5-S1 Build refresh/reparse flow
**Status:** draft
**Acceptance Criteria:**
- Refresh button triggers full re-parse and UI update
- Loading indicator displays during parse
- Error state displayed if parsing fails

#### Tasks
- E5-S1-T1: Implement refresh action that re-runs parser and updates state
- E5-S1-T2: Build loading and error state UI
- E5-S1-T3: Write tests for refresh flow

### E5-S2 Add local file watch support
**Status:** draft
**Acceptance Criteria:**
- When running locally, file changes in the repo trigger automatic re-parse
- Debounce prevents excessive re-parsing on rapid file changes
- Watch can be disabled via configuration

#### Tasks
- E5-S2-T1: Implement file watcher using native or library-based file system events
- E5-S2-T2: Add debounce logic for rapid changes
- E5-S2-T3: Write integration tests for file-watch-triggered refresh

### E5-S3 Add repo selector for compatible projects
**Status:** draft
**Acceptance Criteria:**
- Dashboard displays a repo/project selector
- Selector validates that a repo is "dashboard-capable" (required files/folders present)
- Switching repos loads that project's parsed state
- Invalid repos show a clear error message

#### Tasks
- E5-S3-T1: Build repo selector UI component
- E5-S3-T2: Implement repo capability detection (check for required structure)
- E5-S3-T3: Wire repo switching to parser and state reload
- E5-S3-T4: Write tests for capability detection and repo switching

### E5-S4 Persist recent project selections locally
**Status:** draft
**Acceptance Criteria:**
- Recent project selections persist across browser/app sessions
- User can clear saved selections
- Stored in local storage or equivalent

#### Tasks
- E5-S4-T1: Implement local storage persistence for recent project paths
- E5-S4-T2: Build recent-projects list in selector UI
- E5-S4-T3: Write tests for persistence and clearing

---

## Epic E6: Review, Quality, and Hardening

### E6-S1 Build validation tests for malformed metadata
**Status:** draft
**Acceptance Criteria:**
- Test suite covers missing fields, invalid types, empty frontmatter, no frontmatter
- Parser behavior is verified: warnings emitted, no crashes, partial data extracted where possible

#### Tasks
- E6-S1-T1: Create test fixtures with malformed prompt and handoff files
- E6-S1-T2: Write tests verifying parser resilience
- E6-S1-T3: Write tests verifying warning output for invalid files

### E6-S2 Build performance tests for large prompt inventories
**Status:** draft
**Acceptance Criteria:**
- Parser benchmarked with 300+ prompt files and 250+ handoff files
- Dashboard renders within acceptable time (<3s initial load)
- Performance regression test exists in CI

#### Tasks
- E6-S2-T1: Generate large-scale test fixture (300+ prompt stubs)
- E6-S2-T2: Implement performance benchmark script
- E6-S2-T3: Define and document acceptable performance thresholds

### E6-S3 Build accessibility review and keyboard navigation
**Status:** draft
**Acceptance Criteria:**
- All interactive elements are keyboard-accessible
- ARIA labels present on dynamic content
- Color contrast meets WCAG 2.1 AA
- Screen reader tested on primary views

#### Tasks
- E6-S3-T1: Audit all UI components for keyboard accessibility
- E6-S3-T2: Add ARIA labels and roles to dynamic components
- E6-S3-T3: Test color contrast compliance
- E6-S3-T4: Test with screen reader on overview and prompt views

### E6-S4 Build security review for file/path handling
**Status:** draft
**Acceptance Criteria:**
- No path traversal vulnerabilities in repo selector or file loading
- All file paths validated and sandboxed to repo root
- No user-supplied paths used in fs operations without sanitization
- XSS prevention verified for rendered markdown content

#### Tasks
- E6-S4-T1: Security audit file path handling in parser and repo selector
- E6-S4-T2: Implement path sanitization and sandboxing
- E6-S4-T3: Audit markdown rendering for XSS vectors
- E6-S4-T4: Write security-focused tests for path traversal and XSS

### E6-S5 Build release readiness checklist and documentation
**Status:** draft
**Acceptance Criteria:**
- README with setup and usage instructions
- Architecture documentation updated
- Release readiness checklist completed
- All review sign-offs collected

#### Tasks
- E6-S5-T1: Write dashboard README with setup, usage, and development instructions
- E6-S5-T2: Update architecture-overview.md with final component diagram
- E6-S5-T3: Complete release readiness checklist template
- E6-S5-T4: Collect sign-offs from all required reviewers
