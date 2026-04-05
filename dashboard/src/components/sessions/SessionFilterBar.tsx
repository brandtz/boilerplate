'use client';

import { useState, useCallback } from 'react';

export interface SessionFilters {
  status: string;
  role: string;
  search: string;
}

const DEFAULT_FILTERS: SessionFilters = {
  status: 'All',
  role: 'All',
  search: '',
};

interface SessionFilterBarProps {
  roles: string[];
  onChange: (filters: SessionFilters) => void;
  initialFilters?: Partial<SessionFilters>;
}

const STATUS_OPTIONS = ['All', 'complete', 'partial', 'failed'];

export function SessionFilterBar({ roles, onChange, initialFilters }: SessionFilterBarProps) {
  const [filters, setFilters] = useState<SessionFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const update = useCallback(
    (partial: Partial<SessionFilters>) => {
      const next = { ...filters, ...partial };
      setFilters(next);
      onChange(next);
    },
    [filters, onChange],
  );

  const hasActiveFilters =
    filters.status !== 'All' || filters.role !== 'All' || filters.search !== '';

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
      data-testid="session-filter-bar"
    >
      {/* Status */}
      <label className="flex items-center gap-1 text-sm text-gray-600">
        Status:
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          data-testid="filter-status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* Role */}
      <label className="flex items-center gap-1 text-sm text-gray-600">
        Role:
        <select
          value={filters.role}
          onChange={(e) => update({ role: e.target.value })}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          data-testid="filter-role"
        >
          <option value="All">All</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      {/* Search */}
      <label className="flex items-center gap-1 text-sm text-gray-600">
        <input
          type="text"
          placeholder="Search sessions…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1 text-sm w-48"
          data-testid="filter-search"
        />
      </label>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={() =>
            update({ status: 'All', role: 'All', search: '' })
          }
          className="text-xs text-blue-600 hover:underline"
          data-testid="filter-clear"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
