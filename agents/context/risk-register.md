# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | Weak markdown discipline produces bad dashboard state | High | High | Enforce templates with validation; parser emits warnings for non-conformant files; validator rejects missing required fields, warns on optional | QA / Standards Guardian | Mitigated |
| R2 | Inconsistent prompt file shapes reduce trust in dashboard | Medium | High | Strict frontmatter validation at parse time; 14 warning codes in structured ParseWarning taxonomy; 21 malformed-metadata validation tests | QA / DevOps | Mitigated |
| R3 | Inserted prompt ordering becomes chaotic | Medium | Medium | Enforce prompt numbering standard; natural tuple sorting in sorting.ts; verified with insertion edge-case tests | Architect / QA | Mitigated |
| R4 | Manual prerequisite edits drift from actual repo state | Medium | Medium | Dependency graph engine validates prerequisites against actual prompt status; W_PREREQ_NOT_FOUND warning emitted; eligibility engine tested | Architect | Mitigated |
| R5 | Parser performance degrades at scale (250+ prompts) | Low | Medium | Benchmarked: 81ms for 310 prompts (6220 prompts/sec); 13 performance tests; threshold <2s | Engineer | Mitigated |
| R6 | Multi-repo selector introduces path traversal risk | Low | High | Validate and sandbox all file paths; restrict to known repo roots; canonicalize with `path.resolve()` + prefix check; reject `..`, null bytes; use allowlist approach (see HIGH-001 in security-review-findings.md) | DevSecOps | Mitigated |
| R7 | Chart rendering library adds significant bundle size | Low | Low | Chart.js selected (~60KB gzipped); lazy-loaded via dynamic import; build size within 500KB budget | Architect | Mitigated |
| R8 | Handoff folder convention unclear (agents/handoffs/ not yet created) | Medium | Medium | Decide convention in architecture review; create folder in scaffolding. **Resolved:** `agents/handoffs/` is the canonical path (confirmed by existing files and ADR-002 scanning conventions) | Architect / PM | Mitigated |
| R9 | Missing `docs/business-rules.md` blocks epic acceptance criteria validation | High | High | File authored in prompt 2.0.1; all epic acceptance criteria reference business rules correctly | BSA / Architect | Mitigated |
| R10 | `ParsedPrompt` interface missing lifecycle fields from data contract | Medium | High | All 6 lifecycle fields added in prompt 9.0.1; implemented in parser; verified in tests | Architect / Engineer | Mitigated |
| R11 | Epic/story/task combined markdown format (A11) has no parsing schema | Medium | High | Regex parsing schema defined in 9.0.1; epic-parser.ts implements H2/H3/list extraction; 98.5% coverage | Architect / BSA | Mitigated |
| R12 | `ProjectSummary`, `SummaryMetrics`, `NextPromptInfo` interfaces undefined | Medium | Medium | All interfaces defined in prompt 9.0.1; implemented in types.ts and graph-builder.ts | Architect / Engineer | Mitigated |
| R13 | No React error boundaries specified in UI architecture | Low | Medium | ErrorBoundary component wraps each view page; retry button re-mounts children; tested | Engineer / UX | Mitigated |
| R14 | Bundle size may exceed target without monitoring | Low | Medium | Build succeeds within budget; Chart.js lazy-loaded via dynamic import; static export optimized | DevOps / Engineer | Mitigated |
| R15 | XSS via markdown rendering if rehype-raw enabled or link protocols not sanitized | Low | High | Never enable rehype-raw; sanitize link protocols; enforce CSP; test with malicious fixtures; protocol-relative URLs blocked | DevSecOps / Engineer | Mitigated |
| R16 | Dependency supply chain compromise via npm ecosystem | Low | High | Lock dependencies (package-lock.json committed); npm audit 0 vulnerabilities at release; recommend npm audit in CI; pin security-sensitive packages | DevSecOps / DevOps | Accepted |
| R17 | Prototype pollution via YAML frontmatter with __proto__ or constructor keys | Low | Medium | Validate field names; use null-prototype objects for lookups; freeze parsed objects | Engineer | Mitigated |
| R18 | Symlink traversal bypasses repo root sandboxing | Low | High | Disable symlink following in scanner and chokidar; post-resolution path validation | Engineer / DevSecOps | Mitigated |
