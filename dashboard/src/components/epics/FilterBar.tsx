'use client';

import { useState } from 'react';
import type { PromptStatus } from '@/types';

const STATUS_OPTIONS: { value: '' | PromptStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
  { value: 'superseded', label: 'Superseded' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface FilterBarProps {
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({ onStatusChange, onSearchChange }: FilterBarProps) {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
      data-testid="filter-bar"
    >
      <label className="sr-only" htmlFor="status-filter">
        Filter by status
      </label>
      <select
        id="status-filter"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          onStatusChange(e.target.value);
        }}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
        data-testid="status-filter"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="search-filter">
        Search epics and stories
      </label>
      <input
        id="search-filter"
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearchChange(e.target.value);
        }}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 flex-1 min-w-[200px]"
        data-testid="search-filter"
      />
    </div>
  );
}
