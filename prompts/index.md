# Prompt Inventory — Canonical Index

> This file is the single source of truth for all prompts across all projects in this repository.
> The dashboard reads this file first. Folder contents alone do not define project scope.

## Project: Project Manager Dashboard

### Summary

| Metric | Count |
|---|---|
| Total prompts | 34 |
| Boilerplate operational prompts | 4 |
| Dashboard project prompts | 30 |
| Status: ready | 11 |
| Status: done | 23 |
| Status: archived | 0 |
| Status: blocked | 0 |
| Status: superseded | 0 |

### Boilerplate Operational Prompts

| prompt_id | title | status | phase | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00_bootstrap | Bootstrap Repo | ready | bootstrap | prompts/active/00_FIRST_PROMPT_bootstrap_repo.md | — | 01_intake | — | 2026-04-03 | — | — | Boilerplate scaffolding prompt |
| 00_kickoff | Kickoff Project Manager Dashboard | ready | kickoff | prompts/active/00_kickoff_project_manager_dashboard.md | — | 1.0.1 | agents/handoffs/2026-04-03-00-kickoff.md | 2026-04-03 | 2026-04-03 | — | Executed during initial kickoff session |
| 01_intake | Master Agent Project Intake | ready | intake | prompts/active/01_MASTER_AGENT_PROJECT_INTAKE_PROMPT.md | 00_bootstrap | 02_prompt_builder | — | 2026-04-03 | — | — | Boilerplate intake prompt |
| 02_prompt_builder | Master Agent Prompt Builder | ready | prompt-building | prompts/active/02_MASTER_AGENT_PROMPT_BUILDER_PROMPT.md | 01_intake | — | — | 2026-04-03 | — | — | Boilerplate prompt builder |

### Dashboard Project Prompts — Phase 1: Product Definition

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.0.1 | PRD Review and Gap Analysis | done | product-definition | E1 | — | — | prompts/archive/01.0.1-pm-prd-review-gap-analysis.md | — | 2.0.1 | agents/handoffs/S-2026-04-03-004-prd-gap-analysis.md | 2026-04-03 | 2026-04-03 | 2026-04-03 | Gap analysis produced: docs/prd-gap-analysis.md |
| 2.0.1 | Business Rules and Acceptance Criteria | done | product-definition | E1 | — | — | prompts/archive/02.0.1-bsa-business-rules-acceptance-criteria.md | 1.0.1 | 3.0.1 | agents/handoffs/S-2026-04-03-005-bsa-acceptance-criteria.md | 2026-04-03 | 2026-04-03 | 2026-04-03 | Business rules + 24 stories refined |
| 3.0.1 | Dashboard UX Review and Wireframes | done | product-definition | E2 | — | — | prompts/archive/03.0.1-ux-dashboard-review-wireframes.md | 2.0.1 | 4.0.1 | agents/handoffs/S-2026-04-03-006-ux-wireframes.md | 2026-04-03 | 2026-04-03 | 2026-04-03 | UX wireframes for 5 views + accessibility |

### Dashboard Project Prompts — Phase 2: Cross-Functional Review

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 4.0.1 | Architecture Review and ADR Approval | done | architecture-review | E1 | — | — | prompts/archive/04.0.1-architect-architecture-review.md | 2.0.1, 3.0.1 | 5.0.1 | agents/handoffs/S-2026-04-03-007-architecture-review.md | 2026-04-03 | 2026-04-03 | 2026-04-03 | 3 ADRs reviewed + arch overview rewritten |
| 5.0.1 | Security Review of Architecture | done | security-review | E6 | E6-S4 | — | prompts/active/05.0.1-devsecops-security-review.md | 4.0.1 | 6.0.1 | agents/handoffs/S-2026-04-03-008-security-review.md | 2026-04-03 | 2026-04-03 | — | 0 critical, 2 high, 4 medium, 3 low findings; PROCEED |
| 6.0.1 | Operational Review and Local Dev Setup | done | operational-review | E5 | — | — | prompts/active/06.0.1-devops-operational-review.md | 4.0.1 | 7.0.1 | agents/handoffs/S-2026-04-03-009-operational-review.md | 2026-04-03 | 2026-04-03 | — | Operational review produced: docs/operational-review.md |
| 7.0.1 | Test Strategy and Test Plan | done | qa-planning | E6 | E6-S1 | — | prompts/active/07.0.1-qa-test-strategy.md | 4.0.1, 5.0.1 | 8.0.1 | agents/handoffs/S-2026-04-04-010-test-strategy.md | 2026-04-03 | 2026-04-04 | — | Test strategy: 4 test levels, 8 fixture categories, quality gates per phase |
| 8.0.1 | Pre-Implementation Review Gate | done | review-approval | — | — | — | prompts/archive/08.0.1-review-gate-pre-implementation.md | 1.0.1–7.0.1 | 9.0.1 | agents/handoffs/S-2026-04-04-011-pre-implementation-review-gate.md | 2026-04-03 | 2026-04-04 | 2026-04-04 | GO: All deliverables verified; proceed with ADR-002 conditions in 9.0.1 |

### Dashboard Project Prompts — Phase 3: Technical Task Generation

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 9.0.1 | Technical Tasks for Parser (E1) | done | technical-task-generation | E1 | — | — | prompts/archive/09.0.1-architect-technical-tasks-parser.md | 8.0.1 | 10.0.1, 11.0.1 | agents/handoffs/S-2026-04-04-012-technical-tasks-parser.md | 2026-04-03 | 2026-04-04 | 2026-04-04 | 21 tasks specified; all 6 ADR-002 conditions resolved; R10/R11/R12 resolved |
| 10.0.1 | Technical Tasks for UI (E2–E5) | done | technical-task-generation | E2 | — | — | prompts/active/10.0.1-architect-technical-tasks-ui.md | 8.0.1 | 16.0.1 | agents/handoffs/S-2026-04-03-013-technical-tasks-ui.md | 2026-04-03 | 2026-04-03 | — | 55 UI tasks specified across E2–E5; component structure, hooks, and test requirements defined |

### Dashboard Project Prompts — Phase 4: Implementation — Parser

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11.0.1 | Project Scaffolding and Parser Setup | done | implementation | E1 | E1-S1 | E1-S1-T1 | prompts/active/11.0.1-engineer-project-scaffolding.md | 9.0.1 | 12.0.1 | agents/handoffs/S-2026-04-04-014-project-scaffolding.md | 2026-04-03 | 2026-04-04 | — | Scaffolded Next.js + TS project; parser module structure + all interfaces defined |
| 12.0.1 | Frontmatter Parser and Validators | done | implementation | E1 | E1-S3 | E1-S1-T2,T3;E1-S2-T1–T3;E1-S3-T1–T5 | prompts/active/12.0.1-engineer-frontmatter-parser.md | 11.0.1 | 13.0.1 | agents/handoffs/S-2026-04-04-015-frontmatter-parser.md | 2026-04-03 | 2026-04-04 | — | 7 parser modules, 57 tests, 97% coverage |
| 13.0.1 | Prompt Sorting and Dependency Engine | done | implementation | E1 | E1-S4 | E1-S4-T1,T2;E1-S5-T1–T4 | prompts/active/13.0.1-engineer-sorting-dependency-engine.md | 12.0.1 | 14.0.1 | agents/handoffs/S-2026-04-04-016-sorting-dependency-engine.md | 2026-04-03 | 2026-04-04 | — | sorting.ts + eligibility.ts; 56 new tests |
| 14.0.1 | JSON State Emitter and CLI | done | implementation | E1 | E1-S6 | E1-S6-T1–T4 | prompts/active/14.0.1-engineer-json-emitter-cli.md | 13.0.1 | 15.0.1 | agents/handoffs/S-2026-04-04-017-json-emitter-cli.md | 2026-04-03 | 2026-04-04 | — | parse() + CLI + 26 new tests |
| 15.0.1 | Parser Code Review Gate | done | review-approval | E1 | — | — | prompts/active/15.0.1-review-gate-parser.md | 14.0.1 | 16.0.1 | agents/handoffs/S-2026-04-04-018-review-gate-parser.md | 2026-04-03 | 2026-04-04 | — | Approved: Architect, QA, Security — no rework needed; 139 tests passing |

### Dashboard Project Prompts — Phase 5: Implementation — UI

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 16.0.1 | App Shell, Layout, Navigation | done | implementation | E2 | E2-S1 | E2-S1-T1 | prompts/active/16.0.1-engineer-app-shell-navigation.md | 10.0.1, 15.0.1 | 17.0.1 | agents/handoffs/S-2026-04-04-019-app-shell-navigation.md | 2026-04-03 | 2026-04-04 | — | Shell + sidebar + 5 routes + DashboardContext; 31 new tests |
| 17.0.1 | Overview: Summary Cards and Charts | done | implementation | E2 | E2-S1 | E2-S1-T1–T3;E2-S2-T1–T5 | prompts/active/17.0.1-engineer-overview-cards-charts.md | 16.0.1 | 18.0.1 | agents/handoffs/S-2026-04-04-020-overview-cards-charts.md | 2026-04-03 | 2026-04-04 | — | Summary cards + 3 charts + 50 tests |
| 18.0.1 | Blockers Panel and Next Prompt Widget | done | implementation | E2 | E2-S3 | E2-S3-T1–T4;E2-S4-T1–T4 | prompts/active/18.0.1-engineer-blockers-next-prompt.md | 17.0.1 | 19.0.1 | agents/handoffs/S-2026-04-04-021-blockers-next-prompt.md | 2026-04-03 | 2026-04-04 | — | BlockersWarningsPanel + NextPromptWidget + CopyButton + useCopyToClipboard; 31 new tests; 251 total passing |
| 19.0.1 | Epics View: Table, Drill-Down, Tasks | done | implementation | E3 | E3-S1 | All E3 tasks | prompts/active/19.0.1-engineer-epics-view.md | 18.0.1 | 20.0.1 | agents/handoffs/S-2026-04-04-022-epics-view.md | 2026-04-03 | 2026-04-04 | — | EpicAccordion + StoryRow + TaskList + StatusBadge + FilterBar + UpdateSummary; 59 new tests; 310 total passing |
| 20.0.1 | Prompt Inventory Table and Detail Drawer | done | implementation | E4 | E4-S1 | E4-S1-T1–T4;E4-S2-T1–T4 | prompts/active/20.0.1-engineer-prompt-inventory.md | 19.0.1 | 21.0.1 | agents/handoffs/S-2026-04-04-023-prompt-inventory.md | 2026-04-03 | 2026-04-04 | — | PromptTable + PromptDetailDrawer + PromptFilterBar + MarkdownRenderer + Pagination + useDrawer; 47 new tests; 356 total passing |
| 21.0.1 | Session Timeline and Handoff Links | done | implementation | E4 | E4-S3 | E4-S3-T1–T4;E4-S4-T1–T3 | prompts/active/21.0.1-engineer-session-timeline.md | 20.0.1 | 22.0.1 | agents/handoffs/S-2026-04-04-024-session-timeline.md | 2026-04-03 | 2026-04-04 | — | SessionTimeline + SessionCard + SessionDetail + SessionFilterBar; enhanced PromptDetailDrawer handoffs; 29 new tests; 385 total passing |
| 22.0.1 | Refresh, File Watch, Repo Selector | done | implementation | E5 | E5-S1 | All E5 tasks | prompts/active/22.0.1-engineer-refresh-watch-repo-selector.md | 21.0.1 | 23.0.1 | agents/handoffs/S-2026-04-04-025-refresh-watch-repo.md | 2026-04-03 | 2026-04-04 | — | LoadingIndicator + ErrorBanner + RepoSelector + recentProjects + repoDetection + fileWatcher; 53 new tests; 438 total passing |
| 23.0.1 | UI Code Review Gate | done | review-approval | E2 | — | — | prompts/active/23.0.1-review-gate-ui.md | 22.0.1 | 24.0.1 | agents/handoffs/S-2026-04-04-026-review-gate-ui.md | 2026-04-03 | 2026-04-04 | — | APPROVED: Architect, QA, Security, UX — no rework needed; 438 tests, 88% coverage |

### Dashboard Project Prompts — Phase 6: Validation and Hardening

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 24.0.1 | Validation Tests for Malformed Metadata | ready | validation | E6 | E6-S1 | E6-S1-T1–T3 | prompts/active/24.0.1-qa-validation-tests.md | 23.0.1 | 25.0.1 | — | 2026-04-03 | — | — | — |
| 25.0.1 | Performance Tests for Large Inventories | ready | validation | E6 | E6-S2 | E6-S2-T1–T3 | prompts/active/25.0.1-qa-performance-tests.md | 24.0.1 | 26.0.1 | — | 2026-04-03 | — | — | — |
| 26.0.1 | Accessibility Review and Keyboard Nav | ready | validation | E6 | E6-S3 | E6-S3-T1–T4 | prompts/active/26.0.1-ux-accessibility-review.md | 23.0.1 | 27.0.1 | — | 2026-04-03 | — | — | — |
| 27.0.1 | Security Hardening and Path Sanitization | ready | validation | E6 | E6-S4 | E6-S4-T1–T4 | prompts/active/27.0.1-devsecops-security-hardening.md | 23.0.1 | 28.0.1 | — | 2026-04-03 | — | — | — |

### Dashboard Project Prompts — Phase 7: Release

| prompt_id | title | status | phase | epic_id | story_id | task_ids | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 28.0.1 | Final Review Gate — Release Readiness | ready | review-approval | E6 | E6-S5 | — | prompts/active/28.0.1-review-gate-release-readiness.md | 24.0.1–27.0.1 | 29.0.1 | — | 2026-04-03 | — | — | — |
| 29.0.1 | Release Documentation and README | ready | release | E6 | E6-S5 | E6-S5-T1,T2 | prompts/active/29.0.1-writer-release-documentation.md | 28.0.1 | 30.0.1 | — | 2026-04-03 | — | — | — |
| 30.0.1 | Release Handoff — Dashboard v1 Complete | ready | release | — | — | E6-S5-T3,T4 | prompts/active/30.0.1-release-handoff.md | 29.0.1 | — | — | 2026-04-03 | — | — | Final prompt |

### Dependency Graph

```
1.0.1 → 2.0.1 → 3.0.1 ─┐
                         ├→ 4.0.1 → 5.0.1 → 7.0.1 ─┐
                         │       └→ 6.0.1 ──────────┤
                         │                           ├→ 8.0.1 → 9.0.1 → 11.0.1 → 12.0.1 → 13.0.1 → 14.0.1 → 15.0.1 ─┐
                         │                           │    └→ 10.0.1 ─────────────────────────────────────────────────────┤
                         │                           │                                                                   ├→ 16.0.1 → 17.0.1 → 18.0.1 → 19.0.1 → 20.0.1 → 21.0.1 → 22.0.1 → 23.0.1 ─┐
                         │                           │                                                                   │                                                                              ├→ 24.0.1 → 25.0.1 ─┐
                         │                           │                                                                   │                                                                              ├→ 26.0.1 ──────────┤
                         │                           │                                                                   │                                                                              ├→ 27.0.1 ──────────┤
                         └───────────────────────────┴───────────────────────────────────────────────────────────────────┘                                                                              └→ 28.0.1 → 29.0.1 → 30.0.1
```

### Role Distribution

| Role | Prompt Count |
|---|---|
| Senior Software Engineer | 10 |
| Master Agent Orchestrator | 5 |
| Solution Architect | 3 |
| QA Test Architect | 3 |
| DevSecOps Engineer | 2 |
| Product Manager | 1 |
| Business Systems Analyst | 1 |
| Product Designer UX | 2 |
| DevOps SRE Engineer | 1 |
| Technical Writer | 1 |
| **Total (dashboard project)** | **30** |
