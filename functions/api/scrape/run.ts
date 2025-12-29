// POST /api/scrape/run - Trigger a scrape run

import { neon } from '@neondatabase/serverless';
import type { AppContext } from '../../_middleware';
import { RedditClient } from '../../lib/reddit';
import { OpenRouterClient, normalizeSeverity } from '../../lib/openrouter';

interface ScrapeRequest {
  subredditId: string;
  windowDays: number; // 1 or 7
}

export const onRequestPost = async (context: any) => {
  const sql = neon(context.env.DATABASE_URL);
  const env = context.env;

  try {
    console.log('[SCRAPE] Received scrape request');
    const body = await context.request.json() as ScrapeRequest;
    
    console.log('[SCRAPE] Request params:', { subredditId: body.subredditId, windowDays: body.windowDays });
    
    if (!body.subredditId || !body.windowDays) {
      return new Response(JSON.stringify({
        error: 'subredditId and windowDays are required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate windowDays
    if (![1, 7].includes(body.windowDays)) {
      return new Response(JSON.stringify({
        error: 'windowDays must be 1 or 7',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get subreddit info
    const subreddits = await sql`
      SELECT id, name, is_active
      FROM tracked_subreddits
      WHERE id = ${body.subredditId}
    `;

    if (subreddits.length === 0) {
      console.error('[SCRAPE] Subreddit not found:', body.subredditId);
      return new Response(JSON.stringify({
        error: 'Subreddit not found',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const subreddit = subreddits[0] as { id: string; name: string; is_active: boolean };
    console.log('[SCRAPE] Found subreddit:', subreddit.name);

    // Create run record
    const runs = await sql`
      INSERT INTO scrape_runs (subreddit_id, window_days, status)
      VALUES (${body.subredditId}, ${body.windowDays}, 'running')
      RETURNING id
    `;
    
    const runId = runs[0].id;
    console.log('[SCRAPE] Created run with ID:', runId);

    // Run the scrape job synchronously (wait for completion)
    console.log('[SCRAPE] Starting scrape job...');
    const result = await runScrapeJob(runId, subreddit, body.windowDays, env, sql);

    console.log('[SCRAPE] Job completed, returning result');
    return new Response(JSON.stringify({
      id: runId,
      status: result.status,
      message: result.status === 'completed' ? 'Scrape job completed successfully' : 'Scrape job failed',
      stats: result.stats,
      error: result.error,
    }), {
      status: result.status === 'completed' ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting scrape:', error);
    return new Response(JSON.stringify({
      error: 'Failed to start scrape',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function runScrapeJob(
  runId: string,
  subreddit: { id: string; name: string },
  windowDays: number,
  env: any,
  sql: any
): Promise<{ status: 'completed' | 'failed'; stats: any; error?: string }> {
  console.log(`[SCRAPE JOB ${runId}] Starting for r/${subreddit.name}, window: ${windowDays} days`);
  
  // Extended stats for better visibility into what was scraped
  const stats = {
    postsScraped: 0,
    postsWithComments: 0,  // How many posts had comments fetched
    commentsScraped: 0,
    problemsExtracted: 0,
    clustersCreated: 0,
    ideasGenerated: 0,
  };

  try {
    // Initialize clients
    console.log(`[SCRAPE JOB ${runId}] Initializing Reddit and AI clients`);
    
    const userAgent = env.REDDIT_USER_AGENT || 'web:PulsePoint:v1.0.0 (by /u/pulsepoint)';
    console.log(`[SCRAPE JOB ${runId}] Using Reddit User-Agent: ${userAgent}`);
    
    const reddit = new RedditClient({
      userAgent,
    });

    // Check for required API key
    if (!env.OPENROUTER_API_KEY) {
      console.error(`[SCRAPE JOB ${runId}] Missing OPENROUTER_API_KEY`);
      throw new Error('OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in environment variables.');
    }

    const ai = new OpenRouterClient({
      apiKey: env.OPENROUTER_API_KEY,
      // Model will be auto-selected if not provided
      model: env.OPENROUTER_MODEL,
    });

    console.log(`[SCRAPE JOB ${runId}] OpenRouter client initialized (model will be auto-selected)`);

    // Calculate cutoff timestamp
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);
    const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
    console.log(`[SCRAPE JOB ${runId}] Cutoff: ${cutoffDate.toISOString()} (${cutoffTimestamp})`);

    // For 24-hour scrapes, always start fresh (no checkpoint)
    // Reddit's /new endpoint returns newest posts first, so using an old cursor
    // from a previous run would skip all the new posts we want to capture.
    // For 7-day scrapes, we can use checkpoints for incremental updates.
    let afterCursor: string | undefined = undefined;
    
    if (windowDays === 7) {
      // Get checkpoint only for 7-day window
      const checkpoints = await sql`
        SELECT last_after_cursor
        FROM scrape_checkpoints
        WHERE subreddit_id = ${subreddit.id} AND window_days = ${windowDays}
      `;
      afterCursor = checkpoints[0]?.last_after_cursor || undefined;
      if (afterCursor) {
        console.log(`[SCRAPE JOB ${runId}] Using checkpoint cursor for 7-day window`);
      }
    } else {
      console.log(`[SCRAPE JOB ${runId}] 24-hour window: starting fresh (no checkpoint)`);
      // Clear any stale checkpoint for 24h window
      await sql`
        DELETE FROM scrape_checkpoints 
        WHERE subreddit_id = ${subreddit.id} AND window_days = ${windowDays}
      `;
    }

    // Fetch posts (limit to stay within subrequest limits)
    const allPosts: any[] = [];
    let continuePages = true;
    
    // ============================================================
    // SCRAPER LIMITS DOCUMENTATION
    // ============================================================
    // CRITICAL: Cloudflare Pages has a limit of 50 subrequests total per request.
    // Each DB insert = 1 subrequest. Each Reddit API call = 1 subrequest.
    // 
    // Current budget breakdown:
    // - Posts:    ~10 inserts (MAX_POSTS)
    // - Comments: ~9 inserts (3 posts × 3 comments each)
    // - Problems: ~10 inserts
    // - Clusters: ~5 inserts
    // - Ideas:    ~5 inserts  
    // - Other:    ~5 queries (checkpoints, run updates, etc.)
    // Total:      ~44 subrequests (under 50 limit)
    // ============================================================
    const MAX_POSTS = 10;              // Maximum posts to scrape
    const MAX_POSTS_WITH_COMMENTS = 3; // Only top 3 posts get their comments fetched
    const MAX_COMMENTS_PER_POST = 3;   // Up to 3 comments per post = 9 comments max
    
    console.log(`[SCRAPE ${runId}] Limits: ${MAX_POSTS} posts, ${MAX_POSTS_WITH_COMMENTS} posts with comments, ${MAX_COMMENTS_PER_POST} comments/post`);

    while (continuePages && allPosts.length < MAX_POSTS) {
      console.log(`[SCRAPE ${runId}] Fetching posts, current count: ${allPosts.length}`);
      const { posts, after } = await reddit.fetchPosts(
        subreddit.name,
        cutoffTimestamp,
        afterCursor
      );

      if (posts.length === 0) {
        continuePages = false;
        break;
      }

      // Batch insert posts (1 query instead of N queries to save subrequests)
      const postsToInsert = posts.slice(0, MAX_POSTS - allPosts.length);
      
      if (postsToInsert.length > 0) {
        // Insert posts one by one (Neon serverless requires tagged template literals)
        for (const post of postsToInsert) {
          try {
            const dbPosts = await sql`
              INSERT INTO reddit_posts (
                run_id, subreddit_id, reddit_post_id, created_utc,
                title, selftext, author, permalink, url, score, num_comments, raw
              )
              VALUES (
                ${runId}, ${subreddit.id}, ${post.id},
                to_timestamp(${post.created_utc}),
                ${post.title}, ${post.selftext}, ${post.author},
                ${post.permalink}, ${post.url}, ${post.score},
                ${post.num_comments}, ${JSON.stringify(post)}::jsonb
              )
              ON CONFLICT (reddit_post_id) DO UPDATE
              SET run_id = EXCLUDED.run_id
              RETURNING id, reddit_post_id
            `;

            if (dbPosts.length > 0) {
              allPosts.push({ ...post, uuid: dbPosts[0].id });
              stats.postsScraped++;
            }
          } catch (error) {
            console.error(`[SCRAPE ${runId}] Error inserting post ${post.id}:`, error);
          }
        }
        console.log(`[SCRAPE ${runId}] Inserted ${postsToInsert.length} posts`);
      }

      afterCursor = after || undefined;
      
      if (!after || allPosts.length >= MAX_POSTS) {
        continuePages = false;
      }

      // Save checkpoint
      await sql`
        INSERT INTO scrape_checkpoints (subreddit_id, window_days, last_after_cursor, last_post_created_utc)
        VALUES (
          ${subreddit.id}, ${windowDays}, ${afterCursor}, 
          to_timestamp(${posts[posts.length - 1]?.created_utc || cutoffTimestamp})
        )
        ON CONFLICT (subreddit_id, window_days)
        DO UPDATE SET
          last_after_cursor = EXCLUDED.last_after_cursor,
          last_post_created_utc = EXCLUDED.last_post_created_utc,
          updated_at = NOW()
      `;
    }

    // Fetch comments only for top posts (to stay within limits)
    // Note: Only MAX_POSTS_WITH_COMMENTS posts get their comments fetched,
    // and each post gets up to MAX_COMMENTS_PER_POST comments.
    console.log(`[SCRAPE ${runId}] Fetching comments for top ${MAX_POSTS_WITH_COMMENTS} of ${allPosts.length} posts`);
    const topPosts = allPosts.slice(0, MAX_POSTS_WITH_COMMENTS);
    
    const allComments: any[] = [];
    let postsWithCommentsCount = 0;
    
    for (const post of topPosts) {
      try {
        const comments = await reddit.fetchComments(subreddit.name, post.id, 1, 10);
        
        // Only take top N comments per post (to minimize subrequests)
        const topComments = comments.slice(0, MAX_COMMENTS_PER_POST);
        
        if (topComments.length > 0) {
          postsWithCommentsCount++;
        }
        
        // Add to batch with post UUID
        for (const comment of topComments) {
          allComments.push({ ...comment, postUuid: post.uuid, postId: post.id });
        }

        console.log(`[SCRAPE ${runId}] Fetched ${topComments.length}/${comments.length} comments for post ${post.id}`);
        
        // Small delay between comment fetches
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching comments for post ${post.id}:`, error);
      }
    }
    
    stats.postsWithComments = postsWithCommentsCount;
    console.log(`[SCRAPE ${runId}] Comment summary: ${postsWithCommentsCount} posts with comments, ${allComments.length} total comments to insert`);

    // Insert comments one by one (Neon serverless requires tagged template literals)
    if (allComments.length > 0) {
      let insertedComments = 0;
      for (const comment of allComments) {
        try {
          await sql`
            INSERT INTO reddit_comments (
              run_id, subreddit_id, post_uuid, reddit_comment_id,
              reddit_post_id, parent_reddit_comment_id, created_utc,
              author, body, score, raw
            )
            VALUES (
              ${runId}, ${subreddit.id}, ${comment.postUuid}, ${comment.id},
              ${comment.postId}, ${comment.parent_id}, to_timestamp(${comment.created_utc}),
              ${comment.author}, ${comment.body}, ${comment.score}, 
              ${JSON.stringify(comment)}::jsonb
            )
            ON CONFLICT (reddit_comment_id) DO NOTHING
          `;
          insertedComments++;
        } catch (error) {
          console.error(`[SCRAPE ${runId}] Error inserting comment ${comment.id}:`, error);
        }
      }
      stats.commentsScraped = insertedComments;
      console.log(`[SCRAPE ${runId}] Inserted ${insertedComments} comments`);
    }

    // AI Processing: Extract problems (heavily reduced to stay under 50 subrequest limit)
    const allProblems: Array<{ statement: string; sourceType: string; sourceUuid: string }> = [];

    console.log(`[SCRAPE ${runId}] Starting AI problem extraction (limited to conserve subrequests)`);
    
    // Extract from top 3 posts only (each AI call = 1 subrequest to OpenRouter)
    const postsToAnalyze = allPosts.slice(0, 3);
    for (const post of postsToAnalyze) {
      const text = `${post.title}\n\n${post.selftext}`.trim();
      if (text.length > 50) {
        try {
          const problems = await ai.extractProblems(text, `post in r/${subreddit.name}`);
          // Limit to 2 problems per post to reduce inserts
          for (const problem of problems.slice(0, 2)) {
            allProblems.push({
              statement: problem,
              sourceType: 'post',
              sourceUuid: post.uuid,
            });
          }
        } catch (error) {
          console.error(`Error extracting problems from post ${post.id}:`, error);
        }
      }
    }

    // Extract from top 3 comments only (each AI call = 1 subrequest to OpenRouter)
    const comments = await sql`
      SELECT id, body
      FROM reddit_comments
      WHERE run_id = ${runId}
      ORDER BY score DESC
      LIMIT 3
    `;

    for (const comment of comments) {
      if (comment.body && comment.body.length > 50) {
        try {
          const problems = await ai.extractProblems(comment.body, `comment in r/${subreddit.name}`);
          // Limit to 2 problems per comment
          for (const problem of problems.slice(0, 2)) {
            allProblems.push({
              statement: problem,
              sourceType: 'comment',
              sourceUuid: comment.id,
            });
          }
        } catch (error) {
          console.error(`Error extracting problems from comment:`, error);
        }
      }
    }

    console.log(`[SCRAPE ${runId}] Extracted ${allProblems.length} problems total`);

    // Limit total problem inserts to 10 max (each insert = 1 subrequest)
    const problemsToStore = allProblems.slice(0, 10);
    console.log(`[SCRAPE ${runId}] Storing ${problemsToStore.length} problems in DB`);

    // Insert problem statements one by one (Neon serverless requires tagged template literals)
    if (problemsToStore.length > 0) {
      let insertedProblems = 0;
      for (const problem of problemsToStore) {
        try {
          await sql`
            INSERT INTO problem_statements (
              run_id, subreddit_id, source_type, source_uuid, statement
            )
            VALUES (
              ${runId}, ${subreddit.id}, ${problem.sourceType}, 
              ${problem.sourceUuid}, ${problem.statement}
            )
          `;
          insertedProblems++;
        } catch (error) {
          console.error(`[SCRAPE ${runId}] Error inserting problem statement:`, error);
        }
      }
      stats.problemsExtracted = insertedProblems;
      console.log(`[SCRAPE ${runId}] Inserted ${insertedProblems} problem statements`);
    }

    // Cluster problems (limit to stay within subrequest limits)
    if (allProblems.length > 0) {
      console.log(`[SCRAPE ${runId}] Clustering ${allProblems.length} problems`);
      const problemStatements = allProblems.map(p => p.statement);
      
      try {
        const clusters = await ai.clusterProblems(problemStatements);
        console.log(`[SCRAPE ${runId}] Generated ${clusters.length} clusters`);

        for (const cluster of clusters) {
          try {
            // Store cluster with normalized severity
            const evidence = cluster.memberIndices
              .slice(0, 5)
              .map(i => allProblems[i]?.statement)
              .filter(Boolean);
            
            // Ensure severity is normalized (handles AI variations like "medium-high")
            const clusterSeverity = normalizeSeverity(cluster.severity);

            const dbClusters = await sql`
              INSERT INTO problem_clusters (
                run_id, subreddit_id, title, summary, frequency, severity, evidence
              )
              VALUES (
                ${runId}, ${subreddit.id}, ${cluster.title}, ${cluster.summary},
                ${cluster.frequency}, ${clusterSeverity}, ${JSON.stringify(evidence)}::jsonb
              )
              RETURNING id
            `;

            const clusterId = dbClusters[0].id;
            stats.clustersCreated++;

            // Generate idea for this cluster
            try {
              const idea = await ai.generateIdea(cluster);
              
              if (idea) {
                // ============================================================
                // IDEA SCORE CALCULATION
                // ============================================================
                // Score = frequency × severity_multiplier
                // 
                // Severity multipliers:
                //   - high:   3x (urgent, critical problems)
                //   - medium: 2x (moderate impact problems)
                //   - low:    1x (minor inconveniences)
                //
                // Example: frequency=5, severity="high" → score = 5 × 3 = 15
                // 
                // Higher scores indicate more promising opportunities:
                //   - High frequency = many people have this problem
                //   - High severity = the problem causes significant pain
                // ============================================================
                const normalizedSeverity = normalizeSeverity(cluster.severity);
                const severityMultiplier = normalizedSeverity === 'high' ? 3 : normalizedSeverity === 'medium' ? 2 : 1;
                const score = cluster.frequency * severityMultiplier;
                
                console.log(`[SCRAPE ${runId}] Idea "${idea.title}": frequency=${cluster.frequency}, severity=${normalizedSeverity}, score=${score}`);
                
                await sql`
                  INSERT INTO generated_ideas (
                    run_id, subreddit_id, cluster_id, title, idea, score
                  )
                  VALUES (
                    ${runId}, ${subreddit.id}, ${clusterId}, ${idea.title},
                    ${JSON.stringify(idea)}::jsonb, ${score}
                  )
                `;
                stats.ideasGenerated++;
              }
            } catch (error) {
              console.error(`Error generating idea for cluster ${clusterId}:`, error);
            }
          } catch (error) {
            console.error(`Error storing cluster:`, error);
          }
        }
      } catch (error) {
        console.error(`Error clustering problems:`, error);
      }
    }

    console.log(`[SCRAPE ${runId}] Completed successfully. Stats:`, stats);

    // Mark as completed
    await sql`
      UPDATE scrape_runs
      SET 
        status = 'completed',
        finished_at = NOW(),
        stats = ${JSON.stringify(stats)}::jsonb
      WHERE id = ${runId}
    `;

    return { status: 'completed', stats };

  } catch (error) {
    console.error('Scrape job failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await sql`
      UPDATE scrape_runs
      SET 
        status = 'failed',
        finished_at = NOW(),
        error_message = ${errorMessage},
        stats = ${JSON.stringify(stats)}::jsonb
      WHERE id = ${runId}
    `;

    return { status: 'failed', stats, error: errorMessage };
  }
}

