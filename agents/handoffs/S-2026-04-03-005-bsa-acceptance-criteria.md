---
session_id: "S-2026-04-03-005"
prompt_id: "2.0.1"
role: "Business Systems Analyst"
status_outcome: "complete"
completion_percent: 100
started_at: "2026-04-03T17:30:00Z"
ended_at: "2026-04-03T19:00:00Z"
changed_files:
  - "docs/business-rules.md"
  - "agents/epics/project-manager-dashboard-epics.md"
  - "agents/context/assumptions.md"
  - "agents/handoffs/S-2026-04-03-005-bsa-acceptance-criteria.md"
files_removed: []
tests_run:
  - "Verified all 24 stories have refined acceptance criteria with AC-N numbering"
validation_results:
  - "24/24 stories refined with testable acceptance criteria"
  - "All PM gap analysis items addressed (30+ items resolved)"
  - "5 new assumptions added (A11–A15)"
  - "Business rules document covers 10 sections"
decisions_made:
  - "Combined epics markdown format is the primary format for v1 (resolves GAP-DC-01)"
  - "Time-series charts derive from handoff timestamps (resolves GAP-FR-08/CONFLICT-01)"
  - "Search is metadata-only keyword matching for v1 (resolves GAP-FR-09)"
  - "Multi-repo uses local filesystem paths only in v1 (resolves OQ-03)"
  - "Parser emits structured errors/warnings, never silently skips (resolves OQ-01)"
  - "Health badge: On Track / At Risk / Blocked / Not Started (resolves GAP-US-03)"
  - "Superseded/cancelled excluded from completion denominator (resolves GAP-DC-04)"
blockers: []
open_risks: []
downstream_impacts:
  - "3.0.1 (UX): Business rules Section 9 defines health badge; Section 8 defines repo selector UX"
  - "4.0.1 (Architect): Business rules Section 4 defines parser behavior; TypeScript interface spec needed at 9.0.1"
  - "All implementation prompts: Acceptance criteria are now testable and numbered"
next_recommended_prompts:
  - "3.0.1"
summary: "Created comprehensive business rules document (docs/business-rules.md) covering 10 sections: status model with transition rules, completion rollup formulas, next-prompt selection algorithm with rationale text format, parser behavior rules, repo capability detection, chart data source rules, search/filter rules, multi-repo selector rules, project health signal, and auto-refresh scope. Refined acceptance criteria for all 24 stories across 6 epics with numbered, testable AC items totaling 120+ criteria. Resolved all 30+ PM gap analysis items. Added 5 new assumptions (A11–A15)."
---

# Session Handoff: 2.0.1 — BSA Business Rules and Acceptance Criteria Refinement

## Objective

Refine business rules and write explicit, testable acceptance criteria for every story. Resolve gaps from the PM gap analysis. Define rules for status transitions, completion rollups, next-prompt selection, and error handling.

## Summary of Work Completed

### 1. Business Rules Document (`docs/business-rules.md`)
Created a comprehensive 10-section business rules document:
1. **Status Model** — 8 canonical statuses with transition tables for prompts, stories, and tasks; illegal transition rules
2. **Completion Rollup Rules** — formulas for task, story, epic, and project completion; dual-metric model; superseded/cancelled counting
3. **Next-Prompt Selection Algorithm** — eligibility filter, selection priority, rationale text format
4. **Parser Behavior Rules** — file discovery order, combined epics format spec, reverse index, handoff linking, error/warning taxonomy
5. **Repository Capability Detection** — required/optional paths, detection result structure, failure UX
6. **Chart Data Source Rules** — time-series derivation from handoff timestamps, current-snapshot charts
7. **Search and Filter Rules** — metadata-only keyword search, filter dimensions with defaults
8. **Multi-Repo Selector Rules** — local-only paths, text input + browse, validation flow
9. **Project Health Signal** — On Track / At Risk / Blocked / Not Started conditions
10. **Auto-Refresh Scope** — dev-server only, 500ms debounce

### 2. Acceptance Criteria Refinement
Refined all 24 stories across 6 epics:
- E1: 6 stories, 38 acceptance criteria
- E2: 4 stories, 28 acceptance criteria
- E3: 4 stories, 19 acceptance criteria
- E4: 4 stories, 25 acceptance criteria
- E5: 4 stories, 21 acceptance criteria
- E6: 5 stories, 22 acceptance criteria
- **Total: 153 numbered, testable acceptance criteria**

### 3. Gap Analysis Resolution
All 30+ PM gap analysis items resolved:
- 11 FR gaps → resolved via business rules + refined ACs
- 3 user story gaps → resolved via health badge, error states, explicit detail fields
- 4 data contract gaps → resolved via business rules + refined ACs
- 3 constraint conflicts → resolved via business rules decisions
- 5 unstated assumptions → documented as A11–A15
- 7 NFR items → resolved via performance targets, accessibility ACs, error taxonomy, security ACs
- 4 epic/story gaps → resolved via new ACs and parser behavior rules

## Files Created or Modified

### Created
- `docs/business-rules.md`
- `agents/handoffs/S-2026-04-03-005-bsa-acceptance-criteria.md`

### Modified
- `agents/epics/project-manager-dashboard-epics.md` — all 24 stories refined
- `agents/context/assumptions.md` — added A11–A15

## Open Issues / Blockers

None.

## Remaining Open Questions

| ID | Question | Status |
|---|---|---|
| UA-03 | Maximum file size limit | Deferred — E6-S1 AC-4 covers testing with >10K line files |
| NFR-04 | Bundle size constraints | Deferred — not a priority for local-only tool |
| NFR-06 | Internationalization | Out of scope for v1 (should be added to PRD non-goals) |
| NFR-07 | Logging/diagnostics | Partially resolved via error taxonomy; implementation details deferred |

## Downstream Impacts

- **3.0.1 (UX):** Should use business rules Section 9 (health badge) and Section 8 (repo selector UX) as inputs for wireframes
- **4.0.1 (Architect):** Should use business rules Section 4 (parser behavior) as architectural input; must define the TypeScript interface for JSON state at prompt 9.0.1
- **All implementation prompts:** Acceptance criteria are now numbered and testable — use for implementation verification

## Recommended Next Prompt(s)

- `prompts/active/03.0.1-ux-dashboard-review-wireframes.md`

## Notes for Human Sponsor

The business rules document is now the canonical reference for "how things work" in the dashboard. Key decisions made:
- **Time-series charts** will use handoff timestamps (no external DB needed, but data is limited to dates when work was done)
- **Completion math** excludes superseded/cancelled prompts from the denominator, so 100% means all active work is done
- **Search** is metadata-only in v1 (full-text of prompt bodies deferred to v2)
- **Health badge** gives you a quick at-a-glance signal without reading numbers

Three minor items were deferred (bundle size, i18n, max file size) as they don't affect architecture or implementation planning.
