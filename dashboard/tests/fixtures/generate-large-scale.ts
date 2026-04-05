/**
 * Large-Scale Test Fixture Generator
 *
 * Generates a realistic test repository with 300+ prompts, 250+ handoffs,
 * and 10 epics for performance benchmarking.
 *
 * Usage: npx tsx tests/fixtures/generate-large-scale.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const FIXTURE_DIR = path.join(__dirname, 'large-scale');
const PROMPT_COUNT = 310;
const HANDOFF_COUNT = 260;
const EPIC_COUNT = 10;
const STORIES_PER_EPIC = 5;
const TASKS_PER_STORY = 4;

const PHASES = ['planning', 'design', 'implementation', 'validation', 'release'];
const STATUSES = ['draft', 'ready', 'in_progress', 'done', 'blocked', 'cancelled', 'superseded'];
const ROLES = [
  'Senior Software Engineer',
  'QA Test Architect',
  'Product Manager',
  'Solution Architect',
  'DevSecOps Engineer',
];
const OUTCOMES = ['complete', 'partial', 'failed'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoDate(dayOffset: number): string {
  const d = new Date('2026-04-01T00:00:00Z');
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
}

function generatePrompt(id: number, epicIdx: number, storyIdx: number): string {
  const promptId = `${id}.0.1`;
  const epicId = `E${epicIdx + 1}`;
  const storyId = `${epicId}-S${storyIdx + 1}`;
  const taskId = `${storyId}-T${(id % TASKS_PER_STORY) + 1}`;
  const status = id <= 250 ? 'done' : pickRandom(['ready', 'draft', 'in_progress', 'blocked']);
  const phase = pickRandom(PHASES);
  const role = pickRandom(ROLES);
  const prereqs = id > 1 ? [`"${id - 1}.0.1"`] : [];
  const downstream = id < PROMPT_COUNT ? [`"${id + 1}.0.1"`] : [];
  const completedAt = status === 'done' ? isoDate(Math.floor(id / 10)) : '';
  const dayOffset = Math.floor(id / 10);

  return `---
prompt_id: "${promptId}"
title: "Task ${id} — ${phase} work for ${storyId}"
phase: "${phase}"
status: "${status}"
epic_id: "${epicId}"
story_id: "${storyId}"
task_ids:
  - "${taskId}"
owner_role: "${role}"
prerequisites:
${prereqs.length > 0 ? prereqs.map((p) => `  - ${p}`).join('\n') : '  []'}
required_reading:
  - "docs/test-strategy.md"
downstream_prompts:
${downstream.length > 0 ? downstream.map((d) => `  - ${d}`).join('\n') : '  []'}
inserted_after: null
affects_prompts: []
review_required: []
created_at: "${isoDate(dayOffset)}"
updated_at: "${isoDate(dayOffset)}"
session_handoff: "${status === 'done' ? `agents/handoffs/S-perf-${id}.md` : ''}"
supersedes: ""
superseded_by: ""
insert_reason: ""
completed_at: "${completedAt}"
archived_at: ""
---

# Prompt ${promptId}: Task ${id}

## Context

Generated performance test fixture prompt ${id} of ${PROMPT_COUNT}.
This file tests parser throughput with realistic frontmatter content.

## Scope

- Perform task ${taskId} for story ${storyId}
- Validate output against acceptance criteria
- Create handoff documentation
`;
}

function generateHandoff(id: number): string {
  const promptId = `${id}.0.1`;
  const sessionId = `S-2026-04-perf-${String(id).padStart(3, '0')}`;
  const role = pickRandom(ROLES);
  const outcome = pickRandom(OUTCOMES);
  const completion = outcome === 'complete' ? 100 : outcome === 'partial' ? 50 + Math.floor(Math.random() * 40) : 0;
  const dayOffset = Math.floor(id / 10);

  return `---
session_id: "${sessionId}"
prompt_id: "${promptId}"
role: "${role}"
status_outcome: "${outcome}"
completion_percent: ${completion}
started_at: "${isoDate(dayOffset)}"
ended_at: "${isoDate(dayOffset + 1)}"
changed_files:
  - "src/module-${id}.ts"
  - "tests/module-${id}.test.ts"
blockers: []
next_recommended_prompts:
  - "${id + 1}.0.1"
summary: "Completed work on prompt ${promptId}. All tests passing."
---

# Session Handoff: ${promptId}

## Summary

Performance fixture handoff ${id} of ${HANDOFF_COUNT}.
`;
}

function generateIndexMd(): string {
  const header = `# Prompt Inventory

| ID | Title | Phase | Status | Epic | Handoff | Completed |
|---|---|---|---|---|---|---|
`;
  const rows: string[] = [];
  for (let i = 1; i <= PROMPT_COUNT; i++) {
    const epicIdx = ((i - 1) % EPIC_COUNT);
    const storyIdx = Math.floor(((i - 1) % (EPIC_COUNT * STORIES_PER_EPIC)) / EPIC_COUNT);
    const status = i <= 250 ? 'done' : 'ready';
    const handoff = status === 'done' ? `agents/handoffs/S-perf-${i}.md` : '';
    const completed = status === 'done' ? isoDate(Math.floor(i / 10)).split('T')[0] : '';
    rows.push(`| ${i}.0.1 | Task ${i} | implementation | ${status} | E${epicIdx + 1} | ${handoff} | ${completed} |`);
  }
  return header + rows.join('\n') + '\n';
}

function generateEpics(): string {
  const lines: string[] = ['# Project Epics', ''];

  for (let e = 0; e < EPIC_COUNT; e++) {
    const epicId = `E${e + 1}`;
    lines.push(`## Epic ${epicId}: Performance Test Epic ${e + 1}`);
    lines.push('');

    for (let s = 0; s < STORIES_PER_EPIC; s++) {
      const storyId = `${epicId}-S${s + 1}`;
      lines.push(`### ${storyId} Story ${s + 1} of Epic ${e + 1}`);
      lines.push(`**Status:** in_progress`);
      lines.push('');
      lines.push('**Acceptance Criteria:**');
      lines.push(`- AC-1: All tasks completed`);
      lines.push(`- AC-2: Tests passing`);
      lines.push('');
      lines.push('#### Tasks');
      for (let t = 0; t < TASKS_PER_STORY; t++) {
        lines.push(`- ${storyId}-T${t + 1}: Task ${t + 1} — status: done`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generate(): void {
  // Clean up existing
  if (fs.existsSync(FIXTURE_DIR)) {
    fs.rmSync(FIXTURE_DIR, { recursive: true });
  }

  // Create directories
  const dirs = [
    path.join(FIXTURE_DIR, 'prompts', 'active'),
    path.join(FIXTURE_DIR, 'prompts', 'archive'),
    path.join(FIXTURE_DIR, 'agents', 'epics'),
    path.join(FIXTURE_DIR, 'agents', 'handoffs'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Generate prompts
  for (let i = 1; i <= PROMPT_COUNT; i++) {
    const epicIdx = ((i - 1) % EPIC_COUNT);
    const storyIdx = Math.floor(((i - 1) % (EPIC_COUNT * STORIES_PER_EPIC)) / EPIC_COUNT);
    const filename = `${i}.0.1-task-${i}.md`;
    const dir = i <= 250
      ? path.join(FIXTURE_DIR, 'prompts', 'archive')
      : path.join(FIXTURE_DIR, 'prompts', 'active');
    fs.writeFileSync(path.join(dir, filename), generatePrompt(i, epicIdx, storyIdx));
  }

  // Generate handoffs
  for (let i = 1; i <= HANDOFF_COUNT; i++) {
    const filename = `S-perf-${i}.md`;
    fs.writeFileSync(
      path.join(FIXTURE_DIR, 'agents', 'handoffs', filename),
      generateHandoff(i),
    );
  }

  // Generate index.md
  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'prompts', 'index.md'),
    generateIndexMd(),
  );

  // Generate epics file
  fs.writeFileSync(
    path.join(FIXTURE_DIR, 'agents', 'epics', 'project-epics.md'),
    generateEpics(),
  );

  console.log(`Generated large-scale fixture:`);
  console.log(`  ${PROMPT_COUNT} prompts (250 archive + ${PROMPT_COUNT - 250} active)`);
  console.log(`  ${HANDOFF_COUNT} handoffs`);
  console.log(`  ${EPIC_COUNT} epics, ${EPIC_COUNT * STORIES_PER_EPIC} stories, ${EPIC_COUNT * STORIES_PER_EPIC * TASKS_PER_STORY} tasks`);
  console.log(`  Location: ${FIXTURE_DIR}`);
}

generate();
