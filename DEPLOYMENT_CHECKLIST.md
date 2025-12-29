# Deployment Checklist - Public JSON API

## ✅ What Changed

Switched from Reddit OAuth to **public JSON API** — no Reddit app registration required!

### Removed Requirements
- ❌ Reddit app creation
- ❌ REDDIT_CLIENT_ID
- ❌ REDDIT_CLIENT_SECRET

### New Requirements
- ✅ Only 3 environment variables
- ✅ No Reddit account issues
- ✅ Works immediately

---

## Pre-Deployment Checklist

### 1. Get OpenRouter API Key
- [ ] Sign up at https://openrouter.ai/
- [ ] Create API key
- [ ] Add $5-10 credits
- [ ] Copy API key (starts with `sk-or-v1-`)

### 2. Add Environment Variables to Cloudflare Pages
- [ ] `DATABASE_URL` (already provided below)
- [ ] `OPENROUTER_API_KEY` (from step 1)
- [ ] `REDDIT_USER_AGENT` (use: `PulsePoint/1.0`)

**Your DATABASE_URL:**
```
postgresql://neondb_owner:npg_h3Epe0txwVZz@ep-purple-brook-aeet6th9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### 3. Deploy Code
- [ ] Commit changes: `git add . && git commit -m "Switch to public JSON API"`
- [ ] Push to GitHub: `git push`
- [ ] Or manual build: `npm run build` + upload `dist`

---

## Post-Deployment Testing

### 1. Health Check
- [ ] Visit: `https://your-project.pages.dev/api/health`
- [ ] Should return: `{"status":"ok","database":"connected"}`

### 2. Test Scraper
- [ ] Go to your site → Subreddits page
- [ ] Add subreddit: `microsaas` (small, fast test)
- [ ] Select: "Last 24h"
- [ ] Click: "Run Scrape"
- [ ] Should see: Success toast

### 3. Check Results
- [ ] Go to Analyses page
- [ ] Should see: New entry with "running" status
- [ ] Wait: 30-90 seconds
- [ ] Refresh: Status should be "completed"
- [ ] Click entry: View clusters and ideas

### 4. Verify Data
- [ ] Clusters tab shows recurring problems
- [ ] Ideas tab shows AI-generated concepts
- [ ] Stats show posts/comments/problems/clusters/ideas counts

---

## Expected Performance

### Public JSON API (No OAuth)
- **24h scrape**: 30-90 seconds (10-50 posts)
- **7d scrape**: 1-4 minutes (50-200 posts)
- **30d scrape**: 3-10 minutes (200-500 posts)

*Slightly slower than OAuth due to public API rate limits (1 req/sec baseline)*

### Built-in Safeguards
- ✅ Rate limiting (1 req/sec)
- ✅ Exponential backoff
- ✅ ETag caching
- ✅ Retry logic (3 attempts)
- ✅ Checkpointing

---

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Verify DATABASE_URL includes `?sslmode=require`
- Use pooled connection string from Neon

**"OpenRouter API error"**
- Check API key is correct
- Ensure account has credits
- Verify key format: `sk-or-v1-...`

**Scrape takes longer than expected**
- Normal with public API (stricter rate limits)
- Use 24h window for faster tests
- Automatic throttling prevents blocks

**"Rate limited" messages**
- Expected behavior (1 req/sec limit)
- Scraper automatically handles this
- No action needed

---

## Cost Breakdown

### OpenRouter (AI Analysis)
- Per scrape: $0.01-0.05
- Model: Claude 3.5 Sonnet (~$3 per million tokens)

### Neon (Database)
- Free tier: 0.5GB storage
- Sufficient for thousands of analyses

### Cloudflare Pages
- Free tier: unlimited requests
- Functions: 100k requests/day free

**Estimated monthly cost: $5-10** (for regular usage)

---

## Files Modified

### Backend
- ✅ `functions/lib/reddit.ts` - Public JSON client
- ✅ `functions/api/scrape/run.ts` - Removed OAuth vars

### Documentation
- ✅ `SETUP_GUIDE.md` - Complete setup guide
- ✅ `ENV_SETUP.md` - Environment variables
- ✅ `.dev.vars.example` - Local dev template
- ✅ `DEPLOYMENT_CHECKLIST.md` - This file

### Frontend
- ✅ No changes needed (already implemented)

---

## Quick Start Commands

### Deploy
```bash
git add .
git commit -m "Switch to Reddit public JSON API"
git push
```

### Local Development
```bash
# Create .dev.vars with your credentials
cp .dev.vars.example .dev.vars

# Edit .dev.vars with real values
# Then run:
npm run dev
```

---

## Success Criteria

✅ Health check returns OK
✅ Can add subreddits
✅ Can trigger scrapes
✅ Scrapes complete successfully
✅ Can view clusters and ideas
✅ No OAuth-related errors

---

## Next Steps After Deployment

1. **Test with small subreddit** (e.g., `microsaas`)
2. **Verify 24h scrape completes** in ~30-90 seconds
3. **Check clusters and ideas** are generated
4. **Try different subreddits** and time windows
5. **Monitor Cloudflare Functions logs** for any issues

---

## Support

If you encounter issues:
1. Check Cloudflare Functions logs
2. Verify all 3 environment variables are set
3. Test health endpoint first
4. Start with 24h window on small subreddits

See `SETUP_GUIDE.md` for detailed troubleshooting.

---

**Status**: Ready to deploy! ✅

All code changes complete. Just add your OpenRouter API key and deploy.

