# Agentic AI Team Factory Blueprint

## Objective

Design a boilerplate repository that behaves like an AI-native SaaS organization in a box.

The system should support a workflow where:
- the human sponsor provides the idea, goals, and decisions
- a Master Agent orchestrates the workflow
- specialist agents perform focused SDLC work
- all agents read from and write to shared context files
- every meaningful output passes through review and sign-off
- the final product is robust, secure, scalable, and production grade

## Design principles

### 1. Document-first execution
The repo must preserve state in files, not only in transient chat context. Agents forget; documents remember.

### 2. Role clarity
Each agent role must have a clear mission, scope, required inputs, required outputs, and escalation boundaries.

### 3. Workflow gating
No phase should blur into the next phase. Entry conditions, outputs, review gates, and approval rules must be explicit.

### 4. Heavy review culture
Sound process beats speed. Use multiple role reviews when work is security-sensitive, user-facing, data-heavy, or release-impacting.

### 5. Small artifacts, strong contracts
Short, structured, machine-readable markdown is better than sprawling prose for AI workflows.

### 6. Shared context is mandatory
Agents must read living documents before acting and must update them after acting when relevant.

### 7. Stop conditions prevent fantasy work
If required interfaces, dependencies, or assumptions are missing, the agent must document, escalate, and stop instead of inventing.

## Recommended operating roles

### Orchestration
- Master Agent / Orchestrator
- Prompt Builder
- Repo Knowledge Curator
- Standards Guardian

### Product and planning
- Product Manager
- Technical Product Manager
- Business Systems Analyst
- Program / Delivery Manager

### Technical strategy
- Solution Architect
- Security Architect
- Data Architect (as needed)

### Engineering and delivery
- Senior Engineer
- Frontend Engineer
- Backend Engineer
- DevOps / Platform Engineer
- SRE / Observability Engineer

### Risk and quality
- DevSecOps Engineer
- QA / Test Architect
- Accessibility Reviewer
- Performance Reviewer
- Compliance / Privacy Reviewer

### Design and customer
- Product Designer / UX
- Technical Writer
- Customer Support / Success Reviewer
- Product Marketing Reviewer (optional for external products)

## Review doctrine

Use the following review pattern by default:
1. Authoring agent creates or updates the artifact.
2. Adjacent discipline reviewer inspects for completeness and risks.
3. Downstream consumer reviewer checks implementability and usability.
4. Orchestrator reconciles conflicts and routes rework.
5. Human sponsor approves major decisions or high-impact tradeoffs.

## High-value living documents

The following should exist in most projects:
- `agents/context/project-charter.md`
- `agents/context/product-brief.md`
- `agents/context/architecture-overview.md`
- `agents/context/assumptions.md`
- `agents/context/constraints.md`
- `agents/context/decision-log.md`
- `agents/context/risk-register.md`
- `agents/context/status-dashboard.md`

## Phase state machine

### Phase 0: Intake and framing
Input: project idea  
Output: charter, goals, assumptions, open questions

### Phase 1: Prompt-building and execution planning
Input: charter  
Output: prompt sequence plan, role routing, artifact map

### Phase 2: Product definition
Input: charter and prompt plan  
Output: personas, workflows, epics, stories, requirements

### Phase 3: Cross-functional review
Input: epics and stories  
Output: review findings, gaps, risks, changes required

### Phase 4: Revision and approval
Input: review findings  
Output: approved backlog and decision log

### Phase 5: Technical task generation
Input: approved backlog  
Output: ADRs, technical tasks, test strategy, environment plan

### Phase 6: Build
Input: technical tasks  
Output: code, tests, docs, configs, handoffs

### Phase 7: Validation and hardening
Input: completed implementation  
Output: validation reports, defect list, release blockers, readiness status

### Phase 8: Release readiness
Input: validated build  
Output: release notes, runbooks, operational checklist, approval status

### Phase 9: Post-release handoff
Input: release package  
Output: support handoff, observability notes, follow-up backlog

## What makes this “fire on all cylinders”

The factory performs best when:
- prompts are generated from templates instead of ad hoc chatting
- agents must cite required reading paths
- handoffs are written every cycle
- reviews are role-specific
- acceptance criteria are testable
- stop conditions are enforced
- context docs are treated as the source of truth
- the human sponsor approves only at key decision gates rather than micromanaging all work
