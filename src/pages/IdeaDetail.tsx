import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Download, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/AppShell';
import { mockIdeas, mockClusters } from '@/data/mockData';
import { toast } from 'sonner';

export default function IdeaDetail() {
  const { id } = useParams();
  const idea = mockIdeas.find(i => i.id === id) || mockIdeas[0];
  const linkedClusters = mockClusters.filter(c => idea.clusterIds.includes(c.id));

  const handleCopy = () => {
    navigator.clipboard.writeText(`# ${idea.name}\n\n${idea.oneLiner}\n\n**Target:** ${idea.targetUser}\n**Pricing:** ${idea.pricing}\n\n## MVP\n${idea.mvp.map(m => `- ${m}`).join('\n')}`);
    toast.success('Copied to clipboard');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/ideas"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold">{idea.name}</h1>
              <p className="text-muted-foreground">{idea.oneLiner}</p>
            </div>
          </div>
          <Select defaultValue={idea.status}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="launched">Launched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-sm font-medium text-muted-foreground">Target User</p><p>{idea.targetUser}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Pricing Strategy</p><p>{idea.pricing}</p></div>
                <div><p className="text-sm font-medium text-muted-foreground">Moat</p><p>{idea.moat}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>MVP Scope</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{idea.mvp.map((f, i) => <li key={i} className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>)}</ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Validation Plan</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside">{idea.validation.map((v, i) => <li key={i} className="text-sm">{v}</li>)}</ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Risk Flags</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{idea.risks.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />{r}</li>)}</ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" />Copy to Clipboard</Button>
                <Button variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" />Export Markdown</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Linked Evidence</CardTitle></CardHeader>
              <CardContent>
                {linkedClusters.length > 0 ? linkedClusters.map(c => (
                  <div key={c.id} className="p-3 border rounded-lg mb-2">
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.frequency} mentions</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No linked clusters</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
