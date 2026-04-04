import {
  checkPrerequisites,
  resolvePrerequisites,
  selectNextPrompt,
  generateRationale,
  generateNoEligibleRationale,
  buildDownstreamMap,
  detectInsertionImpacts,
} from '../../src/parser/eligibility';
import type { ParsedPrompt } from '../../src/parser/types';

function makePrompt(overrides: Partial<ParsedPrompt> & { promptId: string }): ParsedPrompt {
  return {
    title: `Prompt ${overrides.promptId}`,
    phase: 'implementation',
    status: 'ready',
    epicId: 'E1',
    storyId: 'E1-S1',
    taskIds: [],
    role: 'Senior Software Engineer',
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
    sourcePath: `prompts/active/${overrides.promptId}.md`,
    ...overrides,
  };
}

function toMap(prompts: ParsedPrompt[]): Map<string, ParsedPrompt> {
  const map = new Map<string, ParsedPrompt>();
  for (const p of prompts) {
    map.set(p.promptId, p);
  }
  return map;
}

// =============================================================================
// checkPrerequisites
// =============================================================================

describe('checkPrerequisites', () => {
  it('returns met when all prerequisites are done', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'done' }),
      makePrompt({ promptId: '3.0.1', prerequisites: ['1.0.1', '2.0.1'] }),
    ];
    const map = toMap(prompts);
    const result = checkPrerequisites(prompts[2], map);
    expect(result.met).toBe(true);
    expect(result.metCount).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.unmet).toEqual([]);
  });

  it('returns not met when a prerequisite is not done', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'ready' }),
      makePrompt({ promptId: '3.0.1', prerequisites: ['1.0.1', '2.0.1'] }),
    ];
    const map = toMap(prompts);
    const result = checkPrerequisites(prompts[2], map);
    expect(result.met).toBe(false);
    expect(result.metCount).toBe(1);
    expect(result.unmet).toEqual(['2.0.1']);
  });

  it('returns not met when prerequisite does not exist', () => {
    const prompts = [
      makePrompt({ promptId: '2.0.1', prerequisites: ['1.0.1'] }),
    ];
    const map = toMap(prompts);
    const result = checkPrerequisites(prompts[0], map);
    expect(result.met).toBe(false);
    expect(result.unmet).toEqual(['1.0.1']);
  });

  it('returns met when no prerequisites', () => {
    const prompt = makePrompt({ promptId: '1.0.1', prerequisites: [] });
    const result = checkPrerequisites(prompt, toMap([prompt]));
    expect(result.met).toBe(true);
    expect(result.totalCount).toBe(0);
  });
});

// =============================================================================
// resolvePrerequisites
// =============================================================================

describe('resolvePrerequisites', () => {
  it('categorizes eligible prompts', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['1.0.1'] }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.eligible.map(p => p.promptId)).toEqual(['2.0.1']);
    expect(result.blocked).toEqual([]);
    expect(result.waiting).toEqual([]);
  });

  it('categorizes waiting prompts when prerequisites are unmet', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'ready' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['1.0.1'] }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.eligible.map(p => p.promptId)).toEqual(['1.0.1']);
    expect(result.waiting.map(p => p.promptId)).toEqual(['2.0.1']);
  });

  it('categorizes blocked prompts', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'blocked' }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.blocked.map(p => p.promptId)).toEqual(['1.0.1']);
    expect(result.eligible).toEqual([]);
  });

  it('skips terminal prompts (done, superseded, cancelled)', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'superseded' }),
      makePrompt({ promptId: '3.0.1', status: 'cancelled' }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.eligible).toEqual([]);
    expect(result.blocked).toEqual([]);
    expect(result.waiting).toEqual([]);
  });

  it('skips prompts in archive/', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({
        promptId: '2.0.1',
        status: 'ready',
        prerequisites: ['1.0.1'],
        sourcePath: 'prompts/archive/2.0.1.md',
      }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.eligible).toEqual([]);
  });

  it('skips in_progress prompts (not eligible)', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'in_progress' }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.eligible).toEqual([]);
  });

  it('emits warning for non-existent prerequisite', () => {
    const prompts = [
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['nonexistent'] }),
    ];
    const result = resolvePrerequisites(toMap(prompts));
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].code).toBe('W_PREREQ_NOT_FOUND');
  });

  it('handles empty prompt map', () => {
    const result = resolvePrerequisites(new Map());
    expect(result.eligible).toEqual([]);
    expect(result.blocked).toEqual([]);
    expect(result.waiting).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});

// =============================================================================
// selectNextPrompt
// =============================================================================

describe('selectNextPrompt', () => {
  it('selects the lowest sort order prompt', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '3.0.1', status: 'ready', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['1.0.1'] }),
    ];
    const map = toMap(prompts);
    const eligible = [prompts[1], prompts[2]];
    const result = selectNextPrompt(eligible, map);
    expect(result).not.toBeNull();
    expect(result!.promptId).toBe('2.0.1');
  });

  it('returns null when no eligible prompts', () => {
    const result = selectNextPrompt([], new Map());
    expect(result).toBeNull();
  });

  it('selects single eligible prompt', () => {
    const prompts = [
      makePrompt({ promptId: '5.0.1', status: 'ready' }),
    ];
    const map = toMap(prompts);
    const result = selectNextPrompt(prompts, map);
    expect(result).not.toBeNull();
    expect(result!.promptId).toBe('5.0.1');
    expect(result!.eligibleCount).toBe(1);
  });

  it('applies tiebreaker: more downstream wins for same major prefix', () => {
    // 5.0.1 unblocks 6.0.1; 5.0.2 unblocks 6.0.1 AND 7.0.1
    const prompts = [
      makePrompt({ promptId: '5.0.1', status: 'ready' }),
      makePrompt({ promptId: '5.0.2', status: 'ready' }),
      makePrompt({ promptId: '6.0.1', status: 'ready', prerequisites: ['5.0.1', '5.0.2'] }),
      makePrompt({ promptId: '7.0.1', status: 'ready', prerequisites: ['5.0.2'] }),
    ];
    const map = toMap(prompts);
    const eligible = [prompts[0], prompts[1]];
    const result = selectNextPrompt(eligible, map);
    expect(result).not.toBeNull();
    // 5.0.2 has 2 downstream (6.0.1, 7.0.1), 5.0.1 has 1 (6.0.1)
    expect(result!.promptId).toBe('5.0.2');
  });

  it('builds correct NextPromptInfo fields', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['1.0.1'], role: 'Engineer' }),
      makePrompt({ promptId: '3.0.1', status: 'ready', prerequisites: ['2.0.1'] }),
    ];
    const map = toMap(prompts);
    const eligible = [prompts[1]];
    const result = selectNextPrompt(eligible, map);
    expect(result).not.toBeNull();
    expect(result!.prerequisitesMet).toBe(1);
    expect(result!.totalPrerequisites).toBe(1);
    expect(result!.eligibleCount).toBe(1);
    expect(result!.downstreamCount).toBe(1);
    expect(result!.ownerRole).toBe('Engineer');
  });
});

// =============================================================================
// generateRationale / generateNoEligibleRationale
// =============================================================================

describe('generateRationale', () => {
  it('produces correct format', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '3.0.1', status: 'ready', prerequisites: ['2.0.1'] }),
    ];
    const map = toMap(prompts);
    const rationale = generateRationale(prompts[1], 1, map);
    expect(rationale).toBe(
      'Prompt 2.0.1 is next because: all 1 prerequisites are met, it has the lowest sequence number among 1 eligible prompts, and it unblocks 1 downstream prompt(s).'
    );
  });
});

describe('generateNoEligibleRationale', () => {
  it('produces correct format', () => {
    const rationale = generateNoEligibleRationale(2, 5);
    expect(rationale).toBe(
      'No prompts are currently eligible. 2 prompt(s) are blocked, 5 are awaiting prerequisite completion.'
    );
  });

  it('handles zero counts', () => {
    const rationale = generateNoEligibleRationale(0, 0);
    expect(rationale).toBe(
      'No prompts are currently eligible. 0 prompt(s) are blocked, 0 are awaiting prerequisite completion.'
    );
  });
});

// =============================================================================
// buildDownstreamMap
// =============================================================================

describe('buildDownstreamMap', () => {
  it('builds correct downstream map for linear chain', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1' }),
      makePrompt({ promptId: '2.0.1', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '3.0.1', prerequisites: ['2.0.1'] }),
    ];
    const map = toMap(prompts);
    const downstream = buildDownstreamMap(map);
    expect(downstream.get('1.0.1')).toEqual(['2.0.1']);
    expect(downstream.get('2.0.1')).toEqual(['3.0.1']);
    expect(downstream.get('3.0.1')).toEqual([]);
  });

  it('handles branching prerequisites', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1' }),
      makePrompt({ promptId: '2.0.1' }),
      makePrompt({ promptId: '3.0.1', prerequisites: ['1.0.1', '2.0.1'] }),
    ];
    const map = toMap(prompts);
    const downstream = buildDownstreamMap(map);
    expect(downstream.get('1.0.1')).toContain('3.0.1');
    expect(downstream.get('2.0.1')).toContain('3.0.1');
  });

  it('returns empty arrays for prompts with no downstream', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1' }),
    ];
    const map = toMap(prompts);
    const downstream = buildDownstreamMap(map);
    expect(downstream.get('1.0.1')).toEqual([]);
  });

  it('handles empty map', () => {
    const downstream = buildDownstreamMap(new Map());
    expect(downstream.size).toBe(0);
  });
});

// =============================================================================
// detectInsertionImpacts
// =============================================================================

describe('detectInsertionImpacts', () => {
  it('no warnings when all prerequisites exist', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1' }),
      makePrompt({ promptId: '2.0.1', prerequisites: ['1.0.1'] }),
    ];
    const warnings = detectInsertionImpacts(toMap(prompts));
    expect(warnings).toEqual([]);
  });

  it('warns on missing prerequisite', () => {
    const prompts = [
      makePrompt({ promptId: '2.0.1', prerequisites: ['nonexistent'] }),
    ];
    const warnings = detectInsertionImpacts(toMap(prompts));
    expect(warnings.length).toBe(1);
    expect(warnings[0].code).toBe('W_PREREQ_NOT_FOUND');
  });

  it('warns on missing insertedAfter reference', () => {
    const prompts = [
      makePrompt({ promptId: '2.0.1', insertedAfter: 'nonexistent' }),
    ];
    const warnings = detectInsertionImpacts(toMap(prompts));
    expect(warnings.length).toBe(1);
    expect(warnings[0].code).toBe('W_PREREQ_NOT_FOUND');
    expect(warnings[0].message).toContain('insertedAfter');
  });

  it('no warning when insertedAfter exists', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1' }),
      makePrompt({ promptId: '1.0.2', insertedAfter: '1.0.1' }),
    ];
    const warnings = detectInsertionImpacts(toMap(prompts));
    expect(warnings).toEqual([]);
  });
});

// =============================================================================
// Integration tests with multi-prompt dependency graph
// =============================================================================

describe('Integration: multi-prompt dependency graph', () => {
  it('linear chain: first 2 done → prompt 3 is next', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'done', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '3.0.1', status: 'ready', prerequisites: ['2.0.1'] }),
      makePrompt({ promptId: '4.0.1', status: 'ready', prerequisites: ['3.0.1'] }),
      makePrompt({ promptId: '5.0.1', status: 'ready', prerequisites: ['4.0.1'] }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    const next = selectNextPrompt(resolved.eligible, map);
    expect(next).not.toBeNull();
    expect(next!.promptId).toBe('3.0.1');
  });

  it('branching prerequisites: only 1 of 2 done → not eligible', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'ready' }),
      makePrompt({ promptId: '3.0.1', status: 'ready', prerequisites: ['1.0.1', '2.0.1'] }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    expect(resolved.eligible.map(p => p.promptId)).toContain('2.0.1');
    expect(resolved.eligible.map(p => p.promptId)).not.toContain('3.0.1');
    expect(resolved.waiting.map(p => p.promptId)).toContain('3.0.1');
  });

  it('inserted prompt: correct sort and selection', () => {
    const prompts = [
      makePrompt({ promptId: '5.0.1', status: 'done' }),
      makePrompt({ promptId: '5.0.2', status: 'ready', prerequisites: ['5.0.1'], insertedAfter: '5.0.1' }),
      makePrompt({ promptId: '6.0.1', status: 'ready', prerequisites: ['5.0.2'] }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    const next = selectNextPrompt(resolved.eligible, map);
    expect(next!.promptId).toBe('5.0.2');
  });

  it('all blocked: null next prompt with rationale', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'blocked' }),
      makePrompt({ promptId: '2.0.1', status: 'blocked' }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    const next = selectNextPrompt(resolved.eligible, map);
    expect(next).toBeNull();
    const rationale = generateNoEligibleRationale(resolved.blocked.length, resolved.waiting.length);
    expect(rationale).toContain('2 prompt(s) are blocked');
  });

  it('empty repo: null next prompt', () => {
    const resolved = resolvePrerequisites(new Map());
    const next = selectNextPrompt(resolved.eligible, new Map());
    expect(next).toBeNull();
    const rationale = generateNoEligibleRationale(0, 0);
    expect(rationale).toContain('0 prompt(s) are blocked');
  });

  it('complex graph: 10+ prompts with branching and merging', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'done', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '3.0.1', status: 'done', prerequisites: ['2.0.1'] }),
      makePrompt({ promptId: '4.0.1', status: 'done', prerequisites: ['2.0.1', '3.0.1'] }),
      makePrompt({ promptId: '5.0.1', status: 'done', prerequisites: ['4.0.1'] }),
      makePrompt({ promptId: '6.0.1', status: 'done', prerequisites: ['4.0.1'] }),
      makePrompt({ promptId: '7.0.1', status: 'done', prerequisites: ['5.0.1'] }),
      makePrompt({ promptId: '8.0.1', status: 'done', prerequisites: ['1.0.1', '2.0.1', '3.0.1', '4.0.1', '5.0.1', '6.0.1', '7.0.1'] }),
      makePrompt({ promptId: '9.0.1', status: 'done', prerequisites: ['8.0.1'] }),
      makePrompt({ promptId: '10.0.1', status: 'done', prerequisites: ['8.0.1'] }),
      // Two prompts now eligible:
      makePrompt({ promptId: '11.0.1', status: 'ready', prerequisites: ['9.0.1'] }),
      makePrompt({ promptId: '12.0.1', status: 'ready', prerequisites: ['11.0.1'] }),
      makePrompt({ promptId: '13.0.1', status: 'ready', prerequisites: ['12.0.1'] }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    expect(resolved.eligible.map(p => p.promptId)).toEqual(['11.0.1']);
    expect(resolved.waiting.length).toBe(2); // 12.0.1, 13.0.1
    const next = selectNextPrompt(resolved.eligible, map);
    expect(next!.promptId).toBe('11.0.1');
  });

  it('all done: null next prompt, no warnings from resolve', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done' }),
      makePrompt({ promptId: '2.0.1', status: 'done', prerequisites: ['1.0.1'] }),
      makePrompt({ promptId: '3.0.1', status: 'done', prerequisites: ['2.0.1'] }),
    ];
    const map = toMap(prompts);
    const resolved = resolvePrerequisites(map);
    expect(resolved.eligible).toEqual([]);
    expect(resolved.warnings).toEqual([]);
    const next = selectNextPrompt(resolved.eligible, map);
    expect(next).toBeNull();
  });
});
