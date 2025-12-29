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

    // Start async processing (don't await - return immediately)
    context.waitUntil(
      runScrapeJob(runId, subreddit, body.windowDays, env, sql)
    );

    console.log('[SCRAPE] Background job started, returning 202');
    return new Response(JSON.stringify({
      id: runId,
      status: 'running',
      message: 'Scrape job started',
    }), {
      status: 202,
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
) {
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
    // CRITICAL: Each DB INSERT = 1 subrequest. Cloudflare limit = 50 total.
    // With overhead (queries, AI calls), we can only afford ~35 inserts.
    const MAX_POSTS = 20; // 20 post inserts
    const MAX_POSTS_WITH_COMMENTS = 5; // Only 5 posts get comments
    const MAX_COMMENTS_PER_POST = 4; // 4 comments each = 20 comment inserts
    // Total inserts: 20 posts + 20 comments + ~10 problems + ~3 clusters + ~3 ideas = ~56
    // Still tight! May need to reduce further in production.

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

      // Insert posts (Note: Each INSERT counts as a subrequest)
      // To stay within Cloudflare's 50 subrequest limit, we limit to 30 posts total
      const postsToInsert = posts.slice(0, MAX_POSTS - allPosts.length);
      
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
            RETURNING id
          `;

          allPosts.push({ ...post, uuid: dbPosts[0].id });
          stats.postsScraped++;
        } catch (error) {
          console.error(`[SCRAPE ${runId}] Error inserting post ${post.id}:`, error);
        }
      }

      console.log(`[SCRAPE ${runId}] Inserted ${postsToInsert.length} posts`);

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
    
    for (const post of topPosts) {
      try {
        const comments = await reddit.fetchComments(subreddit.name, post.id, 1, 10);
        
        // Only insert top N comments per post (to minimize subrequests)
        const topComments = comments.slice(0, MAX_COMMENTS_PER_POST);
        
        for (const comment of topComments) {
          try {
            await sql`
              INSERT INTO reddit_comments (
                run_id, subreddit_id, post_uuid, reddit_comment_id,
                reddit_post_id, parent_reddit_comment_id, created_utc,
                author, body, score, raw
              )
              VALUES (
                ${runId}, ${subreddit.id}, ${post.uuid}, ${comment.id},
                ${post.id}, ${comment.parent_id}, to_timestamp(${comment.created_utc}),
                ${comment.author}, ${comment.body}, ${comment.score}, 
                ${JSON.stringify(comment)}::jsonb
              )
              ON CONFLICT (reddit_comment_id) DO NOTHING
            `;
            stats.commentsScraped++;
          } catch (error) {
            console.error(`Error inserting comment ${comment.id}:`, error);
          }
        }

        console.log(`[SCRAPE ${runId}] Stored ${topComments.length} comments for post ${post.id}`);
        
        // Small delay between comment fetches
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching comments for post ${post.id}:`, error);
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

    // Store problem statements (each is 1 subrequest)
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
        stats.problemsExtracted++;
      } catch (error) {
        console.error(`Error storing problem statement:`, error);
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

  } catch (error) {
    console.error('Scrape job failed:', error);
    
    await sql`
      UPDATE scrape_runs
      SET 
        status = 'failed',
        finished_at = NOW(),
        error_message = ${error instanceof Error ? error.message : 'Unknown error'},
        stats = ${JSON.stringify(stats)}::jsonb
      WHERE id = ${runId}
    `;
  }
}

