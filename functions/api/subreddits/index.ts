// GET /api/subreddits - List all tracked subreddits
// POST /api/subreddits - Add a new tracked subreddit

import { neon } from '@neondatabase/serverless';
import type { AppContext } from '../../_middleware';

export const onRequestGet: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = neon(context.env.DATABASE_URL);
    
    const subreddits = await sql`
      SELECT 
        id,
        name,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM tracked_subreddits
      ORDER BY created_at DESC
    `;
    
    return new Response(JSON.stringify(subreddits), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch subreddits',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = neon(context.env.DATABASE_URL);
    const body = await context.request.json() as { name: string; isActive?: boolean };
    
    if (!body.name || !body.name.trim()) {
      return new Response(JSON.stringify({
        error: 'Subreddit name is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Remove r/ prefix if present
    const cleanName = body.name.replace(/^r\//, '').trim();
    
    const result = await sql`
      INSERT INTO tracked_subreddits (name, is_active)
      VALUES (${cleanName}, ${body.isActive ?? true})
      ON CONFLICT (name) 
      DO UPDATE SET 
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING 
        id,
        name,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding subreddit:', error);
    return new Response(JSON.stringify({
      error: 'Failed to add subreddit',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

