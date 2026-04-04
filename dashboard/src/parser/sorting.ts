/**
 * Natural Tuple Sorting for Prompt IDs
 *
 * Sorts prompt IDs by numeric tuples (major.branch.revision)
 * per the prompt numbering standard.
 */

import type { ParsedPrompt } from './types';

export interface PromptIdTuple {
  numeric: boolean;
  tuple: number[];
  raw: string;
}

/**
 * Parse a prompt ID string into a sortable tuple.
 * Numeric IDs like "16.0.2" → { numeric: true, tuple: [16, 0, 2] }
 * Non-numeric IDs like "00_bootstrap" → { numeric: false, tuple: [], raw: "00_bootstrap" }
 */
export function parsePromptIdTuple(id: string): PromptIdTuple {
  const parts = id.split('.');
  const nums: number[] = [];
  for (const part of parts) {
    const n = parseInt(part, 10);
    if (isNaN(n) || String(n) !== part) {
      return { numeric: false, tuple: [], raw: id };
    }
    nums.push(n);
  }
  if (nums.length === 0) {
    return { numeric: false, tuple: [], raw: id };
  }
  return { numeric: true, tuple: nums, raw: id };
}

/**
 * Compare two prompt IDs for sorting.
 * Non-numeric IDs sort before all numeric IDs (alphabetical among themselves).
 * Numeric IDs sort by tuple comparison: major, then branch, then revision.
 */
export function comparePromptIds(a: string, b: string): number {
  const ta = parsePromptIdTuple(a);
  const tb = parsePromptIdTuple(b);

  // Non-numeric before numeric
  if (!ta.numeric && !tb.numeric) {
    return ta.raw < tb.raw ? -1 : ta.raw > tb.raw ? 1 : 0;
  }
  if (!ta.numeric) return -1;
  if (!tb.numeric) return 1;

  // Numeric tuple comparison
  const len = Math.max(ta.tuple.length, tb.tuple.length);
  for (let i = 0; i < len; i++) {
    const va = ta.tuple[i] ?? 0;
    const vb = tb.tuple[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

/**
 * Sort an array of ParsedPrompt objects by natural prompt ID order.
 * Returns a new sorted array (does not mutate input).
 */
export function sortPrompts(prompts: ParsedPrompt[]): ParsedPrompt[] {
  return [...prompts].sort((a, b) => comparePromptIds(a.promptId, b.promptId));
}
