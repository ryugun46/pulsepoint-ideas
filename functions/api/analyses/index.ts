// GET /api/analyses - List all analysis runs

import type { AppContext } from '../../_middleware';

export const onRequestGet: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = (context as any).sql;
    
    const analyses = await sql`
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
      ORDER BY sr.started_at DESC
      LIMIT 50
    `;
    
    return new Response(JSON.stringify(analyses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch analyses',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

