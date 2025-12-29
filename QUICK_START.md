# Quick Start Guide - Reddit Scraper

## 🎉 Implementation Complete!

The Reddit scraper is fully built and ready to use. Here's what you need to do next:

## 1. Set Up API Credentials

### Reddit API (5 minutes)
1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..."
3. Select type: **script**
4. Fill in any name/description
5. Redirect URI: `http://localhost`
6. Copy the **client ID** (under app name) and **secret**

### OpenRouter API (3 minutes)
1. Sign up at https://openrouter.ai/
2. Go to Keys → Create new key
3. Add $5-10 credits (pay-as-you-go)
4. Copy your API key

### Neon Database (Already Done ✓)
Your connection string is already available in Neon console.
Use the **pooled connection** string.

## 2. Configure Cloudflare Pages

Go to your Cloudflare Pages project → Settings → Environment variables

Add these for **Production** and **Preview**:

```
DATABASE_URL = postgresql://[from Neon console]
REDDIT_CLIENT_ID = [from step 1]
REDDIT_CLIENT_SECRET = [from step 1]
REDDIT_USER_AGENT = PulsePoint/1.0
OPENROUTER_API_KEY = [from step 2]
```

## 3. Deploy

Your code is ready! Just push to GitHub and Cloudflare Pages will auto-deploy.

Or deploy manually:
```bash
npm run build
# Deploy via Cloudflare dashboard
```

## 4. Test It Out

1. Go to your deployed site → **Subreddits** page
2. Add a subreddit (e.g., "microsaas" or "saas")
3. Select time window (start with 24h for quick test)
4. Click "Run Scrape"
5. Go to **Analyses** page to see progress
6. Click on completed run to see clusters and ideas!

## What Was Built

### ✅ Database Schema (Neon)
- 8 tables for tracking scrapes, posts, comments, clusters, and ideas
- Already applied to your production database

### ✅ Backend API (Cloudflare Pages Functions)
Located in `/functions/` directory:
- Health check
- Subreddit management (add/list/delete)
- Scrape runner (manual trigger)
- Analysis results API

### ✅ Reddit Scraper
- Official Reddit API (OAuth)
- Rate limiting + retries
- Checkpointing for efficiency
- Configurable time windows (24h/7d/30d)
- Comment depth control

### ✅ AI Pipeline (OpenRouter)
- Extracts problems from posts/comments
- Clusters recurring issues
- Generates detailed micro-SaaS ideas

### ✅ Frontend (React)
- Updated Subreddits page (manage & trigger scrapes)
- Updated Analyses list (view all runs)
- Updated Analysis detail (explore results)

## Files Created

### Backend
- `functions/_middleware.ts` - CORS + DB client setup
- `functions/api/health.ts` - Health check
- `functions/api/subreddits/index.ts` - List/add subreddits
- `functions/api/subreddits/[id].ts` - Delete subreddit
- `functions/api/analyses/index.ts` - List analyses
- `functions/api/analyses/[id].ts` - Analysis detail
- `functions/api/scrape/run.ts` - Scrape runner
- `functions/lib/reddit.ts` - Reddit API client
- `functions/lib/openrouter.ts` - OpenRouter AI client

### Frontend
- `src/lib/api.ts` - Type-safe API client
- `src/pages/Subreddits.tsx` - Updated with real API
- `src/pages/AnalysesList.tsx` - Updated with real API
- `src/pages/AnalysisDetail.tsx` - Updated with real API

### Documentation
- `SCRAPER_IMPLEMENTATION.md` - Full technical guide
- `ENV_SETUP.md` - Environment variables guide
- `.dev.vars.example` - Example env file for local dev
- `QUICK_START.md` - This file

## Architecture

```
User → React Frontend → Cloudflare Pages Functions API
                              ↓
                    ┌─────────┼─────────┐
                    ↓         ↓         ↓
                  Neon     Reddit   OpenRouter
                   DB       API        AI
```

## How It Works

1. User adds subreddit to track (stored in Neon)
2. User triggers scrape with time window (24h/7d/30d)
3. Backend fetches posts & comments from Reddit API
4. AI extracts problems from text
5. AI clusters similar problems
6. AI generates micro-SaaS ideas for each cluster
7. Everything stored in Neon for viewing

## Expected Performance

- **24h scrape**: ~30-60 seconds
- **7d scrape**: ~1-3 minutes  
- **30d scrape**: ~3-8 minutes

Times vary by subreddit size and activity.

## Cost Estimates

### OpenRouter (AI)
- ~$0.01-0.05 per scrape (depending on volume)
- Claude 3.5 Sonnet pricing: ~$3 per million tokens

### Neon (Database)
- Free tier: 0.5GB storage (plenty for thousands of analyses)
- Compute: serverless, only charged when active

### Cloudflare Pages
- Free tier: 500 builds/month, unlimited requests
- Functions: 100k requests/day free

**Total cost for light usage**: ~$5-10/month

## Troubleshooting

### "Database connection failed"
→ Check DATABASE_URL uses **pooled** connection string from Neon
→ Ensure it ends with `?sslmode=require`

### "Reddit API authentication failed"
→ Verify REDDIT_CLIENT_ID and SECRET are correct
→ Ensure app type is "script" (not "web app")

### "OpenRouter API error"
→ Check API key is valid
→ Ensure account has credits

### "Scrape stuck in 'running' status"
→ Check Cloudflare Functions logs for errors
→ May need to increase function timeout (default 30s)

## Local Development

1. Create `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
# Edit with your credentials
```

2. Run frontend:
```bash
npm run dev
```

3. Run backend (in separate terminal):
```bash
npm run build  # Build frontend first
npx wrangler pages dev dist --port 8788
```

Frontend will be on http://localhost:5173
Backend API on http://localhost:8788

## Need Help?

Check `SCRAPER_IMPLEMENTATION.md` for detailed technical documentation.

---

**Status**: ✅ Ready for deployment!

Just add your API credentials to Cloudflare Pages and you're good to go.

