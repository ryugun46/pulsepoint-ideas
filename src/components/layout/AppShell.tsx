import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, sidebarOpen } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          sidebarOpen ? 'pl-60' : 'pl-16'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
