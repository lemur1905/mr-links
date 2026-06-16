# MR Links

A searchable, scrollable archive of [Marginal Revolution](https://marginalrevolution.com)'s
daily "Assorted Links" posts. Live at **[mr.iankahn.net](https://mr.iankahn.net)**.

This is a **fully static site** — no server, no database, $0 hosting. A scheduled
GitHub Action scrapes MR once a day, writes the data to `public/links.json`, and the
React app loads that file and does search/pagination entirely in the browser.

## How it works

```
scripts/build_data.py   (pure scraper + RSS parser, no database)
        │  scrapes MR, merges into public/links.json (dedupe by post_url)
        ▼
public/links.json       (committed; the persistent store + what ships)
        │
React app  ──fetch('/links.json') once──▶  client-side search + pagination
        │
GitHub Actions (daily cron): build_data.py → commit links.json → npm build → deploy Pages
```

Search is a case-insensitive substring match on link titles, results grouped by day
(newest first), showing only matching links within each day, with "load more" pagination.

## Local development

```bash
# Frontend (no backend needed)
npm ci
npm start            # http://localhost:3000, reads public/links.json
npm run build        # production build into build/ (includes links.json)

# Data build (Python 3.11+)
pip install -r scripts/requirements.txt
python scripts/build_data.py            # incremental update via RSS (what the cron runs)
python scripts/build_data.py --full     # full backfill via HTML scrape
python scripts/build_data.py --full --max-pages 20
```

## Project layout

- `src/` — the React app (Create React App).
- `public/links.json` — the data store; committed and served as-is.
- `public/CNAME` — custom domain (`mr.iankahn.net`) for GitHub Pages.
- `scripts/` — `build_data.py` plus the pure `scraper.py` / `rss_parser.py` it imports.
- `.github/workflows/update-and-deploy.yml` — daily scrape + build + deploy.

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and DNS setup.
