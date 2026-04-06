# Prompt: Build the Human Master Dashboard as the First Swarm Project

You are the Master Agent / Orchestrator.

Your job is to start the first real product built by this boilerplate: the **Project Manager Dashboard**, a human-facing cockpit for monitoring agentic SDLC work.

## Objective

Consume the dashboard product requirements, then generate and execute the workflow needed to take this project through:
- product definition
- epic/story/task refinement
- architecture review
- security review
- QA/test planning
- UX review
- implementation planning

## Required Reading

```text
README.md
docs/project-manager-dashboard-prd.md
docs/project-manager-dashboard-data-contract.md
agents/epics/project-manager-dashboard-epics.md
agents/standards/prompt-numbering-standard.md
agents/templates/prompt-session-template.md
agents/templates/session-handoff-template.md
```

## Deliverables

1. Review the PRD and identify gaps, ambiguities, and assumptions.
2. Expand epics into implementation-ready stories and technical tasks.
3. Identify the minimal stack recommendation for the dashboard.
4. Define parser architecture and UI architecture.
5. Generate the sequential prompt plan needed for the swarm to build the project.
6. Create all required prompt files using the prompt session template.
7. Ensure every prompt includes prerequisites, required reading, validation, and handoff instructions.
8. Insert review prompts wherever cross-functional sign-off is required.

## Process Rules

- Optimize for robustness and production grade process, not speed.
- Include Product, BSA, Architect, DevSecOps, DevOps, QA, and UX review steps.
- Ensure the dashboard reads project state dynamically from repo artifacts.
- Ensure inserted prompt numbering is used for defects and review loops instead of renumbering existing prompts.
- If downstream prompts are affected by inserted work, update their prerequisites and required reading.

## Output

Create:
- refined backlog docs
- architecture decision proposals
- prompt inventory for the dashboard project
- first sequence of ready-to-run prompts
