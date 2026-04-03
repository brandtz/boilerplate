# Operational Review — Project Manager Dashboard v1

> **Review Date:** 2026-04-03
> **Reviewer:** DevOps SRE Engineer (Prompt 6.0.1)
> **Scope:** Local development setup, build pipeline, static export, file watching, CI/CD recommendations, project scaffolding
> **Status:** Complete

---

## Executive Summary

This operational review defines the developer experience for building, running, and testing the Project Manager Dashboard locally. It covers project scaffolding, local development workflow, static export requirements, file watcher configuration, and CI/CD pipeline recommendations. The review is requirements-focused — no build scripts or pipelines are implemented here.

The approved technology stack (Next.js + TypeScript + Chart.js + Tailwind CSS) is well-suited for local-only operation. The `next dev` server provides instant feedback during development, and `next export` produces a fully static site that can be opened directly from the filesystem or served by any HTTP server.

---

## 1. Project Scaffolding Structure

The dashboard application code should be organized as a Next.js project within the repository. The recommended layout separates parser logic from UI components and keeps the dashboard self-contained.

### Recommended Folder Layout

```text
dashboard/
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                        # Next.js App Router (or pages/)
│   │   ├── layout.tsx              # Root layout (shell, sidebar, status bar)
│   │   ├── page.tsx                # Overview view (/)
│   │   ├── epics/
│   │   │   └── page.tsx            # Epics view (/epics)
│   │   ├── prompts/
│   │   │   └── page.tsx            # Prompt Inventory view (/prompts)
│   │   ├── sessions/
│   │   │   └── page.tsx            # Session History view (/sessions)
│   │   └── tasks/
│   │       └── page.tsx            # Task Graph view (/tasks)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Header + sidebar + main + status bar
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── charts/
│   │   │   ├── EpicCompletionChart.tsx
│   │   │   ├── PromptStatusChart.tsx
│   │   │   └── SessionThroughputChart.tsx
│   │   ├── shared/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   └── views/
│   │       ├── OverviewView.tsx
│   │       ├── EpicsView.tsx
│   │       ├── PromptsView.tsx
│   │       ├── SessionsView.tsx
│   │       └── TasksView.tsx
│   ├── context/
│   │   └── DashboardContext.tsx     # React Context + useReducer for DashboardState
│   ├── hooks/
│   │   ├── useDashboardState.ts
│   │   └── useFileWatcher.ts
│   ├── lib/
│   │   └── constants.ts            # STATUS_THEME map, config values
│   ├── parser/
│   │   ├── index.ts                # Parser entry point
│   │   ├── scanner.ts              # Layer 1: File Scanner
│   │   ├── extractor.ts            # Layer 2: Frontmatter Extractor & Validator
│   │   ├── graph-builder.ts        # Layer 3: Graph Builder & Eligibility Engine
│   │   ├── types.ts                # ParsedPrompt, ParsedHandoff, DashboardState, etc.
│   │   └── schemas/                # Validation schemas for frontmatter fields
│   │       ├── prompt-schema.ts
│   │       ├── handoff-schema.ts
│   │       └── epic-schema.ts
│   ├── styles/
│   │   └── globals.css             # Tailwind directives + any global styles
│   └── types/
│       └── index.ts                # Shared TypeScript type exports
├── tests/
│   ├── parser/
│   │   ├── scanner.test.ts
│   │   ├── extractor.test.ts
│   │   └── graph-builder.test.ts
│   ├── components/
│   │   └── ...                     # Component tests
│   └── fixtures/
│       ├── valid-prompt.md
│       ├── malformed-prompt.md
│       ├── adversarial-yaml.md     # Security test fixtures (per 5.0.1)
│       └── sample-repo/            # Mini repo structure for integration tests
└── out/                            # Static export output (git-ignored)
```

### Key Scaffolding Decisions

| Decision | Rationale |
|----------|-----------|
| Dashboard code lives in `dashboard/` subdirectory | Keeps app code separate from repo management artifacts (agents/, prompts/, docs/) |
| Parser is co-located in `src/parser/` | Allows import as a library by the UI and future extraction as a standalone package |
| App Router preferred over Pages Router | Next.js App Router is the current standard; supports layouts, loading states, error boundaries natively |
| Tests live in `tests/` at project root | Follows common convention; avoids cluttering `src/` with test files |
| Fixtures directory for parser testing | Supports ADR-002 Key Design Rule 6 (each layer independently testable with fixtures) |
| `out/` directory for static export | Standard Next.js export output directory; must be git-ignored |

---

## 2. Local Development Workflow

### Prerequisites

- **Node.js:** v18.17+ (LTS) or v20.x (recommended)
- **npm:** v9+ (ships with Node.js 18+)
- **Git:** For repository management
- **OS:** macOS, Linux, or Windows (WSL recommended on Windows)

### Step-by-Step Workflow

#### 2.1 Initial Setup (one-time)

```bash
# Clone the repository
git clone <repo-url>
cd boilerplate

# Navigate to the dashboard project
cd dashboard

# Install dependencies (uses package-lock.json for reproducibility)
npm ci

# Verify installation
npm run type-check
```

#### 2.2 Development Server

```bash
# Start the Next.js development server
npm run dev

# Dashboard available at http://localhost:3000
# Hot module replacement (HMR) enabled for instant feedback
# File watcher (chokidar) monitors repo directories for changes
```

#### 2.3 Build and Static Export

```bash
# Run production build
npm run build

# Generate static export
npm run export

# Output in dashboard/out/
# Can be opened directly: open out/index.html
# Or served locally: npx serve out
```

#### 2.4 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run parser tests only
npm test -- --testPathPattern=parser

# Run with coverage
npm run test:coverage
```

#### 2.5 Linting and Type Checking

```bash
# Lint all source files
npm run lint

# Type-check without emitting
npm run type-check

# Fix auto-fixable lint issues
npm run lint:fix
```

#### 2.6 Parser CLI (standalone)

```bash
# Run parser directly against a repo
npx dashboard-parse --repo ../.. --output dashboard-state.json

# Run parser against the current repo (from dashboard/)
npx dashboard-parse --repo .. --output dashboard-state.json
```

### Recommended `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next build && next export",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "parse": "ts-node src/parser/index.ts"
  }
}
```

> **Note on `next export`:** As of Next.js 13.3+, static export is configured via `output: 'export'` in `next.config.js` and runs as part of `next build`. The separate `next export` command is deprecated. The `export` script above should be updated during scaffolding (prompt 11.0.1) to match the installed Next.js version.

---

## 3. Static Export Requirements

The dashboard's primary deployment mode is static export — a fully pre-rendered HTML/CSS/JS bundle with no server runtime.

### Requirements

| Requirement | Description | Constraint |
|-------------|-------------|------------|
| SE-1 | Static export must produce a self-contained `out/` directory | C1, C2 |
| SE-2 | All pages must be statically exportable (no SSR-only features) | C2 |
| SE-3 | No API routes (`/api/*`) in the exported build | C1 |
| SE-4 | No `getServerSideProps` usage — only `getStaticProps` or client-side data fetching | C2 |
| SE-5 | Parser runs client-side on page load, not at build time | Parser needs access to live repo state |
| SE-6 | Static export should be servable by any static HTTP server (nginx, serve, Python http.server) | C2 |
| SE-7 | Static export should also work when opened directly from the filesystem (`file://` protocol) | C2 (ideal, may require `basePath` configuration) |
| SE-8 | Bundle size must stay under 500KB gzipped total | ADR-001 condition |
| SE-9 | Chart.js must be lazy-loaded to reduce initial bundle size | Architecture overview performance constraint |

### Next.js Configuration for Static Export

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Enable static export
  trailingSlash: true,        // Required for file:// protocol compatibility
  images: {
    unoptimized: true,        // Required for static export (no image optimization server)
  },
  // basePath can be set if dashboard is served from a subdirectory
};

module.exports = nextConfig;
```

### File Protocol Considerations

For `file://` protocol access (opening `out/index.html` directly):
- `trailingSlash: true` generates `index.html` files in directories, enabling file:// navigation
- All asset references must be relative (no absolute `/` paths)
- CSP meta tag must account for `file://` origin
- The parser must use the File System Access API or be pre-loaded with data when running from file://

> **Recommendation:** Support `file://` as a best-effort target. The primary local mode is `npm run dev` (dev server) or `npx serve out` (static server). Direct file:// access has browser security restrictions that may limit parser functionality.

---

## 4. File Watcher Configuration

The file watcher (chokidar) monitors repository directories for changes and triggers a re-parse of the dashboard state.

### Configuration Requirements

| Requirement | Value | Source |
|-------------|-------|--------|
| FW-1 | Debounce interval: 500ms minimum | E5-S2, ADR-001 condition |
| FW-2 | Escalating debounce: 2–5s for batch changes (>10 files) | Security review LOW-003 |
| FW-3 | Disable symlink following: `followSymlinks: false` | Security review MED-002, R18 |
| FW-4 | Watched directories: `prompts/`, `agents/epics/`, `agents/handoffs/`, `agents/context/`, `schemas/` | ADR-002 directory scanning |
| FW-5 | File patterns: `**/*.md`, `**/*.json` | ADR-002 file patterns |
| FW-6 | Ignore patterns: `node_modules/`, `.git/`, `out/`, `dashboard/` | Standard exclusions |
| FW-7 | Cancel in-progress parse when new changes arrive | Avoid queuing stale parses |
| FW-8 | Trigger full parser pipeline on change | Parser is stateless (ADR-002 Rule 3) |
| FW-9 | Only active in dev mode (`npm run dev`), not in static export | Static export is a point-in-time snapshot |

### Recommended chokidar Configuration

```typescript
// Conceptual configuration — not implementation code
const watcherConfig = {
  paths: [
    '../prompts/',
    '../agents/epics/',
    '../agents/handoffs/',
    '../agents/context/',
    '../schemas/',
  ],
  options: {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    followSymlinks: false,      // R18 mitigation
    depth: 3,                   // Limit recursion depth
    awaitWriteFinish: {
      stabilityThreshold: 300,  // Wait for write to finish
      pollInterval: 100,
    },
  },
  debounce: {
    singleFile: 500,            // 500ms for individual changes
    batchThreshold: 10,         // Files changed within window
    batchDebounce: 3000,        // 3s debounce for batch changes
  },
};
```

### Integration with React State

The file watcher triggers the following flow:
1. chokidar detects file change(s)
2. Debounce timer fires
3. Cancel any in-progress parse
4. Execute full parser pipeline (stateless, fresh run)
5. Dispatch new `DashboardState` to React Context
6. All views re-render from new state
7. Status bar updates "Last parsed" timestamp

---

## 5. CI/CD Pipeline Recommendations

While CI/CD is not implemented in v1, the following pipeline structure is recommended for when automated builds are introduced.

### Recommended Pipeline Stages

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Install    │───▶│    Lint      │───▶│    Test      │───▶│    Build     │───▶│   Deploy     │
│              │    │              │    │              │    │              │    │  (optional)  │
│  npm ci      │    │  next lint   │    │  jest        │    │  next build  │    │  Upload      │
│              │    │  tsc --noEmit│    │  coverage    │    │  (export)    │    │  artifact    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Stage Details

#### 5.1 Install

```yaml
# GitHub Actions example (not implemented — for future reference)
- name: Install dependencies
  run: npm ci
  working-directory: dashboard
```

- Use `npm ci` (not `npm install`) for reproducible builds
- Cache `node_modules` using actions/cache with `package-lock.json` hash
- Pin Node.js version using actions/setup-node

#### 5.2 Lint

- Run `next lint` for ESLint checks
- Run `tsc --noEmit` for TypeScript type checking
- Fail the pipeline on any lint error or type error
- Consider adding Prettier for consistent formatting

#### 5.3 Test

- Run `jest` with coverage reporting
- Set minimum coverage thresholds (recommended: 80% line coverage for parser, 60% for UI components)
- Include parser fixture tests (valid, malformed, adversarial YAML per security review)
- Consider separate test stages: unit tests (fast) → integration tests (parser + fixtures)

#### 5.4 Build

- Run `next build` with `output: 'export'` configuration
- Verify bundle size stays under 500KB gzipped
- Archive `out/` directory as a build artifact
- Run `npm audit` and fail on high/critical vulnerabilities

#### 5.5 Deploy (optional, future)

- Upload `out/` as a GitHub Pages artifact or release asset
- Not required for v1 (local-only constraint C2)
- If implemented, add environment-specific configuration via build-time env vars

### Recommended GitHub Actions Workflow Structure

```text
.github/
  workflows/
    ci.yml                  # Lint + test + build on every PR
    release.yml             # Build + bundle analysis on tagged releases (future)
```

### CI Matrix

| Trigger | Stages | Purpose |
|---------|--------|---------|
| Pull request | Install → Lint → Test → Build | Validate changes before merge |
| Push to main | Install → Lint → Test → Build → Bundle analysis | Ensure main is always clean |
| Tag/release | Full pipeline + artifact upload | Produce distributable static export |

### Security in CI

Per security review (prompt 5.0.1):
- Run `npm audit` in the Install stage; fail on high/critical findings
- Pin all GitHub Actions to SHA hashes (not tags) to prevent supply chain attacks
- Use `package-lock.json` with `npm ci` for deterministic installs
- Consider Dependabot or Renovate for automated dependency updates

---

## 6. Environment Configuration

### Environment Variables

The dashboard is a local-only application with minimal configuration needs. All configuration should use sensible defaults with optional overrides.

| Variable | Default | Purpose |
|----------|---------|---------|
| `DASHBOARD_REPO_ROOT` | `..` (parent of dashboard/) | Root directory of the repository to parse |
| `DASHBOARD_PORT` | `3000` | Development server port |
| `NEXT_PUBLIC_BASE_PATH` | `` (empty) | Base path for static export serving from subdirectory |

### Configuration File

```javascript
// src/lib/config.ts (conceptual)
const config = {
  repoRoot: process.env.DASHBOARD_REPO_ROOT || '..',
  port: parseInt(process.env.DASHBOARD_PORT || '3000', 10),
  watcher: {
    enabled: process.env.NODE_ENV === 'development',
    debounceMs: 500,
    batchDebounceMs: 3000,
    batchThreshold: 10,
  },
  parser: {
    maxFileSize: 1024 * 1024,   // 1MB per file
    maxFiles: 1000,              // Safety limit
    followSymlinks: false,       // R18
  },
};
```

---

## 7. Development Tools and Quality Gates

### Recommended Tooling

| Tool | Purpose | Configuration |
|------|---------|---------------|
| ESLint | Code quality and consistency | `next lint` default + TypeScript rules |
| Prettier | Code formatting | Consistent formatting across all files |
| TypeScript | Type safety | `strict: true` in tsconfig.json |
| Jest | Testing framework | With ts-jest for TypeScript support |
| Testing Library | Component testing | @testing-library/react for UI tests |
| Husky | Git hooks | Pre-commit: lint-staged; pre-push: type-check |
| lint-staged | Staged file linting | Run ESLint + Prettier on staged files only |

### Pre-Commit Hooks

```text
Pre-commit:
  ├── lint-staged (ESLint + Prettier on staged files)
  └── type-check (tsc --noEmit) [optional, can be slow]

Pre-push:
  ├── npm test (full test suite)
  └── npm run build (verify build succeeds)
```

### Quality Gates Summary

| Gate | When | Blocking? |
|------|------|-----------|
| ESLint (no errors) | Pre-commit, CI | Yes |
| TypeScript (no type errors) | Pre-commit, CI | Yes |
| Prettier (formatting) | Pre-commit | Yes |
| Unit tests pass | Pre-push, CI | Yes |
| Test coverage ≥ threshold | CI | Yes |
| Bundle size < 500KB gzip | CI | Yes (warning in dev) |
| `npm audit` clean | CI | Yes (high/critical) |

---

## 8. Performance Monitoring Recommendations

### Bundle Size Tracking

- Use `@next/bundle-analyzer` to visualize bundle composition
- Set a 500KB gzipped budget (per architecture overview)
- Chart.js should be lazy-loaded (dynamic import) to reduce initial page load
- Track bundle size in CI; alert on regressions exceeding 10%

### Parser Performance

- Benchmark parser on repos with 250+ prompts (constraint C7)
- Target: full parse under 2 seconds for 300-file repo
- If performance degrades, consider incremental parsing or worker threads
- Profile with Node.js `--prof` flag during development

---

## 9. Risk Considerations

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Node.js version mismatch across team members | Medium | Low | Document minimum version; use `.nvmrc` or `.node-version` file |
| `npm install` vs `npm ci` drift | Medium | Medium | Document `npm ci` as the standard; lint-staged pre-commit prevents lock file drift |
| Dev server port conflicts | Low | Low | Configurable via `DASHBOARD_PORT` env var |
| Large repos slow down file watcher | Low | Medium | Limit watch depth; use chokidar ignore patterns; escalating debounce |
| Static export breaks on Next.js upgrade | Low | Medium | Pin Next.js version; test export in CI |
| `file://` protocol limitations | Medium | Low | Document as best-effort; recommend `npx serve out` for local viewing |

### Cross-References to Security Review

The following security review findings (prompt 5.0.1) have operational implications:

| Finding | Operational Impact |
|---------|-------------------|
| HIGH-001 (Path traversal) | Repo root configuration must be validated; see Environment Configuration section |
| MED-002 (Symlink traversal) | chokidar must set `followSymlinks: false`; see File Watcher Configuration |
| MED-003 (Supply chain) | `npm ci` + `npm audit` in CI; lock file committed |
| LOW-003 (File watcher DoS) | Escalating debounce; cancel in-progress parses |

---

## 10. Recommendations Summary

### Must-Have (for prompt 11.0.1 scaffolding)

1. Create `dashboard/` project directory with the scaffolding structure defined in Section 1
2. Initialize Next.js project with TypeScript, Tailwind CSS, and ESLint
3. Configure `next.config.js` for static export (`output: 'export'`)
4. Set up Jest with ts-jest for TypeScript testing
5. Create `.nvmrc` or `.node-version` file specifying Node.js ≥ 18.17
6. Commit `package-lock.json` for reproducible builds
7. Add `out/` to `.gitignore`

### Should-Have (for early implementation prompts)

8. Set up Husky + lint-staged for pre-commit hooks
9. Configure Prettier for consistent formatting
10. Set up `@next/bundle-analyzer` for bundle size monitoring
11. Create parser test fixtures directory with valid, malformed, and adversarial samples
12. Document all `npm run` scripts in a `dashboard/README.md`

### Nice-to-Have (for hardening/release prompts)

13. GitHub Actions CI workflow (`ci.yml`)
14. Automated dependency updates (Dependabot/Renovate)
15. Bundle size regression alerting in CI
16. Performance benchmarking harness for parser

---

## Conclusion

The approved technology stack and architecture are well-suited for local-only operation. Next.js provides both the development server and static export capabilities required by constraints C1 and C2. The recommended scaffolding structure cleanly separates parser logic from UI components, and the parser's co-location in `src/parser/` enables both library import and future standalone extraction.

The primary local development workflow — `npm ci` → `npm run dev` → browser at localhost:3000 — is straightforward and requires no infrastructure beyond Node.js. Static export via `next build` produces a distributable bundle that can be served by any HTTP server or (best-effort) opened directly from the filesystem.

**Decision: PROCEED** — No operational blockers identified. Scaffolding can begin in prompt 11.0.1.
