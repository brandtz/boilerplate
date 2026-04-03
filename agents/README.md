# Agents Operating Manual

This directory contains the AI operating system for the repository.

## Purpose

The repository is designed so AI agents can behave like a coordinated software delivery organization. Agents do not work from memory alone. They work from:
- role instructions
- workflow definitions
- standards
- templates
- shared context documents
- handoffs
- review artifacts

## Core operating rules

1. Read before acting.
2. Update shared state after acting.
3. Do not skip handoffs.
4. Do not invent missing requirements.
5. Escalate when stop conditions are hit.
6. Respect approval boundaries.
7. Prefer short structured documents over long narrative prose.
8. Treat context files as the current truth unless explicitly superseded.

## Required reading before any major work

Every major agent session should read:
- `agents/workflows/00-operating-model.md`
- the current phase workflow file
- `agents/standards/required-reading-standard.md`
- `agents/standards/handoff-standard.md`
- `agents/context/project-charter.md`
- `agents/context/assumptions.md`
- `agents/context/constraints.md`
- `agents/context/decision-log.md`
- `agents/context/risk-register.md`
- any prompt-specific files listed in the work packet

## Standard execution loop

1. Confirm phase and objective
2. Read required context
3. Perform the assigned work
4. Update artifacts
5. Produce a handoff
6. Route to reviewer or downstream role
7. Stop if a stop condition is triggered

## Directory map

- `roles/` identity files for specialist agents
- `workflows/` SDLC process definitions
- `standards/` operating contracts
- `templates/` structured markdown templates
- `context/` living project memory
- `handoffs/` cycle-end handoff notes
- `reviews/` role-based review notes

> **Note:** Prompt files are stored at `prompts/active/` and `prompts/archive/` (project root), not under `agents/`. See `prompts/README.md` and `agents/standards/prompt-lifecycle-standard.md`.

## Recommended review doctrine

Use more eyes when work is:
- security-sensitive
- customer-facing
- stateful or data-heavy
- operationally risky
- release-impacting
- compliance-relevant

The default is not speed. The default is quality.
