import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Users,
  PenTool,
  Search,
  Check,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useApp } from '@/context/AppContext';
import { mockSubreddits } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const goals = [
  { id: 'micro-saas', label: 'Micro-SaaS Ideas', description: 'Find validated problems to build solutions for', icon: Target },
  { id: 'customer-research', label: 'Customer Research', description: 'Understand what users really want', icon: Users },
  { id: 'content-angles', label: 'Content Angles', description: 'Discover topics your audience cares about', icon: PenTool },
];

const suggestedSubreddits = [
  { name: 'SaaS', category: 'B2B' },
  { name: 'startups', category: 'Founders' },
  { name: 'Entrepreneur', category: 'Business' },
  { name: 'shopify', category: 'E-commerce' },
  { name: 'webdev', category: 'Developers' },
  { name: 'smallbusiness', category: 'SMB' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('7d');
  const [language, setLanguage] = useState('en');

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const toggleSubreddit = (name: string) => {
    setSelectedSubreddits(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const filteredSubreddits = mockSubreddits.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleComplete = () => {
    if (user) {
      setUser({
        ...user,
        onboardingComplete: true,
        preferences: {
          goals: selectedGoals,
          defaultTimeframe: timeframe,
          language,
        },
      });
    }
    toast.success('All set! Let\'s find some opportunities.');
    navigate('/app');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedGoals.length > 0;
      case 2: return selectedSubreddits.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">PulseMine</span>
        </Link>
      </header>

      {/* Progress */}
      <div className="max-w-xl mx-auto px-4 mt-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  s < step
                    ? 'bg-primary text-primary-foreground'
                    : s === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    s < step ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Goals */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>What are you looking to achieve?</CardTitle>
                  <CardDescription>
                    Select all that apply. This helps us tailor your experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        'w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left',
                        selectedGoals.includes(goal.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          selectedGoals.includes(goal.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <goal.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{goal.label}</p>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      {selectedGoals.includes(goal.id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Subreddits */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Pick starter subreddits</CardTitle>
                  <CardDescription>
                    Choose communities where your target users hang out. You can always add more later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subreddits..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {!searchQuery && (
                    <>
                      <p className="text-sm text-muted-foreground">Suggested for you:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSubreddits.map((sub) => (
                          <button
                            key={sub.name}
                            onClick={() => toggleSubreddit(sub.name)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all',
                              selectedSubreddits.includes(sub.name)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            r/{sub.name}
                            {selectedSubreddits.includes(sub.name) && (
                              <Check className="h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {searchQuery && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredSubreddits.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => toggleSubreddit(sub.name)}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                            selectedSubreddits.includes(sub.name)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div>
                            <p className="font-medium text-sm">r/{sub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(sub.members / 1000).toFixed(0)}k members
                            </p>
                          </div>
                          {selectedSubreddits.includes(sub.name) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSubreddits.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Selected ({selectedSubreddits.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubreddits.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs"
                          >
                            r/{name}
                            <button
                              onClick={() => toggleSubreddit(name)}
                              className="hover:text-primary/70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Set your defaults</CardTitle>
                  <CardDescription>
                    These will be your default settings. You can change them anytime.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Default timeframe for analysis</Label>
                    <RadioGroup value={timeframe} onValueChange={setTimeframe}>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: '24h', label: '24 hours' },
                          { value: '7d', label: '7 days' },
                          { value: '30d', label: '30 days' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all',
                              timeframe === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Language preference</Label>
                    <RadioGroup value={language} onValueChange={setLanguage}>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'en', label: 'English', flag: '🇺🇸' },
                          { value: 'all', label: 'All languages', flag: '🌍' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                              language === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <span className="text-lg">{option.flag}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 mb-16">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => (step === 3 ? handleComplete() : setStep(step + 1))}
            disabled={!canProceed()}
          >
            {step === 3 ? 'Get Started' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
