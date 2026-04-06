#!/bin/sh
# validate-boilerplate.sh — Structural integrity checker for the agentic boilerplate
# POSIX-compatible. No bashisms. Runs in Git Bash (Windows) and native sh/bash (macOS/Linux).
# Exit 0 if all checks pass, exit 1 if any fail.

set -e

PASS_COUNT=0
FAIL_COUNT=0
TOTAL=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  TOTAL=$((TOTAL + 1))
  echo "PASS: $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  TOTAL=$((TOTAL + 1))
  echo "FAIL: $1 — $2"
}

# ---------------------------------------------------------------------------
# Check 1: Required directories exist
# ---------------------------------------------------------------------------
check_directories() {
  for dir in \
    agents \
    agents/context \
    agents/standards \
    agents/templates \
    agents/roles \
    agents/workflows \
    prompts \
    prompts/active \
    prompts/archive \
    dashboard
  do
    if [ -d "$dir" ]; then
      pass "Directory exists: $dir"
    else
      fail "Directory exists: $dir" "directory not found"
    fi
  done
}

# ---------------------------------------------------------------------------
# Check 2: Required context files exist
# ---------------------------------------------------------------------------
check_context_files() {
  for file in \
    project-charter.md \
    assumptions.md \
    constraints.md \
    risk-register.md \
    decision-log.md \
    status-dashboard.md \
    product-brief.md
  do
    if [ -f "agents/context/$file" ]; then
      pass "Context file exists: $file"
    else
      fail "Context file exists: $file" "not found in agents/context/"
    fi
  done
}

# ---------------------------------------------------------------------------
# Check 3: Standards files are non-empty (> 3 lines)
# ---------------------------------------------------------------------------
check_standards() {
  found_any=0
  for file in agents/standards/*.md; do
    # Guard against no-match glob
    if [ ! -f "$file" ]; then
      continue
    fi
    found_any=1
    line_count=$(wc -l < "$file" | tr -d ' ')
    basename_file=$(basename "$file")
    if [ "$line_count" -gt 3 ]; then
      pass "Standard non-empty (${line_count} lines): $basename_file"
    else
      fail "Standard non-empty: $basename_file" "only $line_count lines (minimum 4 required)"
    fi
  done
  if [ "$found_any" -eq 0 ]; then
    fail "Standards exist" "no .md files found in agents/standards/"
  fi
}

# ---------------------------------------------------------------------------
# Check 4: Template files are non-empty (> 3 lines)
# ---------------------------------------------------------------------------
check_templates() {
  found_any=0
  for file in agents/templates/*.md; do
    if [ ! -f "$file" ]; then
      continue
    fi
    found_any=1
    line_count=$(wc -l < "$file" | tr -d ' ')
    basename_file=$(basename "$file")
    if [ "$line_count" -gt 3 ]; then
      pass "Template non-empty (${line_count} lines): $basename_file"
    else
      fail "Template non-empty: $basename_file" "only $line_count lines (minimum 4 required)"
    fi
  done
  if [ "$found_any" -eq 0 ]; then
    fail "Templates exist" "no .md files found in agents/templates/"
  fi
}

# ---------------------------------------------------------------------------
# Check 5: Role directories have content
# ---------------------------------------------------------------------------
check_roles() {
  found_any=0
  for dir in agents/roles/*/; do
    if [ ! -d "$dir" ]; then
      continue
    fi
    found_any=1
    dirname_short=$(basename "$dir")
    md_count=$(find "$dir" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$md_count" -gt 0 ]; then
      pass "Role directory has content ($md_count files): $dirname_short"
    else
      fail "Role directory has content: $dirname_short" "no .md files found"
    fi
  done
  if [ "$found_any" -eq 0 ]; then
    fail "Role directories exist" "no subdirectories found in agents/roles/"
  fi
}

# ---------------------------------------------------------------------------
# Check 6: Prompt index consistency
# Every .md file in prompts/active/ should have a matching row in prompts/index.md
# ---------------------------------------------------------------------------
check_prompt_index() {
  if [ ! -f "prompts/index.md" ]; then
    fail "Prompt index exists" "prompts/index.md not found"
    return
  fi
  pass "Prompt index exists: prompts/index.md"

  for file in prompts/active/*.md; do
    if [ ! -f "$file" ]; then
      continue
    fi
    basename_file=$(basename "$file")
    # Skip README files
    if [ "$basename_file" = "README.md" ]; then
      continue
    fi
    # Check if the filename appears anywhere in the index
    if grep -q "$basename_file" prompts/index.md; then
      pass "Prompt indexed: $basename_file"
    else
      fail "Prompt indexed: $basename_file" "not found in prompts/index.md"
    fi
  done
}

# ---------------------------------------------------------------------------
# Check 7: Cross-reference validation
# If required-reading-standard.md exists, check that file paths it references resolve
# ---------------------------------------------------------------------------
check_cross_references() {
  rr_file="agents/standards/required-reading-standard.md"
  if [ ! -f "$rr_file" ]; then
    pass "Cross-reference check: required-reading-standard.md not found (skipped)"
    return
  fi

  # Extract paths that look like file references (agents/... or prompts/...)
  paths=$(grep -oE '(agents|prompts|docs|scripts|dashboard)/[a-zA-Z0-9_./-]+\.md' "$rr_file" 2>/dev/null || true)
  if [ -z "$paths" ]; then
    pass "Cross-reference check: no file paths found in required-reading-standard.md (skipped)"
    return
  fi

  echo "$paths" | sort -u | while read -r ref_path; do
    if [ -f "$ref_path" ]; then
      pass "Cross-reference resolves: $ref_path"
    else
      fail "Cross-reference resolves: $ref_path" "referenced in required-reading-standard.md but file not found"
    fi
  done
}

# ---------------------------------------------------------------------------
# Check 8: No orphaned handoffs
# Every .md handoff in agents/handoffs/ should be referenced by a prompt or the index
# ---------------------------------------------------------------------------
check_orphaned_handoffs() {
  handoff_dir="agents/handoffs"
  if [ ! -d "$handoff_dir" ]; then
    pass "Handoff directory check: agents/handoffs/ not found (skipped)"
    return
  fi

  md_count=$(find "$handoff_dir" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$md_count" -eq 0 ]; then
    pass "Orphaned handoff check: no .md handoffs to check"
    return
  fi

  for file in "$handoff_dir"/*.md; do
    if [ ! -f "$file" ]; then
      continue
    fi
    basename_file=$(basename "$file")
    # Search for references in prompts/index.md and all prompt files
    found=0
    if grep -rq "$basename_file" prompts/ 2>/dev/null; then
      found=1
    fi
    if [ "$found" -eq 0 ] && grep -rq "$basename_file" agents/handoffs/ 2>/dev/null; then
      # Self-reference doesn't count, but check prompt frontmatter
      if grep -rq "$file" prompts/active/ 2>/dev/null; then
        found=1
      fi
    fi
    if [ "$found" -eq 1 ]; then
      pass "Handoff referenced: $basename_file"
    else
      fail "Handoff referenced: $basename_file" "not referenced by any prompt or the index"
    fi
  done
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo "=========================================="
echo "Boilerplate Structural Integrity Check"
echo "=========================================="
echo ""

check_directories
echo ""
check_context_files
echo ""
check_standards
echo ""
check_templates
echo ""
check_roles
echo ""
check_prompt_index
echo ""
check_cross_references
echo ""
check_orphaned_handoffs

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT/$TOTAL checks passed"
if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "FAILED: $FAIL_COUNT check(s) did not pass"
  exit 1
else
  echo "ALL CHECKS PASSED"
  exit 0
fi
