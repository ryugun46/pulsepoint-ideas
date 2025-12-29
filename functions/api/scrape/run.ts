// POST /api/scrape/run - Trigger a scrape run

import { neon } from '@neondatabase/serverless';
import type { AppContext } from '../../_middleware';
import { RedditClient } from '../../lib/reddit';
import { OpenRouterClient } from '../../lib/openrouter';

interface ScrapeRequest {
  subredditId: string;
  windowDays: number; // 1, 7, or 30
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
    if (![1, 7, 30].includes(body.windowDays)) {
      return new Response(JSON.stringify({
        error: 'windowDays must be 1, 7, or 30',
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
  
  const stats = {
    postsScraped: 0,
    commentsScraped: 0,
    problemsExtracted: 0,
    clustersCreated: 0,
    ideasGenerated: 0,
  };

  try {
    // Initialize clients
    console.log(`[SCRAPE JOB ${runId}] Initializing Reddit and AI clients`);
    const reddit = new RedditClient({
      userAgent: env.REDDIT_USER_AGENT || 'web:PulsePoint:v1.0.0 (by /u/pulsepoint)',
    });

    const ai = new OpenRouterClient({
      apiKey: env.OPENROUTER_API_KEY,
      model: env.OPENROUTER_MODEL,
    });

    // Calculate cutoff timestamp
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);
    const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
    console.log(`[SCRAPE JOB ${runId}] Cutoff: ${cutoffDate.toISOString()} (${cutoffTimestamp})`);

    // Get checkpoint
    const checkpoints = await sql`
      SELECT last_after_cursor
      FROM scrape_checkpoints
      WHERE subreddit_id = ${subreddit.id} AND window_days = ${windowDays}
    `;
    
    let afterCursor = checkpoints[0]?.last_after_cursor || undefined;

    // Fetch posts (limit to stay within subrequest limits)
    const allPosts: any[] = [];
    let continuePages = true;
    // CRITICAL: We batch inserts to minimize subrequests (Cloudflare limit = 50 total)
    // With batching: 1 post insert + 1 comment insert + 1 problem insert + N clusters/ideas + other queries
    // This should keep us well under the 50 subrequest limit
    const MAX_POSTS = 20; // All posts in 1 batch insert
    const MAX_POSTS_WITH_COMMENTS = 5; // Only 5 posts get comments
    const MAX_COMMENTS_PER_POST = 4; // All comments in 1 batch insert

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
        try {
          // Build values array for batch insert
          const values = postsToInsert.map(post => sql`(
            ${runId}, ${subreddit.id}, ${post.id},
            to_timestamp(${post.created_utc}),
            ${post.title}, ${post.selftext}, ${post.author},
            ${post.permalink}, ${post.url}, ${post.score},
            ${post.num_comments}, ${JSON.stringify(post)}::jsonb
          )`);

          // Batch insert all posts in one query
          const dbPosts = await sql`
            INSERT INTO reddit_posts (
              run_id, subreddit_id, reddit_post_id, created_utc,
              title, selftext, author, permalink, url, score, num_comments, raw
            )
            VALUES ${sql(values)}
            ON CONFLICT (reddit_post_id) DO UPDATE
            SET run_id = EXCLUDED.run_id
            RETURNING id, reddit_post_id
          `;

          // Map UUIDs back to posts
          for (let i = 0; i < postsToInsert.length; i++) {
            const post = postsToInsert[i];
            const dbPost = dbPosts.find((p: any) => p.reddit_post_id === post.id);
            if (dbPost) {
              allPosts.push({ ...post, uuid: dbPost.id });
              stats.postsScraped++;
            }
          }

          console.log(`[SCRAPE ${runId}] Batch inserted ${postsToInsert.length} posts`);
        } catch (error) {
          console.error(`[SCRAPE ${runId}] Error batch inserting posts:`, error);
        }
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
    console.log(`[SCRAPE ${runId}] Fetching comments for top ${MAX_POSTS_WITH_COMMENTS} posts`);
    const topPosts = allPosts.slice(0, MAX_POSTS_WITH_COMMENTS);
    
    const allComments: any[] = [];
    for (const post of topPosts) {
      try {
        const comments = await reddit.fetchComments(subreddit.name, post.id, 1, 10);
        
        // Only take top N comments per post (to minimize subrequests)
        const topComments = comments.slice(0, MAX_COMMENTS_PER_POST);
        
        // Add to batch with post UUID
        for (const comment of topComments) {
          allComments.push({ ...comment, postUuid: post.uuid, postId: post.id });
        }

        console.log(`[SCRAPE ${runId}] Fetched ${topComments.length} comments for post ${post.id}`);
        
        // Small delay between comment fetches
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching comments for post ${post.id}:`, error);
      }
    }

    // Batch insert all comments in one query
    if (allComments.length > 0) {
      try {
        const values = allComments.map(comment => sql`(
          ${runId}, ${subreddit.id}, ${comment.postUuid}, ${comment.id},
          ${comment.postId}, ${comment.parent_id}, to_timestamp(${comment.created_utc}),
          ${comment.author}, ${comment.body}, ${comment.score}, 
          ${JSON.stringify(comment)}::jsonb
        )`);

        await sql`
          INSERT INTO reddit_comments (
            run_id, subreddit_id, post_uuid, reddit_comment_id,
            reddit_post_id, parent_reddit_comment_id, created_utc,
            author, body, score, raw
          )
          VALUES ${sql(values)}
          ON CONFLICT (reddit_comment_id) DO NOTHING
        `;
        
        stats.commentsScraped = allComments.length;
        console.log(`[SCRAPE ${runId}] Batch inserted ${allComments.length} comments`);
      } catch (error) {
        console.error(`Error batch inserting comments:`, error);
      }
    }

    // AI Processing: Extract problems (heavily reduced to stay under 50 subrequest limit)
    const allProblems: Array<{ statement: string; sourceType: string; sourceUuid: string }> = [];

    console.log(`[SCRAPE ${runId}] Starting AI problem extraction (limited to conserve subrequests)`);
    
    // Extract from top 5 posts only
    const postsToAnalyze = allPosts.slice(0, 5);
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

    // Extract from top 5 comments
    const comments = await sql`
      SELECT id, body
      FROM reddit_comments
      WHERE run_id = ${runId}
      ORDER BY score DESC
      LIMIT 5
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

    // Limit total problem inserts to 15 max
    const problemsToStore = allProblems.slice(0, 15);
    console.log(`[SCRAPE ${runId}] Storing ${problemsToStore.length} problems in DB`);

    // Batch insert all problem statements in one query
    if (problemsToStore.length > 0) {
      try {
        const values = problemsToStore.map(problem => sql`(
          ${runId}, ${subreddit.id}, ${problem.sourceType}, 
          ${problem.sourceUuid}, ${problem.statement}
        )`);

        await sql`
          INSERT INTO problem_statements (
            run_id, subreddit_id, source_type, source_uuid, statement
          )
          VALUES ${sql(values)}
        `;
        
        stats.problemsExtracted = problemsToStore.length;
        console.log(`[SCRAPE ${runId}] Batch inserted ${problemsToStore.length} problem statements`);
      } catch (error) {
        console.error(`Error batch inserting problem statements:`, error);
      }
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
            // Store cluster
            const evidence = cluster.memberIndices
              .slice(0, 5)
              .map(i => allProblems[i]?.statement)
              .filter(Boolean);

            const dbClusters = await sql`
              INSERT INTO problem_clusters (
                run_id, subreddit_id, title, summary, frequency, severity, evidence
              )
              VALUES (
                ${runId}, ${subreddit.id}, ${cluster.title}, ${cluster.summary},
                ${cluster.frequency}, ${cluster.severity}, ${JSON.stringify(evidence)}::jsonb
              )
              RETURNING id
            `;

            const clusterId = dbClusters[0].id;
            stats.clustersCreated++;

            // Generate idea for this cluster
            try {
              const idea = await ai.generateIdea(cluster);
              
              if (idea) {
                await sql`
                  INSERT INTO generated_ideas (
                    run_id, subreddit_id, cluster_id, title, idea, score
                  )
                  VALUES (
                    ${runId}, ${subreddit.id}, ${clusterId}, ${idea.title},
                    ${JSON.stringify(idea)}::jsonb, ${cluster.frequency * (cluster.severity === 'high' ? 3 : cluster.severity === 'medium' ? 2 : 1)}
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

