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
| 2026-04-03 | Drawer pattern for prompt detail view | Keeps table visible for context; avoids full-page navigation for quick glances | UX Designer | dashboard-ux-wireframes.md, E2 stories |
| 2026-04-03 | Accordion pattern for Epics/Tasks views | Three-level hierarchy fits progressive disclosure; avoids multiple page navigations | UX Designer | dashboard-ux-wireframes.md, E3/E4 stories |
| 2026-04-03 | Desktop-first responsive strategy with 3 breakpoints | Primary use case is developer workstation per ADR-003; mobile is functional not optimized | UX Designer | dashboard-ux-wireframes.md |
| 2026-04-03 | Pagination over infinite scroll for Prompts table | Better keyboard accessibility and deep-linking support for 250+ items | UX Designer | dashboard-ux-wireframes.md, E2-S1 |
| 2026-04-03 | Canonical status badge color map with WCAG AA compliance | Single source of truth for all 8 statuses ensures visual consistency across views | UX Designer | dashboard-ux-wireframes.md Appendix A |
| 2026-04-03 | ADR-001 (Stack Selection) Approved | Stack choices well-justified; Next.js satisfies C1/C2, TypeScript enforces contracts, Chart.js proportionate, gray-matter de-facto standard | Solution Architect | ADR-001-stack-selection.md |
| 2026-04-03 | ADR-002 (Parser Architecture) Approved with 6 Conditions | Pipeline sound but needs: index.md two-phase parsing, ParseWarning interface, lifecycle fields in ParsedPrompt, missing interfaces, derived metrics docs, epic parsing schema | Solution Architect | ADR-002-parser-architecture.md |
| 2026-04-03 | ADR-003 (UI Architecture) Approved | View structure maps correctly to all 5 PRD views; state management appropriate for v1 scope | Solution Architect | ADR-003-ui-architecture.md |
| 2026-04-03 | ParseWarning interface shape: { file, line?, code, message, severity } | Provides structured diagnostics for Blockers & Warnings panel | Solution Architect | ADR-002, architecture-overview.md |
| 2026-04-03 | Bundle size budget <500KB gzipped | Proportionate for local-first dashboard; Chart.js should be lazy-loaded | Solution Architect | architecture-overview.md |
| 2026-04-03 | Security review: PROCEED — no architectural changes required | Local-only, read-only design provides strong baseline; 2 high + 4 medium + 3 low findings all addressable in implementation | DevSecOps Engineer | docs/security-review-findings.md |
| 2026-04-03 | Never enable rehype-raw in react-markdown | Prevents XSS via raw HTML passthrough; mandatory constraint for all implementation prompts | DevSecOps Engineer | docs/security-review-findings.md (HIGH-002) |
| 2026-04-03 | Allowlist approach for multi-repo selector path validation | More secure than arbitrary path validation; canonicalize with path.resolve() + prefix check | DevSecOps Engineer | docs/security-review-findings.md (HIGH-001) |
| 2026-04-03 | Disable symlink following in file scanner and chokidar | Prevents sandbox escape via filesystem symlinks; set followSymlinks: false | DevSecOps Engineer | docs/security-review-findings.md (MED-002) |
| 2026-04-03 | Add CSP meta tag to static export | Defense-in-depth against XSS; restrict inline scripts and eval() | DevSecOps Engineer | docs/security-review-findings.md (HIGH-002) |
| 2026-04-03 | Added risks R15–R18 to risk register | XSS (R15), supply chain (R16), prototype pollution (R17), symlink traversal (R18) | DevSecOps Engineer | agents/context/risk-register.md |
