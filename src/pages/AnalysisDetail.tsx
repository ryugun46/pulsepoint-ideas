import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Download, Calendar, Layers, FileText, Lightbulb, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AppShell } from '@/components/layout/AppShell';
import { api, type AnalysisDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnalysis(id);
    }
  }, [id]);

  const loadAnalysis = async (analysisId: string) => {
    try {
      const data = await api.getAnalysisDetail(analysisId);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast.error('Failed to load analysis detail');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </AppShell>
    );
  }

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
              <h1 className="text-2xl font-bold">r/{analysis.subredditName}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(analysis.startedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Last {analysis.windowDays} day{analysis.windowDays > 1 ? 's' : ''}</span>
                <span>•</span>
                <Badge variant={analysis.status === 'completed' ? 'default' : analysis.status === 'failed' ? 'destructive' : 'secondary'}>
                  {analysis.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </div>

        {/* Stats */}
        {analysis.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Posts', value: analysis.stats.postsScraped },
              { label: 'Comments', value: analysis.stats.commentsScraped },
              { label: 'Problems', value: analysis.stats.problemsExtracted },
              { label: 'Clusters', value: analysis.stats.clustersCreated },
              { label: 'Ideas', value: analysis.stats.ideasGenerated },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error Message */}
        {analysis.errorMessage && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{analysis.errorMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="clusters">
          <TabsList>
            <TabsTrigger value="clusters"><Layers className="mr-2 h-4 w-4" />Clusters ({analysis.clusters.length})</TabsTrigger>
            <TabsTrigger value="ideas"><Lightbulb className="mr-2 h-4 w-4" />Ideas ({analysis.ideas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="clusters" className="mt-6">
            {analysis.clusters.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No clusters generated yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.clusters.map((cluster, i) => (
                  <motion.div key={cluster.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold">{cluster.title}</h3>
                          <Badge variant={cluster.severity === 'high' ? 'destructive' : cluster.severity === 'medium' ? 'default' : 'secondary'}>
                            {cluster.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{cluster.summary}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">{cluster.frequency}</span> mentions
                          </span>
                        </div>
                        {cluster.evidence.length > 0 && (
                          <Accordion type="single" collapsible className="mt-3">
                            <AccordionItem value="evidence" className="border-0">
                              <AccordionTrigger className="text-xs py-2">View Evidence</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {cluster.evidence.map((ev, idx) => (
                                    <p key={idx} className="text-xs text-muted-foreground italic border-l-2 pl-2">
                                      "{ev}"
                                    </p>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="mt-6">
            {analysis.ideas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No ideas generated yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.ideas.map((ideaItem, i) => {
                  const idea = ideaItem.idea;
                  return (
                    <motion.div key={ideaItem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className="h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{idea.title}</h3>
                            <Badge variant="outline">Score: {Math.round(ideaItem.score)}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{idea.oneLiner}</p>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium mb-1">Target User</p>
                              <p className="text-muted-foreground">{idea.targetUser}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">Solution</p>
                              <p className="text-muted-foreground">{idea.solution}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">MVP Features</p>
                              <ul className="space-y-1">
                                {idea.mvp.map((feature, idx) => (
                                  <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                    <span>•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">Pricing</p>
                              <p className="text-muted-foreground">{idea.pricing}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">Differentiators</p>
                              <ul className="space-y-1">
                                {idea.differentiators.map((diff, idx) => (
                                  <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                    <span>•</span>
                                    <span>{diff}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">Acquisition</p>
                              <p className="text-muted-foreground">{idea.acquisitionChannel}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium mb-1">Risks</p>
                              <ul className="space-y-1">
                                {idea.risks.map((risk, idx) => (
                                  <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                    <span>•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
