# Project Manager Dashboard

A local-first single-page dashboard that parses boilerplate repo artifacts (markdown files with YAML frontmatter) and renders a project management cockpit. Gives the human sponsor real-time visibility into agentic AI software projects without requiring agents to report status manually.

## Features

- **Overview dashboard** — summary cards, health badge, epic completion chart, prompt status distribution, session throughput timeline, remaining prompts chart, blockers/warnings panel, next-prompt widget with copy-to-clipboard
- **Epics view** — accordion-based epic/story/task hierarchy with completion rollups, status badges, and filter bar
- **Prompt inventory** — sortable/filterable table of all prompts (active and archived) with detail drawer showing full markdown body, metadata, and associated handoffs
- **Session timeline** — chronological view of all session handoffs grouped by date, with expandable detail cards
- **Multi-repo support** — repo selector with capability detection, path validation, and recent project persistence
- **Auto-refresh** — chokidar file watcher triggers re-parse on file changes in dev mode
- **Parser CLI** — standalone command-line tool for generating dashboard state JSON

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16.2 (React 19) | SPA with static export |
| Language | TypeScript 5 (strict) | Type-safe contracts |
| YAML Parsing | gray-matter + js-yaml v4 | Frontmatter extraction (safe schema) |
| Charts | Chart.js + react-chartjs-2 | Lightweight charting (~60KB gzipped) |
| Markdown | react-markdown + remark-gfm | XSS-safe markdown rendering |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| File Watching | chokidar v5 | Local dev mode auto-refresh |
| Testing | Jest 30 + Testing Library | Unit, component, integration tests |

## Prerequisites

- **Node.js** v18.17+ (LTS) or v20.x
- **npm** v9+

## Installation

```bash
cd dashboard
npm ci
```

## Usage

### Development Server

```bash
npm run dev
```

Dashboard available at [http://localhost:3000](http://localhost:3000). The `predev` script automatically runs the parser to generate `public/dashboard-state.json` before starting the dev server. File changes in the repo trigger automatic re-parsing via chokidar.

### Static Build and Export

```bash
npm run build
```

The `prebuild` script runs the parser first, then Next.js produces a static export to `out/`. Serve with any static HTTP server:

```bash
npx serve out
```

### Parser CLI

The parser can be used independently to generate dashboard state JSON:

```bash
# Parse current repo to stdout
npx tsx bin/dashboard-parse.ts

# Parse specific repo with JSON output
npx tsx bin/dashboard-parse.ts --repo /path/to/repo --output state.json --pretty

# Quiet mode (suppress info-level warnings)
npx tsx bin/dashboard-parse.ts --repo .. --output state.json --quiet
```

**CLI options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--repo <path>` | Path to repository root | Current working directory |
| `--output <path>` | Write JSON to file (otherwise stdout) | stdout |
| `--pretty` | Pretty-print JSON with 2-space indent | false |
| `--quiet` | Suppress info-level warnings from stderr | false |
| `--help` | Print usage information | — |
| `--version` | Print version | — |

Exit code is `1` if any error-level validation issues are found, `0` otherwise.

## Dashboard Views

### Overview (`/`)

Project summary cards showing total epics, stories, tasks, prompts, and completion metrics. Four chart panels (epic completion, prompt status distribution, session throughput, remaining prompts over time). Blockers & warnings panel with categorized issues. Next-prompt widget with copy-to-clipboard.

### Epics (`/epics`)

Accordion-based view of all epics with story and task drill-down. Each level shows completion percentage calculated as `done / (total - cancelled) × 100`. Filter bar for searching and filtering by status.

### Prompts (`/prompts`)

Sortable, filterable table of all prompts (active and archived). Natural numeric sorting for prompt IDs (e.g., `2.0.1` sorts before `16.0.1`). Click any row to open a detail drawer with full prompt metadata, rendered markdown body, prerequisites, and linked handoff history.

### Sessions (`/sessions`)

Chronological timeline of all session handoffs grouped by date. Each card shows session ID, prompt, role, outcome, and summary. Expand for full detail including changed files and downstream impacts. Filter by status outcome, role, or keyword search.

### Tasks (`/tasks`)

> **v1 limitation:** The Tasks view renders a placeholder page. Full task tree hierarchy with status badges and prompt linking is deferred to v2.

## Project Structure

```
dashboard/
├── bin/
│   └── dashboard-parse.ts       # CLI entry point
├── public/
│   └── dashboard-state.json     # Generated at build time
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout with CSP meta tag
│   │   ├── globals.css          # Global styles + focus-visible
│   │   ├── page.tsx             # Overview (/)
│   │   ├── epics/page.tsx       # Epics view
│   │   ├── prompts/page.tsx     # Prompts view
│   │   ├── sessions/page.tsx    # Sessions view
│   │   └── tasks/page.tsx       # Tasks view (placeholder)
│   ├── components/
│   │   ├── epics/               # Epic accordion, story rows, task list
│   │   ├── overview/            # Summary cards, charts, blockers, next-prompt
│   │   ├── prompts/             # Prompt table, detail drawer, markdown renderer
│   │   ├── sessions/            # Session timeline, cards, detail
│   │   ├── shared/              # ErrorBoundary, Pagination, StatusBadge, etc.
│   │   └── shell/               # AppShell, Header, Sidebar, StatusBar
│   ├── constants/               # Route definitions, status theme
│   ├── context/                 # DashboardContext (global state)
│   ├── hooks/                   # useAccordion, useCopyToClipboard, useDrawer
│   ├── lib/                     # chartConfig, fileWatcher, repoDetection
│   ├── parser/                  # Three-layer parser pipeline
│   │   ├── scanner.ts           # Layer 1: File discovery + path sandboxing
│   │   ├── extractor.ts         # Layer 2: Frontmatter extraction + validation
│   │   ├── graph-builder.ts     # Layer 3: Graph construction + rollups
│   │   ├── eligibility.ts       # Next-prompt selection algorithm
│   │   ├── epic-parser.ts       # Epic/story/task markdown extraction
│   │   ├── sorting.ts           # Natural prompt ID sorting
│   │   ├── index.ts             # Public API: parse()
│   │   ├── types.ts             # All TypeScript interfaces
│   │   ├── warnings.ts          # Warning code helpers
│   │   └── schemas/             # Prompt and handoff validation schemas
│   └── types/                   # Re-exported types for UI consumption
├── tests/
│   ├── components/              # Component tests (33 files)
│   ├── hooks/                   # Hook tests (4 files)
│   ├── lib/                     # Utility tests (3 files)
│   ├── parser/                  # Parser tests (12 files)
│   ├── security/                # Security audit tests (1 file, 43 tests)
│   ├── perf/                    # Performance benchmarks (excluded from npm test)
│   └── fixtures/                # Test data: valid, malformed, adversarial, edge-case
├── jest.config.ts
├── next.config.ts               # output: "export" (static SSG)
├── package.json
└── tsconfig.json                # strict mode, @/ path alias
```

## Testing

```bash
npm test                  # Run all tests (excludes perf)
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:perf         # Performance benchmarks only
```

**Test suite:** 558 tests across 50 suites with 9 snapshots — all passing.

**Coverage targets:**
- Parser modules: ≥90% line coverage
- UI components: ≥80% line coverage
- Overall: ~88%

**Test categories:**
- **Parser unit tests** — frontmatter extraction, validation, sorting, eligibility, graph building
- **Component tests** — all UI components rendered with Testing Library
- **Hook tests** — useAccordion, useCopyToClipboard, useDrawer, useDashboard
- **Integration tests** — full parser pipeline against fixture repos, snapshot comparison
- **Security tests** — path traversal, XSS, prototype pollution, YAML injection, CSP validation (43 tests)
- **Performance tests** — parser benchmark (81ms/310 prompts), UI render benchmark, memory usage

### Dependency Auditing

Run `npm audit` regularly and before releases to check for dependency vulnerabilities:

```bash
npm audit
```

At v1 release: **0 vulnerabilities** found. Consider adding `npm audit` to your CI pipeline.

## Security

### Architecture

The dashboard is designed with a minimal attack surface:
- **Local-only** — no network-facing APIs, no authentication
- **Read-only** — never writes to the repository
- **Static export** — no server-side code execution in production

### Mitigations

| Threat | Mitigation |
|--------|------------|
| Path traversal via repo selector | Reject `..`, null bytes, non-printable chars; `path.resolve()` + prefix check |
| XSS via markdown rendering | No `rehype-raw`; link protocol sanitizer blocks `javascript:`, `data:`, protocol-relative URLs |
| YAML injection / DoS | gray-matter + js-yaml v4 safe schema; try-catch wrapping; type validation |
| Symlink traversal | `followSymlinks: false` in scanner and chokidar; `lstat` for detection |
| Prototype pollution | `__proto__`, `constructor`, `prototype` keys rejected in frontmatter extractor |
| Clickjacking | CSP `frame-ancestors 'none'` meta tag |

### Content Security Policy

The dashboard includes a CSP meta tag in the root layout:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; frame-ancestors 'none'
```

> **Known limitation:** `script-src 'unsafe-inline'` is required because Next.js static export (`output: "export"`) injects inline scripts for hydration. Nonce-based CSP requires server-side rendering, which conflicts with the static export constraint. This is an accepted trade-off for v1.

## Accessibility

WCAG 2.1 Level AA compliance:
- Global focus-visible indicators (2px solid blue, 2px offset)
- Skip-to-content link
- Keyboard-accessible sort headers, accordion toggles, and drawer
- Chart alternative text via `<figure role="img">` with sr-only data tables
- `aria-live` region for data refresh announcements
- Color contrast ≥4.5:1 for all status badges
- Focus trap in prompt detail drawer (Tab cycles, Escape closes)

## Supported Browsers

- Chrome (latest)
- Edge (latest)
- Firefox (latest)

## Configuration

No environment variables are required. All configuration is code-based:
- **Routes:** `src/constants/routes.ts`
- **Status theme:** `src/constants/statusTheme.ts`
- **Next.js:** `next.config.ts` — `output: "export"`, `trailingSlash: true`
- **TypeScript:** `tsconfig.json` — strict mode, `@/` path alias maps to `src/`

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (auto-parses repo first) |
| `npm run build` | Production build with static export to `out/` |
| `npm start` | Start Next.js production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | TypeScript type-check without emit |
| `npm test` | Run all tests (excludes perf) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:perf` | Run performance benchmarks only |
| `npm run parse` | Run parser CLI |
| `npm run parse:json` | Run parser CLI with JSON file output |

## Architecture

For detailed architecture documentation, see:
- [Architecture Overview](../agents/context/architecture-overview.md)
- [ADR-001: Stack Selection](../agents/decisions/ADR-001-stack-selection.md)
- [ADR-002: Parser Architecture](../agents/decisions/ADR-002-parser-architecture.md)
- [ADR-003: UI Architecture](../agents/decisions/ADR-003-ui-architecture.md)

## Known Limitations (v1)

1. **Tasks view** — renders a placeholder page; full task tree hierarchy deferred to v2
2. **CSP `unsafe-inline`** — required by Next.js static export for script hydration
3. **No E2E tests** — Playwright browser tests deferred to v2; comprehensive jsdom coverage in place
4. **No dark mode** — light theme only in v1
5. **No full-text search** — keyword search is metadata-only; full-text search deferred to v2
6. **No git URL repos** — multi-repo selector accepts local filesystem paths only
```

### Type Checking

```bash
npm run type-check              # TypeScript check without emit
```

## Project Structure

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── lib/                    # Constants and utilities
│   ├── parser/                 # Parser module (3-layer pipeline)
│   │   ├── index.ts            # Public API
│   │   ├── types.ts            # All TypeScript interfaces
│   │   ├── scanner.ts          # Layer 1: File Scanner
│   │   ├── extractor.ts        # Layer 2: Frontmatter Extractor & Validator
│   │   ├── graph-builder.ts    # Layer 3: Graph Builder & Eligibility Engine
│   │   ├── index-parser.ts     # prompts/index.md two-phase parser
│   │   ├── epic-parser.ts      # Epic/story/task extractor
│   │   ├── sorting.ts          # Natural prompt ID sorting
│   │   ├── eligibility.ts      # Next-prompt selection
│   │   ├── metrics.ts          # Completion rollups
│   │   ├── warnings.ts         # Warning helpers
│   │   └── schemas/            # Validation schemas
│   └── types/                  # Re-exported types for UI
├── tests/
│   ├── parser/                 # Parser unit tests
│   ├── components/             # Component tests
│   └── fixtures/               # Test fixture files
│       ├── valid/
│       ├── malformed/
│       ├── adversarial/
│       ├── edge-case/
│       ├── epics/
│       └── index-md/
└── public/                     # Static assets
```

## Architecture

See [ADR-001](../agents/decisions/ADR-001-stack-selection.md), [ADR-002](../agents/decisions/ADR-002-parser-architecture.md), and the [Architecture Overview](../agents/context/architecture-overview.md) for detailed architecture documentation.
