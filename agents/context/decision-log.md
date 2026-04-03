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
| 2026-04-03 | Combined epics markdown format is primary for v1 parser | Matches actual repo structure; parser extracts epics/stories/tasks from headings and lists in a single file | BSA | business-rules Section 4.2, epics file, data-contract GAP-DC-01 |
| 2026-04-03 | Time-series charts derive from handoff timestamps | C1/C8 prohibit external DB and repo writes; handoff ended_at provides sufficient historical data | BSA | business-rules Section 6, PRD FR-13, GAP-FR-08 |
| 2026-04-03 | Superseded/cancelled prompts excluded from completion denominator | Clearer math: 100% means all active work done; aligns with dual-metric model | BSA | business-rules Section 2.5, GAP-DC-04 |
| 2026-04-03 | Search is metadata-only keyword matching in v1 | Limits implementation scope; full-text search deferred to v2 | BSA | business-rules Section 7, GAP-FR-09 |
| 2026-04-03 | Multi-repo selector uses local filesystem paths only in v1 | Aligns with C2 local-only constraint; git URL support deferred | BSA | business-rules Section 8, OQ-03 |
