# Environment Variables

This file should be added to Cloudflare Pages settings (not committed to git).

## Required Variables

### Neon Database
- `DATABASE_URL`: Your Neon Postgres connection string (use the pooled/serverless connection string)

### Reddit API
- `REDDIT_CLIENT_ID`: Reddit API client ID (get from https://www.reddit.com/prefs/apps)
- `REDDIT_CLIENT_SECRET`: Reddit API client secret
- `REDDIT_USER_AGENT`: User agent string (e.g., "PulsePoint/1.0")

### OpenRouter API
- `OPENROUTER_API_KEY`: Your OpenRouter API key (get from https://openrouter.ai/)
- `OPENROUTER_MODEL`: Optional, defaults to "anthropic/claude-3.5-sonnet"

## Setup Instructions

1. **Neon Database**: Already connected via MCP
   - Get your connection string from Neon console
   - Use the "Pooled connection" string for Cloudflare Workers compatibility

2. **Reddit API**:
   - Go to https://www.reddit.com/prefs/apps
   - Create a new "script" app
   - Copy the client ID and secret

3. **OpenRouter API**:
   - Sign up at https://openrouter.ai/
   - Create an API key
   - Add credits to your account

4. **Add to Cloudflare Pages**:
   - Go to your Cloudflare Pages project
   - Settings → Environment variables
   - Add all variables for Production and Preview environments

