import * as fs from 'fs';
import * as path from 'path';
import { extractPrompt, extractHandoff, extractFrontmatter } from '@/parser/extractor';

const fixturesDir = path.join(__dirname, '..', 'fixtures');

function readFixture(relativePath: string): string {
  return fs.readFileSync(path.join(fixturesDir, relativePath), 'utf-8');
}

describe('extractor - prompt extraction', () => {
  test('valid complete prompt extracts correctly', () => {
    const content = readFixture('valid/prompt-complete.md');
    const { prompt, warnings } = extractPrompt('prompts/active/16.0.1.md', content);

    expect(prompt).not.toBeNull();
    expect(prompt?.promptId).toBe('16.0.1');
    expect(prompt?.title).toBe('Implement Account Dashboard Feature');
    expect(prompt?.status).toBe('ready');
    expect(prompt?.epicId).toBe('E3');
    expect(prompt?.storyId).toBe('E3-S2');
    expect(prompt?.taskIds).toEqual(['E3-S2-T1', 'E3-S2-T2']);
    expect(prompt?.role).toBe('Senior Software Engineer');
    expect(prompt?.prerequisites).toEqual(['15.0.1']);
    expect(prompt?.downstreamPrompts).toEqual(['17.0.1']);
    expect(prompt?.body).toContain('complete fixture prompt');
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('valid done prompt extracts lifecycle fields', () => {
    const content = readFixture('valid/prompt-done.md');
    const { prompt, warnings } = extractPrompt('prompts/archive/8.0.1.md', content);

    expect(prompt).not.toBeNull();
    expect(prompt?.status).toBe('done');
    expect(prompt?.completedAt).toBe('2026-04-04T10:00:00Z');
    expect(prompt?.archivedAt).toBe('2026-04-04T10:05:00Z');
    expect(prompt?.sessionHandoff).toBe('agents/handoffs/S-2026-04-04-011-review-gate.md');
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('valid minimal prompt extracts with only required fields', () => {
    const content = readFixture('valid/prompt-minimal.md');
    const { prompt, warnings } = extractPrompt('prompts/active/1.0.1.md', content);

    expect(prompt).not.toBeNull();
    expect(prompt?.promptId).toBe('1.0.1');
    expect(prompt?.title).toBe('Minimal Prompt');
    expect(prompt?.status).toBe('draft');
    expect(prompt?.taskIds).toEqual([]);
    expect(prompt?.prerequisites).toEqual([]);
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('no frontmatter returns null with I_NO_FRONTMATTER (info)', () => {
    const content = readFixture('malformed/prompt-no-frontmatter.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).toBeNull();
    expect(warnings.some(w => w.code === 'I_NO_FRONTMATTER' && w.severity === 'info')).toBe(true);
  });

  test('bad YAML returns null with E_INVALID_YAML', () => {
    const content = readFixture('malformed/prompt-bad-yaml.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).toBeNull();
    expect(warnings.some(w => w.code === 'E_INVALID_YAML')).toBe(true);
  });

  test('invalid dates emit W_INVALID_DATE', () => {
    const content = readFixture('malformed/prompt-bad-dates.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).not.toBeNull();
    expect(warnings.some(w => w.code === 'W_INVALID_DATE')).toBe(true);
  });

  test('unknown status emits W_UNKNOWN_STATUS', () => {
    const content = readFixture('malformed/prompt-unknown-status.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).not.toBeNull();
    expect(warnings.some(w => w.code === 'W_UNKNOWN_STATUS')).toBe(true);
  });

  test('missing required field returns null', () => {
    const content = readFixture('malformed/prompt-missing-required.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).toBeNull();
    expect(warnings.some(w => w.code === 'E_MISSING_REQUIRED')).toBe(true);
  });

  test('done prompt without completed_at emits W_OPTIONAL_MISSING', () => {
    const content = readFixture('malformed/prompt-done-no-completed.md');
    const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

    expect(prompt).not.toBeNull();
    expect(warnings.some(w => w.code === 'W_OPTIONAL_MISSING' && w.message.includes('completed_at'))).toBe(true);
  });

  test('prototype pollution keys are rejected', () => {
    const content = `---
prompt_id: "test.1"
title: "Test"
status: "ready"
__proto__: "malicious"
---

# Test
`;
    const { prompt, warnings } = extractPrompt('test.md', content);
    expect(prompt).not.toBeNull();
    expect(warnings.some(w => w.message.includes('__proto__'))).toBe(true);
  });
});

describe('extractor - handoff extraction', () => {
  test('valid complete handoff extracts correctly', () => {
    const content = readFixture('valid/handoff-complete.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/S-001.md', content);

    expect(handoff).not.toBeNull();
    expect(handoff?.sessionId).toBe('S-2026-04-03-001');
    expect(handoff?.promptId).toBe('16.0.1');
    expect(handoff?.statusOutcome).toBe('complete');
    expect(handoff?.completionPercent).toBe(100);
    expect(handoff?.changedFiles).toEqual(['src/components/PromptTable.tsx', 'src/components/Dashboard.tsx']);
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('valid partial handoff extracts correctly', () => {
    const content = readFixture('valid/handoff-partial.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/S-002.md', content);

    expect(handoff).not.toBeNull();
    expect(handoff?.statusOutcome).toBe('partial');
    expect(handoff?.completionPercent).toBe(50);
    expect(handoff?.blockers).toContain('Waiting for API schema finalization');
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('missing required handoff field returns null', () => {
    const content = readFixture('malformed/handoff-missing-required.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/S-bad.md', content);

    expect(handoff).toBeNull();
    expect(warnings.some(w => w.code === 'E_MISSING_REQUIRED')).toBe(true);
  });

  test('no frontmatter returns null', () => {
    const content = readFixture('malformed/prompt-no-frontmatter.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/test.md', content);

    expect(handoff).toBeNull();
    expect(warnings.some(w => w.code === 'E_NO_FRONTMATTER')).toBe(true);
  });

  test('code-fence YAML handoff extracts correctly', () => {
    const content = readFixture('valid/handoff-codefence.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/S-008.md', content);

    expect(handoff).not.toBeNull();
    expect(handoff?.sessionId).toBe('S-2026-04-03-008');
    expect(handoff?.promptId).toBe('5.0.1');
    expect(handoff?.statusOutcome).toBe('complete');
    expect(handoff?.completionPercent).toBe(100);
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });

  test('raw YAML handoff (no delimiters) extracts correctly', () => {
    const content = readFixture('valid/handoff-rawyaml.md');
    const { handoff, warnings } = extractHandoff('agents/handoffs/S-023.md', content);

    expect(handoff).not.toBeNull();
    expect(handoff?.sessionId).toBe('S-2026-04-04-023');
    expect(handoff?.promptId).toBe('20.0.1');
    expect(handoff?.statusOutcome).toBe('complete');
    expect(warnings.filter(w => w.severity === 'error')).toHaveLength(0);
  });
});

describe('extractor - extractFrontmatter dispatch', () => {
  test('dispatches to prompt extraction for prompts/active paths', () => {
    const content = readFixture('valid/prompt-complete.md');
    const result = extractFrontmatter('prompts/active/16.0.1.md', content);

    expect(result.entityType).toBe('prompt');
    expect(result.entity).not.toBeNull();
  });

  test('dispatches to handoff extraction for agents/handoffs paths', () => {
    const content = readFixture('valid/handoff-complete.md');
    const result = extractFrontmatter('agents/handoffs/S-001.md', content);

    expect(result.entityType).toBe('handoff');
    expect(result.entity).not.toBeNull();
  });
});
