# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | Weak markdown discipline produces bad dashboard state | High | High | Enforce templates with validation; parser emits warnings for non-conformant files | QA / Standards Guardian | Open |
| R2 | Inconsistent prompt file shapes reduce trust in dashboard | Medium | High | Strict frontmatter validation at parse time; CI linter for prompt files | QA / DevOps | Open |
| R3 | Inserted prompt ordering becomes chaotic | Medium | Medium | Enforce prompt numbering standard; natural tuple sorting in parser | Architect / QA | Open |
| R4 | Manual prerequisite edits drift from actual repo state | Medium | Medium | Dependency graph engine validates prerequisites against actual prompt status | Architect | Open |
| R5 | Parser performance degrades at scale (250+ prompts) | Low | Medium | Benchmark early; use incremental parsing or caching if needed | Engineer | Open |
| R6 | Multi-repo selector introduces path traversal risk | Low | High | Validate and sandbox all file paths; restrict to known repo roots | DevSecOps | Open |
| R7 | Chart rendering library adds significant bundle size | Low | Low | Evaluate lightweight options (Chart.js) before heavier ones (D3) | Architect | Open |
| R8 | Handoff folder convention unclear (agents/handoffs/ not yet created) | Medium | Medium | Decide convention in architecture review; create folder in scaffolding | Architect / PM | Open |
