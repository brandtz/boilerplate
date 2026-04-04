'use client';

import { createContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { DashboardState } from '@/types';

export interface DashboardContextValue {
  state: DashboardState | null;
  isLoading: boolean;
  error: string | null;
  repoPath: string;
  lastParsedAt: string | null;
  refresh: () => Promise<void>;
  setRepoPath: (path: string) => Promise<void>;
}

type DashboardAction =
  | { type: 'PARSE_START' }
  | { type: 'PARSE_SUCCESS'; payload: DashboardState }
  | { type: 'PARSE_ERROR'; error: string }
  | { type: 'SET_REPO_PATH'; path: string };

interface ReducerState {
  state: DashboardState | null;
  isLoading: boolean;
  error: string | null;
  repoPath: string;
}

function reducer(current: ReducerState, action: DashboardAction): ReducerState {
  switch (action.type) {
    case 'PARSE_START':
      return { ...current, isLoading: true, error: null };
    case 'PARSE_SUCCESS':
      return {
        ...current,
        isLoading: false,
        error: null,
        state: action.payload,
      };
    case 'PARSE_ERROR':
      return { ...current, isLoading: false, error: action.error };
    case 'SET_REPO_PATH':
      return { ...current, repoPath: action.path };
  }
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  /** Optional initial repo path. Defaults to cwd-relative '.' */
  initialRepoPath?: string;
  /** Optional parse function override for testing. */
  parseFn?: (repoPath: string) => Promise<DashboardState>;
}

export function DashboardProvider({
  children,
  initialRepoPath = '.',
  parseFn,
}: DashboardProviderProps) {
  const [reducerState, dispatch] = useReducer(reducer, {
    state: null,
    isLoading: false,
    error: null,
    repoPath: initialRepoPath,
  });

  const loadData = useCallback(
    async (repoPath: string) => {
      dispatch({ type: 'PARSE_START' });
      try {
        if (parseFn) {
          const data = await parseFn(repoPath);
          dispatch({ type: 'PARSE_SUCCESS', payload: data });
        } else {
          // In a static-export environment the parser cannot run in the browser.
          // Data must be provided via props, API route, or pre-built JSON.
          // For now, dispatch an error explaining the situation.
          dispatch({
            type: 'PARSE_ERROR',
            error: 'No parse function provided. Supply parseFn or pre-built state.',
          });
        }
      } catch (err) {
        dispatch({
          type: 'PARSE_ERROR',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [parseFn],
  );

  const refresh = useCallback(async () => {
    await loadData(reducerState.repoPath);
  }, [loadData, reducerState.repoPath]);

  const setRepoPath = useCallback(
    async (path: string) => {
      dispatch({ type: 'SET_REPO_PATH', path });
      await loadData(path);
    },
    [loadData],
  );

  // Load data on mount
  useEffect(() => {
    if (parseFn) {
      loadData(reducerState.repoPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: DashboardContextValue = {
    state: reducerState.state,
    isLoading: reducerState.isLoading,
    error: reducerState.error,
    repoPath: reducerState.repoPath,
    lastParsedAt: reducerState.state?.project.lastParsedAt ?? null,
    refresh,
    setRepoPath,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}
