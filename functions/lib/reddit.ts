// Reddit Public JSON API client (no OAuth required)

export interface RedditConfig {
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
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000; // 1 request per second baseline
  private etagCache: Map<string, string> = new Map();

  constructor(config: RedditConfig) {
    this.config = config;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    await this.throttle();

    for (let i = 0; i < retries; i++) {
      try {
        const headers: Record<string, string> = {
          'User-Agent': this.config.userAgent || 'web:PulsePoint:v1.0.0 (by /u/pulsepoint)',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        };

        // Add ETag caching if we've seen this URL before
        const cachedEtag = this.etagCache.get(url);
        if (cachedEtag) {
          headers['If-None-Match'] = cachedEtag;
        }

        const response = await fetch(url, { headers });

        // Handle 304 Not Modified (cached content)
        if (response.status === 304) {
          console.log(`Cache hit for ${url}`);
          return null; // Indicates no new data
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          console.warn(`Rate limited, waiting ${retryAfter}s`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        // Handle 403 Forbidden with detailed error message
        if (response.status === 403) {
          const errorText = await response.text().catch(() => '');
          const errorMessage = `Reddit API 403 Forbidden. User-Agent: ${this.config.userAgent || 'not set'}. ` +
            `Please ensure REDDIT_USER_AGENT is set in format: "web:appname:version (by /u/username)". ` +
            `Response: ${errorText || 'No additional details'}`;
          throw new Error(errorMessage);
        }

        if (!response.ok) {
          throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
        }

        // Cache ETag for future requests
        const etag = response.headers.get('etag');
        if (etag) {
          this.etagCache.set(url, etag);
        }

        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        const backoff = Math.min(1000 * Math.pow(2, i), 10000);
        console.warn(`Retry ${i + 1}/${retries} after ${backoff}ms`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  async fetchPosts(
    subreddit: string,
    cutoffTimestamp: number,
    afterCursor?: string,
    limit = 100
  ): Promise<{ posts: RedditPost[]; after: string | null }> {
    let url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
    if (afterCursor) {
      url += `&after=${afterCursor}`;
    }

    const data = await this.fetchWithRetry(url);
    
    // Handle 304 (no new data)
    if (!data) {
      return { posts: [], after: null };
    }

    const posts: RedditPost[] = [];
    let shouldContinue = false;

    if (data?.data?.children) {
      for (const child of data.data.children) {
        const post = child.data;
        
        // Stop if we've reached posts older than our cutoff
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
    }

    return {
      posts,
      after: shouldContinue && data?.data?.after ? data.data.after : null,
    };
  }

  async fetchComments(
    subreddit: string,
    postId: string,
    maxDepth = 2,
    maxComments = 50
  ): Promise<RedditComment[]> {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=100&depth=${maxDepth}`;
    
    const data = await this.fetchWithRetry(url);
    
    if (!data) {
      return []; // 304 or error
    }

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

    // Reddit returns [post_listing, comments_listing]
    if (Array.isArray(data) && data[1]?.data?.children) {
      extractComments(data[1].data.children);
    }

    return comments;
  }
}
