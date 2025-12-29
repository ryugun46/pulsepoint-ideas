# Environment Variables (Public JSON API)

## Required Variables

Add these to Cloudflare Pages → Settings → Environment variables

### 1. Neon Database
```bash
DATABASE_URL=postgresql://neondb_owner:npg_h3Epe0txwVZz@ep-purple-brook-aeet6th9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**What it is:** Your Neon Postgres connection string (pooled connection)
**Already set:** Yes, this is your production database

### 2. OpenRouter API
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

**What it is:** API key for OpenRouter (AI provider)
**Get it from:** https://openrouter.ai/keys
**Cost:** ~$0.01-0.05 per scrape

Optional:
```bash
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
**Default:** Claude 3.5 Sonnet (if not specified)

### 3. Reddit User Agent
```bash
REDDIT_USER_AGENT=PulsePoint/1.0
```

**What it is:** User agent string for Reddit API requests
**Can be:** Any descriptive string (e.g., "YourApp/1.0")

---

## Removed Variables (No Longer Needed)

~~REDDIT_CLIENT_ID~~ - Not needed with public JSON API
~~REDDIT_CLIENT_SECRET~~ - Not needed with public JSON API

---

## How to Add Variables

### In Cloudflare Pages Dashboard

1. Go to https://dash.cloudflare.com/
2. Open your Pages project
3. Settings → Environment variables
4. Add each variable:
   - Click "Add variable"
   - Name: (variable name)
   - Value: (variable value)
   - Environment: Production (and Preview if you want)
   - Click "Save"

### For Local Development

Create `.dev.vars` file:
```bash
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-v1-...
REDDIT_USER_AGENT=PulsePoint/1.0
```

**Note:** `.dev.vars` is gitignored — don't commit it!

---

## Getting OpenRouter API Key

1. Sign up at https://openrouter.ai/
2. Go to Keys: https://openrouter.ai/keys
3. Click "Create Key"
4. Copy the key (starts with `sk-or-v1-`)
5. Add $5-10 credits to your account

---

## Quick Setup Checklist

- [ ] Add `DATABASE_URL` to Cloudflare Pages (already available above)
- [ ] Get OpenRouter API key
- [ ] Add credits to OpenRouter account
- [ ] Add `OPENROUTER_API_KEY` to Cloudflare Pages
- [ ] Add `REDDIT_USER_AGENT` to Cloudflare Pages
- [ ] Deploy your code
- [ ] Test with a scrape

That's it! No Reddit app registration required.
