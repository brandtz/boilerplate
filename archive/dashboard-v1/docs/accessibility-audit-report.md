# Accessibility Audit Report — Project Manager Dashboard

**Auditor:** Product Designer / UX Agent  
**Prompt:** 26.0.1  
**Date:** 2026-04-04  
**WCAG Target:** 2.1 Level AA  
**Components Audited:** 30 (all interactive + display components)

---

## Executive Summary

The dashboard has a **solid ARIA foundation** — most interactive regions have appropriate `role`, `aria-label`, and `aria-expanded` attributes. The `useDrawer` hook implements a proper focus trap with `Escape` close and focus restoration. Form controls in the Prompt and Epic filter bars have proper `<label>` associations.

However, the audit identified **14 findings** across 4 WCAG categories that require remediation. The most critical issues are: chart components providing zero screen reader information, missing skip navigation, absence of visible focus indicators, and keyboard-inaccessible sortable table headers.

| Severity | Count | WCAG Level |
|----------|-------|------------|
| HIGH     | 5     | A          |
| MEDIUM   | 6     | AA         |
| LOW      | 3     | AA / Best Practice |

**Recommendation:** Create an inserted prompt (26.0.2) to implement all HIGH and MEDIUM fixes.

---

## Finding 1: Charts provide no screen reader alternative (HIGH)

**WCAG:** 1.1.1 Non-text Content (Level A)  
**Components:** `EpicCompletionChart`, `PromptStatusChart`, `SessionThroughputChart`, `RemainingPromptsChart`  
**Issue:** All 4 Chart.js `<canvas>` elements render without any ARIA attributes. Screen readers encounter a mute canvas with no accessible name, no data table alternative, and no `role="img"`.  

**Current code:**
```tsx
<div className="h-64">
  <Bar data={data} options={defaultBarOptions} />
</div>
```

**Recommended fix:**
- Wrap each chart in a `<figure>` with `role="img"` and an `aria-label` summarizing the data
- Add a visually hidden `<table>` (sr-only) below each chart containing the raw data
- OR use Chart.js `plugins.title.display` with `aria-label` on the canvas parent

**Affected files:**
- `src/components/overview/EpicCompletionChart.tsx`
- `src/components/overview/PromptStatusChart.tsx`
- `src/components/overview/SessionThroughputChart.tsx`
- `src/components/overview/RemainingPromptsChart.tsx`

---

## Finding 2: No skip-to-content navigation link (HIGH)

**WCAG:** 2.4.1 Bypass Blocks (Level A)  
**Component:** `layout.tsx` / `AppShell.tsx`  
**Issue:** There is no skip-to-content link. Keyboard users must Tab through the full sidebar navigation (5+ links) and header controls on every page load before reaching the main content.

**Recommended fix:**
- Add a visually hidden skip link as the first child of `<body>`: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>`
- Add `id="main-content"` to the `<main>` element in `AppShell.tsx`

**Affected files:**
- `src/app/layout.tsx`
- `src/components/shell/AppShell.tsx`

---

## Finding 3: Sortable table headers not keyboard accessible (HIGH)

**WCAG:** 2.1.1 Keyboard (Level A)  
**Component:** `PromptTable.tsx`  
**Issue:** Sortable column headers (`<th>`) use `onClick` but have no `tabIndex`, `role="button"`, or `onKeyDown` handler. They cannot be reached or activated by keyboard.

**Current code:**
```tsx
<th
  className="... cursor-pointer hover:bg-gray-100"
  onClick={() => onSort(col.key)}
  aria-sort={ariaSort(col.key)}
>
```

**Recommended fix:**
- Add `tabIndex={0}`, `role="columnheader button"` (or wrap content in `<button>`)
- Add `onKeyDown` handler for `Enter` and `Space` keys
- Add `aria-label` describing the sort action: `"Sort by {column}, currently {direction}"`

**Affected file:** `src/components/prompts/PromptTable.tsx`

---

## Finding 4: No visible focus indicators (HIGH)

**WCAG:** 2.4.7 Focus Visible (Level AA) — but treated as HIGH due to app-wide impact  
**Component:** Global (all interactive elements)  
**Issue:** No focus ring styles exist in `globals.css` or on any component. The app relies entirely on browser default focus outlines, which are inconsistent across browsers and often invisible against colored backgrounds. No `focus-visible:ring-*` or `focus:outline-*` Tailwind utilities are used anywhere.

**Recommended fix:**
- Add a global focus-visible style in `globals.css`:
  ```css
  *:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
  }
  ```
- OR add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` to all interactive elements

**Affected file:** `src/app/globals.css`

---

## Finding 5: RepoSelector listbox missing keyboard navigation (HIGH)

**WCAG:** 2.1.1 Keyboard (Level A)  
**Component:** `RepoSelector.tsx`  
**Issue:** The recent projects list uses `role="listbox"` and `role="option"` but provides no arrow key navigation. Users cannot navigate the list with Up/Down arrow keys as expected for a listbox pattern. Additionally, `<button>` elements are placed inside `role="option"` divs, which is a role mismatch — `option` should not contain interactive children.

**Recommended fix:**
- Implement `onKeyDown` on the listbox: `ArrowDown` moves to next option, `ArrowUp` moves to previous, `Enter` selects
- Manage `aria-activedescendant` on the listbox to track the focused option
- Remove nested `<button>` from within `role="option"` — make the option div itself the interactive element
- OR simplify: drop `role="listbox"` and use a simple list of buttons (this is more honest for the current implementation)

**Affected file:** `src/components/shell/RepoSelector.tsx`

---

## Finding 6: SessionFilterBar search input has no accessible label (MEDIUM)

**WCAG:** 1.3.1 Info and Relationships (Level A) — rated MEDIUM since the placeholder provides some context  
**Component:** `SessionFilterBar.tsx`  
**Issue:** The search input is wrapped in a `<label>` element but neither visible label text nor `aria-label` is provided. The only hint is the `placeholder` attribute ("Search sessions…"), which is not announced by all screen readers.

**Current code:**
```tsx
<label className="flex items-center gap-1 text-sm text-gray-600">
  <input type="text" placeholder="Search sessions…" ... />
</label>
```

**Recommended fix:**
- Add `aria-label="Search sessions"` to the input, OR
- Add visible or `sr-only` label text inside the `<label>`:
  ```tsx
  <label className="flex items-center gap-1 text-sm text-gray-600">
    <span className="sr-only">Search</span>
    <input type="text" placeholder="Search sessions…" ... />
  </label>
  ```

**Affected file:** `src/components/sessions/SessionFilterBar.tsx`

---

## Finding 7: SessionDetail buttons have no aria-labels (MEDIUM)

**WCAG:** 4.1.2 Name, Role, Value (Level A) — rated MEDIUM since visible text provides some context  
**Component:** `SessionDetail.tsx`  
**Issue:** The "→ {promptId}" navigation buttons and "View Prompt →" button have visible text, but no `aria-label` providing full context. A screen reader announces "→ 18.0.1" which is ambiguous.

**Recommended fix:**
- Add `aria-label="Navigate to prompt {pid}"` on next-recommended buttons
- Add `aria-label="View prompt {session.promptId}"` on the "View Prompt →" button

**Affected file:** `src/components/sessions/SessionDetail.tsx`

---

## Finding 8: Superseded/Cancelled badge contrast fails WCAG AA (MEDIUM)

**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Component:** `StatusBadge.tsx` via `statusTheme.ts`  
**Issue:** The `superseded` and `cancelled` statuses use `text-gray-400` (#9CA3AF) on `bg-gray-100` (#F3F4F6). The contrast ratio is approximately **2.5:1**, which fails the WCAG AA minimum of **4.5:1** for normal text.

**Current colors:**
| Status | Text | Background | Contrast Ratio | Pass? |
|--------|------|------------|---------------|-------|
| draft | text-gray-700 (#374151) | bg-gray-200 (#E5E7EB) | ~7.4:1 | ✅ |
| ready | text-blue-800 (#1E40AF) | bg-blue-100 (#DBEAFE) | ~8.0:1 | ✅ |
| in_progress | text-amber-800 (#92400E) | bg-amber-100 (#FEF3C7) | ~7.2:1 | ✅ |
| in_review | text-violet-800 (#5B21B6) | bg-violet-100 (#EDE9FE) | ~7.0:1 | ✅ |
| blocked | text-red-800 (#991B1B) | bg-red-100 (#FEE2E2) | ~7.0:1 | ✅ |
| done | text-green-800 (#166534) | bg-green-100 (#DCFCE7) | ~6.8:1 | ✅ |
| **superseded** | **text-gray-400 (#9CA3AF)** | **bg-gray-100 (#F3F4F6)** | **~2.5:1** | ❌ |
| **cancelled** | **text-gray-400 (#9CA3AF)** | **bg-gray-100 (#F3F4F6)** | **~2.5:1** | ❌ |

**Recommended fix:**
- Change `superseded` and `cancelled` text to `text-gray-500` (#6B7280) — yields ~4.6:1 contrast ratio, passing AA
- The visual "muted" intent is preserved since the strikethrough + lighter background already signal inactive status

**Affected file:** `src/constants/statusTheme.ts`

---

## Finding 9: Data refresh has no screen reader announcement (MEDIUM)

**WCAG:** 4.1.3 Status Messages (Level AA)  
**Component:** `AppShell.tsx` / `DashboardContext.tsx`  
**Issue:** When dashboard data refreshes (via the Refresh button or initial load), there is no `aria-live` announcement. The `aria-busy` attribute on `<main>` is set during loading, but when it clears there is no accompanying status message. Screen reader users don't know when data finishes loading or what changed.

**Recommended fix:**
- Add an `aria-live="polite"` region (visually hidden) that announces "Dashboard data loaded" or "Dashboard refreshed" when loading completes
- Add error announcements: "Dashboard failed to load: {error message}"

**Affected files:**
- `src/components/shell/AppShell.tsx`
- OR `src/context/DashboardContext.tsx`

---

## Finding 10: Accordion containers missing WAI-ARIA accordion pattern (MEDIUM)

**WCAG:** 4.1.2 Name, Role, Value (Level A) — rated MEDIUM since basic expand/collapse works  
**Component:** `EpicAccordion.tsx`, `EpicCard.tsx`, `StoryRow.tsx`, `SessionCard.tsx`  
**Issue:** The accordion pattern is partially implemented — toggle buttons have `aria-expanded` and `aria-controls`. However, the accordion container itself (`EpicAccordion`) has no `role` attribute, and the content panels controlled by `aria-controls` do not have `role="region"` or `aria-labelledby` pointing back to the trigger. This means screen readers can navigate the triggers but cannot easily identify the associated content panels.

**Recommended fix:**
- Add `role="region"` and `aria-labelledby="{triggerId}"` to each collapsible content panel
- Ensure the `id` on the content panel matches the `aria-controls` value on the trigger
- These are already partially in place — `aria-controls={epicContentId}` is used, but the content div should have `id={epicContentId}` and `role="region"`

**Affected files:**
- `src/components/epics/EpicCard.tsx`
- `src/components/epics/StoryRow.tsx`
- `src/components/sessions/SessionCard.tsx`

---

## Finding 11: Redundant keyboard handlers on native buttons (LOW)

**WCAG:** Best Practice  
**Components:** `EpicCard.tsx`, `StoryRow.tsx`, `SessionCard.tsx`  
**Issue:** These components add `onKeyDown` handlers for `Enter` and `Space` on native `<button>` elements. Native HTML buttons already handle these keys. The handlers are harmless but add unnecessary code.

**Recommended fix:**
- Remove the redundant `onKeyDown` handlers from `<button>` elements
- Keep `onKeyDown` only on non-button interactive elements (like `<tr>` in PromptTable)

**Affected files:**
- `src/components/epics/EpicCard.tsx`
- `src/components/epics/StoryRow.tsx`
- `src/components/sessions/SessionCard.tsx`

---

## Finding 12: PromptTable overlay click not keyboard-accessible (LOW)

**WCAG:** 2.1.1 Keyboard (Level A) — rated LOW since drawer has close button  
**Component:** `PromptDetailDrawer.tsx`  
**Issue:** The drawer overlay (`aria-hidden="true"`) closes the drawer on click, but this is not keyboard-accessible. This is acceptable since the drawer has a dedicated close button and `Escape` key support via `useDrawer`, but it is worth noting.

**Status:** No fix needed — alternative keyboard close mechanisms exist.

---

## Finding 13: Dark mode colors not audited (LOW)

**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Component:** `globals.css`  
**Issue:** The CSS defines `prefers-color-scheme: dark` variables `--background: #0a0a0a` and `--foreground: #ededed`, but all component colors are hardcoded Tailwind light-mode classes (e.g., `bg-white`, `text-gray-900`). The dark mode CSS variables are not used by any component. If a user has dark mode enabled, the body background changes but all component backgrounds remain white, creating a fully light UI inside a dark shell. This is cosmetic but could cause contrast issues at component boundaries.

**Recommended fix:**
- Either fully support dark mode with Tailwind `dark:` variants, or remove the dark mode CSS variables to avoid inconsistency
- Not a WCAG violation since the light components have good contrast on their own

---

## Finding 14: No `<h1>` page heading on all views (LOW)

**WCAG:** 2.4.6 Headings and Labels (Level AA) — rated LOW since navigation structure compensates  
**Component:** Page-level components  
**Issue:** The Overview page has no explicit `<h1>`. Charts and panels use `<h3>` directly. The Epics page uses "Epics View" as an `<h1>`. The Prompts and Sessions pages do not have visible `<h1>` headings. Screen reader users navigating by heading may not find a clear page title.

**Recommended fix:**
- Add `<h1>` to each page: "Overview", "Epics", "Prompts", "Sessions"
- Ensure heading hierarchy is logical: `<h1>` (page) → `<h2>` (section) → `<h3>` (panel)

**Affected files:**
- `src/app/page.tsx` (Overview)
- `src/app/prompts/page.tsx`
- `src/app/sessions/page.tsx`

---

## WCAG Compliance Summary

| WCAG Criterion | Level | Status | Findings |
|----------------|-------|--------|----------|
| 1.1.1 Non-text Content | A | ❌ FAIL | F1 (charts) |
| 1.3.1 Info and Relationships | A | ⚠️ PARTIAL | F6 (search label) |
| 1.4.3 Contrast (Minimum) | AA | ⚠️ PARTIAL | F8, F13 |
| 2.1.1 Keyboard | A | ❌ FAIL | F3, F5 |
| 2.4.1 Bypass Blocks | A | ❌ FAIL | F2 |
| 2.4.6 Headings and Labels | AA | ⚠️ PARTIAL | F14 |
| 2.4.7 Focus Visible | AA | ❌ FAIL | F4 |
| 4.1.2 Name, Role, Value | A | ⚠️ PARTIAL | F7, F10 |
| 4.1.3 Status Messages | AA | ⚠️ PARTIAL | F9 |

### Items passing:
- ✅ 1.3.1 — Labels on form controls (Prompt/Epic filter bars)
- ✅ 2.4.3 — Focus order is logical (DOM order matches visual)
- ✅ 2.4.4 — Link purpose is determinable from context
- ✅ 3.1.1 — Language of page (`lang="en"`)
- ✅ 4.1.2 — Drawer dialog pattern (role, aria-modal, aria-labelledby, focus trap, Escape)
- ✅ 4.1.2 — Progress bars have proper role and aria-value attributes
- ✅ 4.1.2 — Navigation landmarks (role="navigation", role="main", role="status")
- ✅ 4.1.2 — CopyButton live region for state change

---

## Remediation Priority

### Must-fix for 26.0.2 (HIGH + MEDIUM):
1. F4 — Global focus-visible indicators
2. F2 — Skip-to-content link
3. F3 — Keyboard-accessible sort headers
4. F1 — Chart accessible alternatives
5. F5 — RepoSelector listbox keyboard nav (or revert to button list)
6. F6 — SessionFilterBar search label
7. F7 — SessionDetail button aria-labels
8. F8 — Superseded/cancelled badge contrast
9. F9 — Data refresh announcements
10. F10 — Accordion content panel roles

### Should-fix (LOW):
11. F11 — Remove redundant onKeyDown handlers
12. F14 — Add page headings

### No action needed:
13. F12 — Overlay click (alternatives exist)
14. F13 — Dark mode (cosmetic, not blocking)
