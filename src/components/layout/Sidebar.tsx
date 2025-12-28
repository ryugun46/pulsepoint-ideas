import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FolderOpen, 
  Lightbulb, 
  Bell, 
  Settings,
  ChevronLeft,
  Activity,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

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

function NavContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground text-lg tracking-tight">PulseMine</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        <div className={cn("mb-3", collapsed ? "px-1" : "px-2")}>
          {!collapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Menu</span>
          )}
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'sidebar-link',
              isActive(item.href) && 'sidebar-link-active'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-3">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'sidebar-link',
              isActive(item.href) && 'sidebar-link-active'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:block',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <NavContent collapsed={!sidebarOpen} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm hidden lg:flex"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn('h-3 w-3 transition-transform', !sidebarOpen && 'rotate-180')} />
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <NavContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
