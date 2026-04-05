# Root Cause Analysis: Data Pipeline Gap

> **Date:** 2026-04-04
> **Author:** Senior Software Engineer (automated fix) + Master Agent (RCA)
> **Severity:** Critical — dashboard rendered no data in production
> **Fix commit:** (pending)

---

## 1. Summary

The dashboard was fully implemented (24 prompts, 495 tests, 91%+ coverage) but displayed **no data** when run via `npm run dev` or `npm run build && npx serve out`. The parser output was never wired to the browser. The fix required:

1. `DashboardContext.tsx` — fetch `/dashboard-state.json` when no `parseFn` is provided
2. `package.json` — add `predev`/`prebuild` scripts that run the CLI parser
3. `.gitignore` — exclude generated JSON

---

## 2. What Went Wrong

### The Paradox

Three constraints were specified independently but never reconciled:

| Constraint | Source | Implication |
|---|---|---|
| C1: All state from repo artifacts | constraints.md | Parser must read filesystem |
| C2: No server deployment | constraints.md | No runtime Node.js available |
| `output: "export"` | next.config.ts | Static HTML/JS only — no SSR, no API routes |

**Result:** The parser uses Node.js `fs` module and cannot run in a browser. Static export means no server is available. But no specification defined the bridge (pre-built JSON, build-time generation, etc.).

### The Deferred Decision

The decision log entry (2026-04-04) explicitly acknowledged the gap:

> *"DashboardProvider accepts injectable parseFn for testability — Static export cannot run Node.js parser in browser; parseFn prop allows test mocking and **future API/pre-built JSON strategies**"*

The phrase "future strategies" deferred the solution without creating a follow-up task, blocker, or risk item. No prompt was assigned to resolve it.

### The Test Illusion

All 495 tests passed because `renderWithProviders()` injects a mock `parseFn` that supplies test data. This is correct for component-level testing but masks the fact that **production has no equivalent data source**. No test existed that validated:

- DashboardProvider initializing without a `parseFn` prop
- The production data loading path (static JSON fetch)
- The build pipeline generating the JSON artifact

---

## 3. Timeline & Failure Points

| Prompt | Role | What happened | What should have happened |
|---|---|---|---|
| **7.0.1** | QA Test Architect | Test strategy defined unit, integration, component, E2E levels. No scenario covers "static export data loading." | Should have included: "Production smoke test: static export serves data without Node.js runtime." |
| **8.0.1** | Solution Architect | ADR-003 specified "Parser output → React context → views" without defining the parser-to-context bridge for static export. | Should have specified: "In static export mode, parser JSON is generated at build time and fetched client-side." |
| **9.0.1** | Solution Architect | Technical tasks (E5-S1-T1) wrote "On mount: dispatch PARSE_START → run parser." Assumed parser runs client-side. | Should have specified: "On mount: fetch pre-built JSON from `/dashboard-state.json`." |
| **11.0.1** | Senior Engineer | Project scaffolding created DashboardProvider with `parseFn` prop. Left `else` branch as error stub. | Should have implemented the static JSON fetch fallback or raised a blocker. |
| **15.0.1** | Orchestrator | Parser review gate approved parser + stubs. Did not validate cross-boundary data flow. | Should have required: "Demonstrate that parsed output reaches DashboardProvider in a non-test context." |
| **16.0.1** | Senior Engineer | App shell wired DashboardProvider in layout.tsx with no props. Added `renderWithProviders()` test helper. | Should have validated: "What happens when DashboardProvider has no parseFn in production?" |
| **22.0.1** | Senior Engineer | Handoff claimed "Refresh flow works end-to-end" with 100% completion. | Should have tested actual data load in browser, not just mocked test context. |
| **23.0.1** | Orchestrator | UI review gate approved without testing production data path. | Should have required: "Run `npm run build && npx serve out` and verify data displays." |

---

## 4. Root Causes (5 Whys)

### Why did the dashboard show no data?
Because `DashboardProvider` had no `parseFn` in production and no fallback for loading data.

### Why was there no fallback?
Because the implementing prompt (16.0.1) left the `else` branch as an error stub, and the decision log deferred the solution to "future strategies."

### Why wasn't the deferred solution caught?
Because no review gate or handoff standard required validating the **production data path** — only component-level acceptance criteria were checked.

### Why didn't tests catch it?
Because `renderWithProviders()` always injects mock data, and no test validated the production initialization path (no `parseFn`, no pre-built JSON).

### Why didn't specifications prevent it?
Because the constraints (C1 + C2 + static export) created a paradox that was mentioned in the decision log but **never decomposed into actionable tasks**. The spec assumed client-side parsing, the architecture acknowledged it was impossible, but no one specified the actual mechanism.

---

## 5. Contributing Factors

### 5.1 Specification-Level

- **PRD gap:** Defined WHAT the dashboard displays but not HOW data reaches the browser.
- **Missing assumption:** No assumption documented: "Parser output must be pre-generated as a static JSON file for production."
- **Constraint paradox:** C1 + C2 + static export were specified independently without a reconciliation step.

### 5.2 Architecture-Level

- **ADR-003 gap:** Specified "Parser output → React context → views" without defining the parser-to-context bridge for static export. File watcher and refresh were specified for dev mode only.
- **Epic E5-S2 gap:** Explicitly noted "File watcher is not available in static export mode" but never specified what IS available instead.
- **Injectable parseFn pattern:** Introduced as a testing seam without specifying the production implementation.

### 5.3 Implementation-Level

- **Error stub accepted:** The `else` branch in DashboardProvider dispatched PARSE_ERROR with "No parse function provided" — a developer-facing message that was never visible or tested in production.
- **Handoff overclaimed:** 22.0.1 claimed "Refresh flow works end-to-end" based on test-context behavior, not actual browser behavior.

### 5.4 Review-Level

- **Layer-scoped reviews:** Review gates validated within their own layer (parser accuracy, component rendering) but did not validate cross-layer integration.
- **No production smoke test:** Neither review gate ran `npm run build && npx serve out` to verify end-to-end behavior.
- **Stub acceptance:** Parser review (15.0.1) accepted stub files without flagging that they masked unresolved architecture.

### 5.5 Testing-Level

- **Test helper masked the gap:** `renderWithProviders()` made all tests pass by injecting mock data at the context layer — the exact layer where the bug existed.
- **No "production path" test:** Test strategy defined 4 levels but no level validated: "DashboardProvider initializes and loads data without parseFn in a static export."
- **Integration tests scoped to parser only:** Parser-to-UI integration was never tested outside the mock context.

---

## 6. Corrective Actions

### 6.1 Immediate Fix (Done)

| Action | File | Change |
|---|---|---|
| Add static JSON fetch fallback | `DashboardContext.tsx` | When no `parseFn` is provided, fetch `/dashboard-state.json` |
| Add build-time data generation | `package.json` | `predev` and `prebuild` scripts run parser CLI |
| Exclude generated artifact | `.gitignore` | Ignore `/public/dashboard-state.json` |

### 6.2 Process Hardening (This Session)

| Action | Target File | Change |
|---|---|---|
| Add "production data path validation" to handoff standard | `handoff-standard.md` | New section: cross-boundary validation requirements |
| Add "production smoke test" to testing standard | `coding-documentation-testing-standard.md` | New testing expectation for production path |
| Add data pipeline test scenario to test strategy | `test-strategy.md` | New integration test: "static export data loading" |
| Update role files with cross-boundary review duties | Multiple role files | Add responsibility for validating cross-layer data flow |
| Document the resolved assumption | `assumptions.md` | Add A16: pre-built JSON mechanism |
| Log the decision | `decision-log.md` | Record the fix and its rationale |

---

## 7. Lessons Learned

### L1: Deferred decisions need tracking artifacts
When a decision explicitly defers a solution, it MUST create a follow-up task, risk item, or blocker — not just a prose mention of "future strategies."

### L2: Test helpers can mask production gaps
A test utility that always satisfies a dependency (like `parseFn`) can make 100% of tests pass while 0% of production works. At least one test per critical path must validate the production initialization, not the test-helper path.

### L3: Review gates must validate cross-boundary contracts
Layer-scoped reviews (parser-only, UI-only) are insufficient. Review gates must include a "production smoke test" that validates the data flow from source to display without test mocks.

### L4: Constraint paradoxes need explicit resolution
When constraints create a logical impossibility (must read filesystem + no server + static export), the specs must include an explicit resolution mechanism. The resolution cannot live only in a decision log entry — it must be decomposed into tasks.

### L5: Handoff claims must be evidence-based
"Works end-to-end" must be validated by actual end-to-end execution, not by test results that use mocked intermediaries.

---

## 8. Metrics

| Metric | Value |
|---|---|
| Prompts completed before discovery | 24 of 30 |
| Tests passing (all mocked) | 495 |
| Tests that validated production path | 0 |
| Review gates that checked production path | 0 of 2 |
| Time from first deferred mention to fix | Same sprint (caught during dev validation) |
| Lines of production code changed | ~15 |
| Files changed | 3 |
