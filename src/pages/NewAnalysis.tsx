import { useState } from 'react';
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
  Filter
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
import type { Analysis } from '@/types';

const analysisSteps = [
  { id: 'fetch', label: 'Fetching posts', icon: Search, description: 'Collecting relevant discussions' },
  { id: 'clean', label: 'Cleaning data', icon: Filter, description: 'Removing noise and duplicates' },
  { id: 'extract', label: 'Extracting problems', icon: MessageSquare, description: 'Identifying pain points' },
  { id: 'cluster', label: 'Clustering themes', icon: Layers, description: 'Grouping by similarity' },
  { id: 'generate', label: 'Generating ideas', icon: Lightbulb, description: 'Creating SaaS concepts' },
];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { collections, analyses, setAnalyses } = useApp();
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [timeframe, setTimeframe] = useState('7d');
  const [postType, setPostType] = useState('hot');
  const [includeComments, setIncludeComments] = useState(true);
  const [commentsDepth, setCommentsDepth] = useState([3]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleRun = async () => {
    if (!selectedCollection) {
      toast.error('Please select a collection');
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    setCompletedSteps([]);

    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      setCompletedSteps(prev => [...prev, analysisSteps[i].id]);
    }

    // Create new analysis
    const collection = collections.find(c => c.id === selectedCollection);
    const newAnalysis: Analysis = {
      id: `analysis-${Date.now()}`,
      name: `${collection?.name || 'New'} Analysis`,
      createdAt: new Date().toISOString(),
      timeframe,
      collections: [selectedCollection],
      subreddits: collection?.subreddits || [],
      status: 'completed',
      counts: {
        posts: Math.floor(Math.random() * 2000) + 500,
        problems: Math.floor(Math.random() * 100) + 50,
        clusters: Math.floor(Math.random() * 15) + 5,
        highUrgency: Math.floor(Math.random() * 5) + 2,
      },
    };

    setAnalyses([newAnalysis, ...analyses]);
    toast.success('Analysis complete!');
    
    // Navigate to results after a brief delay
    setTimeout(() => {
      navigate(`/app/analyses/${newAnalysis.id}`);
    }, 500);
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
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: '24h', label: '24 hours' },
                      { value: '7d', label: '7 days' },
                      { value: '30d', label: '30 days' },
                      { value: 'custom', label: 'Custom' },
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

                {/* Post Type */}
                <div className="space-y-2">
                  <Label>Post Type Filter</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'hot', label: 'Hot' },
                      { value: 'new', label: 'New' },
                      { value: 'top', label: 'Top' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPostType(option.value)}
                        className={cn(
                          'flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all',
                          postType === option.value
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
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher depth = more thorough analysis, but slower processing
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
                    Uses Reddit API • Respects rate limits • ~2-5 minutes
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
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <CardTitle>Analysis in Progress</CardTitle>
                    <CardDescription>
                      Please wait while we analyze your subreddits
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisSteps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === index;
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
