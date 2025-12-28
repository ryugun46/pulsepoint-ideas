import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Lightbulb, ArrowRight, Users, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { IdeaStatus } from '@/types';

const columns: { id: IdeaStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'researching', label: 'Researching' },
  { id: 'building', label: 'Building' },
  { id: 'launched', label: 'Launched' },
];

export default function IdeasList() {
  const { ideas } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIdeas = ideas.filter(idea =>
    idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.oneLiner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIdeasByStatus = (status: IdeaStatus) => filteredIdeas.filter(i => i.status === status);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ideas Library</h1>
            <p className="text-muted-foreground">Track and manage your micro-SaaS concepts</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ideas..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Kanban Board */}
        <div className="grid md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.id} className="min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="muted">{getIdeasByStatus(col.id).length}</Badge>
              </div>
              <div className="space-y-3">
                {getIdeasByStatus(col.id).map((idea, i) => (
                  <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/app/ideas/${idea.id}`}>
                      <Card className="kanban-card hover:border-primary/30">
                        <h4 className="font-medium text-sm">{idea.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.oneLiner}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span className="truncate">{idea.targetUser}</span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
                {getIdeasByStatus(col.id).length === 0 && (
                  <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">No ideas yet</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
