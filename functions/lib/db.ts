// functions/lib/db.ts
import { neon } from '@neondatabase/serverless';

export function getDb(connectionString: string) {
  const sql = neon(connectionString);
  return sql;
}

export async function testConnection(connectionString: string) {
  try {
    const sql = getDb(connectionString);
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
