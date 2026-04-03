# Prompt: Example Sequential Implementation Packet

## Sequence Position
- Prompt: 01 of 05
- Phase: Technical Task Generation

## Objective
Create implementation-ready technical tasks from an approved story set.

## Dependencies
- approved epics and stories
- architecture review complete
- QA testability review complete

## Prerequisites
- project charter populated
- product brief current
- architecture overview updated
- decision log current

## Context for the Agent
You are turning approved backlog items into execution-ready technical tasks. This is not an implementation session. Your job is to make sure downstream engineers receive sharply bounded work with clear validation expectations and no hidden ambiguity.

## Required Reading
- agents/README.md
- agents/workflows/03-build-validate-release.md
- agents/standards/prompt-builder-standard.md
- agents/standards/handoff-standard.md
- agents/context/project-charter.md
- agents/context/product-brief.md
- agents/context/architecture-overview.md
- agents/context/decision-log.md
- agents/context/risk-register.md

## Scope
- identify technical task slices
- map each task to its owning story
- identify likely file surfaces
- define validation expectations
- note blockers and unknowns

## Constraints
- do not implement code
- do not re-scope approved stories unless blocker-level ambiguity exists
- keep tasks small enough for focused implementation prompts

## Validation Expectations
- each task maps to a story
- each task has clear output expectations
- each task includes validation notes
- each task includes handoff expectations

## Handoff Instructions
Create a handoff note that includes:
- task files created
- unresolved ambiguities
- recommended implementation order
- required reading for engineers and reviewers

## Downstream Consumers
- Senior Software Engineer
- QA / Test Architect
- DevSecOps Engineer

## Stop Conditions
- story acceptance criteria are too vague to make technical tasks
- architecture decisions are missing for core flows
- high-risk dependencies are undefined
