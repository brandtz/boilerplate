# Prompt Inventory — Canonical Index

## Project: Test Dashboard

### Summary

| Metric | Count |
|---|---|
| Total prompts | 5 |
| Status: ready | 2 |
| Status: done | 3 |

### Test Prompts

| prompt_id | title | status | phase | location | prerequisites | downstream_prompts | session_handoff | created_at | completed_at | archived_at | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.0.1 | First Prompt | done | planning | prompts/active/1.0.1-first.md | — | 2.0.1 | agents/handoffs/S-001.md | 2026-04-01 | 2026-04-01 | — | First prompt done |
| 2.0.1 | Second Prompt | done | planning | prompts/active/2.0.1-second.md | 1.0.1 | 3.0.1 | agents/handoffs/S-002.md | 2026-04-01 | 2026-04-02 | — | Second prompt done |
| 3.0.1 | Third Prompt | done | implementation | prompts/active/3.0.1-third.md | 2.0.1 | 4.0.1, 5.0.1 | agents/handoffs/S-003.md | 2026-04-01 | 2026-04-03 | — | Third prompt done |
| 4.0.1 | Fourth Prompt | ready | implementation | prompts/active/4.0.1-fourth.md | 3.0.1 | — | — | 2026-04-01 | — | — | — |
| 5.0.1 | Fifth Prompt | ready | implementation | prompts/active/5.0.1-fifth.md | 3.0.1 | — | — | 2026-04-01 | — | — | — |
