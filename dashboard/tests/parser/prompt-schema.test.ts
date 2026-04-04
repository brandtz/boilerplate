import { validatePromptFrontmatter } from '@/parser/schemas/prompt-schema';

describe('prompt-schema', () => {
  const validData: Record<string, unknown> = {
    prompt_id: '16.0.1',
    title: 'Implement Feature',
    status: 'ready',
    phase: 'implementation',
    epic_id: 'E3',
    story_id: 'E3-S2',
    task_ids: ['E3-S2-T1'],
    owner_role: 'Senior Software Engineer',
    prerequisites: ['15.0.1'],
    required_reading: ['docs/test.md'],
    downstream_prompts: ['17.0.1'],
    inserted_after: null,
    affects_prompts: [],
    review_required: [],
    created_at: '2026-04-03T12:00:00Z',
    updated_at: '2026-04-03T12:00:00Z',
    session_handoff: '',
    supersedes: '',
    superseded_by: '',
    insert_reason: '',
    completed_at: '',
    archived_at: '',
  };

  test('valid prompt with all fields returns valid with zero warnings', () => {
    const result = validatePromptFrontmatter(validData, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.prompt).not.toBeNull();
    expect(result.warnings).toHaveLength(0);
    expect(result.prompt?.promptId).toBe('16.0.1');
    expect(result.prompt?.status).toBe('ready');
  });

  test('missing prompt_id returns invalid with E_MISSING_REQUIRED', () => {
    const data = { ...validData, prompt_id: undefined };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
    expect(result.prompt).toBeNull();
    expect(result.warnings.some(w => w.code === 'E_MISSING_REQUIRED' && w.message.includes('prompt_id'))).toBe(true);
  });

  test('missing status returns invalid with E_MISSING_REQUIRED', () => {
    const data = { ...validData, status: undefined };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
    expect(result.warnings.some(w => w.code === 'E_MISSING_REQUIRED' && w.message.includes('status'))).toBe(true);
  });

  test('missing title returns invalid with E_MISSING_REQUIRED', () => {
    const data = { ...validData, title: '' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(false);
    expect(result.warnings.some(w => w.code === 'E_MISSING_REQUIRED' && w.message.includes('title'))).toBe(true);
  });

  test('unknown status emits W_UNKNOWN_STATUS', () => {
    const data = { ...validData, status: 'in_limbo' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'W_UNKNOWN_STATUS')).toBe(true);
  });

  test('done prompt missing completed_at emits W_OPTIONAL_MISSING', () => {
    const data = { ...validData, status: 'done', completed_at: '' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'W_OPTIONAL_MISSING' && w.message.includes('completed_at'))).toBe(true);
  });

  test('invalid date format emits W_INVALID_DATE', () => {
    const data = { ...validData, created_at: 'not-a-date' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'W_INVALID_DATE')).toBe(true);
  });

  test('valid ISO date passes without warnings', () => {
    const data = { ...validData, created_at: '2026-04-03' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.warnings.filter(w => w.code === 'W_INVALID_DATE')).toHaveLength(0);
  });

  test('task_ids as string is coerced to array', () => {
    const data = { ...validData, task_ids: 'E1-S1-T1' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.valid).toBe(true);
    expect(result.prompt?.taskIds).toEqual(['E1-S1-T1']);
  });

  test('insertedAfter null is preserved', () => {
    const data = { ...validData, inserted_after: null };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.prompt?.insertedAfter).toBeNull();
  });

  test('insertedAfter with value is preserved', () => {
    const data = { ...validData, inserted_after: '15.0.1' };
    const result = validatePromptFrontmatter(data, 'test.md');
    expect(result.prompt?.insertedAfter).toBe('15.0.1');
  });
});
