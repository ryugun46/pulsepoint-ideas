// DELETE /api/subreddits/:id - Delete a tracked subreddit

import type { AppContext } from '../../_middleware';

export const onRequestDelete: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = (context as any).sql;
    const { id } = context.params;
    
    if (!id) {
      return new Response(JSON.stringify({
        error: 'Subreddit ID is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    await sql`
      DELETE FROM tracked_subreddits
      WHERE id = ${id}
    `;
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting subreddit:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete subreddit',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

