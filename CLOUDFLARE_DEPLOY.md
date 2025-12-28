# Cloudflare Pages Deployment – Quick Start

This project is ready for one-click deploy to Cloudflare Pages.

## Cloudflare Pages Build Settings (if prompted)
| Setting            | Value              |
|--------------------|--------------------|
| **Build command**  | `npm run build`    |
| **Output directory** | `dist`           |
| **Install command** | *(leave blank)*   |

> Leave "Install command" **blank** – Cloudflare will auto-run `npm install`. The `.npmrc` in this repo makes `npm install` ignore stale lock-file entries so the build never fails.

## Important: Delete Bun lockfiles before first deploy

If your GitHub repo still contains `bun.lock` or `bun.lockb`, Cloudflare may misdetect the package manager and fail.

**Delete these files from GitHub manually** (they cannot be removed from within Lovable):
- `bun.lock`
- `bun.lockb`

Commit the deletion, then redeploy.

## Files added for deployment

| File             | Purpose                                                 |
|------------------|---------------------------------------------------------|
| `wrangler.toml`  | Optional Cloudflare Pages beta config                   |
| `.npmrc`         | Forces `npm install` (skips strict lock-file check)     |
| `.node-version`  | Pins Node.js 20 LTS                                     |
| `public/_redirects` | SPA fallback – all routes → `index.html`             |

After the first successful deploy you can keep iterating without further config.
