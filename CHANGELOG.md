# Changelog

## 2026-06-16: Convert to free static site

### Summary
Eliminated the paid backend. The app was a full-stack FastAPI + PostgreSQL +
APScheduler service (~$5/mo on Railway); it is now a static site on GitHub Pages
that costs $0. Data is pre-built into `public/links.json` and search runs in the
browser.

### Changes Made
- **Added `scripts/build_data.py`** — builds `public/links.json` with no database.
  Imports the pure `scraper.py` / `rss_parser.py` (copied into `scripts/`).
  Incremental RSS update by default; `--full` does an HTML-scrape backfill.
- **Frontend (`src/App.js`)** — now fetches `/links.json` once on mount and does
  case-insensitive substring search on link titles + "load more" pagination
  entirely client-side. Removed all `/api/...`, `API_URL`, `REACT_APP_API_URL`.
- **Removed the server** — deleted `backend/`, `railway.json`, `migrate_to_postgres.py`,
  and `.env.example` (backend-only vars).
- **GitHub Pages config** — added `homepage` to `package.json`, `public/CNAME`
  (`mr.iankahn.net`), and `.github/workflows/update-and-deploy.yml` (daily scrape →
  commit JSON → build → deploy).
- Rewrote `README.md` and `DEPLOYMENT.md` for the static architecture.

## 2026-01-03: Full Year Scraping Update

### Summary
Enhanced the scraper to support scraping a full year of "Assorted Links" posts from Marginal Revolution.

### Changes Made

**1. Increased max pages limit**
- File: `backend/app/routers/links.py:70`
- Changed: `pages: int = Query(3, ge=1, le=20)` → `pages: int = Query(3, ge=1, le=50)`
- Reason: 20 pages only covered ~280 days. Need ~26-30 pages for a full year.

**2. Added rate limiting delay**
- File: `backend/app/scraper.py`
- Added `import asyncio` at top
- Added `await asyncio.sleep(0.5)` after each post scrape
- Reason: Be polite to the Marginal Revolution server, avoid rate limiting/blocking

### Test Results
Ran scrape with 30 pages:
- **420 posts scraped** (covers full year of daily posts)
- **2,953 links extracted**
- **Runtime: ~12 minutes**

### Usage
```bash
# Scrape a full year
curl -X POST "http://localhost:8000/api/links/scrape?pages=30"

# Scrape default (3 pages, ~42 days)
curl -X POST "http://localhost:8000/api/links/scrape"
```

### Notes
- The scraper already used the efficient search URL approach (`marginalrevolution.com/?s=assorted+links`)
- Each search results page shows ~14 posts
- Posts are returned newest-first
- Duplicate posts are automatically skipped (checks by URL)
