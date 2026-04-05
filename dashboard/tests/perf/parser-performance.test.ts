/**
 * Performance Tests — Parser Benchmarks
 *
 * E6-S2-T2: Benchmark parser execution time with large-scale fixtures.
 *
 * Thresholds (from test-strategy.md §6.1 and epics AC):
 *   - 300+ prompts: < 2 seconds
 *   - Incremental re-parse (simulated): < 500ms
 *   - Memory: < 100MB heap
 *
 * These tests run in a separate suite via `npm run test:perf`.
 */

import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@/parser';

const LARGE_FIXTURE = path.join(__dirname, '..', 'fixtures', 'large-scale');
const SNAPSHOT_FIXTURE = path.join(__dirname, '..', 'fixtures', 'snapshot-repo');

// Thresholds
const PARSE_300_THRESHOLD_MS = 2000;
const PARSE_30_THRESHOLD_MS = 500;
const MEMORY_THRESHOLD_MB = 100;

// Ensure fixture exists
beforeAll(() => {
  if (!fs.existsSync(LARGE_FIXTURE)) {
    throw new Error(
      'Large-scale fixture not found. Run: npx tsx tests/fixtures/generate-large-scale.ts',
    );
  }
});

describe('Parser Performance — Large Scale (300+ prompts)', () => {
  let state: Awaited<ReturnType<typeof parse>>;
  let elapsedMs: number;

  beforeAll(async () => {
    // Force GC before measurement if available
    if (global.gc) global.gc();

    const start = performance.now();
    state = await parse(LARGE_FIXTURE);
    elapsedMs = performance.now() - start;
  });

  it(`should parse 300+ prompts in under ${PARSE_300_THRESHOLD_MS}ms`, () => {
    console.log(`  Parser time (${state.prompts.length} prompts): ${elapsedMs.toFixed(1)}ms`);
    expect(state.prompts.length).toBeGreaterThanOrEqual(300);
    expect(elapsedMs).toBeLessThan(PARSE_300_THRESHOLD_MS);
  });

  it('should parse all handoffs', () => {
    expect(state.sessions.length).toBeGreaterThanOrEqual(250);
  });

  it('should parse all epics', () => {
    expect(state.epics.length).toBeGreaterThanOrEqual(10);
  });

  it('should produce a valid DashboardState', () => {
    expect(state.project).toBeDefined();
    expect(state.summary).toBeDefined();
    expect(state.project.totalPrompts).toBeGreaterThanOrEqual(300);
    expect(state.project.totalHandoffs).toBeGreaterThanOrEqual(250);
    expect(state.project.totalEpics).toBeGreaterThanOrEqual(10);
  });

  it('should compute correct metrics', () => {
    const { summary } = state;
    expect(summary.completedPrompts).toBeGreaterThan(0);
    expect(summary.scopeCompletionPercent).toBeGreaterThanOrEqual(0);
    expect(summary.scopeCompletionPercent).toBeLessThanOrEqual(100);
  });

  it('should handle warnings without crashing', () => {
    expect(Array.isArray(state.warnings)).toBe(true);
  });
});

describe('Parser Performance — Small Scale (snapshot repo)', () => {
  it(`should parse a small repo in under ${PARSE_30_THRESHOLD_MS}ms`, async () => {
    const start = performance.now();
    const state = await parse(SNAPSHOT_FIXTURE);
    const elapsed = performance.now() - start;

    console.log(`  Parser time (${state.prompts.length} prompts): ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(PARSE_30_THRESHOLD_MS);
  });
});

describe('Parser Performance — Repeated Parse (simulated incremental)', () => {
  it('should re-parse the large fixture in under 2s on second run', async () => {
    // First parse (warm up filesystem cache)
    await parse(LARGE_FIXTURE);

    // Second parse (simulates incremental with warm cache)
    const start = performance.now();
    await parse(LARGE_FIXTURE);
    const elapsed = performance.now() - start;

    console.log(`  Re-parse time: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(PARSE_300_THRESHOLD_MS);
  });
});

describe('Parser Performance — Memory', () => {
  it(`should use less than ${MEMORY_THRESHOLD_MB}MB heap for 300+ prompts`, async () => {
    if (global.gc) global.gc();
    const before = process.memoryUsage().heapUsed;

    await parse(LARGE_FIXTURE);

    const after = process.memoryUsage().heapUsed;
    const deltaMB = (after - before) / (1024 * 1024);

    console.log(`  Memory delta: ${deltaMB.toFixed(1)}MB`);
    expect(deltaMB).toBeLessThan(MEMORY_THRESHOLD_MB);
  });
});

describe('Parser Performance — Throughput', () => {
  it('should log throughput metrics', async () => {
    const start = performance.now();
    const state = await parse(LARGE_FIXTURE);
    const elapsed = performance.now() - start;

    const promptsPerSec = (state.prompts.length / elapsed) * 1000;
    const filesTotal =
      state.prompts.length + state.sessions.length + state.epics.length;
    const filesPerSec = (filesTotal / elapsed) * 1000;

    console.log(`  Throughput: ${promptsPerSec.toFixed(0)} prompts/sec`);
    console.log(`  Throughput: ${filesPerSec.toFixed(0)} total files/sec`);
    console.log(
      `  Total: ${state.prompts.length} prompts, ${state.sessions.length} handoffs, ${state.epics.length} epics = ${filesTotal} files in ${elapsed.toFixed(1)}ms`,
    );

    // Sanity: at least 100 prompts/sec
    expect(promptsPerSec).toBeGreaterThan(100);
  });
});
