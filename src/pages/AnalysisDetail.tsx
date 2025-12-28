import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Download, Calendar, Layers, FileText, Lightbulb, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { mockClusters, mockProblems, mockIdeas, mockSources } from '@/data/mockData';

export default function AnalysisDetail() {
  const { id } = useParams();
  const { analyses } = useApp();
  const analysis = analyses.find(a => a.id === id) || analyses[0];

  if (!analysis) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Analysis not found</p>
          <Link to="/app/analyses"><Button variant="link">Back to analyses</Button></Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/app/analyses">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{analysis.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{analysis.timeframe}</span>
                <span>•</span>
                <span>{analysis.subreddits.join(', ')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Rerun</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Posts', value: analysis.counts.posts },
            { label: 'Problems', value: analysis.counts.problems },
            { label: 'Clusters', value: analysis.counts.clusters },
            { label: 'High Urgency', value: analysis.counts.highUrgency },
          ].map((stat) => (
            <Card key={stat.label} className="stat-card">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clusters">
          <TabsList>
            <TabsTrigger value="clusters"><Layers className="mr-2 h-4 w-4" />Clusters</TabsTrigger>
            <TabsTrigger value="problems"><FileText className="mr-2 h-4 w-4" />Raw Problems</TabsTrigger>
            <TabsTrigger value="ideas"><Lightbulb className="mr-2 h-4 w-4" />Ideas</TabsTrigger>
            <TabsTrigger value="sources"><ExternalLink className="mr-2 h-4 w-4" />Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="clusters" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockClusters.map((cluster, i) => (
                <motion.div key={cluster.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="cluster-card h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{cluster.title}</h3>
                      <Badge variant={cluster.urgency === 'high' ? 'urgencyHigh' : cluster.urgency === 'medium' ? 'urgencyMedium' : 'urgencyLow'}>{cluster.urgency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{cluster.whyItMatters}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cluster.keywords.slice(0, 4).map(k => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground"><span className="font-medium text-foreground">{cluster.frequency}</span> mentions</span>
                      <Button variant="soft" size="sm">Create Idea</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="problems" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Problem</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Confidence</th>
                        <th className="text-left p-4 font-medium">Subreddit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockProblems.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-4 max-w-md">{p.text}</td>
                          <td className="p-4"><Badge variant="secondary">{p.category}</Badge></td>
                          <td className="p-4">{Math.round(p.confidence * 100)}%</td>
                          <td className="p-4">r/{p.subreddit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideas" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mockIdeas.map((idea, i) => (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="idea-card h-full">
                    <h3 className="text-lg font-semibold">{idea.name}</h3>
                    <p className="text-muted-foreground mt-1">{idea.oneLiner}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p><span className="font-medium">Target:</span> {idea.targetUser}</p>
                      <p><span className="font-medium">Pricing:</span> {idea.pricing}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">MVP Scope:</p>
                      <ul className="space-y-1 text-sm">{idea.mvp.slice(0, 3).map((f, i) => <li key={i} className="text-muted-foreground">• {f}</li>)}</ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">Save to Ideas</Button>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <div className="space-y-4">
              {mockSources.map((src) => (
                <Card key={src.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{src.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">r/{src.subreddit} • {new Date(src.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm mt-2 italic text-muted-foreground">{src.excerpt}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={src.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">Uses Reddit API • Respects rate limits • Excerpts are redacted</p>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
