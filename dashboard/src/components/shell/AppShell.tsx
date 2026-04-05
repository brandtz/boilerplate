'use client';

import { useState, type ReactNode } from 'react';
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

  return (
    <div className="flex h-screen flex-col" data-testid="app-shell">
      <Header />
      <LoadingIndicator isLoading={isLoading} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main
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
