'use client';

import { useState } from 'react';
import type { PromptStatus, ParsedEpic } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
  { value: 'superseded', label: 'Superseded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LOCATION_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archive', label: 'Archive' },
  { value: 'all', label: 'All' },
];

export interface PromptFilters {
  status: string;
  epic: string;
  location: string;
  role: string;
  search: string;
}

const DEFAULT_FILTERS: PromptFilters = {
  status: 'All',
  epic: 'All',
  location: 'active',
  role: 'All',
  search: '',
};

interface PromptFilterBarProps {
  epics: ParsedEpic[];
  roles: string[];
  onChange: (filters: PromptFilters) => void;
  initialFilters?: Partial<PromptFilters>;
}

export function PromptFilterBar({ epics, roles, onChange, initialFilters }: PromptFilterBarProps) {
  const [filters, setFilters] = useState<PromptFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const update = (partial: Partial<PromptFilters>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onChange(next);
  };

  const clearAll = () => {
    const cleared: PromptFilters = {
      status: 'All',
      epic: 'All',
      location: 'active',
      role: 'All',
      search: '',
    };
    setFilters(cleared);
    onChange(cleared);
  };

  const hasActiveFilters =
    filters.status !== 'All' ||
    filters.epic !== 'All' ||
    filters.location !== 'active' ||
    filters.role !== 'All' ||
    filters.search !== '';

  return (
    <div
      className="space-y-2 rounded-lg border border-gray-200 bg-white p-3"
      data-testid="prompt-filter-bar"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="pf-status">Filter by status</label>
        <select
          id="pf-status"
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          data-testid="pf-status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pf-epic">Filter by epic</label>
        <select
          id="pf-epic"
          value={filters.epic}
          onChange={(e) => update({ epic: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          data-testid="pf-epic"
        >
          <option value="All">All Epics</option>
          {epics.map((e) => (
            <option key={e.epicId} value={e.epicId}>{e.epicId}: {e.title}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pf-location">Filter by location</label>
        <select
          id="pf-location"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          data-testid="pf-location"
        >
          {LOCATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pf-role">Filter by role</label>
        <select
          id="pf-role"
          value={filters.role}
          onChange={(e) => update({ role: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          data-testid="pf-role"
        >
          <option value="All">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pf-search">Search prompts</label>
        <input
          id="pf-search"
          type="search"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm flex-1 min-w-[180px]"
          data-testid="pf-search"
        />

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            data-testid="pf-clear"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
