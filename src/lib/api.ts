// API client for backend endpoints

const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : '';

export interface TrackedSubreddit {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeRun {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  windowDays: number;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
  stats?: {
    postsScraped: number;
    postsWithComments?: number; // How many posts had comments fetched (max 3)
    commentsScraped: number;
    problemsExtracted: number;
    clustersCreated: number;
    ideasGenerated: number;
  };
  subredditName: string;
  subredditId: string;
}

export interface ProblemCluster {
  id: string;
  title: string;
  summary: string;
  frequency: number;
  severity: string;
  evidence: string[];
  createdAt: string;
}

export interface GeneratedIdea {
  id: string;
  clusterId: string;
  title: string;
  idea: {
    title: string;
    oneLiner: string;
    targetUser: string;
    solution: string;
    mvp: string[];
    pricing: string;
    differentiators: string[];
    risks: string[];
    acquisitionChannel: string;
  };
  score: number;
  createdAt: string;
}

export interface AnalysisDetail extends ScrapeRun {
  clusters: ProblemCluster[];
  ideas: GeneratedIdea[];
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // Subreddits
  async getSubreddits(): Promise<TrackedSubreddit[]> {
    return this.request('/api/subreddits');
  }

  async addSubreddit(name: string, isActive = true): Promise<TrackedSubreddit> {
    return this.request('/api/subreddits', {
      method: 'POST',
      body: JSON.stringify({ name, isActive }),
    });
  }

  async deleteSubreddit(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/subreddits/${id}`, {
      method: 'DELETE',
    });
  }

  // Scraping
  async runScrape(subredditId: string, windowDays: number): Promise<{ 
    id: string; 
    status: string;
    message?: string;
    stats?: {
      postsScraped: number;
      postsWithComments?: number;
      commentsScraped: number;
      problemsExtracted: number;
      clustersCreated: number;
      ideasGenerated: number;
    };
    error?: string;
  }> {
    return this.request('/api/scrape/run', {
      method: 'POST',
      body: JSON.stringify({ subredditId, windowDays }),
    });
  }

  // Get subreddit by name (for analysis page)
  async getSubredditByName(name: string): Promise<TrackedSubreddit | null> {
    const subreddits = await this.getSubreddits();
    return subreddits.find(s => s.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Analyses
  async getAnalyses(): Promise<ScrapeRun[]> {
    return this.request('/api/analyses');
  }

  async getAnalysisDetail(id: string): Promise<AnalysisDetail> {
    return this.request(`/api/analyses/${id}`);
  }

  // Health
  async health(): Promise<{ status: string; timestamp: string; database: string }> {
    return this.request('/api/health');
  }
}

export const api = new ApiClient();

