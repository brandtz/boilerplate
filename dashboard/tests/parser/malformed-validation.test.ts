/**
 * Malformed metadata validation tests — E6-S1
 * Tests parser resilience against invalid, partial, and adversarial input.
 */
import * as fs from 'fs';
import * as path from 'path';
import { extractPrompt, extractHandoff } from '@/parser/extractor';

const fixturesDir = path.join(__dirname, '..', 'fixtures');

function readFixture(relativePath: string): string {
  return fs.readFileSync(path.join(fixturesDir, relativePath), 'utf-8');
}

describe('malformed metadata — parser resilience', () => {
  describe('empty frontmatter', () => {
    test('empty frontmatter delimiters returns null prompt', () => {
      const content = readFixture('malformed/prompt-empty-frontmatter.md');
      const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

      expect(prompt).toBeNull();
      // Should emit missing required field errors
      expect(warnings.some((w) => w.code === 'E_MISSING_REQUIRED')).toBe(true);
    });

    test('parser does not crash on empty frontmatter', () => {
      const content = readFixture('malformed/prompt-empty-frontmatter.md');
      expect(() => extractPrompt('test.md', content)).not.toThrow();
    });
  });

  describe('invalid types', () => {
    test('numeric/boolean field values are coerced to strings', () => {
      const content = readFixture('malformed/prompt-invalid-types.md');
      const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

      // Parser should not crash
      expect(prompt).not.toBeNull();

      // promptId was 99 (number) — should be coerced to "99"
      expect(prompt?.promptId).toBe('99');

      // title was 42 (number) — should be coerced to "42"
      expect(prompt?.title).toBe('42');

      // status was true (boolean) — coerced to "true" → unknown status
      expect(warnings.some((w) => w.code === 'W_UNKNOWN_STATUS')).toBe(true);
    });

    test('string prerequisites are wrapped in array', () => {
      const content = readFixture('malformed/prompt-invalid-types.md');
      const { prompt } = extractPrompt('prompts/active/test.md', content);

      // "not-an-array" should become ["not-an-array"]
      expect(prompt?.prerequisites).toEqual(['not-an-array']);
    });

    test('numeric task_ids default to empty array (non-string, non-array)', () => {
      const content = readFixture('malformed/prompt-invalid-types.md');
      const { prompt } = extractPrompt('prompts/active/test.md', content);

      // ensureStringArray returns [] for plain numbers (not string, not array)
      expect(prompt?.taskIds).toEqual([]);
    });

    test('invalid date value emits W_INVALID_DATE', () => {
      const content = readFixture('malformed/prompt-invalid-types.md');
      const { warnings } = extractPrompt('prompts/active/test.md', content);

      // created_at: 12345 is not ISO 8601
      expect(warnings.some((w) => w.code === 'W_INVALID_DATE')).toBe(true);
    });
  });

  describe('partial data', () => {
    test('prompt with only required + some optional fields extracts correctly', () => {
      const content = readFixture('malformed/prompt-partial-data.md');
      const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

      expect(prompt).not.toBeNull();
      expect(prompt?.promptId).toBe('PARTIAL-1');
      expect(prompt?.title).toBe('Partial Fields Prompt');
      expect(prompt?.status).toBe('in_progress');
      expect(prompt?.epicId).toBe('E1');

      // Missing optional fields default to empty
      expect(prompt?.storyId).toBe('');
      expect(prompt?.role).toBe('');
      expect(prompt?.prerequisites).toEqual([]);
      expect(prompt?.taskIds).toEqual([]);
      expect(prompt?.completedAt).toBe('');
      expect(prompt?.archivedAt).toBe('');

      // No errors for optional fields
      expect(warnings.filter((w) => w.severity === 'error')).toHaveLength(0);
    });
  });

  describe('adversarial input', () => {
    test('prototype pollution keys are rejected', () => {
      const content = readFixture('adversarial/prompt-prototype-pollution.md');
      const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

      expect(prompt).not.toBeNull();
      expect(prompt?.promptId).toBe('PROTO-1');

      // Dangerous keys should be detected
      const pollutionWarnings = warnings.filter(
        (w) => w.message.includes('prototype pollution'),
      );
      expect(pollutionWarnings.length).toBeGreaterThanOrEqual(1);
    });

    test('prototype pollution does not pollute Object prototype', () => {
      const content = readFixture('adversarial/prompt-prototype-pollution.md');
      extractPrompt('prompts/active/test.md', content);

      // Ensure global object prototype is not polluted
      expect(Object.prototype).not.toHaveProperty('polluted');
    });
  });

  describe('edge cases', () => {
    test('body containing --- delimiters parses correctly', () => {
      const content = readFixture('edge-case/prompt-body-with-delimiters.md');
      const { prompt } = extractPrompt('prompts/active/test.md', content);

      expect(prompt).not.toBeNull();
      expect(prompt?.promptId).toBe('HUGE-1');
      expect(prompt?.body).toContain('Section break in body');
      expect(prompt?.body).toContain('Another section break');
    });

    test('duplicate YAML keys cause parse error (js-yaml strict mode)', () => {
      const content = readFixture('edge-case/prompt-duplicate-keys.md');
      const { prompt, warnings } = extractPrompt('prompts/active/test.md', content);

      // js-yaml v4 throws on duplicate keys by default
      expect(prompt).toBeNull();
      expect(warnings.length).toBeGreaterThanOrEqual(1);
    });

    test('empty string content returns null with error', () => {
      const { prompt, warnings } = extractPrompt('test.md', '');

      expect(prompt).toBeNull();
      expect(warnings.length).toBeGreaterThanOrEqual(1);
    });

    test('whitespace-only content returns null with error', () => {
      const { prompt, warnings } = extractPrompt('test.md', '   \n\n  ');

      expect(prompt).toBeNull();
      expect(warnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('warning output verification', () => {
    test('each warning has file, code, message, and severity', () => {
      const content = readFixture('malformed/prompt-missing-required.md');
      const { warnings } = extractPrompt('prompts/active/test-path.md', content);

      expect(warnings.length).toBeGreaterThan(0);
      for (const w of warnings) {
        expect(w).toHaveProperty('file', 'prompts/active/test-path.md');
        expect(w).toHaveProperty('code');
        expect(w).toHaveProperty('message');
        expect(w).toHaveProperty('severity');
        expect(['error', 'warning']).toContain(w.severity);
      }
    });

    test('I_NO_FRONTMATTER has severity info for prompts', () => {
      const content = readFixture('malformed/prompt-no-frontmatter.md');
      const { warnings } = extractPrompt('test.md', content);

      const noFm = warnings.find((w) => w.code === 'I_NO_FRONTMATTER');
      expect(noFm).toBeDefined();
      expect(noFm?.severity).toBe('info');
    });

    test('E_INVALID_YAML has severity error', () => {
      const content = readFixture('malformed/prompt-bad-yaml.md');
      const { warnings } = extractPrompt('test.md', content);

      const badYaml = warnings.find((w) => w.code === 'E_INVALID_YAML');
      expect(badYaml).toBeDefined();
      expect(badYaml?.severity).toBe('error');
    });

    test('W_UNKNOWN_STATUS has severity warning', () => {
      const content = readFixture('malformed/prompt-unknown-status.md');
      const { warnings } = extractPrompt('test.md', content);

      const unknownStatus = warnings.find((w) => w.code === 'W_UNKNOWN_STATUS');
      expect(unknownStatus).toBeDefined();
      expect(unknownStatus?.severity).toBe('warning');
    });

    test('W_INVALID_DATE includes field name in message', () => {
      const content = readFixture('malformed/prompt-bad-dates.md');
      const { warnings } = extractPrompt('test.md', content);

      const dateSeverity = warnings.find((w) => w.code === 'W_INVALID_DATE');
      expect(dateSeverity).toBeDefined();
      expect(dateSeverity?.message).toMatch(/\w+_at/);
    });
  });

  describe('handoff resilience', () => {
    test('handoff missing required fields returns null with errors', () => {
      const content = readFixture('malformed/handoff-missing-required.md');
      const { handoff, warnings } = extractHandoff('agents/handoffs/test.md', content);

      expect(handoff).toBeNull();
      expect(warnings.some((w) => w.code === 'E_MISSING_REQUIRED')).toBe(true);
    });

    test('handoff extractor does not crash on empty content', () => {
      expect(() => extractHandoff('agents/handoffs/test.md', '')).not.toThrow();
    });

    test('handoff extractor does not crash on bad YAML', () => {
      const content = readFixture('malformed/prompt-bad-yaml.md');
      const { handoff, warnings } = extractHandoff('agents/handoffs/test.md', content);

      expect(handoff).toBeNull();
      expect(warnings.length).toBeGreaterThanOrEqual(1);
    });
  });
});
