# Security Review Findings — Project Manager Dashboard v1

> **Review Date:** 2026-04-03
> **Reviewer:** DevSecOps Engineer (Prompt 5.0.1)
> **Scope:** Architecture, parser design, UI design, dependency supply chain
> **Status:** Complete — No critical blocking vulnerabilities found

---

## Executive Summary

This security review examines the proposed architecture for the Project Manager Dashboard v1 as documented in ADR-001 (Stack Selection), ADR-002 (Parser Architecture), ADR-003 (UI Architecture), the architecture overview, PRD, and data contract. The dashboard is a local-first, read-only application that parses markdown files from the local filesystem and renders a project management dashboard.

**Overall Risk Assessment: LOW-MEDIUM**

The local-only, read-only architecture significantly reduces the attack surface compared to a traditional web application. No network-facing APIs, no authentication, no database, and no server infrastructure means many common vulnerability classes are inapplicable. However, several design-time concerns require mitigation during implementation to prevent exploitation vectors, particularly around file path handling and content rendering.

**Finding Summary:**

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 0 | No blocking vulnerabilities |
| High | 2 | Path traversal in multi-repo selector; XSS via markdown rendering |
| Medium | 4 | YAML parsing injection; symlink traversal; dependency supply chain; prototype pollution via frontmatter |
| Low | 3 | Error message information leakage; clipboard API abuse; file watcher denial of service |

---

## Findings

### HIGH-001: Path Traversal via Multi-Repo Selector

**Severity:** High
**Category:** Input Validation / Path Traversal
**Affected Components:** Multi-repo selector (E5), File Scanner (Parser Layer 1)
**Related Risk:** R6

**Description:**
The multi-repo selector allows users to specify a local filesystem path to switch between repositories. If the path input is not properly validated and sandboxed, an attacker (or accidental user input) could traverse outside the intended repository root to read arbitrary files on the filesystem.

The architecture overview states "All file operations restricted to repo root" (Design Rule 4), but no specific validation mechanism is defined. The current design relies on implementation-time enforcement without prescribing the validation approach.

**Attack Vectors:**
- Direct path input: `../../../etc/passwd` or `/etc/passwd`
- Encoded traversal: `..%2F..%2F..%2Fetc%2Fpasswd`
- Null byte injection: `repo-path%00../../sensitive-file`
- Unicode normalization attacks on path components

**Recommendations:**
1. **Implement path canonicalization:** Use `path.resolve()` followed by a prefix check against the allowed root directory. Always resolve to an absolute path before validation.
2. **Allowlist approach:** Maintain a list of known repository roots rather than accepting arbitrary paths. The repo selector should present a directory picker or validate against a configuration file.
3. **Reject path components:** Reject any path containing `..`, null bytes, or non-printable characters before further processing.
4. **Filesystem boundary check:** After `path.resolve()`, verify the resolved path starts with the expected parent directory using `resolvedPath.startsWith(allowedRoot + path.sep)`.
5. **Add to ADR-002:** Document the path validation algorithm as a mandatory implementation requirement.

---

### HIGH-002: Cross-Site Scripting (XSS) via Markdown Rendering

**Severity:** High
**Category:** Output Encoding / XSS
**Affected Components:** Prompt Detail Drawer (E4-S2), any view rendering markdown content
**Related Risk:** New (to be added as R15)

**Description:**
The dashboard renders markdown content from prompt files, handoff files, and other repository artifacts using `react-markdown` with `remark-gfm`. While `react-markdown` is secure by default (it does not render raw HTML), several configuration choices could re-introduce XSS risk:

1. Enabling `rehype-raw` plugin (allows raw HTML passthrough) would bypass sanitization
2. Custom renderers for code blocks, links, or images could introduce injection points
3. The `remark-gfm` plugin enables autolinks, which could be used for `javascript:` URI injection
4. Frontmatter fields rendered as HTML attributes could enable attribute injection

ADR-001 correctly identifies the need to "configure react-markdown to sanitize HTML by default," but the implementation must avoid re-enabling unsafe features.

**Attack Vectors:**
- Malicious markdown in prompt/handoff files: `[click me](javascript:alert(1))`
- Raw HTML in markdown: `<img src=x onerror=alert(1)>` (only if `rehype-raw` enabled)
- Frontmatter injection: A `title` field containing `"; onclick="alert(1)` rendered into an HTML attribute
- GFM autolink abuse: `<javascript:alert(1)>`

**Recommendations:**
1. **Never enable `rehype-raw`:** Document this as a security constraint in implementation guidance. If raw HTML rendering is needed in the future, use `rehype-sanitize` with a strict schema.
2. **Sanitize link protocols:** Configure `react-markdown` to only allow `http:`, `https:`, and `mailto:` protocols in links. Reject `javascript:`, `data:`, and `vbscript:` protocols.
3. **Escape frontmatter values:** All frontmatter values rendered into HTML must be properly escaped. Use React's built-in JSX escaping (avoid `dangerouslySetInnerHTML`).
4. **Content Security Policy:** If the Next.js static export supports it, add a restrictive CSP meta tag that disallows inline scripts and `eval()`.
5. **Add implementation test:** Create a test fixture with malicious markdown to verify XSS prevention.

---

### MED-001: YAML Frontmatter Parsing — Injection and Denial of Service

**Severity:** Medium
**Category:** Input Validation / Injection
**Affected Components:** Frontmatter Extractor (Parser Layer 2)
**Related Risk:** R1, R2

**Description:**
The `gray-matter` library parses YAML frontmatter from markdown files. YAML parsing has known security concerns:

1. **YAML bomb (billion laughs):** Deeply nested YAML anchors and aliases can cause exponential memory consumption, leading to denial of service.
2. **JavaScript execution via YAML:** Some YAML parsers support `!!js/function` or `!!js/undefined` tags that execute JavaScript. The `gray-matter` library uses `js-yaml` internally, which defaults to `DEFAULT_SAFE_SCHEMA` (safe), but older versions or configuration changes could enable unsafe schemas.
3. **Type coercion:** YAML auto-typing can convert strings like `true`, `false`, `null`, `1.0.1` to unexpected types, causing parser errors or logic bugs.

**Recommendations:**
1. **Pin `gray-matter` version:** Ensure the version used defaults to safe YAML schema. Verify `js-yaml` dependency uses `safeLoad` (v3) or `load` with `DEFAULT_SAFE_SCHEMA` (v4).
2. **Set parsing limits:** Configure maximum document size and nesting depth for frontmatter parsing.
3. **Validate types post-parse:** After parsing, validate that each frontmatter field matches the expected TypeScript type from the data contract. Do not trust YAML auto-typing.
4. **Wrap in try-catch:** All `gray-matter` calls must be wrapped in error handling that produces a `ParseWarning` rather than crashing the parser.
5. **Add test fixtures:** Include test files with malformed, oversized, and adversarial YAML frontmatter.

---

### MED-002: Symlink Traversal in File Scanner

**Severity:** Medium
**Category:** Path Traversal
**Affected Components:** File Scanner (Parser Layer 1), File Watcher (chokidar)
**Related Risk:** R6

**Description:**
The file scanner recursively reads markdown files from the repository directory structure. If the repository contains symbolic links, the scanner could follow symlinks that point outside the repository root, bypassing the path sandboxing described in Design Rule 4.

Similarly, `chokidar` (file watcher) follows symlinks by default, which could trigger re-parsing of files outside the repository boundary.

**Recommendations:**
1. **Disable symlink following:** Configure the file scanner to not follow symbolic links. Use `fs.lstat()` instead of `fs.stat()` to detect symlinks, and skip them.
2. **Configure chokidar:** Set `followSymlinks: false` in the chokidar watcher configuration.
3. **Post-resolution validation:** After resolving any file path, verify the resolved absolute path is still within the repository root.
4. **Document in ADR-002:** Add symlink handling as an explicit design decision.

---

### MED-003: Dependency Supply Chain Risk

**Severity:** Medium
**Category:** Supply Chain Security
**Affected Components:** All (project dependencies)
**Related Risk:** R14 (bundle size), New (to be added as R16)

**Description:**
The proposed dependency stack introduces supply chain risk through third-party packages. While the chosen libraries are well-established, the npm ecosystem is subject to dependency confusion, typosquatting, and compromised maintainer accounts.

**Dependency Assessment:**

| Package | Weekly Downloads | Last Updated | Risk Level | Notes |
|---------|-----------------|--------------|------------|-------|
| next | 5M+ | Active | Low | Meta-maintained, well-audited |
| react / react-dom | 20M+ | Active | Low | Meta-maintained |
| typescript | 50M+ | Active | Low | Microsoft-maintained |
| gray-matter | 5M+ | Active | Low | Widely used, focused scope |
| chart.js | 2M+ | Active | Low | Well-maintained, focused scope |
| react-markdown | 1M+ | Active | Low | Actively maintained |
| remark-gfm | 1M+ | Active | Low | Part of unified ecosystem |
| tailwindcss | 10M+ | Active | Low | Well-maintained |
| chokidar | 30M+ | Active | Low | Core Node.js ecosystem |

**Recommendations:**
1. **Lock dependencies:** Use `package-lock.json` (npm) and commit it to the repository. Consider using `npm ci` in all build processes.
2. **Enable npm audit:** Run `npm audit` as part of CI and before each release.
3. **Pin major versions:** Use exact version pinning or tilde ranges (`~`) rather than caret ranges (`^`) for security-sensitive dependencies (`gray-matter`, `react-markdown`).
4. **Review transitive dependencies:** Audit the transitive dependency tree, particularly for `gray-matter` → `js-yaml` version.
5. **Consider Subresource Integrity:** If any CDN-loaded resources are used in future versions, implement SRI hashes.

---

### MED-004: Prototype Pollution via Frontmatter Object Merging

**Severity:** Medium
**Category:** Injection / Logic Bug
**Affected Components:** Frontmatter Extractor (Parser Layer 2), Graph Builder (Parser Layer 3)
**Related Risk:** New (to be added as R17)

**Description:**
When YAML frontmatter is parsed into JavaScript objects and merged or spread into application state, there is a risk of prototype pollution. A malicious frontmatter field like `__proto__` or `constructor` could modify the Object prototype, affecting all JavaScript objects in the application.

Example malicious frontmatter:
```yaml
__proto__:
  isAdmin: true
constructor:
  prototype:
    polluted: true
```

While `gray-matter` + `js-yaml` with safe schema mitigates some of this, the risk re-emerges when parsed objects are spread (`...parsed`) into state objects or used as keys in lookups.

**Recommendations:**
1. **Use `Object.create(null)` for lookup maps:** When building the parsed prompt graph, use null-prototype objects for dictionaries.
2. **Validate field names:** Reject frontmatter fields named `__proto__`, `constructor`, or `prototype`.
3. **Use `Object.hasOwn()` instead of `in` operator:** When checking for property existence on parsed objects.
4. **Freeze parsed objects:** After validation, use `Object.freeze()` on parsed frontmatter to prevent mutation.

---

### LOW-001: Error Message Information Leakage

**Severity:** Low
**Category:** Information Disclosure
**Affected Components:** Parse warnings, error boundaries, console output

**Description:**
The `ParseWarning` interface includes `file` and `line` fields that expose filesystem paths. In a local-only application this is acceptable, but if the dashboard were ever deployed as a shared resource (e.g., team server), these paths would leak filesystem structure.

**Recommendations:**
1. **Relative paths only:** Display file paths relative to the repository root, never absolute filesystem paths.
2. **Error boundary messages:** Ensure React error boundaries display user-friendly messages, not stack traces, in the UI.
3. **Console-only debugging:** Detailed error information (stack traces, full paths) should go to console.error, not the rendered UI.

---

### LOW-002: Clipboard API Abuse Potential

**Severity:** Low
**Category:** UI Security
**Affected Components:** Copy-to-clipboard feature (FR-7)

**Description:**
The PRD specifies a copy-to-clipboard feature for prompt text. The Clipboard API (`navigator.clipboard.writeText()`) requires user gesture and is generally safe, but the content being copied comes from parsed markdown files. If a malicious file contains carefully crafted content, the user might unknowingly copy dangerous commands or scripts.

**Recommendations:**
1. **Visual preview:** Always show the content being copied in the UI before the user clicks "copy."
2. **No auto-copy:** Never automatically copy content to clipboard without explicit user action.
3. **Truncation indicator:** If content is truncated in the UI but full content is copied, indicate this clearly.

---

### LOW-003: File Watcher Denial of Service

**Severity:** Low
**Category:** Availability / DoS
**Affected Components:** File watcher (chokidar), parser pipeline

**Description:**
The chokidar file watcher with a 500ms debounce (per ADR-003) could be overwhelmed if a large number of files change simultaneously (e.g., during a `git checkout` of a branch with many changed files). This could cause excessive re-parsing and UI freezes.

**Recommendations:**
1. **Increase debounce for batch changes:** Implement an escalating debounce — 500ms for single file changes, 2-5 seconds for batch changes (more than 10 files in a short window).
2. **Queue management:** Implement a parsing queue that cancels in-progress parses when new changes arrive, rather than queueing multiple full parses.
3. **UI loading state:** Show a loading indicator during re-parsing to prevent user confusion during large updates.

---

## Dependency Vulnerability Check

All proposed dependencies were assessed for known vulnerabilities at the time of this review:

| Package | Known CVEs | Assessment |
|---------|-----------|------------|
| next (latest) | None critical for static export | Safe for v1 scope |
| gray-matter (latest) | No active CVEs | Safe; verify js-yaml version |
| chart.js (latest) | No active CVEs | Safe |
| react-markdown (latest) | No active CVEs | Safe; do not enable rehype-raw |
| remark-gfm (latest) | No active CVEs | Safe |
| chokidar (latest) | No active CVEs | Safe; disable symlink following |
| tailwindcss (latest) | No active CVEs | Safe; build-time only |

**Recommendation:** Run `npm audit` after initial scaffolding (prompt 11.0.1) and document results.

---

## Security Architecture Strengths

The proposed architecture has several inherent security strengths that should be preserved:

1. **Local-only execution (C1/C2):** No network-facing attack surface. No authentication, no session management, no CSRF, no SSRF.
2. **Read-only operations (C8):** Dashboard never writes to the repository. Eliminates data integrity attacks.
3. **Static export:** Next.js static export eliminates server-side code execution (no SSR injection, no API route abuse).
4. **TypeScript:** Static typing reduces type confusion bugs and provides compile-time contract enforcement.
5. **Minimal user input:** Primary interaction is read-only navigation. Only the repo selector accepts user-provided filesystem paths.

---

## Risk Register Updates

The following risks should be added to the risk register:

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R15 | XSS via markdown rendering if rehype-raw enabled or link protocols not sanitized | Low | High | Never enable rehype-raw; sanitize link protocols; enforce CSP; test with malicious fixtures | DevSecOps / Engineer | Open |
| R16 | Dependency supply chain compromise via npm ecosystem | Low | High | Lock dependencies; run npm audit in CI; pin security-sensitive packages; review transitive deps | DevSecOps / DevOps | Open |
| R17 | Prototype pollution via YAML frontmatter with __proto__ or constructor keys | Low | Medium | Validate field names; use null-prototype objects for lookups; freeze parsed objects | Engineer | Open |
| R18 | Symlink traversal bypasses repo root sandboxing | Low | High | Disable symlink following in scanner and chokidar; post-resolution path validation | Engineer / DevSecOps | Open |

Risk R6 should be updated with additional mitigation details from finding HIGH-001.

---

## Implementation Guidance for Downstream Prompts

### For Prompt 11.0.1 (Project Scaffolding)
- Configure `package-lock.json` and commit to repo
- Add CSP meta tag to `_document.tsx` or layout component
- Run `npm audit` and document results

### For Prompt 12.0.1 (Frontmatter Parser)
- Implement path canonicalization in File Scanner
- Disable symlink following in file scanner
- Wrap `gray-matter` calls in try-catch with ParseWarning output
- Validate frontmatter field names (reject `__proto__`, `constructor`)
- Validate parsed types against data contract schema
- Add adversarial test fixtures

### For Prompt 22.0.1 (Repo Selector)
- Implement allowlist-based repo path validation
- Canonicalize paths with `path.resolve()` + prefix check
- Reject paths containing `..`, null bytes, or non-printable characters
- Disable symlink following in chokidar (`followSymlinks: false`)
- Implement escalating debounce for batch file changes

### For Prompt 27.0.1 (Security Hardening)
- Verify all findings from this review are addressed
- Run final security audit of implementation
- Penetration test path traversal and XSS vectors
- Verify CSP headers and sanitization configuration

---

## Conclusion

No critical vulnerabilities were found that would block the project. The local-only, read-only architecture provides a strong security baseline. Two high-severity findings (path traversal and XSS) require specific mitigation during implementation but are addressable within the current architecture. Four medium-severity and three low-severity findings represent defense-in-depth recommendations that should be implemented during the relevant prompts.

**Decision: PROCEED** — No architectural changes required. Implementation prompts must address findings HIGH-001, HIGH-002, MED-001, MED-002, MED-003, MED-004 as mandatory requirements.
