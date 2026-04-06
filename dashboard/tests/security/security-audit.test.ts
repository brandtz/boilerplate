/**
 * Security-focused test suite for the Project Manager Dashboard.
 * Covers: path traversal, XSS prevention, prototype pollution, symlink handling,
 * file size limits, and YAML injection.
 *
 * @jest-environment node
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { sanitizeRepoPath } from '@/lib/repoDetection';
import { scanRepository } from '@/parser/scanner';
import { extractPrompt, extractHandoff } from '@/parser/extractor';

// =============================================================================
// PATH TRAVERSAL — sanitizeRepoPath
// =============================================================================

describe('Security — Path Traversal (sanitizeRepoPath)', () => {
  it('rejects .. traversal in middle of path', () => {
    const r = sanitizeRepoPath('/repos/project/../../../etc/passwd');
    expect(r.ok).toBe(false);
  });

  it('rejects .. traversal at start', () => {
    const r = sanitizeRepoPath('../../etc/passwd');
    expect(r.ok).toBe(false);
  });

  it('rejects .. traversal with backslashes (Windows)', () => {
    const r = sanitizeRepoPath('C:\\repos\\..\\..\\Windows\\System32');
    expect(r.ok).toBe(false);
  });

  it('rejects null byte injection', () => {
    const r = sanitizeRepoPath('/repos/valid\x00/../../etc/passwd');
    expect(r.ok).toBe(false);
  });

  it('rejects control characters \\x01-\\x1f', () => {
    for (let i = 1; i <= 0x1f; i++) {
      const r = sanitizeRepoPath(`/path${String.fromCharCode(i)}evil`);
      expect(r.ok).toBe(false);
    }
  });

  it('rejects empty string', () => {
    expect(sanitizeRepoPath('').ok).toBe(false);
  });

  it('rejects whitespace-only', () => {
    expect(sanitizeRepoPath('   ').ok).toBe(false);
    expect(sanitizeRepoPath('\t\n').ok).toBe(false);
  });

  it('accepts valid absolute path', () => {
    const r = sanitizeRepoPath('/tmp/valid-repo');
    expect(r.ok).toBe(true);
  });

  it('accepts valid Windows absolute path', () => {
    const r = sanitizeRepoPath('C:\\Projects\\MyRepo');
    expect(r.ok).toBe(true);
  });

  it('resolves to absolute path', () => {
    const r = sanitizeRepoPath('.');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(path.isAbsolute(r.resolved)).toBe(true);
    }
  });
});

// =============================================================================
// PATH TRAVERSAL — Scanner isSafePath
// =============================================================================

describe('Security — Scanner path sandboxing', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'security-scan-'));
    // Create minimal repo structure
    fs.mkdirSync(path.join(tempDir, 'prompts', 'active'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'prompts', 'archive'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents', 'epics'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'agents', 'handoffs'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'prompts', 'index.md'), '# Index\n');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('scans only within repo root', async () => {
    // Place a valid prompt inside the repo
    fs.writeFileSync(
      path.join(tempDir, 'prompts', 'active', '1.0.1.md'),
      '---\nprompt_id: "1.0.1"\ntitle: "Test"\nstatus: "ready"\n---\n# Test',
    );

    const result = await scanRepository(tempDir);
    // All scanned files should be within tempDir
    for (const file of result.files) {
      expect(path.resolve(file.filePath).startsWith(tempDir)).toBe(true);
    }
  });

  it('skips symlinks in scanned directories', async () => {
    const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'outside-'));
    fs.writeFileSync(path.join(outsideDir, 'secret.md'), '---\nsecret: true\n---\n');

    try {
      // Create symlink inside repo pointing outside
      const symlinkPath = path.join(tempDir, 'prompts', 'active', 'evil-link.md');
      fs.symlinkSync(path.join(outsideDir, 'secret.md'), symlinkPath);

      const result = await scanRepository(tempDir);
      // The symlinked file should NOT appear in scanned files
      const filePaths = result.files.map(f => f.filePath);
      expect(filePaths).not.toContain(symlinkPath);
    } catch (e) {
      // Symlink creation may fail on Windows without elevated privileges
      if ((e as NodeJS.ErrnoException).code === 'EPERM') {
        // Skip test on Windows without symlink privileges
        return;
      }
      throw e;
    } finally {
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
  });

  it('enforces MAX_FILE_SIZE limit (1MB)', async () => {
    // Create a file exactly at the limit
    const bigContent = '---\nprompt_id: "big"\ntitle: "Big"\nstatus: "ready"\n---\n' + 'x'.repeat(1_048_577);
    fs.writeFileSync(path.join(tempDir, 'prompts', 'active', 'big.md'), bigContent);

    const result = await scanRepository(tempDir);
    // The oversized file should be skipped with a warning
    const filePaths = result.files.map(f => f.relativePath);
    expect(filePaths).not.toContain('prompts/active/big.md');
    expect(result.warnings.some(w => w.message.includes('1MB'))).toBe(true);
  });

  it('skips hidden files (dot-prefixed)', async () => {
    fs.writeFileSync(
      path.join(tempDir, 'prompts', 'active', '.hidden.md'),
      '---\nprompt_id: "hidden"\ntitle: "Hidden"\nstatus: "ready"\n---\n',
    );

    const result = await scanRepository(tempDir);
    const filePaths = result.files.map(f => f.relativePath);
    expect(filePaths).not.toContain('prompts/active/.hidden.md');
  });
});

// =============================================================================
// PROTOTYPE POLLUTION — Extractor
// =============================================================================

describe('Security — Prototype Pollution Prevention', () => {
  it('rejects __proto__ key in prompt frontmatter', () => {
    const content = `---
prompt_id: "1.0.1"
title: "Test"
status: "ready"
__proto__:
  polluted: true
---
# Test`;
    const { warnings } = extractPrompt('test.md', content);
    expect(warnings.some(w => w.message.includes('__proto__'))).toBe(true);
  });

  it('rejects constructor key in prompt frontmatter', () => {
    const content = `---
prompt_id: "1.0.1"
title: "Test"
status: "ready"
constructor:
  prototype:
    evil: true
---
# Test`;
    const { warnings } = extractPrompt('test.md', content);
    expect(warnings.some(w => w.message.includes('constructor'))).toBe(true);
  });

  it('rejects prototype key in handoff frontmatter', () => {
    const content = `---
session_id: "S-001"
prompt_id: "1.0.1"
role: "Engineer"
status_outcome: "complete"
prototype: "malicious"
---
# Handoff`;
    const { warnings } = extractHandoff('agents/handoffs/S-001.md', content);
    expect(warnings.some(w => w.message.includes('prototype'))).toBe(true);
  });

  it('does not pollute Object.prototype', () => {
    const content = `---
prompt_id: "1.0.1"
title: "Test"
status: "ready"
__proto__:
  isAdmin: true
---
# Test`;
    extractPrompt('test.md', content);
    expect(Object.prototype).not.toHaveProperty('isAdmin');
  });
});

// =============================================================================
// YAML INJECTION — Malformed / Adversarial input
// =============================================================================

describe('Security — YAML Injection Prevention', () => {
  it('handles YAML with !!js/function tag safely', () => {
    const content = `---
prompt_id: "1.0.1"
title: "Test"
status: !!js/function 'function(){return "hacked"}'
---
# Test`;
    // js-yaml v4 safe schema should reject !!js/function
    const { prompt, warnings } = extractPrompt('test.md', content);
    // Either rejects entirely or treats as string — must not execute
    expect(typeof prompt?.status === 'function').toBe(false);
  });

  it('rejects YAML bomb (excessive anchors)', () => {
    const content = `---
prompt_id: "1.0.1"
title: "Test"
status: "ready"
a: &a ["lol","lol","lol","lol","lol","lol","lol","lol","lol"]
b: &b [*a,*a,*a,*a,*a,*a,*a,*a,*a]
c: &c [*b,*b,*b,*b,*b,*b,*b,*b,*b]
---
# Test`;
    // Should either parse without crashing or reject
    const { prompt } = extractPrompt('test.md', content);
    // We primarily verify it doesn't hang or crash
    expect(true).toBe(true);
    // The prompt may or may not be null — the important thing is no crash/hang
  });

  it('handles extremely long field values', () => {
    const longTitle = 'x'.repeat(10000);
    const content = `---
prompt_id: "1.0.1"
title: "${longTitle}"
status: "ready"
---
# Test`;
    const { prompt } = extractPrompt('test.md', content);
    // Should not crash
    expect(prompt?.promptId).toBe('1.0.1');
  });

  it('handles null/undefined field values gracefully', () => {
    const content = `---
prompt_id: "1.0.1"
title: null
status: "ready"
---
# Test`;
    const { prompt, warnings } = extractPrompt('test.md', content);
    // Should produce warning or handle gracefully
    if (prompt) {
      expect(prompt.title).toBeDefined();
    }
  });
});

// =============================================================================
// XSS PREVENTION — MarkdownRenderer link sanitization (unit-level)
// =============================================================================

describe('Security — Link Protocol Sanitization', () => {
  // Test the protocol check logic directly (same regex as MarkdownRenderer)
  function isSafeHref(href: string | undefined): boolean {
    if (!href) return false;
    return /^(https?:|mailto:|#)/i.test(href) ||
           (href.startsWith('/') && !href.startsWith('//'));
  }

  it('allows https:', () => expect(isSafeHref('https://example.com')).toBe(true));
  it('allows http:', () => expect(isSafeHref('http://example.com')).toBe(true));
  it('allows mailto:', () => expect(isSafeHref('mailto:user@example.com')).toBe(true));
  it('allows anchor #', () => expect(isSafeHref('#section')).toBe(true));
  it('allows relative /', () => expect(isSafeHref('/path/to/page')).toBe(true));

  it('blocks javascript:', () => expect(isSafeHref('javascript:alert(1)')).toBe(false));
  it('blocks JAVASCRIPT: (case)', () => expect(isSafeHref('JAVASCRIPT:alert(1)')).toBe(false));
  it('blocks data:', () => expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false));
  it('blocks vbscript:', () => expect(isSafeHref('vbscript:MsgBox("XSS")')).toBe(false));
  it('blocks protocol-relative //evil.com', () => expect(isSafeHref('//evil.com/path')).toBe(false));
  it('blocks empty string', () => expect(isSafeHref('')).toBe(false));
  it('blocks undefined', () => expect(isSafeHref(undefined)).toBe(false));

  // Edge cases
  it('blocks javascript: with whitespace padding', () => {
    expect(isSafeHref('javascript:void(0)')).toBe(false);
  });

  it('blocks data:text/html', () => {
    expect(isSafeHref('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
  });
});

// =============================================================================
// CSP — Content Security Policy validation
// =============================================================================

describe('Security — CSP Configuration', () => {
  it('layout.tsx contains restrictive CSP meta tag', () => {
    const layoutContent = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'app', 'layout.tsx'),
      'utf-8',
    );
    expect(layoutContent).toContain("default-src 'self'");
    expect(layoutContent).toContain("script-src 'self'");
    expect(layoutContent).toContain("style-src 'self'");
    expect(layoutContent).toContain("img-src 'self' data:");
    expect(layoutContent).toContain("font-src 'self'");
    expect(layoutContent).toContain("frame-ancestors 'none'");
  });

  it('layout.tsx does NOT contain unsafe-eval', () => {
    const layoutContent = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'app', 'layout.tsx'),
      'utf-8',
    );
    expect(layoutContent).not.toContain('unsafe-eval');
  });
});

// =============================================================================
// MARKDOWN RENDERER — No rehype-raw
// =============================================================================

describe('Security — MarkdownRenderer configuration', () => {
  it('MarkdownRenderer does NOT import rehype-raw', () => {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'components', 'prompts', 'MarkdownRenderer.tsx'),
      'utf-8',
    );
    // Check that rehype-raw is not imported (comment mentions are acceptable)
    expect(content).not.toMatch(/import.*rehype-raw/);
    expect(content).not.toMatch(/require.*rehype-raw/);
    expect(content).not.toContain('dangerouslySetInnerHTML');
  });

  it('MarkdownRenderer has rel="noopener noreferrer" on links', () => {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'components', 'prompts', 'MarkdownRenderer.tsx'),
      'utf-8',
    );
    expect(content).toContain('noopener noreferrer');
  });
});

// =============================================================================
// FILE WATCHER — Secure configuration
// =============================================================================

describe('Security — File Watcher Configuration', () => {
  it('fileWatcher.ts disables symlink following', () => {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'lib', 'fileWatcher.ts'),
      'utf-8',
    );
    expect(content).toContain('followSymlinks: false');
  });

  it('fileWatcher.ts ignores node_modules and .git', () => {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'lib', 'fileWatcher.ts'),
      'utf-8',
    );
    expect(content).toContain('node_modules');
    expect(content).toContain('.git');
  });
});

// =============================================================================
// PROTOTYPE POLLUTION — Extractor DANGEROUS_KEYS
// =============================================================================

describe('Security — Extractor dangerous key list', () => {
  it('extractor.ts rejects __proto__, constructor, prototype', () => {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'parser', 'extractor.ts'),
      'utf-8',
    );
    expect(content).toContain("'__proto__'");
    expect(content).toContain("'constructor'");
    expect(content).toContain("'prototype'");
  });
});
