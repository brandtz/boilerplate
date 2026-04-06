# Constraints

> This file is populated during project intake. Constraints are validated during architecture and operational reviews.

| ID | Constraint | Source | Impact |
|---|---|---|---|
| C1 | No dashboard source code changes. The dashboard is a shipped built-in tool; it must continue to build and pass all 571 tests unchanged. | Sponsor | Limits scope to `agents/`, `prompts/`, `docs/`, `scripts/`, `tests/`, and root config files only. |
| C2 | All new artifacts must be template-based. Every new context file (`conventions.md`, `memory.md`, etc.) must have a corresponding template in `agents/templates/`. | Operating model | Ensures new projects get clean starting points. |
| C3 | No new npm dependencies. This upgrade produces only markdown, shell scripts, and YAML — no runtime packages. | Sponsor | Keeps boilerplate lightweight and language-agnostic. |
| C4 | Existing process standards may be extended but not have existing clauses removed or rewritten. | Operating model | Backward compatibility with archived Dashboard v1 process artifacts. |
| C5 | Skills and capabilities must remain a separate file from conventions. Conventions are stable; skills shift per project and environment. | Sponsor decision 2026-04-06 | Rec 4 implemented as standalone `skills.md`, not merged into `conventions.md`. |
| C6 | Rec 9 (Validation Sandbox Standard) is deferred to each project's architecture review phase, not implemented as a boilerplate artifact. | Sponsor decision 2026-04-06 | Reduces scope to 9 recommendations. |
| C7 | Self-test script must pass before any other recommendation is considered complete. Rec 10 executes first. | Sponsor decision 2026-04-06 | Establishes the validation baseline for the entire upgrade. |
