# AGENTS.md Template

> Copy this template to the repo root as `AGENTS.md` and populate during bootstrap or intake.

## What This Repo Is

<!-- Describe the repository's purpose and what it produces -->

## How the Agent System Works

1. **Human Sponsor** provides the project idea and makes approval decisions
2. **Master Agent / Orchestrator** runs the intake, generates prompts, routes work
3. **Specialist Agents** execute prompts in sequence — each reads its required context, produces artifacts, writes a handoff, and updates governance files
4. **Standards Guardian** audits process compliance at review gates

Every session follows: **read context → execute scope → validate → write handoff → update governance → commit**.

## Current Project

<!-- Update with current project name or reference status-dashboard.md -->
See `agents/context/status-dashboard.md` for live status.

## Key File Locations

| Area | Path | Purpose |
|---|---|---|
| Roles | `agents/roles/` | Agent persona definitions |
| Standards | `agents/standards/` | Process rules and expectations |
| Templates | `agents/templates/` | Artifact templates |
| Context | `agents/context/` | Shared project state |
| Workflows | `agents/workflows/` | Phase sequencing |
| Handoffs | `agents/handoffs/` | Session continuity records |
| Prompts | `prompts/active/` | Current prompt files |
| Prompt Index | `prompts/index.md` | Canonical prompt inventory |

## Role Index

<!-- List each role category with paths -->

| Category | Path | Roles |
|---|---|---|
| Orchestration | `agents/roles/orchestration/` | |
| Product | `agents/roles/product/` | |
| Architecture | `agents/roles/architecture/` | |
| Engineering | `agents/roles/engineering/` | |
| Platform | `agents/roles/platform/` | |
| Security | `agents/roles/security/` | |
| QA | `agents/roles/qa/` | |
| Design | `agents/roles/design/` | |

## Quick Start for New Agent Sessions

1. Read `agents/context/project-charter.md` to understand the current project
2. Read `agents/context/conventions.md` for stack-specific coding patterns
3. Read `agents/context/status-dashboard.md` for current phase and next action
4. Read `prompts/index.md` to find the next prompt to execute
5. Open the prompt file and follow its required reading, scope, and close-out checklist

## Governance Rules

- Every prompt execution must produce a session handoff
- Every session must update: prompt frontmatter, `prompts/index.md`, status dashboard, decision log
- Review gates must run in isolated sessions
- The self-test (`scripts/validate-boilerplate.sh`) must pass after any structural change
