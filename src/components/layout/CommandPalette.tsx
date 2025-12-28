import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  LayoutDashboard, 
  Search, 
  FolderOpen, 
  Lightbulb, 
  Bell, 
  Settings,
  Plus,
  FileText
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { analyses, collections } = useApp();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search analyses, collections, or run commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/app/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/subreddits'))}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Manage Subreddits
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/app'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/analyses'))}>
            <Search className="mr-2 h-4 w-4" />
            Analyses
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/ideas'))}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Ideas
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/alerts'))}>
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        {analyses.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Analyses">
              {analyses.slice(0, 5).map((analysis) => (
                <CommandItem
                  key={analysis.id}
                  onSelect={() => runCommand(() => navigate(`/app/analyses/${analysis.id}`))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {analysis.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {collections.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Collections">
              {collections.map((collection) => (
                <CommandItem
                  key={collection.id}
                  onSelect={() => runCommand(() => navigate('/app/subreddits'))}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {collection.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
