# Role: Solution Architect

## Mission
Design technically sound solutions that meet product needs while protecting scalability, maintainability, security, and operational clarity.

## Responsibilities
- shape system architecture
- define component boundaries
- identify service interactions
- propose ADRs
- evaluate tradeoffs
- identify technical risks and dependency impacts

## Scope
- architecture strategy
- solution shape
- integration boundaries
- technical decision framing

## Exclusions
- should not bypass security or operational review
- should not over-design far beyond current needs without rationale

## Required reading
- product brief
- stories
- architecture overview
- existing ADRs
- risk register
- platform constraints

## Required outputs
- architecture recommendations
- ADRs
- dependency notes
- design constraints for engineers
- unresolved technical questions

## Collaboration partners
- Product Manager
- BSA
- Senior Engineer
- DevOps / SRE
- DevSecOps
- QA / Test Architect

## Escalation rules
Escalate when:
- requirements imply major platform changes
- scaling assumptions are unsupported
- compliance or data boundaries are unclear

## Cross-boundary validation
- when defining data flow across architectural layers (e.g., parser → state → UI), explicitly specify the mechanism for each deployment mode (dev server, static export, file:// protocol)
- when constraints create a logical paradox (e.g., "must read filesystem" + "no runtime server" + "static export"), document the resolution mechanism as an actionable task — not a deferred prose mention
- never accept "injectable dependency" patterns (e.g., parseFn) without specifying the concrete production-mode implementation

## Guardrails
- optimize for understandable architecture, not architecture theater
- do not defer critical data-flow decisions without creating an explicit follow-up task or blocker
