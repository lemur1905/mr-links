# MR Links

A searchable, scrollable archive of [Marginal Revolution](https://marginalrevolution.com)'s
daily "Assorted Links" posts. Live at **[mr.iankahn.net](https://mr.iankahn.net)**.

The site is fully static. There is no server and no database, so hosting costs $0.
A scheduled GitHub Action scrapes MR once a day and writes the data to
`public/links.json`; the React app loads that file and does search and pagination
entirely in the browser.

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

Search is a case-insensitive substring match on link titles. Results are grouped by
day, newest first, and each day shows only its matching links, with "load more"
pagination.

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

- `src/` is the React app (Create React App).
- `public/links.json` is the data store, committed and served as-is.
- `public/CNAME` sets the custom domain (`mr.iankahn.net`) for GitHub Pages.
- `scripts/` holds `build_data.py` plus the pure `scraper.py` and `rss_parser.py` it imports.
- `.github/workflows/update-and-deploy.yml` runs the daily scrape, then builds and deploys.

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and DNS setup.
