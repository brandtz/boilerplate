# Decision Log

| Date | Decision | Rationale | Decider | Affected Artifacts |
|---|---|---|---|---|
| 2026-04-03 | Repo reorganized into canonical root structure (agents/, docs/, prompts/, schemas/) | Eliminate nested staging folders; align file layout with all internal path references | Master Agent | All files — moved from nested seed/spec-pack folders to root |
| 2026-04-03 | Dashboard project selected as first swarm-built product | Provides immediate value to human sponsor; exercises the full agentic SDLC pipeline | Human Sponsor | project-charter, product-brief, epics, PRD |
| 2026-04-03 | Adopt three-part prompt numbering (major.branch.revision) | Supports inserted work, defects, and review loops without renumbering | Master Agent | prompt-numbering-standard, all future prompts |
| 2026-04-03 | Require YAML frontmatter on all prompt and handoff files | Enables deterministic parsing for dashboard state derivation | Master Agent | prompt-session-template, session-handoff-template, data-contract |
| 2026-04-03 | Adopt prompt lifecycle with active/archive folder structure | Provides clear prompt state management; prevents deletion; supports dashboard metrics for completed prompts | Master Agent | prompt-lifecycle-standard, prompts/README, PRD FR-1/FR-6/FR-8, data-contract |
| 2026-04-03 | prompts/index.md is canonical inventory (supersedes docs/prompt-inventory.md) | Single source of truth readable by dashboard parser and humans; decouples scope from folder contents | Master Agent | prompts/index.md, docs/prompt-inventory.md (removed), PRD, data-contract |
| 2026-04-03 | Rename frontmatter field `role` to `owner_role` across all prompts | Eliminates ambiguity with other uses of "role"; aligns with epic/story contract field naming | Master Agent | All 30 prompt files, prompt-session-template, data-contract |
