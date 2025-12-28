import { Check, ExternalLink, Settings as SettingsIcon, User, Database, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';

export default function Settings() {
  const { user } = useApp();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ExternalLink className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle>Reddit Connection</CardTitle>
                <CardDescription>Connect your Reddit account for API access</CardDescription>
              </div>
              <Badge variant="success"><Check className="mr-1 h-3 w-3" />Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Your Reddit account is connected. PulseMine uses the official Reddit API with proper rate limiting.</p>
            <Button variant="outline">Reconnect Reddit</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Customize your workspace settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <Input defaultValue="PulseMine" />
            </div>
            <div className="space-y-2">
              <Label>Default Timeframe</Label>
              <Select defaultValue="7d">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Control how your data is handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Auto-delete analyses after 90 days</Label><p className="text-sm text-muted-foreground">Automatically remove old analyses</p></div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Analytics & improvements</Label><p className="text-sm text-muted-foreground">Help improve PulseMine with usage data</p></div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email || ''} disabled />
            </div>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
