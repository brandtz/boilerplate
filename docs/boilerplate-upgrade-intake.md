# Boilerplate Upgrade Intake — 10 Recommendations for Agentic Build Stability

> **Purpose:** This document is structured as a project intake artifact for the Master Agent. Feed it into `01_MASTER_AGENT_PROJECT_INTAKE_PROMPT.md` as the project idea to generate the epic/story/prompt sequence for upgrading the boilerplate itself.
>
> **Author:** Claude (external reviewer), in collaboration with Matthew Brandt (human sponsor)
>
> **Date:** 2026-04-06
>
> **Context:** The boilerplate was reviewed end-to-end after its initial build with GitHub Copilot. These recommendations address gaps that will surface when the boilerplate is used to build real production SaaS projects (starting with Bulwark). The review focused on what's missing to make agentic builds stable, repeatable, and production-grade across multiple concurrent ventures.

---

## Recommendation 1: Add a Stack Conventions Layer

### Problem
The boilerplate is stack-agnostic by design, but every real project has a specific stack. There is no mechanism to inject stack-specific conventions (frameworks, deployment targets, database choices, coding patterns) into the agent context so that every downstream prompt respects them.

### Proposed Change
Create `agents/context/conventions.md` as a required living document populated during intake. This file defines the project's tech stack, framework conventions, naming patterns, file structure rules, deployment targets, and any stack-specific constraints.

### Impact
- The Master Agent intake prompt (01) must be updated to interview the sponsor about stack choices and generate the conventions file.
- The required-reading standard must add `conventions.md` to the universal tier.
- The Senior Engineer, Solution Architect, DevOps, and QA roles must list it as required reading.
- The prompt-builder standard must inject conventions as a constraint block in every implementation prompt.

### Acceptance Criteria
- A conventions file template exists in `agents/templates/`.
- Intake prompt 01 produces a populated conventions file.
- Every implementation-phase prompt includes conventions as required reading.
- The Standards Guardian validates that implementation prompts reference conventions.

---

## Recommendation 2: Add an Agent Session Configuration Standard (AGENTS.md)

### Problem
There is no mechanism to configure how Copilot agents behave at the repo level. GitHub Copilot supports `.github/copilot-instructions.md` for repo-wide agent instructions, but the boilerplate doesn't generate or manage this file. Agents start each session with no repo-level behavioral priming beyond what's in the prompt.

### Proposed Change
Create a standard for agent session configuration that includes:
- `.github/copilot-instructions.md` — repo-wide instructions Copilot reads automatically.
- `AGENTS.md` at root — a human-readable and agent-readable summary of how the repo's agent system works, which roles exist, what the current project state is, and where to find key files.
- A clause in the operating model requiring the Orchestrator to keep both files current.

### Impact
- New standard file: `agents/standards/agent-configuration-standard.md`.
- New template: `agents/templates/agents-md-template.md`.
- Bootstrap prompt (00) must generate the initial `.github/copilot-instructions.md` and `AGENTS.md`.
- The Repo Knowledge Curator role must maintain them.

### Acceptance Criteria
- `.github/copilot-instructions.md` exists and is generated during bootstrap.
- `AGENTS.md` exists at repo root with current project state, role index, and file map.
- Both files are listed in the Repo Knowledge Curator's required outputs.
- The Standards Guardian validates their freshness at each review gate.

---

## Recommendation 3: Add a Persistent Memory System (MEMORY.md)

### Problem
Handoffs preserve session-to-session continuity, but they accumulate as individual files. There is no consolidated "what the project has learned" artifact. Late-stage agents must read a growing chain of handoffs to reconstruct decisions, patterns, gotchas, and resolved ambiguities. This doesn't scale.

### Proposed Change
Create `agents/context/memory.md` as a living document that the Repo Knowledge Curator consolidates after each phase. It captures:
- Resolved ambiguities and their outcomes.
- Patterns that worked or failed.
- Key technical discoveries (e.g., "Neon doesn't support X, use Y instead").
- Human sponsor preferences expressed during the project.
- Accumulated style/convention decisions not in the original conventions file.
- Cross-cutting concerns discovered during reviews.

### Impact
- New context file: `agents/context/memory.md`.
- New template: `agents/templates/memory-template.md`.
- The Repo Knowledge Curator's responsibilities expand to include memory consolidation.
- The required-reading standard adds `memory.md` to the universal tier.
- The handoff standard gains a section: "memory-worthy items" that the curator should extract.

### Acceptance Criteria
- Memory file exists and is populated after Phase 2 at the latest.
- Each handoff includes a "Memory Candidates" section.
- The Repo Knowledge Curator consolidates memory at least once per phase.
- Late-stage agents can read memory.md instead of re-reading all prior handoffs.

---

## Recommendation 4: Add a Skills and Capabilities Registry

### Problem
Agents don't know what tools, APIs, integrations, or capabilities are available to them in the current environment. A Copilot agent in VS Code has different capabilities than a cloud agent. An agent with MCP server access has different capabilities than one without. There is no artifact that declares the available toolset.

### Proposed Change
Create `agents/context/skills.md` (or `capabilities.md`) that declares:
- Available MCP servers and what they provide.
- Available CLI tools and their versions.
- Available APIs (internal and external) with auth requirements.
- Available AI model access (e.g., can agents call Claude API for sub-tasks?).
- Environment constraints (e.g., no Docker, static export only, Vercel serverless limits).
- File system access boundaries.

### Impact
- New context file: `agents/context/skills.md`.
- New template: `agents/templates/skills-template.md`.
- Intake prompt (01) must interview the sponsor about available tooling and environment.
- The Solution Architect and DevOps roles must validate skills against architecture decisions.
- The prompt-builder must inject relevant skills into prompts that require tool usage.

### Acceptance Criteria
- Skills file exists and is populated during intake.
- Architecture review validates that no design decision depends on an unavailable capability.
- Implementation prompts reference skills.md when tool usage is expected.
- The DevOps/SRE role validates skills against deployment targets.

---

## Recommendation 5: Add a Third-Party Integration Map

### Problem
Real SaaS projects depend on external services (databases, auth providers, CDNs, payment processors, storage, email). The boilerplate has no artifact for tracking these dependencies, their configuration requirements, their failure modes, or their cost implications. Agents will make architecture decisions without knowing what's actually available.

### Proposed Change
Create `agents/context/integrations.md` that maps every external dependency:
- Service name, purpose, and tier/plan.
- Configuration requirements and environment variables.
- Known limitations and failure modes.
- Cost model (per-request, per-seat, flat rate).
- Auth mechanism (API key, OAuth, service account).
- SDK or client library and version.
- Fallback or degradation strategy.

### Impact
- New context file: `agents/context/integrations.md`.
- New template: `agents/templates/integrations-template.md`.
- The Solution Architect must populate this during architecture review.
- The DevSecOps role must review it for secret management and attack surface.
- The DevOps/SRE role must review it for operational reliability.
- The Senior Engineer must reference it during implementation.

### Acceptance Criteria
- Integrations file exists and is populated before implementation begins.
- Every external service call in the codebase traces back to an entry in integrations.md.
- DevSecOps review validates that no secrets are hardcoded.
- The risk register includes entries for critical third-party dependencies.

---

## Recommendation 6: Add Complexity Scoring and Estimation to Prompts

### Problem
Prompts have no complexity estimate, token budget, or expected session duration. The dashboard tracks completion status but cannot predict how much work remains or flag prompts that are too large for a single agent session. Oversized prompts lead to context window exhaustion, incomplete handoffs, and quality degradation.

### Proposed Change
Add to the prompt template:
- **Complexity score** (S/M/L/XL) based on scope, number of files touched, and cross-layer impact.
- **Estimated token budget** — rough ceiling for the agent's output.
- **Max files touched** — if a prompt requires changes to more than ~8 files, it should be split.
- **Session splitting guidance** — if complexity is XL, the prompt-builder must split into sub-prompts.

Update the prompt-builder standard to enforce complexity scoring during prompt generation.

### Impact
- Updated template: `agents/templates/prompt-template.md`.
- Updated standard: `agents/standards/prompt-builder-standard.md`.
- The dashboard can use complexity scores to estimate remaining effort.
- The Standards Guardian validates that XL prompts are split.

### Acceptance Criteria
- Every generated prompt includes a complexity score.
- XL prompts are automatically split by the prompt-builder.
- The dashboard displays complexity distribution and estimated remaining effort.
- The Standards Guardian flags prompts without complexity scores.

---

## Recommendation 7: Add an Environment and Secrets Management Standard

### Problem
There is no standard for how agents handle environment variables, secrets, API keys, or deployment configuration. Agents may hardcode values, commit secrets, or make assumptions about runtime environment. This is a critical gap for production SaaS.

### Proposed Change
Create `agents/standards/environment-secrets-standard.md` that defines:
- All secrets must be referenced via environment variables, never hardcoded.
- A `.env.example` file must exist documenting every required variable.
- The DevSecOps role must review every PR or prompt output for secret leaks.
- Deployment configuration must be documented in integrations.md.
- Local development setup must be reproducible from documented env vars alone.

### Impact
- New standard: `agents/standards/environment-secrets-standard.md`.
- The bootstrap prompt (00) must generate `.env.example`.
- The DevSecOps role gains a mandatory review checkpoint for secrets.
- The coding standard must reference the environment standard.
- `.gitignore` must be validated to exclude `.env` files.

### Acceptance Criteria
- Standard exists and is in the DevSecOps required reading.
- `.env.example` is generated during project setup.
- No prompt output contains hardcoded secrets (validated by DevSecOps review).
- The close-out checklist includes a secrets audit step.

---

## Recommendation 8: Add Human Role Mapping for Small Teams

### Problem
The boilerplate defines 10+ agent roles and assumes a single "human sponsor" for approvals. In practice, Bulwark has two humans (Matthew and Drew) with different expertise and authority. There is no mechanism to map real humans to review gates, approval boundaries, or domain authority. Drew's field expertise should gate certain product decisions; Matthew's technical authority should gate architecture decisions.

### Proposed Change
Create `agents/context/team.md` that maps:
- Each human team member, their domain expertise, and their authority scope.
- Which review gates require which human's approval.
- Which agent roles a human can override or veto.
- Escalation paths when humans disagree.
- Availability constraints (e.g., Drew is in the field during business hours).

Update the review-signoff standard to reference team.md for human approval routing.

### Impact
- New context file: `agents/context/team.md`.
- New template: `agents/templates/team-template.md`.
- Intake prompt (01) must interview the sponsor about team composition.
- The review-signoff standard must reference team.md for approval routing.
- The Orchestrator must route human approvals to the correct person.

### Acceptance Criteria
- Team file exists and is populated during intake.
- Review gates that require human approval specify which human by role, not generically.
- The Orchestrator routes domain-specific approvals to the appropriate team member.
- Availability constraints are reflected in prompt scheduling.

---

## Recommendation 9: Add a Validation Sandbox Standard

### Problem
The coding/testing standard requires validation but doesn't define *how* agents should validate in different environments. A Copilot agent in VS Code can run local commands. A cloud agent cannot. Static export apps need different validation than server-rendered apps. There is no standard for what "validated" means in each deployment context.

### Proposed Change
Create `agents/standards/validation-sandbox-standard.md` that defines:
- What validation commands are available in each agent environment (local VS Code, cloud, CI).
- What constitutes "production-path validation" for each deployment target (Vercel serverless, static export, edge functions).
- Required validation evidence format (command output, screenshot, log excerpt).
- When agents must defer validation to CI/CD vs. performing it locally.
- How to validate cross-service integrations when external services aren't available locally.

### Impact
- New standard: `agents/standards/validation-sandbox-standard.md`.
- The coding-documentation-testing standard must reference it.
- The DevOps/SRE role must define the validation matrix during architecture review.
- Implementation prompts must specify which validation tier is expected.
- The handoff standard's "production smoke test" section must reference the sandbox standard.

### Acceptance Criteria
- Standard exists and defines validation tiers per deployment target.
- Every implementation prompt specifies the expected validation tier.
- Handoff validation sections cite the standard and include the required evidence.
- The Standards Guardian flags handoffs claiming validation without matching evidence.

---

## Recommendation 10: Add a Boilerplate Self-Test / Dry Run Mechanism

### Problem
There is no way to verify that the boilerplate itself works correctly after modifications. If you update a template, standard, or workflow, there's no automated check that the prompt chain still produces valid output. The dashboard v1 dogfood proved it works once, but future changes could introduce regressions in the process itself.

### Proposed Change
Create a lightweight self-test that can be run after any boilerplate modification:
- A `scripts/validate-boilerplate.sh` that checks structural integrity: all templates referenced in standards exist, all required-reading paths resolve, all role files have required sections, all workflow files have entry/exit conditions, the prompt index is consistent with the filesystem.
- A sample "smoke test project" in `tests/smoke/` — a minimal project idea that can be run through intake and prompt-building to verify the pipeline produces valid output structure.
- The Standards Guardian gains a "meta-review" responsibility: after any boilerplate change, run the self-test before committing.

### Impact
- New directory: `scripts/` with `validate-boilerplate.sh`.
- New directory: `tests/smoke/` with a minimal test project fixture.
- The Standards Guardian role gains meta-review responsibility.
- The operating model gains a rule: boilerplate changes require self-test pass before merge.

### Acceptance Criteria
- `validate-boilerplate.sh` exists and catches missing files, broken references, and malformed templates.
- The smoke test project can be run through intake without errors.
- The Standards Guardian runs the self-test after any boilerplate modification.
- CI (if configured) runs the self-test on every push to main.

---

## Summary of New Artifacts

| Type | File | Recommendation |
|---|---|---|
| Context | `agents/context/conventions.md` | 1 |
| Context | `agents/context/memory.md` | 3 |
| Context | `agents/context/skills.md` | 4 |
| Context | `agents/context/integrations.md` | 5 |
| Context | `agents/context/team.md` | 8 |
| Standard | `agents/standards/agent-configuration-standard.md` | 2 |
| Standard | `agents/standards/environment-secrets-standard.md` | 7 |
| Standard | `agents/standards/validation-sandbox-standard.md` | 9 |
| Config | `.github/copilot-instructions.md` | 2 |
| Config | `AGENTS.md` | 2 |
| Template | `agents/templates/conventions-template.md` | 1 |
| Template | `agents/templates/agents-md-template.md` | 2 |
| Template | `agents/templates/memory-template.md` | 3 |
| Template | `agents/templates/skills-template.md` | 4 |
| Template | `agents/templates/integrations-template.md` | 5 |
| Template | `agents/templates/team-template.md` | 8 |
| Updated | `agents/templates/prompt-template.md` | 6 |
| Updated | `agents/standards/prompt-builder-standard.md` | 6 |
| Updated | `agents/standards/required-reading-standard.md` | 1, 3, 4 |
| Updated | Intake prompt 01 | 1, 4, 5, 8 |
| Updated | Bootstrap prompt 00 | 2, 7 |
| Updated | Handoff standard | 3 |
| Updated | Review-signoff standard | 8 |
| Updated | Coding-documentation-testing standard | 7, 9 |
| Script | `scripts/validate-boilerplate.sh` | 10 |
| Test | `tests/smoke/` | 10 |

## Recommended Execution Order

1. Recommendations 1–2 (conventions + agent config) — foundational for all downstream work
2. Recommendations 3–5 (memory + skills + integrations) — context layer completeness
3. Recommendation 8 (team mapping) — required before Bulwark intake with Drew
4. Recommendations 6–7 (complexity scoring + secrets) — process hardening
5. Recommendation 9 (validation sandbox) — implementation quality
6. Recommendation 10 (self-test) — lock it down before Bulwark kickoff

## Sponsor Decision Required

Before executing: confirm whether all 10 recommendations should be implemented, or whether a subset is sufficient for Bulwark kickoff. The minimum viable set for a stable Bulwark build is **1, 2, 3, 5, 7, and 8**.
