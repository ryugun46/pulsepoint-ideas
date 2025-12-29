import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Check,
  Loader2,
  Search,
  MessageSquare,
  Layers,
  Lightbulb,
  Sparkles,
  Clock,
  Filter,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, type TrackedSubreddit } from '@/lib/api';

const analysisSteps = [
  { id: 'fetch', label: 'Fetching posts', icon: Search, description: 'Collecting relevant discussions from Reddit' },
  { id: 'comments', label: 'Loading comments', icon: MessageSquare, description: 'Gathering top comments for analysis' },
  { id: 'extract', label: 'Extracting problems', icon: Filter, description: 'Identifying pain points with AI' },
  { id: 'cluster', label: 'Clustering themes', icon: Layers, description: 'Grouping similar problems together' },
  { id: 'generate', label: 'Generating ideas', icon: Lightbulb, description: 'Creating SaaS concepts from clusters' },
];

interface ScrapeResult {
  subredditName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  runId?: string;
  error?: string;
  stats?: {
    postsScraped: number;
    commentsScraped: number;
    problemsExtracted: number;
    clustersCreated: number;
    ideasGenerated: number;
  };
}

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { collections } = useApp();
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [timeframe, setTimeframe] = useState('7d');
  const [includeComments, setIncludeComments] = useState(true);
  const [commentsDepth, setCommentsDepth] = useState([3]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [trackedSubreddits, setTrackedSubreddits] = useState<TrackedSubreddit[]>([]);
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load tracked subreddits on mount
  useEffect(() => {
    const loadSubreddits = async () => {
      try {
        const subs = await api.getSubreddits();
        setTrackedSubreddits(subs);
      } catch (error) {
        console.error('Failed to load subreddits:', error);
      }
    };
    loadSubreddits();
  }, []);

  // Convert timeframe to windowDays
  const getWindowDays = (tf: string): number => {
    switch (tf) {
      case '24h': return 1;
      case '7d': return 7;
      default: return 7;
    }
  };

  const handleRun = async () => {
    if (!selectedCollection) {
      toast.error('Please select a collection');
      return;
    }

    const collection = collections.find(c => c.id === selectedCollection);
    if (!collection) {
      toast.error('Collection not found');
      return;
    }

    // Find matching tracked subreddits for this collection
    const subredditsToScrape = collection.subreddits
      .map(name => trackedSubreddits.find(s => s.name.toLowerCase() === name.toLowerCase()))
      .filter((s): s is TrackedSubreddit => s !== null && s !== undefined);

    if (subredditsToScrape.length === 0) {
      toast.error('No tracked subreddits found for this collection. Please add subreddits first.');
      return;
    }

    setIsRunning(true);
    setOverallStatus('running');
    setErrorMessage(null);
    setCompletedSteps([]);
    
    // Initialize results
    const initialResults: ScrapeResult[] = subredditsToScrape.map(s => ({
      subredditName: s.name,
      status: 'pending'
    }));
    setScrapeResults(initialResults);

    const windowDays = getWindowDays(timeframe);
    let hasErrors = false;
    let lastRunId: string | undefined;
    let totalStats = {
      postsScraped: 0,
      commentsScraped: 0,
      problemsExtracted: 0,
      clustersCreated: 0,
      ideasGenerated: 0,
    };

    // Run scrape for each subreddit sequentially
    for (let i = 0; i < subredditsToScrape.length; i++) {
      const subreddit = subredditsToScrape[i];
      
      // Update current step based on progress
      if (i === 0) {
        setCurrentStep(0); // Fetching posts
        setCompletedSteps([]);
      }

      // Mark subreddit as running
      setScrapeResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'running' } : r
      ));

      try {
        // Show progress through steps while waiting for API
        const stepDelay = 500;
        
        // Simulate step progression while API runs
        setTimeout(() => {
          setCompletedSteps(['fetch']);
          setCurrentStep(1);
        }, stepDelay);

        setTimeout(() => {
          setCompletedSteps(['fetch', 'comments']);
          setCurrentStep(2);
        }, stepDelay * 2);

        setTimeout(() => {
          setCompletedSteps(['fetch', 'comments', 'extract']);
          setCurrentStep(3);
        }, stepDelay * 4);

        // Call the actual API
        const result = await api.runScrape(subreddit.id, windowDays);
        lastRunId = result.id;

        // Complete remaining steps
        setCompletedSteps(['fetch', 'comments', 'extract', 'cluster']);
        setCurrentStep(4);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setCompletedSteps(['fetch', 'comments', 'extract', 'cluster', 'generate']);
        setCurrentStep(5);

        // Update result
        setScrapeResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: result.status === 'completed' ? 'completed' : 'failed',
            runId: result.id,
            stats: result.stats,
            error: result.error 
          } : r
        ));

        // Aggregate stats
        if (result.stats) {
          totalStats.postsScraped += result.stats.postsScraped || 0;
          totalStats.commentsScraped += result.stats.commentsScraped || 0;
          totalStats.problemsExtracted += result.stats.problemsExtracted || 0;
          totalStats.clustersCreated += result.stats.clustersCreated || 0;
          totalStats.ideasGenerated += result.stats.ideasGenerated || 0;
        }

        if (result.status !== 'completed') {
          hasErrors = true;
          setErrorMessage(result.error || 'Scrape failed');
        }

      } catch (error) {
        hasErrors = true;
        const errorMsg = error instanceof Error ? error.message : 'Failed to run scrape';
        setErrorMessage(errorMsg);
        
        setScrapeResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'failed', error: errorMsg } : r
        ));
      }
    }

    // Final status
    if (hasErrors) {
      setOverallStatus('failed');
      toast.error('Analysis completed with errors', {
        description: errorMessage || 'Some subreddits failed to scrape'
      });
    } else {
      setOverallStatus('completed');
      toast.success('Analysis complete!', {
        description: `Generated ${totalStats.ideasGenerated} ideas from ${totalStats.postsScraped} posts`
      });

      // Navigate to results after a brief delay
      if (lastRunId) {
        setTimeout(() => {
          navigate(`/app/analyses/${lastRunId}`);
        }, 1500);
      }
    }
  };

  const handleRetry = () => {
    setIsRunning(false);
    setOverallStatus('idle');
    setCurrentStep(-1);
    setCompletedSteps([]);
    setScrapeResults([]);
    setErrorMessage(null);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">New Analysis</h1>
          <p className="text-muted-foreground">Configure and run a pain point analysis</p>
        </div>

        {!isRunning ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Analysis Configuration</CardTitle>
                <CardDescription>
                  Select your target subreddits and analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Collection Selector */}
                <div className="space-y-2">
                  <Label>Subreddit Collection</Label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name} ({col.subreddits.length} subreddits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {collections.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No collections found.{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/app/subreddits')}>
                        Create one first
                      </Button>
                    </p>
                  )}
                </div>

                {/* Timeframe */}
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: '24h', label: '24 hours' },
                      { value: '7d', label: '7 days' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTimeframe(option.value)}
                        className={cn(
                          'flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all',
                          timeframe === option.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Comments */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze comments for additional pain points
                    </p>
                  </div>
                  <Switch checked={includeComments} onCheckedChange={setIncludeComments} />
                </div>

                {/* Comments Depth */}
                {includeComments && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Comments Depth</Label>
                      <span className="text-sm text-muted-foreground">
                        {commentsDepth[0]} levels
                      </span>
                    </div>
                    <Slider
                      value={commentsDepth}
                      onValueChange={setCommentsDepth}
                      min={1}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Limited to 3 levels due to API rate limits
                    </p>
                  </div>
                )}

                {/* Run Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleRun}
                    className="w-full"
                    size="lg"
                    disabled={!selectedCollection}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run Analysis
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Uses Reddit Public API + OpenRouter AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    overallStatus === 'failed' ? 'bg-destructive/10' : 'bg-primary/10'
                  )}>
                    {overallStatus === 'failed' ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : overallStatus === 'completed' ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    )}
                  </div>
                  <div>
                    <CardTitle>
                      {overallStatus === 'failed' 
                        ? 'Analysis Failed' 
                        : overallStatus === 'completed'
                        ? 'Analysis Complete'
                        : 'Analysis in Progress'}
                    </CardTitle>
                    <CardDescription>
                      {overallStatus === 'failed'
                        ? 'There was an error during analysis'
                        : overallStatus === 'completed'
                        ? 'Your results are ready'
                        : 'Please wait while we analyze your subreddits'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisSteps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === index && overallStatus === 'running';
                    const isPending = currentStep < index;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border transition-all',
                          isCompleted && 'bg-success/5 border-success/30',
                          isCurrent && 'bg-primary/5 border-primary/30',
                          isPending && 'opacity-50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            isCompleted && 'bg-success text-success-foreground',
                            isCurrent && 'bg-primary text-primary-foreground',
                            isPending && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            'font-medium',
                            isCompleted && 'text-success',
                            isCurrent && 'text-primary'
                          )}>
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {isCurrent && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Processing...
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Error Message */}
                {errorMessage && overallStatus === 'failed' && (
                  <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Retry Button */}
                {overallStatus === 'failed' && (
                  <div className="mt-4">
                    <Button onClick={handleRetry} variant="outline" className="w-full">
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Results Summary */}
                {overallStatus === 'completed' && scrapeResults.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-success/5 border border-success/30">
                    <p className="font-medium text-success mb-2">Analysis Summary</p>
                    {scrapeResults.map((result, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        <span className="font-medium">r/{result.subredditName}:</span>{' '}
                        {result.stats ? (
                          <span>
                            {result.stats.postsScraped} posts, {result.stats.ideasGenerated} ideas
                          </span>
                        ) : (
                          <span className="text-destructive">Failed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
