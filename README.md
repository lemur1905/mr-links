# MR Links

A searchable archive of [Marginal Revolution](https://marginalrevolution.com)'s
daily "Assorted Links" posts. Live at **[mr.iankahn.net](https://mr.iankahn.net)**.

I read MR daily, and I kept wanting to dig a link back up. Sometimes it was one
I half-remembered from a few weeks ago; sometimes I wanted to see everything
Tyler has linked on a topic over the years. MR can filter posts down to the
assorted-links series, but it has no good way to search inside them. This site
is that search box.

The site is fully static, with no server and no database. A scheduled GitHub
Action polls MR through its usual afternoon posting window and writes any new
links to `public/links.json`; the React app loads that file and does search and
pagination entirely in the browser.

## How it works

```
scripts/build_data.py   (pure scraper + RSS parser, no database)
        │  scrapes MR, merges into public/links.json (dedupe by post_url)
        ▼
public/links.json       (committed; the persistent store + what ships)
        │
React app  ──fetch('/links.json') once──▶  client-side search + pagination
        │
GitHub Actions (hourly cron, 16-23 UTC): build_data.py → commit links.json → npm build → deploy Pages
```

Search matches each link's title plus the paragraph text scraped from around it
in the original post, so a half-remembered phrase usually finds the link even
when the phrase never appears in the title. Matching is a case-insensitive
substring. Results are grouped by day, newest first, and each day shows only its
matching links, with "load more" pagination.

## Local development

```bash
# Frontend (no backend needed)
npm ci
npm start            # http://localhost:3000, reads public/links.json
npm run build        # production build into build/ (includes links.json)

# Data build (Python 3.11+)
pip install -r scripts/requirements.txt
python scripts/build_data.py            # incremental update via RSS (what the scheduled run does)
python scripts/build_data.py --full     # full backfill via HTML scrape
python scripts/build_data.py --full --max-pages 20
```

## Project layout

- `src/` is the React app (Create React App).
- `public/links.json` is the data store, committed and served as-is.
- `public/CNAME` sets the custom domain (`mr.iankahn.net`) for GitHub Pages.
- `scripts/` holds `build_data.py` plus the pure `scraper.py` and `rss_parser.py` it imports.
- `.github/workflows/update-and-deploy.yml` runs the scheduled scrape, then builds and deploys when the data changed.

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and DNS setup.
