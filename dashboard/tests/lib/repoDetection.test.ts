/**
 * @jest-environment node
 */
import { sanitizeRepoPath, detectRepoCapability } from '@/lib/repoDetection';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('sanitizeRepoPath', () => {
  it('resolves a valid relative path', () => {
    const result = sanitizeRepoPath('.');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(path.isAbsolute(result.resolved)).toBe(true);
    }
  });

  it('rejects empty string', () => {
    const result = sanitizeRepoPath('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('empty');
    }
  });

  it('rejects whitespace-only string', () => {
    const result = sanitizeRepoPath('   ');
    expect(result.ok).toBe(false);
  });

  it('rejects path traversal with ..', () => {
    const result = sanitizeRepoPath('../../etc/passwd');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('traversal');
    }
  });

  it('rejects null bytes', () => {
    const result = sanitizeRepoPath('/valid/path\x00/evil');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('invalid characters');
    }
  });

  it('rejects non-printable characters', () => {
    const result = sanitizeRepoPath('/path/with\x01control');
    expect(result.ok).toBe(false);
  });

  it('accepts absolute path without traversal', () => {
    const result = sanitizeRepoPath('/tmp/valid-repo');
    expect(result.ok).toBe(true);
  });
});

describe('detectRepoCapability', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-detect-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('detects a valid repo as capable', () => {
    // Create required structure
    fs.mkdirSync(path.join(tempDir, 'prompts/active'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'prompts/index.md'), '# Index');
    fs.mkdirSync(path.join(tempDir, 'agents/epics'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents/handoffs'), { recursive: true });

    return detectRepoCapability(tempDir).then((result) => {
      expect(result.capable).toBe(true);
      expect(result.missingRequired).toEqual([]);
    });
  });

  it('detects missing prompts/index.md', () => {
    fs.mkdirSync(path.join(tempDir, 'prompts/active'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents/epics'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents/handoffs'), { recursive: true });

    return detectRepoCapability(tempDir).then((result) => {
      expect(result.capable).toBe(false);
      expect(result.missingRequired).toContain('prompts/index.md');
    });
  });

  it('detects missing agents/handoffs', () => {
    fs.mkdirSync(path.join(tempDir, 'prompts/active'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'prompts/index.md'), '# Index');
    fs.mkdirSync(path.join(tempDir, 'agents/epics'), { recursive: true });

    return detectRepoCapability(tempDir).then((result) => {
      expect(result.capable).toBe(false);
      expect(result.missingRequired).toContain('agents/handoffs');
    });
  });

  it('reports missing optional paths but remains capable', () => {
    fs.mkdirSync(path.join(tempDir, 'prompts/active'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'prompts/index.md'), '# Index');
    fs.mkdirSync(path.join(tempDir, 'agents/epics'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents/handoffs'), { recursive: true });

    return detectRepoCapability(tempDir).then((result) => {
      expect(result.capable).toBe(true);
      expect(result.missingOptional).toContain('prompts/archive');
    });
  });

  it('rejects path traversal attempt', () => {
    return detectRepoCapability('../../etc').then((result) => {
      expect(result.capable).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  it('handles non-existent path gracefully', () => {
    return detectRepoCapability('/nonexistent/path/12345').then((result) => {
      expect(result.capable).toBe(false);
      expect(result.warnings).toContain('Path does not exist');
    });
  });

  it('counts prompts in active directory', () => {
    fs.mkdirSync(path.join(tempDir, 'prompts/active'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'prompts/index.md'), '# Index');
    fs.writeFileSync(path.join(tempDir, 'prompts/active/1.0.1.md'), '---\n---');
    fs.writeFileSync(path.join(tempDir, 'prompts/active/2.0.1.md'), '---\n---');
    fs.mkdirSync(path.join(tempDir, 'agents/epics'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents/handoffs'), { recursive: true });

    return detectRepoCapability(tempDir).then((result) => {
      expect(result.promptCount).toBe(2);
    });
  });

  it('rejects empty string path', () => {
    return detectRepoCapability('').then((result) => {
      expect(result.capable).toBe(false);
    });
  });
});
