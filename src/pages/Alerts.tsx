import { Bell, Plus, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { mockAlertRules, mockCollections } from '@/data/mockData';

export default function Alerts() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">Get notified when new pain points emerge</p>
          </div>
          <Button><Plus className="mr-2 h-4 w-4" />New Alert</Button>
        </div>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Alerts Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Set up automated alerts to monitor subreddit collections for emerging pain points and opportunities.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mockAlertRules.map((rule) => {
            const collection = mockCollections.find(c => c.id === rule.collectionId);
            return (
              <Card key={rule.id} className="opacity-75">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{rule.theme || 'Custom Alert'}</p>
                      <p className="text-sm text-muted-foreground">{collection?.name} • {rule.keywords.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{rule.cadence}</Badge>
                    <Badge variant={rule.enabled ? 'success' : 'muted'}>{rule.enabled ? 'Active' : 'Paused'}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
