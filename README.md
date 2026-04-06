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
  decisions/       architecture decision records (ADRs)
  epics/           epic and story breakdowns per project
  handoffs/        session handoff files from completed prompts
  roles/           AI role identity files
  standards/       contracts and operating standards
  templates/       templates for artifacts and handoffs
  workflows/       SDLC workflow definitions
archive/           completed project artifacts (prompts, handoffs, docs)
dashboard/         built-in project management dashboard (Next.js)
docs/              high-level blueprints and product documents
prompts/
  active/          prompts ready for execution
  archive/         completed prompts
  templates/       prompt authoring templates
schemas/           machine-readable schema examples
```

## Getting Started

1. Clone or fork this repository.
2. Install the dashboard: `cd dashboard && npm ci`
3. Start with `prompts/active/01_MASTER_AGENT_PROJECT_INTAKE_PROMPT.md` to kick off a new project.
4. The Master Agent will interview you, create a project charter, and generate the prompt sequence.
5. Execute prompts in order. The dashboard tracks progress automatically.

## Built-In Dashboard

This boilerplate includes a **project management dashboard** that automatically parses your repo's prompts, epics, handoffs, and session artifacts to give you a real-time view of project progress.

```bash
cd dashboard
npm ci
npm run dev     # Dev server at http://localhost:3000
npm run build   # Static export to out/
```

The dashboard reads `prompts/index.md`, `agents/epics/`, `agents/handoffs/`, and prompt frontmatter to derive:
- Overall project health and completion metrics
- Epic > Story > Task hierarchy with status badges
- Prompt inventory with dependency graph
- Session timeline with handoff summaries
- Next-prompt recommendation with copy-to-clipboard

See [dashboard/README.md](dashboard/README.md) for full documentation.

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

## Key Reference Files

- `agents/README.md` — operating model and agent rules
- `prompts/README.md` — prompt lifecycle and authoring guide
- `agents/workflows/00-operating-model.md` — full SDLC workflow definition
- `agents/standards/` — all operating standards (handoff, review, prompt lifecycle, etc.)
- `agents/templates/` — templates for prompts, handoffs, ADRs, epics, stories, tasks
- `docs/agentic-ai-team-factory-blueprint.md` — conceptual blueprint for the operating model

## Archived Projects

### Dashboard v1 (2026-04-03 → 2026-04-06)

The dashboard itself was the first project built using this boilerplate. All build artifacts are preserved in `archive/dashboard-v1/` for reference:
- 32 prompts across 7 phases
- 558 tests, 0 vulnerabilities
- 34 session handoffs documenting every decision
