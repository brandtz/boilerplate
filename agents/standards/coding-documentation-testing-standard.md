# Standard: Coding, Documentation, and Testing

## Coding expectations
- prefer clear, maintainable structure
- document non-obvious decisions
- stay within scope unless escalated
- respect architecture boundaries

## Documentation expectations
- update docs when behavior, setup, or operational expectations change
- record key decisions in the decision log or ADRs
- produce handoffs after meaningful work packets

## Testing expectations
- critical acceptance criteria should map to validation
- negative and edge cases matter
- release-impacting work should define rollback or recovery considerations
- avoid claiming confidence without actual validation evidence
- at least one test per critical data path must validate the **production initialization**, not just the test-helper path — if test utilities inject mock dependencies (e.g., mock data providers), a separate test must verify the real initialization works without those mocks
- when test helpers satisfy a dependency that production does not (e.g., an injected `parseFn`), document this gap explicitly and ensure the production path has its own validation

## Cross-layer integration expectations
- when work spans parser → state → UI or similar multi-layer pipelines, at least one integration test must validate the full production data path without mock intermediaries
- static export (`output: "export"`) apps must have a test or validation step confirming that pre-built data artifacts exist and are loadable by the client
- deferred architectural decisions (e.g., "future strategies" for data loading) must be tracked as explicit follow-up tasks, not left as prose in decision logs

## Review gate expectations
- review agents MUST challenge the work product, not merely summarize it — "looks good" without evidence of verification is insufficient
- if a review gate identifies any finding (low, medium, high), the reviewer MUST either: (a) create a rework prompt (N.0.2+) with the finding as explicit scope, or (b) add the finding to the next downstream prompt as a scope item
- findings noted in a review handoff that are NOT propagated to a prompt are a review defect
- reviewers should verify that previous review findings were addressed, not just assume they were
