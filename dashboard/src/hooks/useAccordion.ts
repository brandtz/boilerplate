'use client';

import { useState, useCallback } from 'react';

/**
 * Manages expand/collapse state for a flat set of IDs.
 * Used by EpicAccordion for epic/story/task hierarchy.
 */
export function useAccordion(initialExpanded: string[] = []) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initialExpanded),
  );

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  );

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  return { isExpanded, toggle, collapseAll };
}
