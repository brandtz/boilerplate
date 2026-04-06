# AGENTS.md — Agentic SaaS Team Factory

> This file is a living document. It is read by both humans and AI agents to understand how this repository's agent system works.
> Keep it current as project state changes.

## What This Repo Is

This is a **reusable boilerplate** for running AI-agent-led software delivery lifecycles. It provides:
- Role definitions for 10+ specialist agent personas
- Workflow files that define phase sequencing from intake to release
- Standards for prompts, handoffs, reviews, coding, and testing
- Templates for all project artifacts
- A shared context layer (charter, assumptions, constraints, risks, conventions, etc.)
- A built-in project manager dashboard (Next.js)

## How the Agent System Works

1. **Human Sponsor** provides the project idea and makes approval decisions
2. **Master Agent / Orchestrator** runs the intake, generates prompts, routes work
3. **Specialist Agents** execute prompts in sequence — each reads its required context, produces artifacts, writes a handoff, and updates governance files
4. **Standards Guardian** audits process compliance at review gates

Every session follows: **read context → execute scope → validate → write handoff → update governance → commit**.

## Current Project

See `agents/context/status-dashboard.md` for live status.

## Key File Locations

| Area | Path | Purpose |
|---|---|---|
| Roles | `agents/roles/` | Agent persona definitions (10 categories) |
| Standards | `agents/standards/` | Process rules and expectations |
| Templates | `agents/templates/` | Artifact templates for all document types |
| Context | `agents/context/` | Shared project state (charter, risks, conventions, etc.) |
| Workflows | `agents/workflows/` | Phase sequencing and operating model |
| Handoffs | `agents/handoffs/` | Session-to-session continuity records |
| Prompts | `prompts/active/` | Current prompt files ready for execution |
| Prompt Index | `prompts/index.md` | Canonical prompt inventory (source of truth) |
| Dashboard | `dashboard/` | Built-in PM dashboard (Next.js) |
| Docs | `docs/` | Project-specific documentation |

## Role Index

| Category | Path | Roles |
|---|---|---|
| Orchestration | `agents/roles/orchestration/` | Master Agent, Standards Guardian, Repo Knowledge Curator |
| Product | `agents/roles/product/` | Product Manager, Business Systems Analyst |
| Architecture | `agents/roles/architecture/` | Solution Architect |
| Engineering | `agents/roles/engineering/` | Senior Full-Stack Engineer |
| Platform | `agents/roles/platform/` | DevOps / SRE |
| Security | `agents/roles/security/` | DevSecOps Engineer |
| QA | `agents/roles/qa/` | QA / Test Architect |
| Design | `agents/roles/design/` | UX Designer |
| Docs | `agents/roles/docs/` | Technical Writer |
| Customer | `agents/roles/customer/` | Customer Success / Go-to-Market |

## Quick Start for New Agent Sessions

1. Read `agents/context/project-charter.md` to understand the current project
2. Read `agents/context/conventions.md` for stack-specific coding patterns
3. Read `agents/context/status-dashboard.md` for current phase and next action
4. Read `prompts/index.md` to find the next prompt to execute
5. Open the prompt file and follow its required reading, scope, and close-out checklist

## Governance Rules

- Every prompt execution must produce a session handoff
- Every session must update: prompt frontmatter, `prompts/index.md`, status dashboard, decision log
- Review gates must run in isolated sessions (see `agents/standards/review-signoff-standard.md`)
- The self-test (`scripts/validate-boilerplate.sh`) must pass after any structural change
