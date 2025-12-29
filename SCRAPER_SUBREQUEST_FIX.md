# Scraper Subrequest Limit Fix

## Problem
The scraper was hitting Cloudflare Pages Functions' **50 subrequest limit** because each individual database INSERT counted as a separate subrequest:
- 20 individual post inserts
- 4 individual comment inserts  
- 13 individual problem statement inserts
- Plus cluster and idea inserts
- **Total: 40+ subrequests** just for inserts alone

This caused `"Error: Too many subrequests"` and the job to fail.

## Solution
**Batched all database inserts** to use single queries instead of loops:

### 1. Posts Insert (20 → 1 subrequest)
```typescript
// OLD: 20 separate INSERT queries
for (const post of postsToInsert) {
  await sql`INSERT INTO reddit_posts (...) VALUES (...)`;
}

// NEW: 1 batch INSERT query
const values = postsToInsert.map(post => sql`(...)`);
await sql`INSERT INTO reddit_posts (...) VALUES ${sql(values)}`;
```

### 2. Comments Insert (4 → 1 subrequest)
```typescript
// OLD: Loop with individual inserts
for (const comment of topComments) {
  await sql`INSERT INTO reddit_comments (...) VALUES (...)`;
}

// NEW: Collect all comments, then batch insert
const allComments = []; // collect from all posts
const values = allComments.map(comment => sql`(...)`);
await sql`INSERT INTO reddit_comments (...) VALUES ${sql(values)}`;
```

### 3. Problem Statements Insert (13 → 1 subrequest)
```typescript
// OLD: Loop with individual inserts
for (const problem of problemsToStore) {
  await sql`INSERT INTO problem_statements (...) VALUES (...)`;
}

// NEW: Batch insert
const values = problemsToStore.map(problem => sql`(...)`);
await sql`INSERT INTO problem_statements (...) VALUES ${sql(values)}`;
```

## Result
Reduced subrequest count from **40+** to approximately **10-15**:
- 1 batch post insert
- 1 batch comment insert
- 1 batch problem insert
- ~3-5 cluster inserts (still individual, but manageable)
- ~3-5 idea inserts
- ~3-5 checkpoint/status updates and queries

This keeps us **well under the 50 subrequest limit** with room to spare.

## Additional Changes
- Removed `context.waitUntil()` (was causing inactivity timeout)
- Made scrape run **synchronously** and return result
- Returns **200 OK** on success, **500** on error
- Includes stats in response

## Testing
Deploy and test with:
```bash
npm run deploy
```

Then trigger a scrape from the UI and verify:
- Status 200 (not 202 or 500)
- Stats show posts, comments, problems, clusters, and ideas
- No "too many subrequests" errors in logs

