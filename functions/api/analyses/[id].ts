// GET /api/analyses/:id - Get detailed analysis results

import type { AppContext } from '../../_middleware';

export const onRequestGet: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = (context as any).sql;
    const { id } = context.params;
    
    if (!id) {
      return new Response(JSON.stringify({
        error: 'Analysis ID is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get run info
    const runs = await sql`
      SELECT 
        sr.id,
        sr.status,
        sr.window_days as "windowDays",
        sr.started_at as "startedAt",
        sr.finished_at as "finishedAt",
        sr.error_message as "errorMessage",
        sr.stats,
        ts.name as "subredditName",
        ts.id as "subredditId"
      FROM scrape_runs sr
      JOIN tracked_subreddits ts ON sr.subreddit_id = ts.id
      WHERE sr.id = ${id}
    `;
    
    if (runs.length === 0) {
      return new Response(JSON.stringify({
        error: 'Analysis not found',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const run = runs[0];
    
    // Get clusters
    const clusters = await sql`
      SELECT 
        id,
        title,
        summary,
        frequency,
        severity,
        evidence,
        created_at as "createdAt"
      FROM problem_clusters
      WHERE run_id = ${id}
      ORDER BY frequency DESC
    `;
    
    // Get ideas
    const ideas = await sql`
      SELECT 
        id,
        cluster_id as "clusterId",
        title,
        idea,
        score,
        created_at as "createdAt"
      FROM generated_ideas
      WHERE run_id = ${id}
      ORDER BY score DESC NULLS LAST
    `;
    
    return new Response(JSON.stringify({
      ...run,
      clusters,
      ideas,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching analysis detail:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch analysis detail',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

