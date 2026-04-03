# Product Brief

## Summary
The Project Manager Dashboard is a repo-native, single-page application that parses committed markdown files (epics, stories, tasks, prompts, handoffs) and renders a real-time project cockpit for human sponsors managing agentic AI SDLC projects.

## Users
1. Human Sponsor / Operator — primary user, needs at-a-glance status and next-action guidance
2. Master Agent / Orchestrator — consumes normalized state for workflow decisions
3. Specialist Agents — produce the artifacts the dashboard reads

## Workflows
1. Open dashboard → see project overview with summary metrics, charts, blockers, next prompt
2. Drill into epics → see story and task breakdown with completion rollups
3. Browse prompt inventory → see full prompt list with status, dependencies, sequencing
4. Click a prompt → see detail drawer with metadata, body, handoff, changed files
5. Copy next prompt → launch next agent session from the dashboard
6. Switch projects → select from compatible boilerplate-derived repos
7. Refresh → re-parse repo artifacts and update all views

## Primary Jobs To Be Done
- Understand total project scope and progress at any time
- Identify what has been completed, what is blocked, and what is next
- Launch the next agent session without manually hunting for prompt files
- Track inserted prompts and scope changes without renumbering
- Monitor session-by-session outcomes and file changes

## Constraints
- Must derive all state from committed repo artifacts (no external database in v1)
- Must not require agents to change their handoff workflow beyond following standard templates
- Must handle fractional/inserted prompt numbering (e.g., 16.0.2)
- Must be usable with zero backend infrastructure (static or local-only in v1)
- Must parse YAML frontmatter deterministically

## Open Questions
- Q1: Should the dashboard support a hosted/shared mode in v2, or remain local-only?
- Q2: Should the parser emit warnings for non-conformant files or silently skip them?
- Q3: Should chart rendering use a lightweight library (Chart.js) or a full framework (D3)?
- Q4: Should the multi-repo selector use local filesystem paths or git remote URLs?
