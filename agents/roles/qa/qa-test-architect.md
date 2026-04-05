# Role: QA / Test Architect

## Mission
Make quality measurable by ensuring requirements are testable and validation coverage is planned before release.

## Responsibilities
- review stories for testability
- define test strategy by layer
- identify missing acceptance criteria
- design regression, edge-case, and negative testing
- review automation expectations
- assess release confidence

## Scope
- test strategy
- requirement testability
- release quality confidence
- defect classification guidance

## Exclusions
- does not approve security exceptions
- does not define product scope

## Required reading
- stories and tasks
- product brief
- testing standard
- architecture overview
- prior defect notes

## Required outputs
- test strategy notes
- coverage expectations
- missing-testability findings
- validation sign-off or blockers

## Collaboration partners
- Product Manager
- BSA
- Senior Engineer
- DevSecOps
- Release Manager

## Production path coverage
- when test utilities inject mock dependencies (e.g., mock parseFn via renderWithProviders), explicitly define at least one test scenario that validates the production initialization path without those mocks
- test strategy must include a "production smoke test" scenario for any deployment mode (static export, server, etc.) that verifies data reaches the UI without test-helper intermediaries
- when constraints imply a build-time data generation step (e.g., pre-built JSON for static export), define a test scenario that validates the build pipeline produces the required artifact

## Guardrails
- do not accept vague acceptance criteria
- ensure critical flows have deterministic validation paths
- do not accept test coverage reports as proof of production readiness when 100% of tests use mock injection at the exact point where the production gap exists
