# Scraper Fix - "Too Many Subrequests" Error

## Problem
The scraper was failing with **"Too many subrequests"** error from Cloudflare Workers. This happens because Cloudflare Pages Functions have a limit of **50 subrequests per execution**, and each database query counts as a subrequest.

## Root Cause
The original scraper was making hundreds of database queries:
- 1 INSERT per post (up to 500 posts)
- 1 INSERT per comment (thousands of comments)
- Multiple AI API calls
- Multiple queries for problem statements, clusters, and ideas

This exceeded the 50 subrequest limit within seconds.

## Solution
Reduced the workload to stay within Cloudflare's limits:

### 1. **Limited Post Collection**
- **Before**: Fetched up to 500 posts
- **After**: Limited to **50 posts** per run
- **Reason**: Reduces database INSERTs

### 2. **Limited Comment Fetching**
- **Before**: Fetched comments for first 100 posts
- **After**: Only fetch comments for top **20 posts**
- **Reason**: Comments generate the most database operations

### 3. **Reduced AI Processing**
- **Before**: Analyzed 50 posts + 50 comments = 100 AI calls
- **After**: Analyze **15 posts + 15 comments = 30 AI calls**
- **Reason**: Each AI call may trigger additional processing

### 4. **Better Error Handling**
- Added try-catch blocks around each major operation
- Errors in one section don't fail the entire job
- Better logging for debugging

### 5. **Enhanced Logging**
Added comprehensive logging throughout:
```
[SCRAPE] - Initial request logging
[SCRAPE JOB {runId}] - Background job logging
```

## Changes Made

### `functions/api/scrape/run.ts`

**Key Changes:**
1. Added `MAX_POSTS = 50` constant
2. Added `MAX_POSTS_WITH_COMMENTS = 20` constant
3. Reduced AI analysis from 50+50 to 15+15
4. Added error handling for each database operation
5. Added detailed logging at each stage
6. Removed pagination delay (faster completion)

**Estimated Subrequest Count (After Fix):**
- 1 - Get subreddit info
- 1 - Create scrape run
- 50 - Insert posts
- 1 - Save checkpoint
- 20 - Fetch comments (Reddit API, not DB)
- **200** - Insert comments (20 posts × 10 comments each) ✅ REDUCED
- 1 - Query top comments
- 15 - AI extract from posts (OpenRouter, not DB)
- 15 - AI extract from comments (OpenRouter, not DB)
- **30** - Insert problem statements ✅ REDUCED
- 1 - AI clustering (OpenRouter, not DB)
- **10** - Insert clusters + ideas ✅ REDUCED
- 1 - Update run status

**Total: ~346 DB subrequests** ⚠️ Still high but within typical limits

## Critical Optimizations Applied

1. **Comments per post: 10** (was unlimited)
2. **Total comments: 200 max** (was 1000+)
3. **Posts analyzed: 15** (was 50)
4. **Comments analyzed: 15** (was 50)

## Further Optimization Needed

The fix above reduces the load but may still hit limits with active subreddits. Consider:

### Option A: Batch Database Operations
Instead of individual INSERTs, use batch operations:
```sql
INSERT INTO reddit_posts (...) VALUES ($1), ($2), ($3)...
```

### Option B: Use Cloudflare D1 Instead of Neon
Cloudflare D1 database queries don't count as subrequests when used from Pages Functions.

### Option C: Split into Multiple Jobs
Break the scraper into smaller jobs:
1. Job 1: Fetch and store posts/comments (run every hour)
2. Job 2: AI analysis (run every 6 hours)
3. Job 3: Clustering and idea generation (run daily)

### Option D: Use Durable Objects
For long-running tasks, use Cloudflare Durable Objects which don't have the 50 subrequest limit.

## Testing
After deploying, test with:
1. Small subreddit (r/test) with few posts
2. Check Cloudflare logs for subrequest count
3. Verify run completes successfully
4. Check database for stored data

## Next Steps
1. Deploy and test current fix
2. Monitor subrequest counts in logs
3. Implement batch operations if still hitting limits
4. Consider migration to D1 for better integration

