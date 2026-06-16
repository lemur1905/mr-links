#!/usr/bin/env python3
"""Build public/links.json for the static MR Links site.

Replaces the old FastAPI + PostgreSQL + APScheduler backend. There is no
database: public/links.json IS the persistent store. We load it, fetch new
posts (RSS for the incremental daily run, full HTML scrape with --full for a
backfill), merge by post_url, sort newest-first, and write it back.

Usage:
    python build_data.py            # incremental update via RSS (what the cron runs)
    python build_data.py --full     # full backfill via HTML scrape
    python build_data.py --full --max-pages 20

Imports only the pure scraping/parsing functions (scraper.py, rss_parser.py) --
no FastAPI / SQLAlchemy / Postgres.
"""
import argparse
import asyncio
import json
import logging
import os
import sys

import scraper
import rss_parser

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("build_data")

# Repo-root-relative path to the data file (this script lives in scripts/).
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "public", "links.json"))


def load_existing(path):
    """Load the current links.json, returning [] if it doesn't exist yet."""
    if not os.path.exists(path):
        logger.info("No existing %s; starting fresh.", path)
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d existing posts from %s", len(data), path)
    return data


def normalize(post):
    """Convert a scraper/rss_parser post dict into the canonical JSON shape.

    Source shape (scraper.py / rss_parser.py):
        {title, url, date(datetime|None), links: [{title, url, number}]}
    Canonical shape (what the frontend reads):
        {post_url, post_date: "YYYY-MM-DD", title, links: [{title, url, link_number}]}

    Returns None for posts with no parseable date (can't be ordered/displayed).
    """
    date = post.get("date")
    if not date:
        logger.warning("Skipping post with no date: %s", post.get("title"))
        return None
    return {
        "post_url": post["url"],
        "post_date": date.date().isoformat() if hasattr(date, "date") else str(date),
        "title": post.get("title", ""),
        "links": [
            {
                "title": link["title"],
                "url": link["url"],
                "link_number": link.get("number"),
                "context": link.get("context", ""),
            }
            for link in post.get("links", [])
        ],
    }


def merge(existing, new_posts):
    """Merge new posts into existing, dedupe by post_url, sort by post_date desc.

    Posts with zero parseable links are dropped (no point shipping an empty day,
    and they're usually a transient fetch failure). Because such a post isn't
    persisted, the next run treats it as new and re-fetches it -- so a transient
    failure self-heals on the following run rather than being enshrined.
    Existing posts that DO have links are the source of truth and aren't refetched.
    """
    by_url = {p["post_url"]: p for p in existing}
    added = 0
    for post in new_posts:
        norm = normalize(post)
        if norm is None or not norm["links"]:
            continue
        if norm["post_url"] in by_url:
            continue  # already have it with links; existing JSON wins
        by_url[norm["post_url"]] = norm
        added += 1
    merged = [p for p in by_url.values() if p["links"]]
    dropped = len(by_url) - len(merged)
    if dropped:
        logger.info("Dropped %d existing post(s) with no links.", dropped)
    merged.sort(key=lambda p: p["post_date"], reverse=True)
    return merged, added


def main():
    parser = argparse.ArgumentParser(description="Build public/links.json")
    parser.add_argument(
        "--full",
        action="store_true",
        help="Full HTML scrape (backfill) instead of incremental RSS update.",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=50,
        help="Max search-result pages to scrape with --full (default: 50).",
    )
    args = parser.parse_args()

    existing = load_existing(DATA_PATH)
    existing_urls = {p["post_url"] for p in existing}

    if args.full:
        logger.info("Full scrape: up to %d pages.", args.max_pages)
        new_posts = asyncio.run(
            scraper.scrape_all_assorted_links(
                max_pages=args.max_pages, existing_urls=existing_urls
            )
        )
    else:
        logger.info("Incremental update via RSS.")
        new_posts = rss_parser.get_new_posts_from_rss(existing_urls)

    merged, added = merge(existing, new_posts)

    total_links = sum(len(p["links"]) for p in merged)
    logger.info(
        "Merged: %d posts total (%d new), %d links.", len(merged), added, total_links
    )

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")
    logger.info("Wrote %s", DATA_PATH)

    # Non-zero exit if a run produced literally nothing on a fresh store, so CI
    # surfaces an MR format change on first backfill instead of deploying empty.
    if not merged:
        logger.error("No posts written -- check MR HTML/RSS format.")
        sys.exit(1)


if __name__ == "__main__":
    main()
