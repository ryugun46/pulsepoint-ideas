import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  Plus,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';

export default function AnalysesList() {
  const { analyses, collections } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAnalyses = analyses
    .filter((analysis) => {
      const matchesSearch = analysis.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'problems') {
        return b.counts.problems - a.counts.problems;
      }
      return 0;
    });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analyses</h1>
            <p className="text-muted-foreground">View and manage your pain point analyses</p>
          </div>
          <Link to="/app/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search analyses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="problems">Most Problems</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analyses List */}
        {filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No analyses found</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Run your first analysis to discover pain points and opportunities'}
              </p>
              <Link to="/app/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link to={`/app/analyses/${analysis.id}`}>
                  <Card className="hover:border-primary/30 transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{analysis.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{analysis.timeframe}</span>
                              <span>•</span>
                              <span>{analysis.subreddits.length} subreddits</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysis.subreddits.slice(0, 3).map((sub) => (
                                <Badge key={sub} variant="secondary" className="text-xs">
                                  r/{sub}
                                </Badge>
                              ))}
                              {analysis.subreddits.length > 3 && (
                                <Badge variant="muted" className="text-xs">
                                  +{analysis.subreddits.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge
                            variant={
                              analysis.status === 'completed'
                                ? 'success'
                                : analysis.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {analysis.status}
                          </Badge>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
                            <div className="text-muted-foreground">Problems</div>
                            <div className="font-medium text-right">{analysis.counts.problems}</div>
                            <div className="text-muted-foreground">Clusters</div>
                            <div className="font-medium text-right">{analysis.counts.clusters}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
