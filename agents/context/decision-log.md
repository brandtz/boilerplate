# Decision Log

> This file is populated during project execution. Each session records decisions here per the handoff standard.

| Date | Decision | Rationale | Decider | Affected Artifacts |
|---|---|---|---|---|
| 2026-04-06 | Accept all 9 recommendations (Recs 1–8, 10); defer Rec 9 | Sponsor wants full hardening before Bulwark kickoff. Rec 9 (validation sandbox) is project-specific, not boilerplate-level. | Sponsor (Matthew) | project-charter.md, prompts/index.md |
| 2026-04-06 | Keep skills/capabilities separate from conventions (Rec 4) | Conventions are stable per-project; skills shift per environment and toolset. Merging them would create churn in what should be a stable file. | Sponsor (Matthew) | skills.md stays as standalone context file |
| 2026-04-06 | Simplify Rec 6 to complexity score only (S/M/L/XL) | Token budget estimation and auto-splitting add complexity without proven value. Complexity scoring alone provides visibility. | Sponsor (Matthew) | prompt-template.md, prompt-builder-standard.md |
| 2026-04-06 | Build Rec 10 (self-test) first | Self-test validates boilerplate integrity; running it first establishes the baseline and validates every subsequent recommendation. | Sponsor (Matthew) + Orchestrator | Execution order: Rec 10 → 1 → 2 → 4 → 3 → 5 → 7 → 8 → 6 |
| 2026-04-06 | Rec 2 simplified — no separate agent-configuration-standard.md | AGENTS.md and `.github/copilot-instructions.md` are sufficient. A separate standard document adds overhead without value for two config files. | Orchestrator (confirmed by Sponsor) | Rec 2 scope reduced; no new standard file |
