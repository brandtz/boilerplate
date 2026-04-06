# Copilot Instructions — Agentic SaaS Team Factory

## Before Acting
- Read the current prompt's **required reading** list before writing any code or artifacts.
- Read `agents/context/project-charter.md` for project scope.
- Read `agents/context/conventions.md` for coding patterns and stack decisions.
- Read `agents/context/status-dashboard.md` for current phase.

## Scope Discipline
- Do NOT modify files outside the current prompt's stated scope.
- Do NOT skip required reading — if a file is listed, review it.
- Do NOT make architecture or product decisions without referencing the charter and conventions.

## Session Governance
- Follow `agents/standards/prompt-lifecycle-standard.md` for close-out rules.
- Follow `agents/standards/handoff-standard.md` for session handoffs.
- Complete the **Session Close-Out Checklist** in the prompt before committing.
- Update: prompt frontmatter, `prompts/index.md`, status dashboard, decision log.

## Coding Standards
- Follow conventions in `agents/context/conventions.md`.
- Follow `agents/standards/coding-documentation-testing-standard.md`.
- Never hardcode secrets — use environment variables per `agents/standards/environment-secrets-standard.md` (when it exists).

## When Uncertain
- Check `agents/context/decision-log.md` for prior decisions.
- Check `agents/context/assumptions.md` for project assumptions.
- If still unclear, document the ambiguity in the handoff and stop.
