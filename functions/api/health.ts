// Health check endpoint to verify DB connectivity

import type { AppContext } from '../_middleware';

export const onRequestGet: PagesFunction<AppContext['env']> = async (context) => {
  try {
    const sql = (context as any).sql;
    
    // Simple query to verify connection
    const result = await sql`SELECT NOW() as timestamp`;
    
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: result[0]?.timestamp,
      database: 'connected',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

