# ADR-001: Technology Stack Selection

## Status
Approved (Architect Review — 2026-04-03)

## Architect Review Notes

**Verdict: Approved**

The selected stack (Next.js + TypeScript + Chart.js + Tailwind CSS + gray-matter) is well-suited for the project requirements:

1. **Next.js** satisfies both local dev server and static export modes required by constraints C1/C2. The `next export` path eliminates mandatory server infrastructure while preserving full SSR/ISR capability if needed in v2.
2. **TypeScript** is the correct choice for enforcing parser–UI contracts (ADR-002 core interfaces). Type safety between the parser module and React components reduces integration risk.
3. **gray-matter** is the de-facto standard for YAML frontmatter in the Node.js ecosystem, aligning with constraint C4 (mandatory YAML frontmatter).
4. **Chart.js (~60KB gzipped)** is proportionate for the four chart types required (bar, donut, line, time-series). D3 would be over-engineered for v1. Risk R7 is adequately mitigated.
5. **Tailwind CSS** enables rapid layout iteration without component library lock-in, consistent with ADR-003's no-external-component-library decision.
6. **react-markdown + remark-gfm** provides XSS-safe markdown rendering for prompt bodies and handoff notes (FR-7).

**Conditions:**
- The `chokidar` file watcher must respect the 500ms debounce specified in epic E5-S2.
- Bundle size should be monitored; if total exceeds 500KB gzipped, the team should evaluate code-splitting strategies.
- `react-markdown` must be configured to sanitize HTML by default (security hardening for E6).

## Context
The Project Manager Dashboard needs a frontend framework, a parsing/backend layer, and a chart rendering library. The PRD suggests React or Vue for the SPA, and a local parser that emits normalized JSON. The dashboard must work locally with zero mandatory server infrastructure.

## Decision Drivers
- Must work locally without deployment infrastructure
- Must parse YAML frontmatter from markdown files
- Must render charts and interactive tables
- Must support file watching for local development
- Must be maintainable by agents following boilerplate standards
- Minimal dependency footprint preferred

## Options Considered

### Option A: Next.js + TypeScript + Chart.js (Recommended)
- **Frontend:** Next.js (React) with TypeScript
- **Parser:** Node.js module using `gray-matter` for YAML frontmatter extraction
- **Charts:** Chart.js with `react-chartjs-2` wrapper
- **Markdown rendering:** `react-markdown` with `remark-gfm`
- **File watching:** `chokidar` for local dev mode
- **Styling:** Tailwind CSS
- **Pros:** Mature ecosystem, strong TypeScript support, can run as static export or local dev server, Chart.js is lightweight (~60KB), gray-matter is battle-tested
- **Cons:** Next.js is heavier than a minimal React setup

### Option B: Vite + React + TypeScript + D3
- **Pros:** Faster dev server, D3 offers more chart flexibility
- **Cons:** D3 has steeper learning curve, larger bundle for simple charts, more manual wiring

### Option C: Vite + Vue 3 + TypeScript + Chart.js
- **Pros:** Vue is simpler for small teams, Vite is fast
- **Cons:** Smaller community for agentic tooling, fewer markdown rendering libraries

## Decision
**Option A: Next.js + TypeScript + Chart.js**

Rationale:
1. Next.js provides both dev server and static export modes, satisfying the local-only constraint
2. TypeScript enforces contracts between parser and UI, reducing integration errors
3. gray-matter is the de-facto standard for YAML frontmatter parsing in Node.js
4. Chart.js is lightweight and sufficient for the chart requirements (bar, donut, line)
5. Tailwind CSS enables rapid responsive layout without heavy CSS frameworks
6. react-markdown handles prompt body and handoff note rendering with XSS protection
7. The React ecosystem has the largest pool of agentic-compatible tooling and examples

## Consequences
- All implementation prompts will target TypeScript with React/Next.js
- Parser module will be a standalone TypeScript package importable by the UI
- Chart.js may need to be swapped for D3 if advanced visualizations are required in v2
- Static export mode will be the primary deployment target for v1
