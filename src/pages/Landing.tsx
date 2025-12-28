import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  Search, 
  Layers, 
  Lightbulb,
  Shield,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockLogin } from '@/context/AppContext';

export default function Landing() {
  const navigate = useNavigate();
  const mockLogin = useMockLogin();

  const handleViewSample = () => {
    mockLogin();
    navigate('/app/analyses/analysis-1');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">PulseMine</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/signin')}>Sign in</Button>
            <Button onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-in">
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Zap className="h-3 w-3" />
              Reddit-powered insights
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance leading-tight">
              Find recurring pain points.{' '}
              <span className="text-primary">Build what people need.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              PulseMine analyzes Reddit discussions to surface validated problems 
              and generates actionable micro-SaaS ideas with MVP specs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/signup')}>
                Start analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={handleViewSample}>
                View sample analysis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">How it works</h2>
            <p className="text-muted-foreground text-lg">
              From Reddit discussions to validated startup ideas in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '1',
                title: 'Choose subreddits',
                description: 'Select communities where your target users discuss problems. We analyze posts and comments.',
              },
              {
                icon: Layers,
                step: '2',
                title: 'Extract pain points',
                description: 'Problems are clustered by theme, urgency, and frequency across thousands of posts.',
              },
              {
                icon: Lightbulb,
                step: '3',
                title: 'Generate ideas',
                description: 'Get actionable micro-SaaS ideas with MVP scope, pricing, and validation plans.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Step {item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Built for founders</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to validate ideas before writing code
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: 'Privacy-first',
                description: 'Usernames are redacted. We analyze patterns, not individuals.',
              },
              {
                icon: Layers,
                title: 'Smart clustering',
                description: 'Problems are grouped by theme to reveal recurring pain points.',
              },
              {
                icon: Lightbulb,
                title: 'Actionable ideas',
                description: 'Each idea includes MVP scope, pricing, and validation steps.',
              },
              {
                icon: CheckCircle,
                title: 'Evidence-based',
                description: 'Every insight links back to real Reddit discussions.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-5 rounded-xl border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready to find your next idea?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start analyzing Reddit discussions and discover validated problems today.
          </p>
          <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/signup')}>
            Get started free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PulseMine. Built with respect for Reddit's API and community guidelines.</p>
        </div>
      </footer>
    </div>
  );
}
