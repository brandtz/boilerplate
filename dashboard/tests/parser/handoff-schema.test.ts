import { validateHandoffFrontmatter } from '@/parser/schemas/handoff-schema';

describe('handoff-schema', () => {
  const validData: Record<string, unknown> = {
    session_id: 'S-2026-04-03-001',
    prompt_id: '16.0.1',
    role: 'Senior Software Engineer',
    status_outcome: 'complete',
    completion_percent: 100,
    started_at: '2026-04-03T12:00:00Z',
    ended_at: '2026-04-03T12:24:00Z',
    changed_files: ['src/components/Test.tsx'],
    blockers: [],
    next_recommended_prompts: ['17.0.1'],
    summary: 'Completed the task.',
  };

  test('valid handoff returns valid with zero warnings', () => {
    const result = validateHandoffFrontmatter(validData, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.handoff).not.toBeNull();
    expect(result.warnings).toHaveLength(0);
    expect(result.handoff?.sessionId).toBe('S-2026-04-03-001');
  });

  test('missing session_id returns invalid with E_MISSING_REQUIRED', () => {
    const data = { ...validData, session_id: undefined };
    const result = validateHandoffFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
    expect(result.warnings.some(w => w.code === 'E_MISSING_REQUIRED' && w.message.includes('session_id'))).toBe(true);
  });

  test('missing prompt_id returns invalid', () => {
    const data = { ...validData, prompt_id: '' };
    const result = validateHandoffFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
  });

  test('missing status_outcome returns invalid', () => {
    const data = { ...validData, status_outcome: undefined };
    const result = validateHandoffFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
  });

  test('completion_percent out of range emits warning', () => {
    const data = { ...validData, completion_percent: 150 };
    const result = validateHandoffFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'W_OPTIONAL_MISSING')).toBe(true);
  });

  test('invalid date emits W_INVALID_DATE', () => {
    const data = { ...validData, started_at: 'yesterday' };
    const result = validateHandoffFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'W_INVALID_DATE')).toBe(true);
  });

  test('missing optional fields still returns valid', () => {
    const minimal = {
      session_id: 'S-001',
      prompt_id: '1.0.1',
      status_outcome: 'complete',
    };
    const result = validateHandoffFrontmatter(minimal, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.handoff?.completionPercent).toBe(0);
    expect(result.handoff?.changedFiles).toEqual([]);
  });
});
