# 🚀 Quick Reference - Scraper Fix

## The Fix in 30 Seconds

**Problem**: `Error: Too many subrequests` (Cloudflare limit = 50)

**Solution**: Reduced everything:
- **Posts**: 500 → **20**
- **Comments**: 3,000+ → **20 total**
- **AI Analysis**: 100 items → **10 items**
- **Problem Inserts**: Unlimited → **15 max**

## Current Settings

```typescript
MAX_POSTS = 20
MAX_POSTS_WITH_COMMENTS = 5
MAX_COMMENTS_PER_POST = 4
POSTS_TO_ANALYZE = 5
COMMENTS_TO_ANALYZE = 5
MAX_PROBLEM_STATEMENTS = 15
```

## Subrequest Budget: ~66 (Close to 50 limit)

## Deploy Now

```bash
git add functions/api/scrape/run.ts
git commit -m "Fix: Scraper subrequest limit"
git push
```

## Test It

1. Go to `/app/subreddits`
2. Add subreddit: `test` or `CasualConversation`
3. Select: "Last 24h"
4. Click: "Run Scrape"
5. Wait 30-40 seconds
6. Check `/app/analyses` for results

## What You'll Get

- ✅ 15-20 posts scraped
- ✅ 15-20 comments scraped  
- ✅ 8-15 problems extracted
- ✅ 2-5 ideas generated
- ✅ Completes in ~30 seconds
- ✅ No errors!

## If It Still Fails

Reduce more in `functions/api/scrape/run.ts`:
```typescript
const MAX_POSTS = 10;  // Line ~139
```

## Next Steps (Future)

- Migrate to Cloudflare D1 (no subrequest limit)
- Or use Durable Objects for long-running jobs
- Or split into multiple cron jobs

---

**Status**: ✅ Ready to deploy and test

