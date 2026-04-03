# Project Charter

## Project Name
Project Manager Dashboard

## Objective
Build a repo-native dashboard that gives the human sponsor a holistic, self-service, always-current view of agentic AI project state derived from committed repository artifacts.

## Problem Statement
In an agentic workflow, work is distributed across many prompt sessions, role identities, reviews, and handoffs. Without a consistent monitoring surface, the human operator loses visibility into total scope, completion status, session outcomes, prompt readiness, and next recommended actions.

## Target Users
1. **Human Sponsor / Operator** — starts projects, runs prompts, needs rapid visibility and next-action control
2. **Master Agent / Orchestrator** — updates structured files, uses dashboard state for workflow routing
3. **Specialist Agents** — produce handoffs and status artifacts that feed dashboard views

## Desired Outcomes
1. Single dashboard summarizing project state from repo artifacts
2. Hierarchical progress by epic, story, task, and prompt
3. Session-by-session outcome visibility
4. Next-prompt launcher with copy-to-clipboard
5. Dynamic recalculation as prompts are inserted or scope changes
6. Multi-project support across boilerplate-derived repos
7. Minimal manual upkeep beyond normal agent handoff discipline

## In Scope
- v1 dashboard frontend (SPA)
- Markdown/YAML frontmatter parser
- Normalized JSON state generation
- Epic/story/task/prompt hierarchy views
- Session timeline and handoff views
- Next-prompt widget with copy action
- Inserted-prompt numbering support
- Chart panels for progress visualization
- Multi-repo project selector
- Local file-watch refresh

## Out of Scope
- GitHub Issues / PR integration (v1)
- Direct Copilot usage API integration (v1)
- Authoritative editing of epics/prompts through the dashboard (v1)
- Billing, staffing, or chat transcript management
- CI/CD pipeline integration

## Success Measures
1. Parse a project with 10+ epics, 100+ stories, 300+ tasks, 250+ prompts without code changes
2. Display hierarchical completion metrics derived from repo files
3. Show next prompt with copy-to-clipboard
4. Show session notes for any completed prompt
5. Inserted prompts update sequencing and prerequisite views
6. Switch between at least two compatible repos

## Status
Active — Intake complete, entering epic/story refinement
