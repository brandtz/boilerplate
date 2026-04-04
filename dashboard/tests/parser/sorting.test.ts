import { parsePromptIdTuple, comparePromptIds, sortPrompts } from '../../src/parser/sorting';
import type { ParsedPrompt } from '../../src/parser/types';

function makePrompt(id: string): ParsedPrompt {
  return {
    promptId: id,
    title: `Prompt ${id}`,
    phase: 'implementation',
    status: 'ready',
    epicId: '',
    storyId: '',
    taskIds: [],
    role: '',
    prerequisites: [],
    requiredReading: [],
    downstreamPrompts: [],
    insertedAfter: null,
    affectsPrompts: [],
    reviewRequired: [],
    createdAt: '',
    updatedAt: '',
    sessionHandoff: '',
    supersedes: '',
    supersededBy: '',
    insertReason: '',
    completedAt: '',
    archivedAt: '',
    body: '',
    sourcePath: `prompts/active/${id}.md`,
  };
}

describe('parsePromptIdTuple', () => {
  it('parses numeric IDs to tuples', () => {
    const result = parsePromptIdTuple('16.0.2');
    expect(result).toEqual({ numeric: true, tuple: [16, 0, 2], raw: '16.0.2' });
  });

  it('marks non-numeric IDs', () => {
    const result = parsePromptIdTuple('00_bootstrap');
    expect(result).toEqual({ numeric: false, tuple: [], raw: '00_bootstrap' });
  });

  it('handles single-part numeric IDs', () => {
    const result = parsePromptIdTuple('5');
    expect(result).toEqual({ numeric: true, tuple: [5], raw: '5' });
  });

  it('marks mixed parts as non-numeric', () => {
    const result = parsePromptIdTuple('1.0.abc');
    expect(result).toEqual({ numeric: false, tuple: [], raw: '1.0.abc' });
  });

  it('handles empty string', () => {
    const result = parsePromptIdTuple('');
    expect(result).toEqual({ numeric: false, tuple: [], raw: '' });
  });
});

describe('comparePromptIds', () => {
  it('sorts numeric IDs by tuple', () => {
    expect(comparePromptIds('1.0.1', '2.0.1')).toBeLessThan(0);
    expect(comparePromptIds('2.0.1', '1.0.1')).toBeGreaterThan(0);
  });

  it('equal IDs return 0', () => {
    expect(comparePromptIds('1.0.1', '1.0.1')).toBe(0);
  });

  it('sorts by major first, then branch, then revision', () => {
    expect(comparePromptIds('16.0.1', '16.0.2')).toBeLessThan(0);
    expect(comparePromptIds('16.0.2', '16.1.1')).toBeLessThan(0);
    expect(comparePromptIds('16.1.1', '17.0.1')).toBeLessThan(0);
  });

  it('non-numeric IDs sort before numeric', () => {
    expect(comparePromptIds('00_bootstrap', '1.0.1')).toBeLessThan(0);
    expect(comparePromptIds('1.0.1', '00_bootstrap')).toBeGreaterThan(0);
  });

  it('alphabetical among non-numeric', () => {
    expect(comparePromptIds('00_bootstrap', '00_kickoff')).toBeLessThan(0);
    expect(comparePromptIds('01_intake', '00_bootstrap')).toBeGreaterThan(0);
  });

  it('handles large numbers correctly (numeric, not string)', () => {
    expect(comparePromptIds('100.0.1', '99.0.1')).toBeGreaterThan(0);
    expect(comparePromptIds('9.0.1', '10.0.1')).toBeLessThan(0);
  });

  it('handles branching correctly', () => {
    expect(comparePromptIds('5.0.1', '5.0.2')).toBeLessThan(0);
    expect(comparePromptIds('5.0.2', '5.1.1')).toBeLessThan(0);
  });
});

describe('sortPrompts', () => {
  it('sorts basic numeric order', () => {
    const prompts = ['2.0.1', '1.0.1', '3.0.1'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['1.0.1', '2.0.1', '3.0.1']);
  });

  it('sorts insertion ordering correctly', () => {
    const prompts = ['17.0.1', '16.0.2', '16.1.1', '16.0.1'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['16.0.1', '16.0.2', '16.1.1', '17.0.1']);
  });

  it('sorts mixed non-numeric and numeric', () => {
    const prompts = ['1.0.1', '00_bootstrap', '2.0.1'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['00_bootstrap', '1.0.1', '2.0.1']);
  });

  it('sorts all non-numeric alphabetically', () => {
    const prompts = ['02_prompt_builder', '00_bootstrap', '01_intake'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['00_bootstrap', '01_intake', '02_prompt_builder']);
  });

  it('handles gaps', () => {
    const prompts = ['1.0.1', '5.0.1', '3.0.1'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['1.0.1', '3.0.1', '5.0.1']);
  });

  it('returns empty array for empty input', () => {
    expect(sortPrompts([])).toEqual([]);
  });

  it('returns single element array unchanged', () => {
    const prompts = [makePrompt('1.0.1')];
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['1.0.1']);
  });

  it('does not mutate the input array', () => {
    const prompts = ['2.0.1', '1.0.1'].map(makePrompt);
    const original = [...prompts];
    sortPrompts(prompts);
    expect(prompts.map(p => p.promptId)).toEqual(original.map(p => p.promptId));
  });

  it('handles branching within same major', () => {
    const prompts = ['5.1.1', '5.0.2', '5.0.1'].map(makePrompt);
    const sorted = sortPrompts(prompts);
    expect(sorted.map(p => p.promptId)).toEqual(['5.0.1', '5.0.2', '5.1.1']);
  });
});
