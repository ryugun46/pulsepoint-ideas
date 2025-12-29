// functions/api/test-db.ts
/// <reference types="@cloudflare/workers-types" />
import { testConnection } from '../lib/db';

export const onRequest: PagesFunction<{ DATABASE_URL?: string }> = async (context) => {
  // Get DATABASE_URL from environment variables
  const connectionString = context.env.DATABASE_URL;
  
  if (!connectionString) {
    return new Response(
      JSON.stringify({ error: 'DATABASE_URL environment variable not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const result = await testConnection(connectionString);
    
    if (result.success) {
      return new Response(
        JSON.stringify({ 
          message: 'Database connection successful!',
          data: result.data 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
