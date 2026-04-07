# Prompt Inventory — Canonical Index

> This file is the single source of truth for all prompts across all projects in this repository.
> The dashboard reads this file first. Folder contents alone do not define project scope.

## Boilerplate Operational Prompts

These prompts ship with the boilerplate and are reused for every new project.

| prompt_id | title | status | phase | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00_bootstrap | Bootstrap Repo | ready | bootstrap | prompts/active/00_FIRST_PROMPT_bootstrap_repo.md | — | 01_intake | — | 2026-04-03 | — | — | Scaffolds folder structure, roles, standards, workflows |
| 01_intake | Master Agent Project Intake | ready | intake | prompts/active/01_MASTER_AGENT_PROJECT_INTAKE_PROMPT.md | 00_bootstrap | 02_prompt_builder | — | 2026-04-03 | — | — | Interviews sponsor, creates charter, product brief, risks |
| 02_prompt_builder | Master Agent Prompt Builder | ready | prompt-building | prompts/active/02_MASTER_AGENT_PROMPT_BUILDER_PROMPT.md | 01_intake | — | — | 2026-04-03 | — | — | Generates sequenced specialist prompts from phase + role inputs |

## Active Project: Boilerplate Process Upgrade v2

> 11 prompts across 2 phases (implementation + review). Execution order per sponsor decision: Rec 10 first, then Recs 1→2→4→3→5→7→8→6, review gate, then prompt consolidation.
>
> **Summary:** ready 2 | done 9 | total 11

| prompt_id | title | status | phase | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3.0.1 | Boilerplate Self-Test Script | done | implementation | prompts/active/3.0.1-self-test-script.md | 01_intake | 4.0.1 | agents/handoffs/S-2026-04-06-001-self-test-script.md | 2026-04-06 | 2026-04-06 | — | Rec 10 — 65/65 checks pass, smoke fixture created, Standards Guardian updated |
| 4.0.1 | Stack Conventions Context Layer | done | implementation | prompts/active/4.0.1-conventions-layer.md | 3.0.1 | 5.0.1 | agents/handoffs/S-2026-04-06-002-conventions-layer.md | 2026-04-06 | 2026-04-06 | — | Rec 1 — conventions template + context file + intake/standards updated |
| 5.0.1 | AGENTS.md and Copilot Instructions | done | implementation | prompts/active/5.0.1-agents-md.md | 4.0.1 | 6.0.1 | agents/handoffs/S-2026-04-06-003-agents-md.md | 2026-04-06 | 2026-04-06 | — | Rec 2 — AGENTS.md + copilot-instructions.md + template + bootstrap updated |
| 6.0.1 | Skills and Capabilities Registry | done | implementation | prompts/active/6.0.1-skills-registry.md | 5.0.1 | 7.0.1 | agents/handoffs/S-2026-04-06-004-skills-registry.md | 2026-04-06 | 2026-04-06 | — | Rec 4 — skills template + context file + intake updated, 70/70 |
| 7.0.1 | Persistent Memory System | done | implementation | prompts/active/7.0.1-memory-system.md | 6.0.1 | 8.0.1 | agents/handoffs/S-2026-04-06-005-memory-system.md | 2026-04-06 | 2026-04-06 | — | Rec 3 — memory template + context file + handoff standard/template + curator role, 72/72 |
| 8.0.1 | Third-Party Integrations Map | done | implementation | prompts/active/8.0.1-integrations-map.md | 7.0.1 | 9.0.1 | agents/handoffs/S-2026-04-06-006-integrations-map.md | 2026-04-06 | 2026-04-06 | — | Rec 5 — integrations template + context file + intake updated, 74/74 |
| 9.0.1 | Environment and Secrets Standard | done | implementation | prompts/active/9.0.1-env-secrets.md | 8.0.1 | 10.0.1 | agents/handoffs/S-2026-04-06-007-env-secrets.md | 2026-04-06 | 2026-04-06 | — | Rec 7 — env-secrets standard + bootstrap + DevSecOps role updated, 76/76 |
| 10.0.1 | Human Team Mapping | done | implementation | prompts/active/10.0.1-team-mapping.md | 9.0.1 | 11.0.1 | agents/handoffs/S-2026-04-06-008-team-mapping.md | 2026-04-06 | 2026-04-06 | — | Rec 8 — team template + context file + intake + review-signoff updated, 78/78 |
| 11.0.1 | Complexity Scoring in Prompts | done | implementation | prompts/active/11.0.1-complexity-scoring.md | 10.0.1 | 12.0.1 | agents/handoffs/S-2026-04-06-009-complexity-scoring.md | 2026-04-06 | 2026-04-06 | — | Rec 6 — complexity field in templates + standard + all prompts scored, 79/79 |
| 12.0.1 | Upgrade Review Gate | ready | review | prompts/active/12.0.1-upgrade-review-gate.md | 11.0.1 | 13.0.1 | — | 2026-04-06 | — | — | Session-isolated review of all 9 recs |
| 13.0.1 | Update Bootstrap and Intake Prompts | ready | implementation | prompts/active/13.0.1-prompt-consolidation.md | 12.0.1 | — | — | 2026-04-06 | — | — | Consolidate all updates to prompts 00 + 01 |

## Archived Projects

### Dashboard v1 (2026-04-03 → 2026-04-06)

32 prompts executed across 7 phases. All artifacts archived to `archive/dashboard-v1/`.
See `archive/dashboard-v1/prompts/` for the full prompt history.
