'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { LoadingIndicator } from '@/components/shared/LoadingIndicator';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { useDashboard } from '@/hooks/useDashboard';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoading, error, refresh } = useDashboard();
  const [announcement, setAnnouncement] = useState('');
  const wasLoading = useRef(false);

  useEffect(() => {
    if (wasLoading.current && !isLoading) {
      setAnnouncement(error ? 'Dashboard data failed to load' : 'Dashboard data loaded');
    }
    wasLoading.current = isLoading;
  }, [isLoading, error]);

  return (
    <div className="flex h-screen flex-col" data-testid="app-shell">
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="live-region">
        {announcement}
      </div>
      <Header />
      <LoadingIndicator isLoading={isLoading} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-white p-6"
          role="main"
          aria-label="Main content"
          aria-busy={isLoading}
          data-testid="main-content"
        >
          {error && <ErrorBanner message={error} onRetry={() => void refresh()} />}
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
