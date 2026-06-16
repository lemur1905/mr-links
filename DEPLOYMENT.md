# Deployment: GitHub Pages (free)

This site is a static React app served from GitHub Pages. A scheduled GitHub
Action scrapes Marginal Revolution daily, commits the data into the repo, builds
the app, and deploys it. There is no server and no database — hosting is $0.

## One-time setup

### 1. Make the repo public
Free GitHub Pages requires a public repo (or GitHub Pro for private). Settings →
General → "Change repository visibility" → Public.

### 2. Enable Pages via GitHub Actions
Settings → Pages → **Source: GitHub Actions**. (The workflow uses the official
`upload-pages-artifact` / `deploy-pages` actions, not a `gh-pages` branch.)

### 3. Custom domain
`public/CNAME` already contains `mr.iankahn.net`, so the custom domain re-applies
on every deploy. In **Cloudflare DNS** for `iankahn.net`, add:

```
CNAME   mr   →   lemur1905.github.io      (DNS only / grey cloud — NOT proxied)
```

GitHub needs the un-proxied record to issue the HTTPS certificate. Once Pages
shows the domain as verified and green, enable **Enforce HTTPS** in Settings → Pages.

## The workflow

`.github/workflows/update-and-deploy.yml` runs on a daily cron (`0 12 * * *`), on
push to `main`, and on manual dispatch. Each run:

1. Checks out the repo.
2. Installs `scripts/requirements.txt` and runs `python scripts/build_data.py`
   (incremental RSS scrape).
3. Commits `public/links.json` back if it changed (the store is self-healing and
   incremental). The commit message includes `[skip ci]` so it doesn't re-trigger.
4. `npm ci && npm run build`.
5. Deploys `build/` to Pages.

To trigger manually: Actions → "Update data and deploy" → "Run workflow".

## Backfilling history

The cron only fetches recent posts (via RSS). To (re)build the full archive, run a
full scrape locally and commit the result:

```bash
pip install -r scripts/requirements.txt
python scripts/build_data.py --full --max-pages 50
git add public/links.json && git commit -m "data: full backfill" && git push
```

## Costs

**$0/month.** GitHub Pages hosting is free for public repos; GitHub Actions daily
cron is well within the free minutes allowance. The only cost is the `iankahn.net`
domain registration (already owned).

## Troubleshooting

- **Empty site / no links**: check the latest Actions run logs. If MR changed its
  HTML/RSS format, `build_data.py` will scrape 0 links — verify selectors in
  `scripts/scraper.py`.
- **Custom domain not verifying**: ensure the Cloudflare CNAME is **DNS only**
  (grey cloud), not proxied. Proxying blocks GitHub's cert issuance.
- **`links.json` not updating**: confirm the workflow has `contents: write`
  permission and that the daily run is succeeding.
