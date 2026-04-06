# Project Charter

> This file is populated during project intake (prompt 01). Do not edit manually.

## Project Name
Boilerplate Process Upgrade v2

## Objective
Harden the agentic SaaS team factory boilerplate with 9 process improvements identified during the dashboard v1 retrospective — adding missing context layers, configuration standards, and a self-test mechanism — so the boilerplate is production-ready for multi-project, multi-human team use.

## Problem Statement
The boilerplate was validated by building the dashboard (a local-only, single-developer, no-external-dependencies project). Real production SaaS projects (Bulwark and beyond) require capabilities the boilerplate does not yet support: stack conventions, persistent memory, third-party integration tracking, environment/secrets governance, multi-human team mapping, agent configuration, skills/capabilities awareness, complexity estimation, and structural self-testing. Without these, agents will rediscover decisions, mishandle secrets, ignore team authority boundaries, and produce prompts that are too large for reliable execution.

## Target Users
1. **Human Sponsor(s)** — one or more humans operating the boilerplate for real projects
2. **Master Agent / Orchestrator** — consumes the new context files for better routing and scope decisions
3. **Specialist Agents** — benefit from richer context (conventions, memory, skills, integrations) and better-sized prompts

## Desired Outcomes
1. Every new project intake produces a conventions file, skills file, integrations map, and team map
2. Persistent memory replaces handoff-chain reading for late-stage agents
3. Agent sessions are primed via `.github/copilot-instructions.md` and `AGENTS.md`
4. Secrets and environment variables are governed by an explicit standard
5. Prompts carry complexity scores so oversize work is visible before execution
6. A self-test script validates boilerplate structural integrity after any change

## In Scope
- Rec 1: Stack conventions context file + template
- Rec 2: AGENTS.md + `.github/copilot-instructions.md` (simplified — no separate standard doc)
- Rec 3: Persistent memory context file + template (structured, not freeform)
- Rec 4: Skills/capabilities context file + template (separate from conventions)
- Rec 5: Third-party integrations context file + template
- Rec 6: Complexity scoring (S/M/L/XL) added to prompt template (no token budgets, no auto-splitting)
- Rec 7: Environment and secrets management standard
- Rec 8: Human team mapping context file + template
- Rec 10: Boilerplate self-test script + smoke test fixture

## Out of Scope
- Rec 9: Validation sandbox standard (deferred to each project's architecture review phase)
- Token budget estimation or auto-splitting of prompts
- Dashboard v2 features
- Bulwark project implementation (separate intake after this upgrade)

## Assumptions
See `agents/context/assumptions.md`

## Constraints
See `agents/context/constraints.md`

## Risks
See `agents/context/risk-register.md`

## Success Measures
1. `scripts/validate-boilerplate.sh` passes after all changes — no broken references or missing files
2. Smoke test project can be run through intake without errors
3. All 6 new context file templates exist and are referenced in the required-reading standard
4. The intake prompt (01) interviews for conventions, skills, integrations, and team composition
5. Every generated prompt includes a complexity score field
6. `.github/copilot-instructions.md` and `AGENTS.md` exist and are current
7. The environment/secrets standard is in the DevSecOps required reading chain

## Status
Active — intake complete, prompt generation pending
