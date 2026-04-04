# Project Manager Dashboard Epics — Test Fixture

## Epic E1: Repo Data Contracts and Parsing Foundation

### E1-S1 Define and validate prompt frontmatter contract
**Status:** done
**Acceptance Criteria:**
- AC-1: All prompt YAML frontmatter fields documented
- AC-2: Validation function returns structured errors/warnings

#### Tasks
- E1-S1-T1: Define the canonical YAML schema for prompt frontmatter
- E1-S1-T2: Implement a frontmatter validator

### E1-S2 Define and validate session handoff contract
**Status:** ready
**Acceptance Criteria:**
- AC-1: All handoff YAML frontmatter fields documented

#### Tasks
- E1-S2-T1: Define the canonical YAML schema for handoff frontmatter
- E1-S2-T2: Implement a handoff frontmatter validator
- E1-S2-T3: Create example handoff files

## Epic E2: Dashboard Layout and Navigation

### E2-S1 Build app shell with navigation
**Status:** ready
**Acceptance Criteria:**
- AC-1: App shell renders with sidebar and content area

#### Tasks
- E2-S1-T1: Create AppShell component
- E2-S1-T2: Create Sidebar component
