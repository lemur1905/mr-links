# Deployment: GitHub Pages (free)

This site is a static React app served from GitHub Pages. A scheduled GitHub
Action polls Marginal Revolution for new links, commits the data into the repo,
builds the app, and deploys it. There is no server and no database.

## One-time setup

### 1. Make the repo public
Free GitHub Pages requires a public repo (or GitHub Pro for private). Settings →
General → "Change repository visibility" → Public.

### 2. Enable Pages via GitHub Actions
Settings → Pages → **Source: GitHub Actions**. (The workflow uses the official
`upload-pages-artifact` / `deploy-pages` actions, not a `gh-pages` branch.)

### 3. Custom domain
`public/CNAME` already contains `mr.iankahn.net`, so the custom domain re-applies
on every deploy. In **Cloudflare DNS** for `iankahn.net`, add the record below.

```
CNAME   mr   →   lemur1905.github.io      (DNS only / grey cloud — NOT proxied)
```

GitHub needs the un-proxied record to issue the HTTPS certificate. Once Pages
shows the domain as verified and green, enable **Enforce HTTPS** in Settings → Pages.

## The workflow

`.github/workflows/update-and-deploy.yml` runs on an hourly cron across MR's
usual posting window (`0 16-23 * * *` UTC), on push to `main`, and on manual
dispatch. Each run:

1. Checks out the repo.
2. Installs `scripts/requirements.txt` and runs `python scripts/build_data.py`
   (incremental RSS scrape).
3. Commits `public/links.json` back if it changed (the store is self-healing and
   incremental). The commit message includes `[skip ci]` so it doesn't re-trigger.
4. Decides whether to deploy. Pushes and manual runs always deploy; a scheduled
   run stops here unless the data changed, so the extra polls are cheap no-ops.
5. `npm ci && npm run build`.
6. Deploys `build/` to Pages.

To trigger manually: Actions → "Update data and deploy" → "Run workflow".

## Backfilling history

The scheduled runs only fetch recent posts (via RSS). To rebuild the full archive, run a
full scrape locally and commit the result.

```bash
pip install -r scripts/requirements.txt
python scripts/build_data.py --full --max-pages 50
git add public/links.json && git commit -m "data: full backfill" && git push
```

## Costs

GitHub Pages hosting is free for public repos, and the scheduled Actions runs are
well within the free minutes allowance. The only cost is the `iankahn.net` domain
registration (already owned).

## Troubleshooting

- If the site comes up empty, check the latest Actions run logs. If MR changed its
  HTML or RSS format, `build_data.py` will scrape 0 links; check the selectors in
  `scripts/scraper.py`.
- If the custom domain won't verify, make sure the Cloudflare CNAME is **DNS only**
  (grey cloud), not proxied. Proxying blocks GitHub's cert issuance.
- If `links.json` stops updating, confirm the workflow has `contents: write`
  permission and that the scheduled runs are succeeding.
