import { createWarning, isError, isWarning } from '@/parser/warnings';

describe('warnings', () => {
  test('createWarning creates a warning with all fields', () => {
    const w = createWarning('test.md', 'E_MISSING_REQUIRED', 'Missing field', 'error', 10);
    expect(w).toEqual({
      file: 'test.md',
      code: 'E_MISSING_REQUIRED',
      message: 'Missing field',
      severity: 'error',
      line: 10,
    });
  });

  test('createWarning omits line when not provided', () => {
    const w = createWarning('test.md', 'I_PARSED_OK', 'Parsed', 'info');
    expect(w.line).toBeUndefined();
  });

  test('isError returns true for error severity', () => {
    const w = createWarning('f', 'E_MISSING_REQUIRED', 'msg', 'error');
    expect(isError(w)).toBe(true);
    expect(isWarning(w)).toBe(false);
  });

  test('isWarning returns true for warning severity', () => {
    const w = createWarning('f', 'W_UNKNOWN_STATUS', 'msg', 'warning');
    expect(isWarning(w)).toBe(true);
    expect(isError(w)).toBe(false);
  });
});
