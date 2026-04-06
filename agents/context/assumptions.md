# Assumptions

> This file is populated during project intake. Assumptions are validated during architecture and security reviews.

| ID | Assumption | Validated | Notes |
|---|---|---|---|
| A1 | The boilerplate folder structure (`agents/`, `prompts/`, `dashboard/`, `docs/`, `schemas/`) is stable and will not be reorganised during this upgrade. | Pending | Self-test (Rec 10) will codify the expected structure. |
| A2 | The dashboard parser (`gray-matter` + `js-yaml`) already handles new context files without code changes — they are markdown, not parsed. | Pending | Verify during Rec 10 smoke test. |
| A3 | All changes in this project are additive — no existing standard, template, or workflow will be deleted, only extended. | — | Sponsor confirmed: "get them all." |
| A4 | GitHub Copilot reads `.github/copilot-instructions.md` automatically when present in a repo. | Pending | Verify during Rec 2 implementation. |
| A5 | Complexity scoring (S/M/L/XL) is sufficient without token budget estimation or auto-splitting. | Confirmed | Sponsor decision 2026-04-06. |
| A6 | A single `memory.md` file (structured sections) scales sufficiently for projects of Bulwark's expected size (~40–60 prompts). | Pending | Re-evaluate if memory exceeds ~500 lines. |
| A7 | The 571 existing dashboard tests will continue to pass throughout; no dashboard source changes are in scope. | Pending | Validate after each merge. |
| A8 | The self-test script (`validate-boilerplate.sh`) can run cross-platform (Git Bash on Windows, native on macOS/Linux). | Pending | Verify during Rec 10 implementation. |
