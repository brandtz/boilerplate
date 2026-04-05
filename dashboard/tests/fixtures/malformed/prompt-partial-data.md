---
prompt_id: "PARTIAL-1"
title: "Partial Fields Prompt"
status: "in_progress"
epic_id: "E1"
---

# Partial Data

This prompt has required fields (prompt_id, title, status) plus some optional fields,
but is missing many others (story_id, owner_role, prerequisites, etc.).
The parser should extract what exists and default the rest.
