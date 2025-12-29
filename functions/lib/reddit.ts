// Reddit API client utilities

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  permalink: string;
  url: string;
  score: number;
  num_comments: number;
  subreddit: string;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  parent_id: string;
  link_id: string;
}

export class RedditClient {
  private config: RedditConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: RedditConfig) {
    this.config = config;
  }

  private async ensureAuth(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.config.userAgent,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    await this.ensureAuth();

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.config.userAgent,
          },
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          console.warn(`Rate limited, waiting ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        if (!response.ok) {
          throw new Error(`Reddit API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        const backoff = Math.min(1000 * Math.pow(2, i), 10000);
        console.warn(`Retry ${i + 1}/${retries} after ${backoff}ms`);
        await this.sleep(backoff);
      }
    }
  }

  async fetchPosts(
    subreddit: string,
    cutoffTimestamp: number,
    afterCursor?: string,
    limit = 100
  ): Promise<{ posts: RedditPost[]; after: string | null }> {
    let url = `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`;
    if (afterCursor) {
      url += `&after=${afterCursor}`;
    }

    const data = await this.fetchWithRetry(url);
    const posts: RedditPost[] = [];
    let shouldContinue = false;

    for (const child of data.data.children) {
      const post = child.data;
      if (post.created_utc < cutoffTimestamp) {
        break;
      }
      posts.push({
        id: post.id,
        title: post.title || '',
        selftext: post.selftext || '',
        author: post.author || '[deleted]',
        created_utc: post.created_utc,
        permalink: post.permalink,
        url: post.url,
        score: post.score || 0,
        num_comments: post.num_comments || 0,
        subreddit: post.subreddit,
      });
      shouldContinue = true;
    }

    return {
      posts,
      after: shouldContinue ? data.data.after : null,
    };
  }

  async fetchComments(
    subreddit: string,
    postId: string,
    maxDepth = 2,
    maxComments = 100
  ): Promise<RedditComment[]> {
    const url = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}?limit=100&depth=${maxDepth}`;
    const data = await this.fetchWithRetry(url);

    const comments: RedditComment[] = [];
    
    const extractComments = (items: any[], count = { current: 0 }) => {
      if (!items || count.current >= maxComments) return;
      
      for (const item of items) {
        if (count.current >= maxComments) break;
        if (!item.data || item.kind !== 't1') continue;
        
        const comment = item.data;
        if (comment.body && comment.body !== '[deleted]' && comment.body !== '[removed]') {
          comments.push({
            id: comment.id,
            body: comment.body,
            author: comment.author || '[deleted]',
            created_utc: comment.created_utc,
            score: comment.score || 0,
            parent_id: comment.parent_id,
            link_id: comment.link_id,
          });
          count.current++;
        }
        
        if (comment.replies?.data?.children) {
          extractComments(comment.replies.data.children, count);
        }
      }
    };

    if (data[1]?.data?.children) {
      extractComments(data[1].data.children);
    }

    return comments;
  }
}

