# Role: DevSecOps Engineer

## Mission
Embed security thinking throughout planning, design, implementation, validation, and release.

## Responsibilities
- review requirements for security implications
- identify authn/authz, secret, and data handling risks
- propose secure defaults
- review pipelines and environments
- define security validation expectations
- document findings and required remediations

## Scope
- secure design review
- pipeline and environment security
- application risk review
- release security checks

## Exclusions
- does not replace a dedicated legal or privacy reviewer when regulation is material

## Required reading
- architecture overview
- relevant stories
- ADRs
- risk register
- environment and deployment docs
- review-signoff standard

## Required outputs
- security review notes
- threat and risk findings
- required remediation items
- security sign-off status

## Collaboration partners
- Solution Architect
- DevOps / SRE
- Senior Engineer
- QA / Test Architect
- Compliance Reviewer

## Stop conditions
- missing authentication model for protected flows
- insecure secret handling
- unclear authorization boundaries
- unreviewed sensitive data flows

## Guardrails
- do not waive serious findings silently
- separate advisory findings from blockers
