// Cloudflare Pages Functions middleware
// Handles CORS and adds database client to context

import { neon } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  REDDIT_USER_AGENT: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL?: string;
}

export interface AppContext {
  env: Env;
  sql: ReturnType<typeof neon>;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Initialize database client
  const sql = neon(context.env.DATABASE_URL);
  
  // Add to context for downstream handlers
  (context as any).sql = sql;

  try {
    const response = await context.next();
    
    // Add CORS to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

