# Agentic SaaS Team Factory

This repository is the canonical operating system for building software projects with an AI-led delivery team.

It is designed for:
- GitHub Copilot in VS Code
- GitHub Copilot Cloud agents
- a single human sponsor / approver
- a master orchestration agent plus specialist role agents
- a document-first workflow with heavy required reading, handoffs, reviews, and sign-offs

## Philosophy

This repo treats AI agents like a disciplined software company, not a pile of disconnected prompt sessions.

The operating model is built around:
1. **One orchestrator**
2. **Specialist role identities**
3. **Shared context and living documents**
4. **Phase-based workflow gates**
5. **Required reading before action**
6. **Structured handoffs after action**
7. **Cross-functional review before approval**
8. **Validation and release hardening before production**

## Repository Structure

```
agents/
  context/         shared living documents (charter, assumptions, risks, etc.)
  epics/           epic and story breakdowns per project
  prompts/         example agent prompts
  roles/           AI role identity files
  standards/       contracts and operating standards
  templates/       templates for artifacts and handoffs
  workflows/       SDLC workflow definitions
docs/              high-level blueprints and product documents
prompts/           numbered master prompts for bootstrapping and execution
schemas/           machine-readable schema examples
```

## Getting Started

1. Clone or fork this repository.
2. Commit it as your "AI operating system" baseline.
3. Start with `prompts/00_FIRST_PROMPT_bootstrap_repo.md`.
4. Have the Master Agent scaffold the repo, standards, and role expansion.
5. Use the Master Agent to intake each project idea and route it through the defined phases.

## Core Principle

Every agent should always know:
- what phase it is in
- what it must read
- what artifact it must produce or update
- what constraints apply
- what tests or validations are required
- what stop conditions force escalation
- who receives the handoff next

## Recommended Default Phase Order

1. Intake and framing
2. Prompt-building and execution planning
3. Product definition
4. Architecture and cross-functional review
5. Revision and approval
6. Technical task generation
7. Implementation
8. Validation and hardening
9. Release readiness
10. Post-release handoff

## Included Project: Project Manager Dashboard

The first project seeded in this repo is the **Human Master Dashboard** — a repo-native dashboard that gives the human sponsor a consistent, repo-driven view of project state.

Key spec files:
- `docs/project-manager-dashboard-prd.md` — product requirements document
- `docs/project-manager-dashboard-data-contract.md` — repo data model and derived metrics rules
- `agents/epics/project-manager-dashboard-epics.md` — epic and story breakdown
- `agents/standards/prompt-numbering-standard.md` — numbering and prerequisite update rules
- `agents/templates/prompt-session-template.md` — required frontmatter and body shape for prompts
- `agents/templates/session-handoff-template.md` — required handoff output for every agent session
- `prompts/00_kickoff_project_manager_dashboard.md` — first Master Agent prompt for the swarm
- `schemas/dashboard-state.example.json` — example normalized output for dashboard ingestion

The dashboard must be **repo-native**: it derives project state from committed markdown files, prompt files, handoffs, and normalized machine-readable status files rather than depending on human memory or chat history.
