# Prompt Numbering Standard

## Purpose

Define a sequence system that supports planned work, inserted work, defects, re-review, superseding, and scope changes without destructive renumbering.

## Canonical Format

Use a three-part decimal-like sequence:

`<major>.<branch>.<revision>`

Examples:
- `16.0.1`
- `16.0.2`
- `16.1.1`
- `17.0.1`

## Interpretation

- `major` = primary sequence group or original planned prompt region
- `branch` = inserted branch or sub-flow within that region (0 = main line)
- `revision` = sequence within the branch

## Rules

1. Original planned prompts use `N.0.1` format.
2. Insert a follow-up before the next major prompt by incrementing revision within the same region.
3. Insert a branched sub-flow by incrementing branch and starting revision at 1.
4. Never renumber historical prompts once issued unless they were drafts never executed.
5. Mark superseded prompts as `superseded`; do not delete them silently.
6. Superseded prompts must record `superseded_by` in their frontmatter.
7. Replacement prompts must record `supersedes` in their frontmatter.

## Insertion Examples

If the next original prompt would have been `17.0.1` but a defect or review follow-up must occur after `16.0.1`, create:
- `16.0.2`

If a larger side workflow is needed between 16 and 17, create:
- `16.1.1`
- `16.1.2`

## Superseding Examples

If prompt `12.0.1` must be replaced (not just followed up):
- Mark `12.0.1` with `status: superseded` and `superseded_by: ["12.0.2"]`
- Create `12.0.2` with `supersedes: ["12.0.1"]` and `insert_reason: "Replaced due to ..."`
- Move `12.0.1` to `prompts/archive/`
- Update any downstream prompts that had `12.0.1` in their prerequisites to reference `12.0.2`

## Downstream Update Rule

When an inserted or superseding prompt changes prerequisites or required reading:
1. update the new prompt metadata
2. update affected downstream prompt metadata (prerequisites, required_reading)
3. update prompt text sections for prerequisites and required reading
4. record the rationale in the handoff
5. mark impacted prompts for review if their prior assumptions changed
6. update `prompts/index.md` to reflect all changes

## Natural Sorting

Parsers must sort prompt IDs by numeric tuple, not plain string ordering.

## Relationship to Lifecycle Standard

See `agents/standards/prompt-lifecycle-standard.md` for folder structure, archival rules, and dashboard integration requirements.
