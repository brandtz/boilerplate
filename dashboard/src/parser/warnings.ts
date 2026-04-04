import type { ParseWarning } from './types';
import { WARNING_CODES } from './types';

/**
 * Create a ParseWarning object.
 */
export function createWarning(
  file: string,
  code: string,
  message: string,
  severity: ParseWarning['severity'],
  line?: number,
): ParseWarning {
  const warning: ParseWarning = { file, code, message, severity };
  if (line !== undefined) {
    warning.line = line;
  }
  return warning;
}

export function isError(w: ParseWarning): boolean {
  return w.severity === 'error';
}

export function isWarning(w: ParseWarning): boolean {
  return w.severity === 'warning';
}

export { WARNING_CODES };
