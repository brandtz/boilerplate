# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | Weak markdown discipline produces bad dashboard state | High | High | Enforce templates with validation; parser emits warnings for non-conformant files | QA / Standards Guardian | Open |
| R2 | Inconsistent prompt file shapes reduce trust in dashboard | Medium | High | Strict frontmatter validation at parse time; CI linter for prompt files | QA / DevOps | Open |
| R3 | Inserted prompt ordering becomes chaotic | Medium | Medium | Enforce prompt numbering standard; natural tuple sorting in parser | Architect / QA | Open |
| R4 | Manual prerequisite edits drift from actual repo state | Medium | Medium | Dependency graph engine validates prerequisites against actual prompt status | Architect | Open |
| R5 | Parser performance degrades at scale (250+ prompts) | Low | Medium | Benchmark early; use incremental parsing or caching if needed | Engineer | Open |
| R6 | Multi-repo selector introduces path traversal risk | Low | High | Validate and sandbox all file paths; restrict to known repo roots; canonicalize with `path.resolve()` + prefix check; reject `..`, null bytes; use allowlist approach (see HIGH-001 in security-review-findings.md) | DevSecOps | Open |
| R7 | Chart rendering library adds significant bundle size | Low | Low | Evaluate lightweight options (Chart.js) before heavier ones (D3) | Architect | Open |
| R8 | Handoff folder convention unclear (agents/handoffs/ not yet created) | Medium | Medium | Decide convention in architecture review; create folder in scaffolding. **Resolved:** `agents/handoffs/` is the canonical path (confirmed by existing files and ADR-002 scanning conventions) | Architect / PM | Mitigated |
| R9 | Missing `docs/business-rules.md` blocks epic acceptance criteria validation | High | High | Author business-rules.md or replace epic references with inline specifications before implementation begins | BSA / Architect | Open |
| R10 | `ParsedPrompt` interface missing lifecycle fields from data contract | Medium | High | Amend ADR-002 to add `sessionHandoff`, `supersedes`, `supersededBy`, `insertReason`, `completedAt`, `archivedAt` before parser implementation | Architect / Engineer | Open |
| R11 | Epic/story/task combined markdown format (A11) has no parsing schema | Medium | High | Define formal parsing rules for extracting hierarchical structure from `agents/epics/*.md` files; resolve before E1 implementation | Architect / BSA | Open |
| R12 | `ProjectSummary`, `SummaryMetrics`, `NextPromptInfo` interfaces undefined | Medium | Medium | Specify during technical task generation (prompt 9.0.1) | Architect / Engineer | Open |
| R13 | No React error boundaries specified in UI architecture | Low | Medium | Wrap each view in error boundary; add to ADR-003 implementation guidance | Engineer / UX | Open |
| R14 | Bundle size may exceed target without monitoring | Low | Medium | Set 500KB gzipped budget; implement bundle analysis in CI; lazy-load Chart.js | DevOps / Engineer | Open |
| R15 | XSS via markdown rendering if rehype-raw enabled or link protocols not sanitized | Low | High | Never enable rehype-raw; sanitize link protocols; enforce CSP; test with malicious fixtures | DevSecOps / Engineer | Open |
| R16 | Dependency supply chain compromise via npm ecosystem | Low | High | Lock dependencies; run npm audit in CI; pin security-sensitive packages; review transitive deps | DevSecOps / DevOps | Open |
| R17 | Prototype pollution via YAML frontmatter with __proto__ or constructor keys | Low | Medium | Validate field names; use null-prototype objects for lookups; freeze parsed objects | Engineer | Open |
| R18 | Symlink traversal bypasses repo root sandboxing | Low | High | Disable symlink following in scanner and chokidar; post-resolution path validation | Engineer / DevSecOps | Open |
