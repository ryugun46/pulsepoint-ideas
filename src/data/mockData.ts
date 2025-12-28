import type { Subreddit, Collection, Analysis, Problem, Cluster, Idea, Source, AlertRule, User } from '@/types';

export const mockSubreddits: Subreddit[] = [
  { name: 'SaaS', members: 128000, activityScore: 87, description: 'Software as a Service discussions' },
  { name: 'startups', members: 892000, activityScore: 94, description: 'Startup founders and enthusiasts' },
  { name: 'Entrepreneur', members: 1200000, activityScore: 91, description: 'Business and entrepreneurship' },
  { name: 'smallbusiness', members: 456000, activityScore: 82, description: 'Small business owners' },
  { name: 'webdev', members: 1100000, activityScore: 96, description: 'Web development community' },
  { name: 'indiehackers', members: 89000, activityScore: 88, description: 'Independent makers and hackers' },
  { name: 'shopify', members: 234000, activityScore: 79, description: 'Shopify merchants and developers' },
  { name: 'ecommerce', members: 178000, activityScore: 84, description: 'E-commerce professionals' },
  { name: 'marketing', members: 567000, activityScore: 86, description: 'Marketing professionals' },
  { name: 'freelance', members: 345000, activityScore: 78, description: 'Freelancers and contractors' },
];

export const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'B2B Founders',
    subreddits: ['SaaS', 'startups', 'Entrepreneur'],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'col-2',
    name: 'Shopify Merchants',
    subreddits: ['shopify', 'ecommerce', 'smallbusiness'],
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'col-3',
    name: 'Dev Community',
    subreddits: ['webdev', 'indiehackers'],
    createdAt: '2024-02-01T09:15:00Z',
  },
];

export const mockAnalyses: Analysis[] = [
  {
    id: 'analysis-1',
    name: 'B2B Pain Points - January',
    createdAt: '2024-01-28T16:00:00Z',
    timeframe: '7d',
    collections: ['col-1'],
    subreddits: ['SaaS', 'startups', 'Entrepreneur'],
    status: 'completed',
    counts: { posts: 1247, problems: 89, clusters: 12, highUrgency: 4 },
  },
  {
    id: 'analysis-2',
    name: 'E-commerce Frustrations',
    createdAt: '2024-01-25T11:30:00Z',
    timeframe: '30d',
    collections: ['col-2'],
    subreddits: ['shopify', 'ecommerce'],
    status: 'completed',
    counts: { posts: 3456, problems: 156, clusters: 18, highUrgency: 7 },
  },
  {
    id: 'analysis-3',
    name: 'Developer Tooling Gaps',
    createdAt: '2024-01-30T08:45:00Z',
    timeframe: '24h',
    collections: ['col-3'],
    subreddits: ['webdev', 'indiehackers'],
    status: 'extracting',
    counts: { posts: 234, problems: 0, clusters: 0, highUrgency: 0 },
  },
];

export const mockProblems: Problem[] = [
  {
    id: 'prob-1',
    text: 'Spent 3 hours trying to integrate our CRM with the email tool. The APIs are completely different and there\'s no middleware.',
    category: 'Integration',
    confidence: 0.92,
    subreddit: 'SaaS',
    sourcesCount: 23,
    createdAt: '2024-01-27T14:20:00Z',
  },
  {
    id: 'prob-2',
    text: 'Every time I need to create a proposal, I have to manually copy pricing from 3 different spreadsheets. Takes 45 minutes each time.',
    category: 'Workflow',
    confidence: 0.88,
    subreddit: 'startups',
    sourcesCount: 18,
    createdAt: '2024-01-26T09:15:00Z',
  },
  {
    id: 'prob-3',
    text: 'Our Shopify store has 200+ SKUs and updating inventory across all channels manually is killing us.',
    category: 'Inventory',
    confidence: 0.95,
    subreddit: 'shopify',
    sourcesCount: 45,
    createdAt: '2024-01-25T16:40:00Z',
  },
  {
    id: 'prob-4',
    text: 'Getting customer feedback but it\'s scattered across email, chat, and reviews. No way to see patterns.',
    category: 'Feedback',
    confidence: 0.86,
    subreddit: 'Entrepreneur',
    sourcesCount: 31,
    createdAt: '2024-01-24T11:00:00Z',
  },
  {
    id: 'prob-5',
    text: 'Onboarding new clients takes 2 weeks of back-and-forth emails just to collect basic documents.',
    category: 'Onboarding',
    confidence: 0.91,
    subreddit: 'smallbusiness',
    sourcesCount: 27,
    createdAt: '2024-01-23T13:30:00Z',
  },
];

export const mockClusters: Cluster[] = [
  {
    id: 'cluster-1',
    title: 'Tool Integration Nightmares',
    urgency: 'high',
    frequency: 89,
    keywords: ['API', 'integration', 'sync', 'middleware', 'Zapier'],
    whyItMatters: 'Founders spend 5-10 hours/week manually connecting tools. Existing solutions like Zapier are expensive and limited for complex workflows.',
    excerpts: [
      '"Tried connecting [tool] to [tool] and gave up after 2 days. The documentation is..."',
      '"We pay $300/mo for Zapier and still have sync issues daily..."',
      '"Why can\'t these tools just talk to each other? Every integration breaks..."',
    ],
    subreddits: ['SaaS', 'startups'],
  },
  {
    id: 'cluster-2',
    title: 'Proposal & Pricing Chaos',
    urgency: 'medium',
    frequency: 67,
    keywords: ['proposal', 'pricing', 'quote', 'template', 'spreadsheet'],
    whyItMatters: 'Sales teams lose deals due to slow proposal turnaround. Manual pricing calculations lead to errors and margin leakage.',
    excerpts: [
      '"Our proposals take 2 days to create. Competitors respond in hours..."',
      '"Made a $5k pricing error last month because the spreadsheet formula was wrong..."',
      '"Need 3 approvals for every custom quote. By then the client is gone..."',
    ],
    subreddits: ['startups', 'Entrepreneur'],
  },
  {
    id: 'cluster-3',
    title: 'Multi-Channel Inventory Hell',
    urgency: 'high',
    frequency: 112,
    keywords: ['inventory', 'SKU', 'sync', 'oversell', 'channels'],
    whyItMatters: 'E-commerce merchants regularly oversell and undersell due to inventory sync delays. Average $2k/month lost to overselling alone.',
    excerpts: [
      '"Sold the same item on Amazon and Shopify. Now I have an angry customer..."',
      '"Update inventory at 9am, takes until 3pm to sync. By then, already oversold..."',
      '"Hired a VA just to manually update stock across 4 channels..."',
    ],
    subreddits: ['shopify', 'ecommerce'],
  },
  {
    id: 'cluster-4',
    title: 'Scattered Customer Feedback',
    urgency: 'medium',
    frequency: 54,
    keywords: ['feedback', 'reviews', 'NPS', 'insights', 'aggregate'],
    whyItMatters: 'Product decisions are made on gut feeling because consolidating feedback from 5+ sources is too time-consuming.',
    excerpts: [
      '"Have feedback in Intercom, email, Trustpilot, G2, and support tickets. Impossible to synthesize..."',
      '"Asked 3 team members what customers want. Got 3 different answers..."',
      '"We survey customers but the data sits in a spreadsheet nobody reads..."',
    ],
    subreddits: ['SaaS', 'Entrepreneur'],
  },
  {
    id: 'cluster-5',
    title: 'Client Onboarding Bottleneck',
    urgency: 'high',
    frequency: 78,
    keywords: ['onboarding', 'documents', 'forms', 'portal', 'checklist'],
    whyItMatters: 'Slow onboarding causes client churn before value is delivered. 30% of churned clients cite "too complicated to get started".',
    excerpts: [
      '"Takes 3 weeks to onboard a client. They\'re frustrated before they even start..."',
      '"Chasing documents via email is my full-time job now..."',
      '"Built a Google Form but it\'s clunky and clients complain..."',
    ],
    subreddits: ['smallbusiness', 'startups'],
  },
];

export const mockIdeas: Idea[] = [
  {
    id: 'idea-1',
    name: 'SyncBridge',
    oneLiner: 'Visual workflow builder for complex API integrations that Zapier can\'t handle',
    targetUser: 'Technical founders managing 10+ SaaS tools',
    clusterIds: ['cluster-1'],
    mvp: [
      'Support top 20 SaaS APIs (CRM, email, payments)',
      'Visual drag-and-drop workflow builder',
      'Real-time sync status dashboard',
      'Error alerts with suggested fixes',
      'One-click retry for failed syncs',
    ],
    pricing: 'Freemium: 3 workflows free, $29/mo for unlimited, $99/mo for priority support',
    moat: 'Deep integration expertise + pre-built complex workflow templates for specific use cases (e.g., "Agency client onboarding flow")',
    validation: [
      'Post in r/SaaS asking about integration pain - aim for 50+ comments',
      'Interview 10 founders who mentioned this problem on Reddit',
      'Build a landing page and measure signup intent (target: 5% conversion)',
    ],
    risks: [
      'Zapier has massive market awareness',
      'API changes could break integrations frequently',
      'Support burden could be high for complex use cases',
    ],
    status: 'researching',
    createdAt: '2024-01-28T10:00:00Z',
  },
  {
    id: 'idea-2',
    name: 'ProposaLab',
    oneLiner: 'AI-powered proposal generator that pulls pricing from your existing tools',
    targetUser: 'B2B service agencies with 5-50 employees',
    clusterIds: ['cluster-2'],
    mvp: [
      'Template library for common proposal types',
      'Auto-pull pricing from connected spreadsheets/tools',
      'E-signature integration',
      'Proposal analytics (opens, time spent)',
      'Mobile preview',
    ],
    pricing: '$49/mo per seat, $199/mo team plan (5 seats)',
    moat: 'AI learns your pricing patterns and suggests optimal pricing based on deal context. Industry-specific templates.',
    validation: [
      'Survey 20 agency owners about current proposal process',
      'Offer to build proposals for 5 agencies for free in exchange for feedback',
      'A/B test landing pages: "faster proposals" vs "win more deals"',
    ],
    risks: [
      'PandaDoc and Proposify are established players',
      'Pricing complexity varies wildly by industry',
      'Training AI on sensitive pricing data has privacy concerns',
    ],
    status: 'backlog',
    createdAt: '2024-01-26T14:30:00Z',
  },
  {
    id: 'idea-3',
    name: 'StockSync Pro',
    oneLiner: 'Real-time inventory sync for multi-channel e-commerce sellers',
    targetUser: 'Shopify merchants selling on 3+ channels with 100+ SKUs',
    clusterIds: ['cluster-3'],
    mvp: [
      'Connect Shopify, Amazon, eBay, Walmart',
      'Real-time inventory sync (< 5 min delay)',
      'Low stock alerts across all channels',
      'Sync history and audit log',
      'Bulk edit inventory levels',
    ],
    pricing: '$79/mo for up to 500 SKUs, $149/mo for 2000 SKUs, $299/mo unlimited',
    moat: 'Guaranteed sync time SLA. If we cause an oversell, we cover the cost.',
    validation: [
      'Partner with 3 Shopify app reviewers for beta feedback',
      'Calculate average cost of overselling for target merchants',
      'Cold email 50 merchants who complained about this on Reddit',
    ],
    risks: [
      'TradeGecko/Cin7 are established players',
      'Marketplace API rate limits could cause delays',
      'Liability for oversell guarantee could be expensive',
    ],
    status: 'building',
    createdAt: '2024-01-24T09:00:00Z',
  },
];

export const mockSources: Source[] = [
  {
    id: 'src-1',
    url: 'https://reddit.com/r/SaaS/comments/xxx',
    title: 'Anyone else frustrated with tool integrations?',
    subreddit: 'SaaS',
    createdAt: '2024-01-27T08:00:00Z',
    excerpt: '"...spent 3 hours trying to make [tool] talk to [tool]. The webhooks keep failing and there\'s no error message that makes sense..."',
    commentsExcerpts: [
      '"Same here. We ended up hiring a developer just for integrations..."',
      '"Zapier works for simple stuff but breaks on anything complex..."',
    ],
  },
  {
    id: 'src-2',
    url: 'https://reddit.com/r/shopify/comments/yyy',
    title: 'How do you handle inventory across multiple channels?',
    subreddit: 'shopify',
    createdAt: '2024-01-25T14:30:00Z',
    excerpt: '"...oversold 5 items this week because Amazon inventory didn\'t sync. Now dealing with angry customers and potential account suspension..."',
    commentsExcerpts: [
      '"We use [tool] but it\'s $200/mo and still has a 30-min delay..."',
      '"Hired a VA to manually check inventory every 2 hours. Not sustainable..."',
    ],
  },
  {
    id: 'src-3',
    url: 'https://reddit.com/r/startups/comments/zzz',
    title: 'Our proposal process is killing deals',
    subreddit: 'startups',
    createdAt: '2024-01-24T11:15:00Z',
    excerpt: '"...by the time we send a proposal (usually 2-3 days), the client has already signed with a competitor. We need to speed this up..."',
    commentsExcerpts: [
      '"We templated everything and got it down to 4 hours. Still not fast enough..."',
      '"The worst part is pulling pricing. Have to check 3 systems..."',
    ],
  },
];

export const mockAlertRules: AlertRule[] = [
  {
    id: 'alert-1',
    collectionId: 'col-1',
    keywords: ['integration', 'API', 'sync'],
    theme: 'Tool Integration',
    cadence: 'daily',
    enabled: true,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'alert-2',
    collectionId: 'col-2',
    keywords: ['inventory', 'stock', 'oversell'],
    theme: 'Inventory Management',
    cadence: 'realtime',
    enabled: true,
    createdAt: '2024-01-22T15:00:00Z',
  },
];

export const mockUser: User = {
  id: 'user-1',
  email: 'founder@example.com',
  name: 'Alex Chen',
  redditConnected: true,
  onboardingComplete: true,
  preferences: {
    defaultTimeframe: '7d',
    language: 'en',
    goals: ['micro-saas', 'customer-research'],
  },
};
