# Risk Register

> This file is populated during project execution. Risks are added by any role that identifies them.

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | Template and required-reading proliferation makes agent context windows unmanageable. Six new context files added to universal reading list could crowd out implementation-specific content. | Medium | High | Keep templates concise (< 50 lines each). Add a "required reading budget" check to the self-test. Measure total required-reading token count after all recs are done. | Standards Guardian | Open |
| R2 | `memory.md` becomes stale or unmaintained because no automated mechanism enforces updates. Relies on Repo Knowledge Curator discipline. | Medium | Medium | Self-test checks that `memory.md` has been updated within the last N handoffs. Handoff template gains a mandatory "Memory Candidates" section. | Repo Knowledge Curator | Open |
| R3 | Self-test gives false confidence — passes structurally but doesn't catch semantic errors (e.g., a standard references a role section that exists but is empty). | Low | Medium | Include content-level checks (minimum line counts, required heading validation) in addition to file-existence checks. Smoke test project validates semantic correctness. | QA / Standards Guardian | Open |
| R4 | Cross-platform shell script compatibility. `validate-boilerplate.sh` may use bash features unavailable in Git Bash on Windows. | Medium | Low | Test on both Git Bash (Windows) and native bash (macOS). Keep to POSIX-compatible constructs. Consider a Node.js alternative if shell proves unreliable. | Engineering | Open |
| R5 | Scope creep during implementation — each recommendation touches multiple files and may trigger cascading updates to existing standards. | Medium | Medium | Each prompt is scoped to a single recommendation. The self-test validates structural integrity after each prompt, catching unintended side-effects. | Orchestrator | Open |
