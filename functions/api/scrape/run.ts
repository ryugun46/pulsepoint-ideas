// POST /api/scrape/run - Trigger a scrape run

import { neon } from '@neondatabase/serverless';
import type { AppContext } from '../../_middleware';
import { RedditClient } from '../../lib/reddit';
import { OpenRouterClient } from '../../lib/openrouter';

interface ScrapeRequest {
  subredditId: string;
  windowDays: number; // 1, 7, or 30
}

export const onRequestPost: PagesFunction<AppContext['env']> = async (context) => {
  const sql = neon(context.env.DATABASE_URL);
  const env = context.env;

  try {
    const body = await context.request.json() as ScrapeRequest;
    
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
      return new Response(JSON.stringify({
        error: 'Subreddit not found',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const subreddit = subreddits[0];

    // Create run record
    const runs = await sql`
      INSERT INTO scrape_runs (subreddit_id, window_days, status)
      VALUES (${body.subredditId}, ${body.windowDays}, 'running')
      RETURNING id
    `;
    
    const runId = runs[0].id;

    // Start async processing (don't await - return immediately)
    context.waitUntil(
      runScrapeJob(runId, subreddit, body.windowDays, env, sql)
    );

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
  const stats = {
    postsScraped: 0,
    commentsScraped: 0,
    problemsExtracted: 0,
    clustersCreated: 0,
    ideasGenerated: 0,
  };

  try {
    // Initialize clients
    const reddit = new RedditClient({
      userAgent: env.REDDIT_USER_AGENT || 'PulsePoint/1.0',
    });

    const ai = new OpenRouterClient({
      apiKey: env.OPENROUTER_API_KEY,
      model: env.OPENROUTER_MODEL,
    });

    // Calculate cutoff timestamp
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);
    const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

    // Get checkpoint
    const checkpoints = await sql`
      SELECT last_after_cursor
      FROM scrape_checkpoints
      WHERE subreddit_id = ${subreddit.id} AND window_days = ${windowDays}
    `;
    
    let afterCursor = checkpoints[0]?.last_after_cursor || undefined;

    // Fetch posts
    const allPosts: any[] = [];
    let continuePages = true;

    while (continuePages && allPosts.length < 500) {
      const { posts, after } = await reddit.fetchPosts(
        subreddit.name,
        cutoffTimestamp,
        afterCursor
      );

      if (posts.length === 0) {
        continuePages = false;
        break;
      }

      for (const post of posts) {
        // Store post
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

        const postUuid = dbPosts[0].id;
        allPosts.push({ ...post, uuid: postUuid });
        stats.postsScraped++;

        // Fetch comments for this post (limit to avoid long runs)
        if (allPosts.length <= 100) {
          try {
            const comments = await reddit.fetchComments(subreddit.name, post.id, 2, 50);
            
            for (const comment of comments) {
              await sql`
                INSERT INTO reddit_comments (
                  run_id, subreddit_id, post_uuid, reddit_comment_id,
                  reddit_post_id, parent_reddit_comment_id, created_utc,
                  author, body, score, raw
                )
                VALUES (
                  ${runId}, ${subreddit.id}, ${postUuid}, ${comment.id},
                  ${post.id}, ${comment.parent_id}, to_timestamp(${comment.created_utc}),
                  ${comment.author}, ${comment.body}, ${comment.score}, 
                  ${JSON.stringify(comment)}::jsonb
                )
                ON CONFLICT (reddit_comment_id) DO NOTHING
              `;
              stats.commentsScraped++;
            }

            // Small delay between comment fetches
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Error fetching comments for post ${post.id}:`, error);
          }
        }
      }

      afterCursor = after || undefined;
      
      if (!after) {
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

      // Small delay between page fetches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // AI Processing: Extract problems
    const allProblems: Array<{ statement: string; sourceType: string; sourceUuid: string }> = [];

    // Extract from posts (sample)
    for (const post of allPosts.slice(0, 50)) {
      const text = `${post.title}\n\n${post.selftext}`.trim();
      if (text.length > 50) {
        const problems = await ai.extractProblems(text, `post in r/${subreddit.name}`);
        for (const problem of problems) {
          allProblems.push({
            statement: problem,
            sourceType: 'post',
            sourceUuid: post.uuid,
          });
        }
      }
    }

    // Extract from comments (sample)
    const comments = await sql`
      SELECT id, body
      FROM reddit_comments
      WHERE run_id = ${runId}
      ORDER BY score DESC
      LIMIT 50
    `;

    for (const comment of comments) {
      if (comment.body && comment.body.length > 50) {
        const problems = await ai.extractProblems(comment.body, `comment in r/${subreddit.name}`);
        for (const problem of problems) {
          allProblems.push({
            statement: problem,
            sourceType: 'comment',
            sourceUuid: comment.id,
          });
        }
      }
    }

    // Store problem statements
    for (const problem of allProblems) {
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
    }

    // Cluster problems
    if (allProblems.length > 0) {
      const problemStatements = allProblems.map(p => p.statement);
      const clusters = await ai.clusterProblems(problemStatements);

      for (const cluster of clusters) {
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
      }
    }

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

