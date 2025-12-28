import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FolderOpen, 
  Lightbulb, 
  Bell, 
  Settings,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const navItems = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Analyses', href: '/app/analyses', icon: Search },
  { label: 'Subreddits', href: '/app/subreddits', icon: FolderOpen },
  { label: 'Ideas', href: '/app/ideas', icon: Lightbulb },
  { label: 'Alerts', href: '/app/alerts', icon: Bell },
];

const bottomNavItems = [
  { label: 'Settings', href: '/app/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useApp();

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-foreground">PulseMine</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'sidebar-link',
                isActive(item.href) && 'sidebar-link-active'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border p-3">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'sidebar-link',
                isActive(item.href) && 'sidebar-link-active'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
