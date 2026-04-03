# First Prompt: Bootstrap the Boilerplate Repo

Use this as the first major prompt in a fresh repo to have a Master Agent scaffold the entire AI operating system.

```md
Good afternoon. Today we are creating a reusable boilerplate repository that is preconfigured for an Agentic AI-led software delivery lifecycle using GitHub Copilot agents in VS Code and GitHub Copilot Cloud agents.

Repository target:
<REPLACE_WITH_REPO_URL>

Objective:
Build a repo that contains the scaffolding, standards, role definitions, workflow instructions, templates, and shared context structure needed for AI agents to execute all stages of the SDLC from idea intake through release and handoff.

The repository must be stack-agnostic by default while supporting future specialization for specific tech stacks.

Primary operating model:
- One human user acts as sponsor, approver, and final decision-maker.
- One Master Agent acts as orchestrator and workflow conductor.
- Specialist agents assume defined roles across product, architecture, engineering, QA, security, operations, design, and release.
- All agents must work from shared context files, role instructions, workflow standards, and handoff artifacts.
- Every workflow phase must define required reading, required outputs, validation expectations, downstream consumers, and stop conditions.

Your goals in order:
1. Create the folder structure for the AI operating system.
2. Create foundational markdown files for roles, workflows, standards, templates, and shared context.
3. Create a prompt-builder standard that the Master Agent will use for future project execution.
4. Create default starter context documents and empty placeholders where appropriate.
5. Create a README that explains how a single human sponsor should operate the system.

Required top-level areas:
- `.github/`
- `agents/roles/`
- `agents/workflows/`
- `agents/standards/`
- `agents/templates/`
- `agents/context/`
- `agents/prompts/`
- `agents/handoffs/`
- `agents/reviews/`
- `docs/`

Role categories to create:
- orchestration
- product and planning
- architecture
- engineering
- platform and operations
- security and compliance
- QA and testing
- design and UX
- data and analytics
- customer and go-to-market

Each role file must define:
- role name
- mission
- responsibilities
- scope
- exclusions
- required reading
- required inputs
- required outputs
- collaboration partners
- escalation rules
- approval boundaries
- handoff obligations
- success criteria
- guardrails

Create workflow files for:
- intake and project framing
- prompt-building and execution planning
- epic generation
- story breakdown
- cross-functional review
- revision and approval
- technical task generation
- implementation
- validation
- release readiness
- post-release handoff

Create standards for:
- prompt authoring
- required reading
- handoffs
- reviews and sign-offs
- coding and documentation expectations
- testing expectations
- stop conditions and escalation

Create templates for:
- role identity files
- prompt files
- project charter
- product brief
- epic
- story
- technical task
- ADR
- handoff
- review report
- risk register
- decision log
- release readiness checklist

Important working rules:
- Prefer highly structured markdown over conversational prose.
- Use concise sections and predictable headings.
- Include TODO placeholders where project-specific details will later be added.
- Do not invent stack-specific code unless necessary for scaffold examples.
- Make sure the system is optimized for both local Copilot sessions and cloud agent sessions.
- Assume the human sponsor values sound process over speed to market.
- Assume strong review discipline and cross-functional sign-off are desired.

Before making files:
1. Propose the folder tree.
2. Propose the initial set of core roles.
3. Propose the workflow phase order.
4. Then begin creating files.
5. End by summarizing what was created and what should be reviewed next.
```
