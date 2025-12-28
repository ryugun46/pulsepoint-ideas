import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Command, Calendar, User, LogOut, ChevronDown, Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { CommandPalette } from './CommandPalette';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function TopBar({ breadcrumbs }: TopBarProps) {
  const navigate = useNavigate();
  const { user, setUser, sidebarOpen, globalTimeframe, setGlobalTimeframe } = useApp();
  const [commandOpen, setCommandOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 transition-all duration-300"
        style={{ left: sidebarOpen ? '240px' : '64px' }}
      >
        <div className="flex items-center gap-4 lg:ml-0 ml-12">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  {crumb.href ? (
                    <Link 
                      to={crumb.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            /* Search */
            <Button
              variant="outline"
              className="w-48 md:w-64 justify-start text-muted-foreground bg-muted/30 border-0 hover:bg-muted/50"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="ml-auto pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Timeframe Quick Switch */}
          <Select value={globalTimeframe} onValueChange={setGlobalTimeframe}>
            <SelectTrigger className="w-28 md:w-36 bg-muted/30 border-0">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden md:inline">{user?.name || 'User'}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                <User className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
