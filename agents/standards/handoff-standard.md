# Standard: Handoff

## Purpose
Preserve continuity between agent sessions and phases.

## Every handoff must include
- work packet or phase name
- author role
- date
- objective completed
- artifacts created or changed
- key decisions made
- unresolved issues
- risks introduced or discovered
- validation performed
- recommended next role
- required reading for the next role

## Handoff rules
- keep it concise
- link exact file paths
- separate facts from recommendations
- do not hide blockers
- identify any stop conditions encountered

## Review gate finding propagation
- All review gate findings (low, medium, or info) are pre-approved for implementation
- The review gate agent MUST update the immediate downstream prompt to include findings as actionable tasks, or create an inserted prompt (N.0.2+) if the scope warrants separation
- Findings must never be left as untracked recommendations in a handoff — they must appear as explicit scope items in the next prompt
- The downstream agent should work review findings before or alongside the prompt's original scope

## Scope deferral governance
- When a review gate accepts a scope deferral, the deferral decision MUST be reviewed by a role **other than** the role that made the original scope cut. The Orchestrator cannot both exclude scope and approve the exclusion.
- Every accepted deferral MUST include: (1) the specific tasks deferred, (2) the business justification, (3) the impact on user-facing functionality, (4) the re-evaluation trigger (e.g., next release gate or sprint planning)
- Deferred items MUST be tracked as open items in the risk register (not just the decision log) until either implemented or formally cancelled by the sponsor
- At each subsequent review gate, deferred items MUST be actively re-evaluated — not rubber-stamped from a prior gate's decision

## Cross-boundary validation
- When work spans multiple architectural layers (e.g., parser → context → UI), the handoff MUST validate that data flows correctly across layer boundaries — not just within a single layer
- Claims of "end-to-end" behavior must be supported by actual execution evidence, not test-helper-mediated results
- If a dependency is deferred (e.g., "future API/pre-built JSON strategies"), the handoff MUST explicitly create a follow-up task, risk item, or blocker — prose mentions are not sufficient
- If `output: "export"` or similar static build constraints exist, the handoff must confirm that data reaches the browser without a runtime server

## Production smoke test
- Every handoff that produces user-facing output MUST include evidence of at least one production-path validation (e.g., `npm run build && npx serve out` for static export apps)
- Test-only validation (where all dependencies are mocked) is insufficient for claiming "works end-to-end"
- The validation section of the handoff must distinguish between "tests pass" and "production behavior verified"

## Close-out checklist (mandatory before commit)
Every session MUST complete this checklist before the final commit. Each item that
surfaces rework or open issues MUST produce a concrete follow-up action (new prompt
or edit to the next downstream prompt). Untracked findings are a defect.

1. **Scope audit** — Compare work delivered against every scope item and acceptance
   criterion in the prompt.  Any gap → create a rework prompt (N.0.2+) or add missing
   scope to the next downstream prompt.
2. **Warning/error audit** — Run the parser (`npm run prebuild`) and verify zero
   errors and zero actionable warnings.  Any new warnings → fix immediately or create
   a follow-up prompt describing the fix.
3. **Cross-layer data flow** — If the change touches data across layers (parser →
   context → UI, or backend → API → frontend), verify real data flows through to the
   final output.  Evidence must appear in the Validation Results section.
4. **Production smoke test** — Build the production artifact and verify expected
   output in the target runtime (e.g., `npm run build && npx serve out` for static
   export).  Test-only results do not satisfy this item.
5. **Downstream impact scan** — List every downstream prompt or component affected.
   If any need scope adjustment, edit them before closing.
6. **Findings propagation** — Copy any recommendations, risks, or findings into the
   `Required Follow-Up` section.  For each item decide: (a) create a new prompt, or
   (b) add it as explicit scope to an existing prompt.  Note the action taken.
7. **Handoff frontmatter validation** — Ensure the YAML frontmatter uses exact field
   names from the template: `session_id`, `prompt_id`, `role`, `status_outcome`,
   `completion_percent`, `started_at`, `ended_at`.  Use `---` delimiters.

## Memory candidates
- Every handoff MUST include a `## Memory Candidates` section listing items the Repo Knowledge Curator should extract into `agents/context/memory.md`
- Items should be categorised as: resolved ambiguity, pattern (worked/failed), technical discovery, sponsor preference, or cross-cutting concern
- If no memory-worthy items exist, the section must state "None this session"

## Handoff quality test
The next agent should be able to start with minimal ambiguity after reading the handoff and required files.
