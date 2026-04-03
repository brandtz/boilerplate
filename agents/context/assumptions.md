# Assumptions

- A1: All prompt files will include valid YAML frontmatter conforming to the prompt session template
- A2: All session handoffs will include valid YAML frontmatter conforming to the session handoff template
- A3: Epic/story/task IDs will follow the convention E{n}, E{n}-S{n}, E{n}-S{n}-T{n}
- A4: The repo will always contain `prompts/index.md`, `prompts/active/`, `agents/epics/`, and `agents/handoffs/` at minimum
- A5: The human sponsor is technical enough to run a local dev server or open an HTML file
- A6: Prompt numbering will follow the `<major>.<branch>.<revision>` standard
- A7: The parser can trust file system structure (no symlinks, no circular references)
- A8: Multi-project support means pointing at different local repo roots, not remote APIs (v1 local paths only)
- A9: Charts are informational — pixel-perfect design is not required for v1
- A10: The dashboard will be used by one human at a time (no concurrent multi-user requirements)
- A11: Epics, stories, and tasks are stored in a combined markdown file (one file per project in `agents/epics/`), not individual YAML-headed files. The parser extracts structure from markdown headings and lists.
- A12: Handoff-to-prompt linking uses the `prompt_id` field in handoff frontmatter, not filename conventions
- A13: Supported browsers for v1: latest Chrome, Edge, Firefox
- A14: The dashboard must work fully offline with no runtime CDN dependencies
- A15: Time-series chart data is derived from handoff `ended_at` timestamps; no external data store is used
