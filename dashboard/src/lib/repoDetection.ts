/**
 * Repo capability detection — wraps parser's validateRepoStructure.
 * This module uses Node.js fs/path and runs only in server-side or
 * CLI contexts, never in the browser.
 */
import * as path from 'path';
import * as fs from 'fs';

/** Characters that are never valid in repo paths. */
const FORBIDDEN_CHARS = /[\x00-\x1f]/;

/**
 * Validate and sanitize a user-provided repo path.
 * Rejects path traversal, null bytes, and non-printable characters.
 * Returns the resolved absolute path or an error string.
 */
export function sanitizeRepoPath(input: string): { ok: true; resolved: string } | { ok: false; error: string } {
  if (!input || input.trim().length === 0) {
    return { ok: false, error: 'Path must not be empty' };
  }

  if (FORBIDDEN_CHARS.test(input)) {
    return { ok: false, error: 'Path contains invalid characters' };
  }

  // Reject explicit traversal segments before resolution
  const segments = input.split(/[\\/]/);
  if (segments.some((s) => s === '..')) {
    return { ok: false, error: 'Path traversal is not allowed' };
  }

  const resolved = path.resolve(input);
  return { ok: true, resolved };
}

export interface RepoCapability {
  capable: boolean;
  missingRequired: string[];
  missingOptional: string[];
  promptCount: number;
  epicCount: number;
  warnings: string[];
}

/**
 * Detect whether a path is a compatible repository.
 * Validates path safety, checks required/optional directories,
 * and counts prompts and epics.
 */
export async function detectRepoCapability(repoPath: string): Promise<RepoCapability> {
  const validation = sanitizeRepoPath(repoPath);
  if (!validation.ok) {
    return {
      capable: false,
      missingRequired: [],
      missingOptional: [],
      promptCount: 0,
      epicCount: 0,
      warnings: [validation.error],
    };
  }

  const resolvedRoot = validation.resolved;

  // Verify path exists and is a directory
  try {
    const stat = fs.lstatSync(resolvedRoot);
    if (!stat.isDirectory()) {
      return {
        capable: false,
        missingRequired: [],
        missingOptional: [],
        promptCount: 0,
        epicCount: 0,
        warnings: ['Path is not a directory'],
      };
    }
  } catch {
    return {
      capable: false,
      missingRequired: [],
      missingOptional: [],
      promptCount: 0,
      epicCount: 0,
      warnings: ['Path does not exist'],
    };
  }

  const required = ['prompts/index.md', 'prompts/active', 'agents/epics', 'agents/handoffs'];
  const optional = ['prompts/archive', 'agents/context', 'schemas'];

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const p of required) {
    if (!fs.existsSync(path.resolve(resolvedRoot, p))) {
      missingRequired.push(p);
    }
  }

  for (const p of optional) {
    if (!fs.existsSync(path.resolve(resolvedRoot, p))) {
      missingOptional.push(p);
    }
  }

  // Count prompts in active + archive
  let promptCount = 0;
  const activeDir = path.resolve(resolvedRoot, 'prompts/active');
  if (fs.existsSync(activeDir)) {
    try {
      promptCount += fs.readdirSync(activeDir).filter((f) => f.endsWith('.md')).length;
    } catch { /* ignore */ }
  }
  const archiveDir = path.resolve(resolvedRoot, 'prompts/archive');
  if (fs.existsSync(archiveDir)) {
    try {
      promptCount += fs.readdirSync(archiveDir).filter((f) => f.endsWith('.md')).length;
    } catch { /* ignore */ }
  }

  // Count epics
  let epicCount = 0;
  const epicsDir = path.resolve(resolvedRoot, 'agents/epics');
  if (fs.existsSync(epicsDir)) {
    try {
      epicCount = fs.readdirSync(epicsDir).filter((f) => f.endsWith('.md')).length;
    } catch { /* ignore */ }
  }

  return {
    capable: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    promptCount,
    epicCount,
    warnings: [],
  };
}
