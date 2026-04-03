# Assumptions

- A1: All prompt files will include valid YAML frontmatter conforming to the prompt session template
- A2: All session handoffs will include valid YAML frontmatter conforming to the session handoff template
- A3: Epic/story/task IDs will follow the convention E{n}, E{n}-S{n}, E{n}-S{n}-T{n}
- A4: The repo will always contain `agents/epics/`, `prompts/`, and `agents/context/status-dashboard.md` at minimum
- A5: The human sponsor is technical enough to run a local dev server or open an HTML file
- A6: Prompt numbering will follow the `<major>.<branch>.<revision>` standard
- A7: The parser can trust file system structure (no symlinks, no circular references)
- A8: Multi-project support means pointing at different local repo roots, not remote APIs
- A9: Charts are informational — pixel-perfect design is not required for v1
- A10: The dashboard will be used by one human at a time (no concurrent multi-user requirements)
