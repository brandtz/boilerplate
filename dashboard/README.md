# Project Manager Dashboard

A local-first single-page dashboard that parses boilerplate repo artifacts (markdown files with YAML frontmatter) and renders a project management cockpit. Gives the human sponsor real-time visibility into agentic AI software projects without requiring agents to report status manually.

## Tech Stack

- **Framework:** Next.js (React) with TypeScript
- **Parser:** Node.js module using `gray-matter` for YAML frontmatter extraction
- **Charts:** Chart.js with `react-chartjs-2` wrapper
- **Markdown Rendering:** `react-markdown` with `remark-gfm`
- **Styling:** Tailwind CSS
- **File Watching:** `chokidar` (local dev mode)
- **Testing:** Jest + Testing Library

## Getting Started

### Prerequisites

- Node.js v18.17+ (LTS) or v20.x
- npm v9+

### Installation

```bash
cd dashboard
npm ci
```

### Development

```bash
npm run dev
```

Dashboard available at http://localhost:3000.

### Build and Static Export

```bash
npm run build
```

Output in `out/`. Serve with any static HTTP server (e.g., `npx serve out`).

### Testing

```bash
npm test                        # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage           # With coverage report
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
