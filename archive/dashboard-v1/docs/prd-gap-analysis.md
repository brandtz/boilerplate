# PRD Gap Analysis — Project Manager Dashboard

**Reviewer:** Product Manager
**Prompt:** 1.0.1
**Date:** 2026-04-03
**Documents Reviewed:**
- `docs/project-manager-dashboard-prd.md`
- `docs/project-manager-dashboard-data-contract.md`
- `agents/epics/project-manager-dashboard-epics.md`
- `agents/context/project-charter.md`
- `agents/context/product-brief.md`
- `agents/context/assumptions.md`
- `agents/context/constraints.md`
- `agents/context/architecture-overview.md`
- `schemas/dashboard-state.example.json`

---

## 1. Functional Requirement Gaps

### GAP-FR-01: FR-1 missing validation error UX (Priority: High)
FR-1 defines how the dashboard detects a "dashboard-capable" repo but does not specify what happens when detection fails. The constraints (C6) require graceful handling of malformed data. The PRD should specify:
- What error message is displayed when a repo lacks required files
- Whether the dashboard shows a partial view for repos with some but not all required files
- Whether a detailed compatibility report is available to the user

### GAP-FR-02: FR-2 missing `in_progress` count (Priority: Medium)
FR-2 lists counters for blocked, in-review, and ready, but omits `in_progress`. Since the status model (Section 12) defines `in_progress` as a canonical status and it appears in the data contract's folder rules (Section 1.2), this should be an explicit counter.

### GAP-FR-03: FR-3/FR-4/FR-5 missing click targets for story/task mapping (Priority: Medium)
FR-3 through FR-5 list data to display per epic/story/task but don't specify whether prompts are clickable links to the prompt detail drawer (FR-7) or plaintext references. The UX expectation should be made explicit: are prompt IDs shown inline, and do they link to the prompt detail view?

### GAP-FR-04: FR-5 task detail lacks prompt linkage specification (Priority: Low)
FR-5 says each task shows "latest related prompt/session" but doesn't specify how the parser resolves which prompts map to a task. The data contract shows `task_ids` on prompts but there is no reverse index contract (task → prompt). The parser must build this reverse mapping, and the behavior when multiple prompts reference the same task should be clarified (show latest? show all?).

### GAP-FR-05: FR-7 missing error states for missing handoffs (Priority: Medium)
FR-7 specifies what appears in the prompt detail drawer but doesn't define behavior when a handoff is missing for a `done` prompt. The blockers panel (E2-S3) does detect missing handoffs, but FR-7 should state whether the detail drawer shows a warning inline, a placeholder, or nothing.

### GAP-FR-06: FR-8 rationale algorithm not fully specified (Priority: High)
FR-8 says the widget should show "rationale for why it is next" but neither the PRD nor the data contract defines the format of this rationale. The data contract's Section 7 defines the selection rules, but the human-readable explanation (e.g., "Lowest ready prompt with all prerequisites met") should be specified as a generated text field.

### GAP-FR-07: FR-9 no pagination or scroll behavior defined (Priority: Low)
FR-9 specifies a session timeline but does not address behavior when session counts are large (50+ sessions). Should the timeline paginate, virtual-scroll, or show a "load more" pattern?

### GAP-FR-08: FR-13 chart data sources underspecified (Priority: Medium)
FR-13 requires four chart types but two are time-series ("remaining prompts over time" and "completed sessions over time"). The data contract does not define how historical data points are derived. Since C1 prohibits external databases and C8 prohibits writing to the repo, the dashboard can only compute the current snapshot — it has no time-series data source. Options:
1. Drop time-series charts from v1 (aligns with constraints)
2. Derive approximate history from handoff `ended_at` timestamps (partial data only)
3. Allow the parser to emit an append-only history JSON (conflicts with C8 if written to repo)

**Recommendation:** Downscope to option 2 for v1. Derive historical completion data from handoff timestamps. This does not require writing to the repo but will only show history for completed sessions, not future projections.

### GAP-FR-09: FR-14 search scope undefined (Priority: Medium)
FR-14 lists filtering dimensions but does not define search behavior. Does "search" mean:
- Full-text search across prompt titles and bodies?
- Keyword matching against metadata fields only?
- Fuzzy/autocomplete search?

The scope and implementation cost differ significantly between these options.

### GAP-FR-10: FR-15 repo selector UX incomplete (Priority: Medium)
FR-15 says the dashboard "should support a repository selector" but does not specify:
- How does the user provide a repo path? (File picker? Text input? Drag-and-drop?)
- Is the selector always visible or only accessible from a settings/menu area?
- Product-brief Q4 asks whether to use local filesystem paths or git remote URLs — this remains unanswered

### GAP-FR-11: FR-16 auto-refresh conflict with static deployment (Priority: Low)
FR-16 says the dashboard should "ideally auto-refresh on file changes when run locally." The architecture proposes chokidar for file watching. However, if the dashboard is deployed as a Next.js static export (mentioned in architecture-overview.md), file watching is not available. The PRD should clarify: auto-refresh is a local dev-server feature only, not available in static export mode.

---

## 2. User Story Gaps

### GAP-US-01: No error/empty-state user stories (Priority: High)
The seven user stories (7.1–7.7) cover the happy path but none address:
- "As the human sponsor, I want to see a clear message when the repo is empty or has no valid prompts, so I know the dashboard is working but has nothing to display."
- "As the human sponsor, I want warnings when frontmatter is malformed, so I can fix data quality issues."

These directly relate to C6 (graceful error handling) and should be explicit user stories to ensure the UX is designed, not just exception-handled.

### GAP-US-02: User story 7.4 lacks acceptance criteria specifics (Priority: Medium)
Story 7.4 says "click a prompt and read structured notes" but does not define what constitutes "structured notes." The FR-7 spec fills some of this gap, but the user story itself should reference the expected detail fields so it is testable in isolation.

### GAP-US-03: No user story for overall project health signal (Priority: Medium)
The user stories cover progress visibility and drill-down but none explicitly say:
- "As the human sponsor, I want to see an at-a-glance health indicator (on-track / at-risk / blocked) so I can quickly assess whether the project needs intervention."

The blockers panel (E2-S3) partially addresses this but there is no aggregated project health status in the PRD or data contract.

---

## 3. Data Contract Gaps

### GAP-DC-01: Epic/story/task contracts lack sufficient fields (Priority: High)
The data contract (Sections 3–5) specifies minimal contracts for epics, stories, and tasks:
- Epic: `epic_id`, `title`, `status`, `owner_role`
- Story: `story_id`, `epic_id`, `title`, `status`
- Task: `task_id`, `story_id`, `epic_id`, `title`, `status`

But the epics file (`agents/epics/project-manager-dashboard-epics.md`) stores all epics, stories, and tasks in a single large markdown file with minimal YAML frontmatter (only `status` and `acceptance criteria` in markdown body). The parser needs to extract structured data from this file. The contract should clarify:

1. **Are epics/stories/tasks expected in individual files or a combined markdown document?** The current repo uses one combined file, but the data contract implies individual YAML-headed files.
2. **Missing fields:** The contract omits `acceptance_criteria`, `created_at`, `updated_at`, and `completion_percent` from the story and task contracts. FR-4 and FR-5 require some of these.
3. **No `description` field** in any of the three contracts. The dashboard may need to display story/task descriptions in drill-down views.

### GAP-DC-02: Handoff contract missing lifecycle fields (Priority: Medium)
The prompt contract was updated with lifecycle fields (`session_handoff`, `completed_at`, `archived_at`, `supersedes`, `superseded_by`) but the handoff contract (Section 2) was not updated with corresponding fields. Specifically:
- Handoff file lacks `files_removed`, `tests_run`, `validation_results`, `decisions_made`, `open_risks`, `downstream_impacts` — all present in the session handoff template but not in the data contract.

The parser will need to read these fields from handoffs to populate FR-7 (tests run, changed files). The data contract should reflect the full handoff template.

### GAP-DC-03: JSON state schema is an example, not a specification (Priority: High)
`schemas/dashboard-state.example.json` is described as an "example" but is the only reference for the JSON output format. This file:
- Uses inconsistent field naming (`storiesTotal` vs `prompts[].storyId`)
- Omits many fields needed by the UI (e.g., `blocked` count exists in `summary` but not `in_progress`, `in_review`, or `ready` counts — though FR-2 requires all of these)
- Shows `storiesTotal: 21` and `tasksTotal: 58` which don't match the actual project (24 stories, 87 tasks) — this is expected for an example but should be noted as non-normative
- Does not include archived prompts, lifecycle fields, or the `location` field defined in FR-6
- Does not include sessions with full handoff detail (missing `files_removed`, `tests_run`, etc.)

**Recommendation:** Create a formal JSON schema (JSON Schema or TypeScript interface) as a normative specification, and demote the current file to an example.

### GAP-DC-04: Counting rules for `cancelled` and `superseded` prompts are ambiguous (Priority: Medium)
Section 6.1 states "Superseded or cancelled prompts are excluded from completion numerators but included in scope totals." This needs clarification:
- If a project has 30 prompts and 2 are superseded, the scope total is 30 and completion denominator is 28. Is the project 100% complete when 28 prompts are done?
- Should the project completion percentage exclude superseded/cancelled from the denominator, or show them as a separate "excluded" count?

---

## 4. Conflicts with Constraints

### CONFLICT-01: Time-series charts vs. C1/C8 (Priority: High)
FR-13 requires "remaining prompts over time" and "completed sessions over time." These presume historical data. C1 says no external database and C8 says the dashboard is read-only. Without a persistent data store, pure time-series charts are impossible from a single snapshot. See GAP-FR-08 above for recommended resolution.

### CONFLICT-02: FR-10 dynamic recalculation scope unclear vs. C3 (Priority: Low)
FR-10 says "when new prompts, stories, or tasks are added, the dashboard must recalculate metrics without manual code changes." C3 says "parsing must be deterministic given identical repo contents." These are compatible, but the PRD should clarify that FR-10 means re-parsing produces correct results for the new content — not that the dashboard is reactive in real-time (that's FR-16's job).

### CONFLICT-03: FR-15 multi-repo selector vs. C2 local-only (Priority: Low)
FR-15 implies loading repos from possibly arbitrary paths. C2 says local-only. Together these mean the user must have filesystem access to all project repos. Product-brief Q4 (local paths vs git URLs) is still unanswered. If git URLs are supported, C2 may need revision.

---

## 5. Unstated Assumptions

### UA-01: Single epics file assumed
The current repo has one epics file (`agents/epics/project-manager-dashboard-epics.md`) containing all epics, stories, and tasks. The data contract and parser architecture assume the parser can extract structured data from it. But the contract implies per-entity YAML frontmatter, which is not how the file is structured. The parser must handle embedded markdown-formatted hierarchies, not just standalone YAML-headed files.

### UA-02: Handoff file naming convention not specified
The data contract doesn't specify how the parser finds the handoff matching a prompt. If the lookup is by `prompt_id` in the handoff frontmatter, this is straightforward. If it's by filename convention, the convention is not documented. Handoff `session_id` follows `S-YYYY-MM-DD-NNN` but there's no guaranteed filename ↔ prompt ID mapping defined.

### UA-03: No maximum file size considered
C7 requires support for 250+ prompts, but there is no consideration of individual file size. If a prompt body or handoff is very large (10K+ lines), the dashboard's markdown rendering and detail drawer performance may degrade. No upper bound is stated.

### UA-04: Browser compatibility not stated
A5 assumes the sponsor is "technical enough to run a local dev server" but does not specify which browsers must be supported. This affects CSS, JS API, and accessibility testing scope. Should specify: latest Chrome, Edge, Firefox at minimum.

### UA-05: No offline/network-down behavior defined
Since C2 requires local-only operation, the dashboard should work entirely offline. But if Next.js loads fonts, icons, or CDN resources at runtime, offline use may fail. This should be stated as a constraint: no runtime CDN dependencies.

---

## 6. Missing Non-Functional Requirements

### NFR-01: Performance targets (Priority: High)
E6-S2 defines a performance test for 300+ prompts with "<3s initial load" but this is an epic-level acceptance criterion, not a PRD requirement. The PRD should include a dedicated NFR section specifying:
- Initial parse time for a repo with 250 prompts: < 2s
- Dashboard render time after parse: < 1s
- Incremental refresh time after file change: < 500ms
- Maximum memory footprint: TBD (important for large repos)

### NFR-02: Accessibility requirements (Priority: High)
E6-S3 covers accessibility in the testing phase but the PRD has no accessibility section. The PRD should require:
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility on all primary views
- Minimum color contrast ratios

Without this in the PRD, accessibility may be treated as a nice-to-have rather than a requirement.

### NFR-03: Error handling and resilience (Priority: High)
C6 says "handle malformed or missing frontmatter gracefully (warn, don't crash)" but the PRD lacks a dedicated error-handling section defining:
- What constitutes a warning vs. an error
- Where warnings are displayed (console? dashboard panel? both?)
- Whether the user can dismiss or filter warnings
- Whether a validation report can be exported

### NFR-04: Bundle size and dependency constraints (Priority: Medium)
The architecture uses Next.js, React, Chart.js, Tailwind, gray-matter, react-markdown, and chokidar. The PRD should state whether there are bundle size limits or dependency governance rules. For a local tool, performance is more important than bundle size, but this should be explicit.

### NFR-05: Data privacy and file access scope (Priority: Medium)
E6-S4 covers security for file/path handling, but the PRD should explicitly require:
- All file operations sandboxed to the selected repo root
- No file content transmitted externally
- No telemetry or analytics in v1

### NFR-06: Internationalization (Priority: Low)
The PRD does not address i18n. If not planned for v1, it should be listed as a non-goal to avoid ambiguity.

### NFR-07: Logging and diagnostics (Priority: Low)
The PRD does not mention any logging for the parser or dashboard. For debugging, the parser should log:
- Files scanned, files parsed, files skipped (with reason)
- Validation warnings
- Parse timing

---

## 7. Epics and Stories Review

### GAP-EPIC-01: No story for FR-8 rationale text generation (Priority: Medium)
E2-S4 covers the next-prompt widget but none of the tasks mention generating the human-readable rationale text ("Why is this prompt next?"). This is an FR-8 requirement.

### GAP-EPIC-02: E1-S3 acceptance criteria reference 250+ prompts but tasks don't create test fixtures (Priority: Low)
E1-S3 AC states "works on repos with 250+ prompt files" but E1-S3 tasks don't include generating a large test fixture. E6-S2-T1 covers this later, but the E1-S3 tests may use a smaller fixture initially. This is acceptable but should be noted as a testing gap until E6-S2 runs.

### GAP-EPIC-03: No story for lifecycle-aware prompt display (Priority: Medium)
The lifecycle governance update added `location`, `archived_at`, `supersedes`, `superseded_by` to the data contract and FR-6 requires showing location and archived date. But no epic or story explicitly covers rendering archived prompts with visual distinction, showing supersession chains, or filtering by lifecycle state.

**Recommendation:** Add an acceptance criterion to E4-S1 (prompt inventory table):
- "Archived prompts are visually distinguished from active prompts (e.g., muted styling, badge)."
- "Superseded prompts show a link to the superseding prompt."

### GAP-EPIC-04: No dedicated story for `prompts/index.md` parsing (Priority: High)
The lifecycle standard established `prompts/index.md` as the canonical inventory and the data contract requires the parser to read it first. However, no E1 story or task explicitly covers parsing the index file. E1-S3 (build markdown frontmatter parser) only mentions scanning directories. A story or task should be added:
- "Parser reads `prompts/index.md` to build the prompt registry before scanning `prompts/active/` and `prompts/archive/`."

---

## 8. Open Questions Requiring Resolution

| ID | Question | Source | Recommended Resolution |
|---|---|---|---|
| OQ-01 | Should the parser emit warnings for non-conformant files or silently skip them? | Product Brief Q2 | Emit warnings. Display in blockers panel. Never silently skip. |
| OQ-02 | Chart library: Chart.js or D3? | Product Brief Q3 | Chart.js (already selected in ADR-001). Close this question. |
| OQ-03 | Multi-repo selector: local paths or git remote URLs? | Product Brief Q4 | Local filesystem paths only in v1. Aligns with C2. |
| OQ-04 | Hosted/shared mode in v2? | Product Brief Q1 | Out of scope for v1. Note as future consideration. |
| OQ-05 | How are time-series charts populated without historical state? | GAP-FR-08 | Derive from handoff timestamps. See recommendation above. |
| OQ-06 | Are epics/stories/tasks in individual files or combined markdown? | GAP-DC-01 | Support both, but document the combined format as primary for v1. |
| OQ-07 | What browsers must be supported? | UA-04 | Latest Chrome, Edge, Firefox. Document in PRD. |

---

## 9. Priority Summary

### Must Resolve Before Architecture Review (Prompt 4.0.1)

| ID | Description |
|---|---|
| GAP-DC-01 | Epic/story/task contract vs. actual file format mismatch |
| GAP-DC-03 | JSON state schema needs to be a formal spec, not just an example |
| GAP-FR-08 / CONFLICT-01 | Time-series charts need a feasible data source strategy |
| GAP-EPIC-04 | Missing `prompts/index.md` parsing story/task |
| OQ-03 | Decide local-paths-only for v1 multi-repo |

### Should Resolve Before Implementation (Prompt 11.0.1)

| ID | Description |
|---|---|
| GAP-FR-01 | FR-1 validation error UX |
| GAP-FR-06 | FR-8 rationale algorithm output format |
| GAP-FR-09 | FR-14 search scope definition |
| GAP-US-01 | Error/empty-state user stories |
| GAP-DC-02 | Handoff contract missing lifecycle fields |
| NFR-01 | Performance targets |
| NFR-02 | Accessibility requirements |
| NFR-03 | Error handling taxonomy |

### Can Resolve During Implementation

| ID | Description |
|---|---|
| GAP-FR-02 | Add `in_progress` count to FR-2 |
| GAP-FR-07 | Session timeline pagination |
| GAP-FR-10 | Repo selector UX details |
| GAP-FR-11 | Auto-refresh vs. static export |
| GAP-EPIC-03 | Lifecycle-aware prompt display AC |
| NFR-04–07 | Bundle size, privacy, i18n, logging |
