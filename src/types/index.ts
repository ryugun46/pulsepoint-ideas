export interface Subreddit {
  name: string;
  members: number;
  activityScore: number;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  subreddits: string[];
  createdAt: string;
}

export type AnalysisStatus = 'pending' | 'fetching' | 'cleaning' | 'extracting' | 'clustering' | 'generating' | 'completed' | 'failed';

export interface Analysis {
  id: string;
  name: string;
  createdAt: string;
  timeframe: string;
  collections: string[];
  subreddits: string[];
  status: AnalysisStatus;
  counts: {
    posts: number;
    problems: number;
    clusters: number;
    highUrgency: number;
  };
}

export interface Problem {
  id: string;
  text: string;
  category: string;
  confidence: number;
  subreddit: string;
  sourcesCount: number;
  createdAt: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface Cluster {
  id: string;
  title: string;
  urgency: UrgencyLevel;
  frequency: number;
  keywords: string[];
  whyItMatters: string;
  excerpts: string[];
  subreddits: string[];
}

export type IdeaStatus = 'backlog' | 'researching' | 'building' | 'launched';

export interface Idea {
  id: string;
  name: string;
  oneLiner: string;
  targetUser: string;
  clusterIds: string[];
  mvp: string[];
  pricing: string;
  moat: string;
  validation: string[];
  risks: string[];
  status: IdeaStatus;
  createdAt: string;
  notes?: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  subreddit: string;
  createdAt: string;
  excerpt: string;
  commentsExcerpts: string[];
}

export interface AlertRule {
  id: string;
  collectionId: string;
  keywords: string[];
  theme?: string;
  cadence: 'daily' | 'weekly' | 'realtime';
  enabled: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  redditConnected: boolean;
  onboardingComplete: boolean;
  preferences: {
    defaultTimeframe: string;
    language: string;
    goals: string[];
  };
}
