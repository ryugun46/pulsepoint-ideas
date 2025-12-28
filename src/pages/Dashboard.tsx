import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Layers,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Calendar,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { date: 'Jan 20', problems: 12 },
  { date: 'Jan 21', problems: 18 },
  { date: 'Jan 22', problems: 15 },
  { date: 'Jan 23', problems: 24 },
  { date: 'Jan 24', problems: 31 },
  { date: 'Jan 25', problems: 28 },
  { date: 'Jan 26', problems: 42 },
  { date: 'Jan 27', problems: 38 },
];

const statCards = [
  { label: 'Posts Analyzed', value: '4,937', icon: FileText, change: '+12%' },
  { label: 'Problems Extracted', value: '245', icon: TrendingUp, change: '+8%' },
  { label: 'Clusters Found', value: '30', icon: Layers, change: '+5%' },
  { label: 'High Urgency', value: '11', icon: AlertTriangle, change: '+2' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { analyses, collections } = useApp();

  const recentAnalyses = analyses.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor pain points and opportunities</p>
          </div>
          <Link to="/app/new">
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Run Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Run a new analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze Reddit discussions to find pain points and opportunities
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select defaultValue="col-1">
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="7d">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => navigate('/app/new')}>
                    <Play className="mr-2 h-4 w-4" />
                    Run
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-success mt-2">{stat.change} from last week</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart + Recent Analyses */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Problems Over Time</CardTitle>
                  <CardDescription>Pain points extracted from Reddit</CardDescription>
                </div>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="problems"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Recent Analyses</CardTitle>
                  <Link to="/app/analyses" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No analyses yet</p>
                    <Link to="/app/new">
                      <Button variant="link" size="sm">
                        Run your first analysis
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentAnalyses.map((analysis) => (
                    <Link
                      key={analysis.id}
                      to={`/app/analyses/${analysis.id}`}
                      className="block p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{analysis.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            analysis.status === 'completed'
                              ? 'success'
                              : analysis.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {analysis.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{analysis.counts.problems} problems</span>
                        <span>•</span>
                        <span>{analysis.counts.clusters} clusters</span>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
