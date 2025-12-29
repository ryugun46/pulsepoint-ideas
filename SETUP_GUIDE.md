# Reddit Scraper - Setup Guide (Public JSON API)

## ✅ No Reddit App Required!

The scraper now uses Reddit's **public JSON endpoints** — no OAuth app registration needed. This means:
- ✅ No Reddit app creation required
- ✅ No client ID or secret needed
- ✅ Works immediately without API approval

## Required Environment Variables

You only need **3 environment variables** for Cloudflare Pages:

### 1. Database (Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_h3Epe0txwVZz@ep-purple-brook-aeet6th9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```
*(Already connected to your Neon production database)*

### 2. AI Provider (OpenRouter)
```
OPENROUTER_API_KEY=your_openrouter_api_key
```
Get this from: https://openrouter.ai/keys

Optional:
```
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
*(Defaults to Claude 3.5 Sonnet if not specified)*

### 3. Reddit User Agent
```
REDDIT_USER_AGENT=PulsePoint/1.0
```
*(Can be any descriptive string)*

---

## Step-by-Step Setup

### Step 1: Get OpenRouter API Key (5 minutes)

1. Go to https://openrouter.ai/
2. Sign up or log in
3. Go to Keys: https://openrouter.ai/keys
4. Click "Create Key"
   - Name: `PulsePoint Ideas`
5. Copy the API key (starts with `sk-or-v1-...`)
6. Add credits to your account:
   - Go to https://openrouter.ai/activity
   - Add $5–10 (pay-as-you-go)

### Step 2: Add Environment Variables to Cloudflare Pages (5 minutes)

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Open your Pages project
3. Go to **Settings → Environment variables**
4. Add these 3 variables for **Production** (and Preview):

**Variable 1:** `DATABASE_URL`
```
postgresql://neondb_owner:npg_h3Epe0txwVZz@ep-purple-brook-aeet6th9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**Variable 2:** `OPENROUTER_API_KEY`
```
[your OpenRouter API key from Step 1]
```

**Variable 3:** `REDDIT_USER_AGENT`
```
PulsePoint/1.0
```

5. Click "Save" after adding each variable

### Step 3: Deploy Your Code (5 minutes)

**Option A: Auto-deploy** (if connected to GitHub)
```bash
git add .
git commit -m "Switch to Reddit public JSON API"
git push
```

**Option B: Manual deploy**
```bash
npm run build
```
Then upload `dist` folder in Cloudflare Pages → Deployments

### Step 4: Test the Scraper (5 minutes)

1. Open your deployed site (e.g., `https://your-project.pages.dev`)
2. Go to the **Subreddits** page
3. Add a test subreddit:
   - Type: `microsaas` (or any small subreddit)
   - Click "Add"
4. Run a scrape:
   - Select "Last 24h" from dropdown
   - Click "Run Scrape"
   - You should see a success toast
5. Check **Analyses** page:
   - You should see a new entry with status "running"
   - Wait ~30-60 seconds
   - Refresh — status should be "completed"
6. Click the entry to view:
   - **Clusters** tab: recurring problems found
   - **Ideas** tab: AI-generated micro-SaaS ideas

---

## How It Works (Public JSON API)

### What Changed
- **Before**: Used Reddit OAuth (required app registration)
- **Now**: Uses public JSON endpoints (no registration needed)

### Reddit Public Endpoints Used
- Posts: `https://www.reddit.com/r/{subreddit}/new.json`
- Comments: `https://www.reddit.com/r/{subreddit}/comments/{postId}.json`

### Built-in Safeguards
- ✅ **Rate limiting**: 1 request/second baseline
- ✅ **Exponential backoff**: Automatically slows down on errors
- ✅ **ETag caching**: Avoids refetching unchanged data
- ✅ **Retry logic**: 3 attempts with smart backoff
- ✅ **Checkpointing**: Resumes from last position

### Performance
- **24h scrape**: 30-90 seconds (10-50 posts)
- **7d scrape**: 1-4 minutes (50-200 posts)
- **30d scrape**: 3-10 minutes (200-500 posts)

*Times may be slightly longer than OAuth due to public API rate limits*

---

## Troubleshooting

### "Database connection failed"
→ Verify `DATABASE_URL` includes `?sslmode=require`
→ Use the **pooled connection string** from Neon

### "OpenRouter API error"
→ Check API key is valid
→ Ensure account has credits ($5-10 minimum)
→ Verify key starts with `sk-or-v1-`

### "Rate limited" or slow scrapes
→ Normal with public API (1 req/sec limit)
→ Use 24h window for faster tests
→ The scraper automatically handles rate limits

### Scrape stuck in "running"
→ Check Cloudflare Functions logs for errors
→ May need to increase function timeout (default 30s)

---

## Cost Estimates

### OpenRouter (AI)
- ~$0.01-0.05 per scrape
- Claude 3.5 Sonnet: ~$3 per million tokens

### Neon (Database)
- Free tier: 0.5GB storage
- Plenty for thousands of analyses

### Cloudflare Pages
- Free tier: unlimited requests
- Functions: 100k requests/day free

**Total: ~$5-10/month for regular usage**

---

## Local Development

Create `.dev.vars` file:
```bash
DATABASE_URL=your_neon_connection_string
OPENROUTER_API_KEY=your_openrouter_key
REDDIT_USER_AGENT=PulsePoint/1.0
```

Run:
```bash
npm run dev  # Frontend on :5173
npx wrangler pages dev dist --port 8788  # Backend on :8788
```

---

## Summary

✅ **No Reddit app needed**
✅ **Only 3 environment variables**
✅ **Works immediately after setup**
✅ **Built-in rate limiting & retries**
✅ **Same features as OAuth version**

The public JSON API is more accessible and easier to set up. While it has stricter rate limits than OAuth, the built-in throttling ensures reliable operation.

Ready to deploy? Add your OpenRouter key to Cloudflare Pages and you're good to go!

