# Decision Log

> This file is populated during project execution. Each session records decisions here per the handoff standard.

| Date | Decision | Rationale | Decider | Affected Artifacts |
|---|---|---|---|---|
| 2026-04-06 | Accept all 9 recommendations (Recs 1–8, 10); defer Rec 9 | Sponsor wants full hardening before Bulwark kickoff. Rec 9 (validation sandbox) is project-specific, not boilerplate-level. | Sponsor (Matthew) | project-charter.md, prompts/index.md |
| 2026-04-06 | Keep skills/capabilities separate from conventions (Rec 4) | Conventions are stable per-project; skills shift per environment and toolset. Merging them would create churn in what should be a stable file. | Sponsor (Matthew) | skills.md stays as standalone context file |
| 2026-04-06 | Simplify Rec 6 to complexity score only (S/M/L/XL) | Token budget estimation and auto-splitting add complexity without proven value. Complexity scoring alone provides visibility. | Sponsor (Matthew) | prompt-template.md, prompt-builder-standard.md |
| 2026-04-06 | Build Rec 10 (self-test) first | Self-test validates boilerplate integrity; running it first establishes the baseline and validates every subsequent recommendation. | Sponsor (Matthew) + Orchestrator | Execution order: Rec 10 → 1 → 2 → 4 → 3 → 5 → 7 → 8 → 6 |
| 2026-04-06 | Rec 2 simplified — no separate agent-configuration-standard.md | AGENTS.md and `.github/copilot-instructions.md` are sufficient. A separate standard document adds overhead without value for two config files. | Orchestrator (confirmed by Sponsor) | Rec 2 scope reduced; no new standard file |
| 2026-04-06 | Excluded architecture-overview.md from self-test required context files | File is project-specific (populated during architecture review), not boilerplate-level. Moved to dashboard/ARCHITECTURE.md during boilerplate prep. | Engineer (3.0.1) | validate-boilerplate.sh checks 7 context files instead of 8 |
| 2026-04-06 | Used POSIX sh for self-test script instead of bash | Maximum cross-platform compatibility per assumption A8 | Engineer (3.0.1) | scripts/validate-boilerplate.sh |
| 2026-04-06 | Review gate 12.0.1: APPROVED WITH CONDITIONS | 8 findings (2 major, 3 minor, 3 advisory) — all addressable without architectural changes. Rework prompt 12.0.2 created. | Standards Guardian (12.0.1) | 12.0.2-upgrade-review-gate-remediation.md |
| 2026-04-06 | R1 risk mitigation updated to reflect actuals | Removed aspirational "required reading budget check" from R1 mitigation; replaced with description of actual controls (template size limits, self-test structural validation) | Engineer (12.0.2) | agents/context/risk-register.md |
| 2026-04-06 | Prompt 02 stale architecture-overview.md reference noted but not fixed | Out of scope for 13.0.1 which only covers prompts 00 and 01. Deferred to future maintenance. | Engineer (13.0.1) | prompts/active/02_MASTER_AGENT_PROMPT_BUILDER_PROMPT.md |
| 2026-04-06 | Replaced stale architecture-overview.md ref with conditional note | Architecture docs are project-specific; made the reference conditional ("if it exists") and added conventions.md to required reading instead | Engineer (14.0.1-cleanup) | prompts/active/02_MASTER_AGENT_PROMPT_BUILDER_PROMPT.md |
| 2026-04-06 | Removed orphaned schemas/ directory | Only contained .keep; was a Dashboard v1 artifact with no boilerplate-level purpose | Engineer (14.0.1-cleanup) | README.md, schemas/ deleted |
| 2026-04-06 | Created intake package mechanism | Pre-intake form reduces sponsor Q&A round-trips; prompt 01 auto-detects and consumes docs/intake-package.md | Engineer (14.0.1-cleanup) | agents/templates/intake-package-template.md, prompts/active/01 |
