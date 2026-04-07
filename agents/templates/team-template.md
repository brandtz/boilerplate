# Human Team Mapping

## Team Members

| Name | Role / Title | Domain Expertise | Authority Scope |
|---|---|---|---|
| *(e.g., "Jane")* | *(e.g., "CTO")* | *(e.g., architecture, engineering, security)* | *(e.g., approves ADRs, technical implementation)* |

## Approval Routing

| Review Gate / Decision Type | Required Approver (by domain) |
|---|---|
| Architecture decisions (ADRs) | Technical authority |
| Product scope / feature prioritisation | Product / domain authority |
| Security review sign-off | Technical authority (or dedicated security lead) |
| Release readiness | Technical authority + product authority |
| Budget / vendor selection | Business authority |

## Override / Veto Rights

| Domain Authority | May Override Agent Roles |
|---|---|
| Technical authority | Solution Architect, Senior Engineer, DevOps/SRE, DevSecOps |
| Product / domain authority | Product Manager, BSA, UX Designer, Customer Success |
| Business authority | All roles (sponsor-level override) |

## Escalation Paths

| Scenario | Resolution Process |
|---|---|
| Humans disagree on technical vs. product trade-off | Escalate to business authority or defer to the domain owner |
| No human available for required approval | Block the review gate; do not auto-approve |
| Agent recommends against human decision | Document the agent's rationale in the decision log; human decision stands |

## Availability Constraints

| Team Member | Timezone | Working Hours | Constraints |
|---|---|---|---|
| *(e.g., "Jane")* | *(e.g., UTC-6)* | *(e.g., 09:00–17:00 Mon–Fri)* | *(e.g., field time Tue/Thu, limited availability)* |
