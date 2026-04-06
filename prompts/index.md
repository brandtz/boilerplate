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

## Active Project

> When a new project is kicked off, its prompts are added below.
> Use the prompt builder (02) to generate the project-specific prompt sequence.

(No active project — run intake to begin)

## Archived Projects

### Dashboard v1 (2026-04-03 → 2026-04-06)

32 prompts executed across 7 phases. All artifacts archived to `archive/dashboard-v1/`.
See `archive/dashboard-v1/prompts/` for the full prompt history.
