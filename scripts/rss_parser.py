import feedparser
import httpx
from datetime import datetime
from dateutil import parser as date_parser
from typing import List, Dict, Optional
import logging

from scraper import extract_links_from_post, HEADERS

logger = logging.getLogger(__name__)

RSS_FEED_URL = "https://marginalrevolution.com/feed"


def parse_rss_date(date_str: str) -> Optional[datetime]:
    """Parse RSS date string into datetime object."""
    try:
        return date_parser.parse(date_str)
    except (ValueError, TypeError):
        return None


def extract_links_from_rss_content(content: str) -> List[Dict[str, str]]:
    """Extract links from RSS content:encoded field.

    Wraps the content in a div to make it compatible with
    the existing extract_links_from_post function.
    """
    # Wrap content in a div with entry-content class for compatibility
    wrapped_html = f'<div class="entry-content">{content}</div>'
    return extract_links_from_post(wrapped_html)


def fetch_rss_content() -> Optional[str]:
    """Fetch RSS feed content using httpx (better SSL handling)."""
    try:
        with httpx.Client(timeout=30.0, headers=HEADERS) as client:
            response = client.get(RSS_FEED_URL, follow_redirects=True)
            response.raise_for_status()
            return response.text
    except httpx.HTTPError as e:
        logger.error(f"Error fetching RSS feed: {e}")
        return None


def fetch_rss_feed() -> List[Dict]:
    """Fetch and parse the Marginal Revolution RSS feed.

    Returns a list of assorted links posts with their metadata and links.
    """
    logger.info(f"Fetching RSS feed from {RSS_FEED_URL}")

    # Use httpx to fetch (better SSL handling), then parse with feedparser
    rss_content = fetch_rss_content()
    if not rss_content:
        logger.error("Failed to fetch RSS feed content")
        return []

    feed = feedparser.parse(rss_content)

    if feed.bozo:
        logger.warning(f"RSS feed parsing warning: {feed.bozo_exception}")

    posts = []

    for entry in feed.entries:
        title = entry.get("title", "")

        # Only process "assorted links" posts
        if "assorted links" not in title.lower():
            continue

        # Get the post URL (clean up UTM parameters)
        post_url = entry.get("link", "")
        if "?" in post_url:
            post_url = post_url.split("?")[0]

        # Parse the publication date
        date_str = entry.get("published", "")
        post_date = parse_rss_date(date_str)

        # Extract links from the content
        content = entry.get("content", [{}])[0].get("value", "")
        if not content:
            content = entry.get("summary", "")

        links = extract_links_from_rss_content(content)

        posts.append({
            "title": title,
            "url": post_url,
            "date": post_date,
            "links": links
        })

        logger.info(f"RSS: Found '{title}' with {len(links)} links")

    return posts


def get_new_posts_from_rss(existing_urls: set) -> List[Dict]:
    """Fetch RSS feed and return only posts not already in the database.

    Args:
        existing_urls: Set of post URLs already in the database

    Returns:
        List of new posts with their links
    """
    all_posts = fetch_rss_feed()
    new_posts = [post for post in all_posts if post["url"] not in existing_urls]

    logger.info(f"RSS: {len(all_posts)} total posts, {len(new_posts)} new")
    return new_posts
