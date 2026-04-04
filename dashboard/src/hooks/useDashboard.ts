'use client';

import { useContext } from 'react';
import { DashboardContext, type DashboardContextValue } from '@/context/DashboardContext';

/**
 * Consumer hook for DashboardContext.
 * Throws if used outside DashboardProvider.
 */
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within a <DashboardProvider>');
  }
  return ctx;
}
