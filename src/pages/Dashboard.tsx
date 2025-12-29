import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  FileText,
  ArrowRight,
  Settings2,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { mockAnalyses } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const chartData = [
  { date: 'Jan 22', problems: 12 },
  { date: 'Jan 23', problems: 19 },
  { date: 'Jan 24', problems: 15 },
  { date: 'Jan 25', problems: 28 },
  { date: 'Jan 26', problems: 24 },
  { date: 'Jan 27', problems: 32 },
  { date: 'Jan 28', problems: 21 },
];

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}>
              <TrendingUp className={cn("h-3 w-3", !trend.positive && "rotate-180")} />
              {trend.value}% from last period
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

function AnalysisStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'status-completed' },
    extracting: { label: 'Running', className: 'status-running' },
    failed: { label: 'Failed', className: 'status-failed' },
    pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { collections } = useApp();
  const [analysisTimeframe, setAnalysisTimeframe] = useState('7d');

  const stats = {
    posts: 4937,
    problems: 245,
    clusters: 30,
    highUrgency: 11,
  };

  const recentAnalyses = mockAnalyses.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-8 animate-in">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Monitor your Reddit insights and run new analyses.
          </p>
        </div>

        {/* Run New Analysis Panel */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Run new analysis</CardTitle>
                <CardDescription>
                  Extract problems and opportunities from Reddit discussions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/new')}>
                <Settings2 className="h-4 w-4 mr-2" />
                Advanced options
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Collections</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select collections..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name} ({col.subreddits.length} subreddits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-40 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
                <Select value={analysisTimeframe} onValueChange={setAnalysisTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full md:w-auto" onClick={() => navigate('/app/new')}>
                <Play className="h-4 w-4 mr-2" />
                Run analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Posts Analysed"
            value={stats.posts.toLocaleString()}
            icon={FileText}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Problems Extracted"
            value={stats.problems}
            icon={AlertTriangle}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Clusters Found"
            value={stats.clusters}
            icon={Layers}
          />
          <StatCard
            title="High Urgency"
            value={stats.highUrgency}
            icon={TrendingUp}
            description="Require immediate attention"
          />
        </div>

        {/* Chart and Recent Analyses */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Chart */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Problems over time</CardTitle>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="problems" 
                      stroke="hsl(25, 95%, 53%)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorProblems)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent analyses</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/analyses">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <Link 
                  key={analysis.id} 
                  to={`/app/analyses/${analysis.id}`}
                  className="block p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {analysis.name}
                    </p>
                    <AnalysisStatusBadge status={analysis.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {analysis.timeframe}
                    </Badge>
                    {analysis.subreddits.slice(0, 2).map((sub) => (
                      <Badge key={sub} variant="outline" className="text-xs font-normal">
                        r/{sub}
                      </Badge>
                    ))}
                    {analysis.subreddits.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{analysis.subreddits.length - 2}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
