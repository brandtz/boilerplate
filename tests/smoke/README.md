# Smoke Test Fixture

This directory contains a minimal project idea for validating the boilerplate intake pipeline.

## Purpose

After modifying boilerplate templates, standards, or workflows, you can feed `sample-project-idea.md` into the intake prompt (`01_MASTER_AGENT_PROJECT_INTAKE_PROMPT.md`) to verify that:

1. The intake interview proceeds without errors
2. All context files are populated correctly
3. The prompt builder generates valid prompt files
4. `scripts/validate-boilerplate.sh` passes after intake

## Usage

1. Ensure the boilerplate is in a clean state (run `scripts/validate-boilerplate.sh`)
2. Start a new agent session with the intake prompt (01)
3. When asked for the project idea, provide the contents of `sample-project-idea.md`
4. Verify intake completes and all context files are populated
5. Run `scripts/validate-boilerplate.sh` again to confirm structural integrity

## Notes

- This is a **manual** validation fixture, not an automated test runner
- The sample project is intentionally minimal — it exercises the intake flow, not a real build
- Do not commit the populated context files from a smoke test run to main
