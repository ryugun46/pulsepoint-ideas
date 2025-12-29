import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FolderOpen, 
  Trash2, 
  Edit, 
  Users,
  Activity,
  Check,
  X,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, type TrackedSubreddit } from '@/lib/api';
import type { Collection } from '@/types';

export default function Subreddits() {
  const { collections, setCollections } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [trackedSubreddits, setTrackedSubreddits] = useState<TrackedSubreddit[]>([]);
  const [newSubreddit, setNewSubreddit] = useState('');
  const [isAddingSubreddit, setIsAddingSubreddit] = useState(false);
  const [scrapeWindowDays, setScrapeWindowDays] = useState<number>(7);
  const [selectedSubredditForScrape, setSelectedSubredditForScrape] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubreddits();
  }, []);

  const loadSubreddits = async () => {
    try {
      const subs = await api.getSubreddits();
      setTrackedSubreddits(subs);
    } catch (error) {
      console.error('Failed to load subreddits:', error);
      toast.error('Failed to load subreddits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubreddit = async () => {
    if (!newSubreddit.trim()) {
      toast.error('Please enter a subreddit name');
      return;
    }

    setIsAddingSubreddit(true);
    try {
      await api.addSubreddit(newSubreddit);
      toast.success(`Added r/${newSubreddit}`);
      setNewSubreddit('');
      await loadSubreddits();
    } catch (error) {
      console.error('Failed to add subreddit:', error);
      toast.error('Failed to add subreddit');
    } finally {
      setIsAddingSubreddit(false);
    }
  };

  const handleDeleteSubreddit = async (id: string, name: string) => {
    try {
      await api.deleteSubreddit(id);
      toast.success(`Deleted r/${name}`);
      await loadSubreddits();
    } catch (error) {
      console.error('Failed to delete subreddit:', error);
      toast.error('Failed to delete subreddit');
    }
  };

  const handleRunScrape = async (subredditId: string, name: string) => {
    try {
      const result = await api.runScrape(subredditId, scrapeWindowDays);
      toast.success(`Scrape started for r/${name}`, {
        description: `Run ID: ${result.id}`,
      });
    } catch (error) {
      console.error('Failed to start scrape:', error);
      toast.error('Failed to start scrape');
    }
  };

  const filteredSubreddits = trackedSubreddits.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSubreddit = (name: string) => {
    setSelectedSubs(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim() || selectedSubs.length === 0) {
      toast.error('Please enter a name and select at least one subreddit');
      return;
    }

    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      subreddits: selectedSubs,
      createdAt: new Date().toISOString(),
    };

    setCollections([...collections, newCollection]);
    setNewCollectionName('');
    setSelectedSubs([]);
    setIsDialogOpen(false);
    toast.success('Collection created');
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
    toast.success('Collection deleted');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Subreddits</h1>
            <p className="text-muted-foreground">Manage subreddits and collections for analysis</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Collection Name</Label>
                  <Input
                    placeholder="e.g., B2B Founders"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Search & Add Subreddits</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subreddits..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredSubreddits.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => toggleSubreddit(sub.name)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                        selectedSubs.includes(sub.name)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-medium">
                          r/
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(sub.members / 1000).toFixed(0)}k members
                          </p>
                        </div>
                      </div>
                      {selectedSubs.includes(sub.name) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedSubs.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected ({selectedSubs.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSubs.map((name) => (
                        <Badge key={name} variant="secondary" className="gap-1">
                          r/{name}
                          <button
                            onClick={() => toggleSubreddit(name)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={handleCreateCollection} className="w-full">
                  Create Collection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No collections yet</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
                  Create a collection to group subreddits for easier analysis. 
                  For example: "B2B Founders" or "Shopify Merchants".
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FolderOpen className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base">{collection.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {collection.subreddits.map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs">
                          r/{sub}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {collection.subreddits.length} subreddits
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* All Subreddits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tracked Subreddits</CardTitle>
                <CardDescription>
                  Add subreddits to track and run scrapes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={scrapeWindowDays.toString()} onValueChange={(v) => setScrapeWindowDays(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24h</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter subreddit name (e.g., saas or r/saas)"
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubreddit()}
              />
              <Button onClick={handleAddSubreddit} disabled={isAddingSubreddit}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredSubreddits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tracked subreddits yet. Add one above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSubreddits.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                        r/
                      </div>
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRunScrape(sub.id, sub.name)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Run Scrape
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSubreddit(sub.id, sub.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
