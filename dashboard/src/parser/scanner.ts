import * as fs from 'fs';
import * as path from 'path';
import type { ParseWarning } from './types';
import { createWarning } from './warnings';

export interface ScannedFile {
  filePath: string;
  relativePath: string;
  content: string;
  category: 'prompt' | 'handoff' | 'epic' | 'index' | 'context' | 'schema';
}

interface ScanResult {
  files: ScannedFile[];
  warnings: ParseWarning[];
}

const MAX_FILE_SIZE = 1_048_576; // 1MB

/**
 * Ensure a resolved path is within the repo root (R6/R18 mitigation).
 */
function isSafePath(resolved: string, root: string): boolean {
  const normalizedResolved = path.normalize(resolved);
  const normalizedRoot = path.normalize(root) + path.sep;
  return normalizedResolved.startsWith(normalizedRoot) || normalizedResolved === path.normalize(root);
}

/**
 * Read all .md files from a directory (non-recursive).
 * Does not follow symlinks.
 */
function readMdFiles(
  dirPath: string,
  repoRoot: string,
  category: ScannedFile['category'],
  warnings: ParseWarning[],
): ScannedFile[] {
  const files: ScannedFile[] = [];
  const resolvedDir = path.resolve(repoRoot, dirPath);

  if (!isSafePath(resolvedDir, repoRoot)) {
    warnings.push(createWarning(dirPath, 'E_MISSING_REQUIRED', `Path '${dirPath}' resolves outside repo root`, 'error'));
    return files;
  }

  if (!fs.existsSync(resolvedDir)) {
    return files;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(resolvedDir, { withFileTypes: true });
  } catch {
    warnings.push(createWarning(dirPath, 'E_MISSING_REQUIRED', `Cannot read directory '${dirPath}'`, 'error'));
    return files;
  }

  for (const entry of entries) {
    // Skip hidden files, symlinks
    if (entry.name.startsWith('.')) continue;
    if (entry.isSymbolicLink()) continue;
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.md')) continue;

    const fullPath = path.join(resolvedDir, entry.name);

    if (!isSafePath(fullPath, repoRoot)) {
      warnings.push(createWarning(entry.name, 'W_OPTIONAL_MISSING', `Skipped file outside repo root: ${entry.name}`, 'warning'));
      continue;
    }

    try {
      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_FILE_SIZE) {
        const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');
        warnings.push(createWarning(relPath, 'W_OPTIONAL_MISSING', `File exceeds 1MB limit (${stat.size} bytes), skipping`, 'warning'));
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const relativePath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');
      files.push({ filePath: fullPath, relativePath, content, category });
    } catch {
      const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');
      warnings.push(createWarning(relPath, 'E_MISSING_REQUIRED', `Cannot read file: ${relPath}`, 'error'));
    }
  }

  return files;
}

/**
 * Read a single file from the repo.
 */
function readSingleFile(
  filePath: string,
  repoRoot: string,
  category: ScannedFile['category'],
  warnings: ParseWarning[],
): ScannedFile | null {
  const resolved = path.resolve(repoRoot, filePath);

  if (!isSafePath(resolved, repoRoot)) {
    warnings.push(createWarning(filePath, 'E_MISSING_REQUIRED', `Path resolves outside repo root`, 'error'));
    return null;
  }

  if (!fs.existsSync(resolved)) {
    return null;
  }

  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    const relativePath = path.relative(repoRoot, resolved).replace(/\\/g, '/');
    return { filePath: resolved, relativePath, content, category };
  } catch {
    warnings.push(createWarning(filePath, 'E_MISSING_REQUIRED', `Cannot read file: ${filePath}`, 'error'));
    return null;
  }
}

/**
 * Scan the repository for all parseable files in discovery order.
 */
export async function scanRepository(repoRoot: string): Promise<ScanResult> {
  const resolvedRoot = path.resolve(repoRoot);
  const warnings: ParseWarning[] = [];
  const files: ScannedFile[] = [];

  // 1. Check and read prompts/index.md (required, first)
  const indexFile = readSingleFile('prompts/index.md', resolvedRoot, 'index', warnings);
  if (!indexFile) {
    warnings.push(createWarning('prompts/index.md', 'E_INDEX_MISSING', 'prompts/index.md not found', 'error'));
  } else {
    files.push(indexFile);
  }

  // 2. Check required directories exist
  const requiredDirs = ['prompts/active', 'agents/epics', 'agents/handoffs'];
  for (const dir of requiredDirs) {
    const resolved = path.resolve(resolvedRoot, dir);
    if (!fs.existsSync(resolved)) {
      warnings.push(createWarning(dir, 'E_MISSING_REQUIRED', `Required directory '${dir}' not found`, 'error'));
    }
  }

  // Optional directory check
  const archivePath = path.resolve(resolvedRoot, 'prompts/archive');
  if (!fs.existsSync(archivePath)) {
    warnings.push(createWarning('prompts/archive', 'I_PARSED_OK', `Optional directory 'prompts/archive' not found`, 'info'));
  }

  // 3. Scan in discovery order
  files.push(...readMdFiles('prompts/active', resolvedRoot, 'prompt', warnings));
  files.push(...readMdFiles('prompts/archive', resolvedRoot, 'prompt', warnings));
  files.push(...readMdFiles('agents/epics', resolvedRoot, 'epic', warnings));
  files.push(...readMdFiles('agents/handoffs', resolvedRoot, 'handoff', warnings));

  return { files, warnings };
}

/**
 * Validate that a repo has the expected directory structure.
 */
export async function validateRepoStructure(repoRoot: string): Promise<{
  capable: boolean;
  missingRequired: string[];
  missingOptional: string[];
  warnings: string[];
}> {
  const resolvedRoot = path.resolve(repoRoot);
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const warns: string[] = [];

  const required = ['prompts/index.md', 'prompts/active', 'agents/epics', 'agents/handoffs'];
  const optional = ['prompts/archive', 'agents/context', 'schemas'];

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

  return {
    capable: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    warnings: warns,
  };
}
