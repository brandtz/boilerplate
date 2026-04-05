'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  getRecentProjects,
  saveRecentPath,
  removeRecentPath,
  clearRecentProjects,
} from '@/lib/recentProjects';

interface RepoSelectorProps {
  currentPath: string;
  onSelectPath: (path: string) => Promise<void>;
}

function basename(p: string): string {
  const parts = p.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || p;
}

export function RepoSelector({ currentPath, onSelectPath }: RepoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent projects when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setRecentPaths(getRecentProjects());
      setError(null);
      setInputValue('');
      // Focus input after opening
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleSelect = useCallback(
    async (pathStr: string) => {
      setError(null);
      setIsSubmitting(true);
      try {
        await onSelectPath(pathStr);
        saveRecentPath(pathStr);
        setRecentPaths(getRecentProjects());
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSelectPath],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      void handleSelect(trimmed);
    },
    [inputValue, handleSelect],
  );

  const handleRemoveRecent = useCallback((pathStr: string) => {
    removeRecentPath(pathStr);
    setRecentPaths(getRecentProjects());
  }, []);

  const handleClearAll = useCallback(() => {
    clearRecentProjects();
    setRecentPaths([]);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} data-testid="repo-selector">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        aria-label="Select repository"
        aria-expanded={isOpen}
        data-testid="repo-selector-trigger"
      >
        📁 {basename(currentPath)}
        <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
          role="dialog"
          aria-label="Repository selector"
          data-testid="repo-selector-dropdown"
        >
          {/* Path input */}
          <form onSubmit={handleSubmit} className="border-b border-gray-100 p-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Repository Path
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter path…"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                aria-label="Repository path"
                data-testid="repo-path-input"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputValue.trim()}
                className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                data-testid="repo-path-submit"
              >
                Load
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="border-b border-gray-100 px-3 py-2 text-xs text-red-600" data-testid="repo-selector-error">
              ⚠ {error}
            </div>
          )}

          {/* Recent projects list */}
          <div className="max-h-60 overflow-y-auto" role="listbox" aria-label="Recent repositories">
            {recentPaths.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400" data-testid="no-recent">
                No recent projects
              </p>
            ) : (
              <>
                <p className="px-3 pt-2 text-xs font-medium text-gray-500">Recent</p>
                {recentPaths.map((p) => (
                  <div
                    key={p}
                    className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                      p === currentPath ? 'bg-blue-50' : ''
                    }`}
                    role="option"
                    aria-selected={p === currentPath}
                    data-testid={`recent-item-${basename(p)}`}
                  >
                    <button
                      onClick={() => void handleSelect(p)}
                      className="flex-1 text-left text-sm text-gray-700 truncate"
                      title={p}
                      disabled={isSubmitting}
                    >
                      {basename(p)}
                      <span className="block text-xs text-gray-400 truncate">{p}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveRecent(p)}
                      className="ml-2 shrink-0 text-gray-400 hover:text-red-500 text-xs"
                      aria-label={`Remove ${basename(p)} from recent`}
                      data-testid={`remove-recent-${basename(p)}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Clear all */}
          {recentPaths.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:underline"
                data-testid="clear-recent"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
