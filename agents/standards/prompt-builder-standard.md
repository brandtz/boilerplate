# Standard: Prompt Builder

## Purpose
Define how the Master Agent creates specialist prompt files.

## Every prompt should contain
- title
- sequence position
- phase
- objective
- dependencies
- prerequisites
- context for the agent
- required reading
- implementation or review scope
- constraints
- validation expectations
- handoff instructions
- downstream consumers
- stop conditions

## Style rules
- use markdown
- optimize for copy/paste into a fresh agent session
- keep instructions explicit
- point to exact file paths
- separate hard requirements from advisory guidance
- prefer concise structure over long narrative

## Good prompt doctrine
A good prompt tells the agent:
- why this work exists
- what phase it belongs to
- what it must read
- what artifact it must change
- what good looks like
- what would cause it to stop
- who needs the output next

## Review prompts
Review prompts should require:
- findings grouped by severity
- missing information
- change requests
- explicit sign-off status
- unresolved blockers

## Implementation prompts
Implementation prompts should require:
- scope boundaries
- dependent files
- test expectations
- code quality expectations
- handoff note requirements
- `agents/context/conventions.md` in required reading (for stack-aware implementation)

## Complexity scoring
Every generated prompt MUST include a `complexity` field in its frontmatter.

| Score | Files Touched | Characteristics |
|---|---|---|
| **S** | 1–2 | Single-layer, straightforward |
| **M** | 3–5 | May span 2 layers, moderate decisions |
| **L** | 6–8 | Cross-layer, significant decisions |
| **XL** | 9+ | Fundamental cross-cutting changes |

- The Standards Guardian flags prompts without complexity scores
- XL prompts should include an advisory note about splitting consideration (not mandatory)
- Complexity is informational — it is not a gate or blocker

## Anti-patterns
Avoid prompts that:
- ask for many phases at once
- omit required reading
- blur product decisions with implementation
- forget downstream handoffs
- lack stop conditions
