# Workflow: Build, Validate, Release

## Goal
Execute approved work packets and release safely.

## Sequence
1. technical task generation
2. implementation
3. code review
4. QA validation
5. security review
6. operational review
7. release readiness
8. release handoff

## Required outputs
- code and tests
- updated docs
- implementation handoffs
- review notes
- release checklist
- support and runbook materials

## Default sign-off model
### Low-risk internal changes
- implementing engineer
- QA reviewer
- orchestrator

### Standard product changes
- implementing engineer
- QA reviewer
- architect or tech lead reviewer
- DevSecOps reviewer if relevant
- orchestrator

### High-risk / production-critical changes
- implementing engineer
- QA reviewer
- architect reviewer
- DevSecOps reviewer
- DevOps / SRE reviewer
- supportability reviewer
- orchestrator
- human sponsor or designated approver

## Stop conditions
- tests absent for critical workflows
- unresolved blocker-level defects
- rollback path missing for risky release
- material security concerns unresolved
