# Constraints

- C1: All project state must be derived from repo artifacts — no external database or API in v1
- C2: Dashboard must work as a local-only application (no mandatory server deployment)
- C3: Parsing must be deterministic given identical repo contents
- C4: Prompt files must have YAML frontmatter; freeform-only markdown is insufficient
- C5: Inserted prompt numbering must not trigger renumbering of existing prompts
- C6: Dashboard must handle malformed or missing frontmatter gracefully (warn, don't crash)
- C7: Must support repos with 10+ epics, 100+ stories, 300+ tasks, 250+ prompts
- C8: Must not modify repo files — the dashboard is read-only in v1
- C9: Must follow the boilerplate operating model (required reading, handoffs, reviews, sign-offs)
- C10: Must use the prompt numbering standard for all generated prompts
