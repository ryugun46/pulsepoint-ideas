import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Search, 
  Layers, 
  Lightbulb,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockClusters, mockIdeas } from '@/data/mockData';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">PulseMine</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              Powered by Reddit API
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Find recurring Reddit pain points.{' '}
              <span className="text-primary">Turn them into micro-SaaS ideas.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              PulseMine analyzes thousands of Reddit discussions to surface validated problems 
              people actually have—then generates actionable startup ideas with MVP specs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Connect Reddit & Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/app/analyses/analysis-1">
                <Button variant="heroOutline" size="xl">
                  View Sample Analysis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-2">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              From Reddit discussions to validated startup ideas in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '1',
                title: 'Choose Subreddits',
                description: 'Select communities where your target users hang out. We analyze posts, comments, and discussions.',
              },
              {
                icon: Layers,
                step: '2',
                title: 'Extract Pain Points',
                description: 'Our analysis clusters recurring problems by theme, urgency, and frequency across thousands of posts.',
              },
              {
                icon: Lightbulb,
                step: '3',
                title: 'Generate Ideas',
                description: 'Get micro-SaaS concepts with target users, MVP specs, pricing strategies, and validation plans.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-bold text-muted-foreground/20">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Preview */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Real Insights, Real Ideas</h2>
            <p className="text-muted-foreground text-lg">
              Here's what you'll discover from actual Reddit analysis
            </p>
          </div>

          {/* Clusters Preview */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Problem Clusters
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockClusters.slice(0, 3).map((cluster, index) => (
                <motion.div
                  key={cluster.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="cluster-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-sm">{cluster.title}</h4>
                    <Badge
                      variant={
                        cluster.urgency === 'high'
                          ? 'urgencyHigh'
                          : cluster.urgency === 'medium'
                          ? 'urgencyMedium'
                          : 'urgencyLow'
                      }
                    >
                      {cluster.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {cluster.whyItMatters}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{cluster.frequency}</span> mentions
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Ideas Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Generated Ideas
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {mockIdeas.slice(0, 2).map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="idea-card"
                >
                  <h4 className="text-lg font-semibold mb-1">{idea.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{idea.oneLiner}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground shrink-0">Target:</span>
                      <span>{idea.targetUser}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground shrink-0">Pricing:</span>
                      <span>{idea.pricing}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-2">MVP Features:</p>
                    <ul className="space-y-1">
                      {idea.mvp.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-surface-2 border-t border-border">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Uses Reddit API • Respects rate limits • Usernames are redacted • No personal data stored
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your next idea?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join founders who use real user pain points to build products people actually need.
          </p>
          <Link to="/auth">
            <Button variant="hero" size="xl">
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Zap className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">PulseMine</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 PulseMine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
