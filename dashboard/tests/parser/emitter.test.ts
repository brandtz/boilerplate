import * as path from 'path';
import { parse, parseToJson } from '../../src/parser/index';

const SNAPSHOT_REPO = path.resolve(__dirname, '../fixtures/snapshot-repo');

describe('parse() orchestrator', () => {
  it('parses the snapshot repo and returns a valid DashboardState', async () => {
    const state = await parse(SNAPSHOT_REPO);

    // All top-level keys present
    expect(state).toHaveProperty('project');
    expect(state).toHaveProperty('summary');
    expect(state).toHaveProperty('nextPrompt');
    expect(state).toHaveProperty('epics');
    expect(state).toHaveProperty('prompts');
    expect(state).toHaveProperty('sessions');
    expect(state).toHaveProperty('warnings');
    expect(state).toHaveProperty('taskIndex');
  });

  it('finds the correct number of prompts', async () => {
    const state = await parse(SNAPSHOT_REPO);
    // 5 in active + 1 in archive = 6
    expect(state.prompts.length).toBe(6);
  });

  it('finds the correct number of handoffs', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.sessions.length).toBe(3);
  });

  it('finds the correct number of epics', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.epics.length).toBe(2);
  });

  it('returns prompts sorted by natural tuple order', async () => {
    const state = await parse(SNAPSHOT_REPO);
    const ids = state.prompts.map(p => p.promptId);
    // 0.0.1 (archive), then 1.0.1 through 5.0.1
    expect(ids).toEqual(['0.0.1', '1.0.1', '2.0.1', '3.0.1', '4.0.1', '5.0.1']);
  });

  it('correctly identifies prompt status counts', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.summary.promptsByStatus.done).toBe(4); // 0.0.1, 1.0.1, 2.0.1, 3.0.1
    expect(state.summary.promptsByStatus.ready).toBe(2); // 4.0.1, 5.0.1
  });

  it('selects the correct next prompt', async () => {
    const state = await parse(SNAPSHOT_REPO);
    // 4.0.1 and 5.0.1 are both ready with prereq 3.0.1 done
    // 4.0.1 has lower sort order
    expect(state.nextPrompt).not.toBeNull();
    expect(state.nextPrompt!.promptId).toBe('4.0.1');
  });

  it('generates rationale for next prompt', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.nextPrompt!.rationale).toContain('Prompt 4.0.1 is next');
    expect(state.nextPrompt!.rationale).toContain('2 eligible prompts');
  });

  it('builds reverse task index', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.taskIndex['E1-S1-T1']).toContain('1.0.1');
    expect(state.taskIndex['E1-S2-T3']).toContain('4.0.1');
    expect(state.taskIndex['E2-S1-T1']).toContain('5.0.1');
  });

  it('computes completion timeline from handoffs', async () => {
    const state = await parse(SNAPSHOT_REPO);
    expect(state.summary.completionTimeline.length).toBeGreaterThan(0);
    // 3 handoffs on different dates
    expect(state.summary.completionTimeline.length).toBe(3);
  });

  it('computes execution completion percentage', async () => {
    const state = await parse(SNAPSHOT_REPO);
    // 4 done out of 6 total = 67%
    expect(state.summary.executionCompletionPercent).toBe(67);
  });

  it('links handoffs to prompts correctly', async () => {
    const state = await parse(SNAPSHOT_REPO);
    const s1 = state.sessions.find(s => s.sessionId === 'S-001');
    expect(s1).toBeDefined();
    expect(s1!.promptId).toBe('1.0.1');
  });

  it('parses epic hierarchy correctly', async () => {
    const state = await parse(SNAPSHOT_REPO);
    const e1 = state.epics.find(e => e.epicId === 'E1');
    expect(e1).toBeDefined();
    expect(e1!.stories.length).toBe(2);
    expect(e1!.stories[0].tasks.length).toBe(2);
    expect(e1!.stories[1].tasks.length).toBe(3);

    const e2 = state.epics.find(e => e.epicId === 'E2');
    expect(e2).toBeDefined();
    expect(e2!.stories.length).toBe(1);
  });

  it('sets project health status', async () => {
    const state = await parse(SNAPSHOT_REPO);
    // Some prompts done, none blocked → on_track
    expect(state.project.healthStatus).toBe('on_track');
  });
});

describe('parseToJson()', () => {
  it('returns valid JSON', async () => {
    const json = await parseToJson(SNAPSHOT_REPO);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('returns deterministic output (excluding lastParsedAt)', async () => {
    const json1 = await parseToJson(SNAPSHOT_REPO);
    const json2 = await parseToJson(SNAPSHOT_REPO);
    const state1 = JSON.parse(json1);
    const state2 = JSON.parse(json2);
    // Exclude lastParsedAt since it changes each run
    state1.project.lastParsedAt = '';
    state2.project.lastParsedAt = '';
    expect(state1).toEqual(state2);
  });

  it('supports pretty printing', async () => {
    const json = await parseToJson(SNAPSHOT_REPO, true);
    // Pretty JSON has newlines and indentation
    expect(json).toContain('\n');
    expect(json).toContain('  ');
  });

  it('contains all top-level keys', async () => {
    const json = await parseToJson(SNAPSHOT_REPO);
    const state = JSON.parse(json);
    expect(Object.keys(state).sort()).toEqual([
      'epics', 'nextPrompt', 'project', 'prompts',
      'sessions', 'summary', 'taskIndex', 'warnings',
    ]);
  });

  it('produces no NaN or Infinity values', async () => {
    const json = await parseToJson(SNAPSHOT_REPO);
    expect(json).not.toContain('NaN');
    expect(json).not.toContain('Infinity');
  });
});

describe('parse() snapshot test', () => {
  it('matches expected structure snapshot', async () => {
    const state = await parse(SNAPSHOT_REPO);
    // Normalize lastParsedAt for snapshot stability
    state.project.lastParsedAt = '2026-04-04T00:00:00.000Z';

    expect(state).toMatchSnapshot();
  });
});
