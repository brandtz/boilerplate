import * as fs from 'fs';
import * as path from 'path';
import { parseEpicFile } from '@/parser/epic-parser';

const fixturesDir = path.join(__dirname, '..', 'fixtures');

describe('epic-parser', () => {
  test('parses epics, stories, and tasks from combined markdown', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'epics/test-epics.md'), 'utf-8');
    const { epics, warnings } = parseEpicFile('agents/epics/test.md', content);

    expect(epics).toHaveLength(2);

    // E1
    expect(epics[0].epicId).toBe('E1');
    expect(epics[0].title).toBe('Repo Data Contracts and Parsing Foundation');
    expect(epics[0].stories).toHaveLength(2);

    // E1-S1
    expect(epics[0].stories[0].storyId).toBe('E1-S1');
    expect(epics[0].stories[0].status).toBe('done');
    expect(epics[0].stories[0].tasks).toHaveLength(2);
    expect(epics[0].stories[0].tasks[0].taskId).toBe('E1-S1-T1');
    expect(epics[0].stories[0].tasks[1].taskId).toBe('E1-S1-T2');

    // E1-S2
    expect(epics[0].stories[1].storyId).toBe('E1-S2');
    expect(epics[0].stories[1].status).toBe('ready');
    expect(epics[0].stories[1].tasks).toHaveLength(3);

    // E2
    expect(epics[1].epicId).toBe('E2');
    expect(epics[1].stories).toHaveLength(1);
    expect(epics[1].stories[0].tasks).toHaveLength(2);

    expect(warnings).toHaveLength(0);
  });

  test('extracts acceptance criteria', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'epics/test-epics.md'), 'utf-8');
    const { epics } = parseEpicFile('agents/epics/test.md', content);

    expect(epics[0].stories[0].acceptanceCriteria).toHaveLength(2);
    expect(epics[0].stories[0].acceptanceCriteria[0]).toContain('AC-1');
  });

  test('derives epic status from stories', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'epics/test-epics.md'), 'utf-8');
    const { epics } = parseEpicFile('agents/epics/test.md', content);

    // E1 has one done and one ready story → status should be 'ready'
    expect(epics[0].status).toBe('ready');
  });

  test('empty content returns empty array', () => {
    const { epics, warnings } = parseEpicFile('test.md', '');
    expect(epics).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  test('story outside epic emits warning', () => {
    const content = '### E1-S1 Orphan Story\n**Status:** ready\n';
    const { epics, warnings } = parseEpicFile('test.md', content);
    expect(epics).toHaveLength(0);
    expect(warnings.some(w => w.code === 'W_EPIC_PARSE_FAIL')).toBe(true);
  });

  test('task outside story emits warning', () => {
    const content = '## Epic E1: Test\n- E1-S1-T1: Orphan task\n';
    const { warnings } = parseEpicFile('test.md', content);
    expect(warnings.some(w => w.code === 'W_EPIC_PARSE_FAIL')).toBe(true);
  });
});
