# Changelog

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
